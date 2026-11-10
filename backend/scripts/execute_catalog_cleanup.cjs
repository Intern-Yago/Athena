const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runCleanup() {
  const client = await pool.connect();
  try {
    console.log("=== INITIATING CATALOG CLEANUP TRANSACTION ===");
    await client.query("BEGIN");

    // 1. Initial State Check
    const countBefore = await client.query(`
      SELECT count(*) as total,
             count(*) FILTER (WHERE status = 'published') as published,
             count(*) FILTER (WHERE status = 'draft') as draft
      FROM products;
    `);
    console.log("Count BEFORE:", countBefore.rows[0]);

    // 2. Fix the 3 shared Omie codes
    console.log("\n--- Fixing the 3 shared omie codes ---");
    // Pair 1: SGT-TP-02 (Torquímetro 3/8") -> 'SGT-TP-02'
    const fix1 = await client.query(`
      UPDATE products
      SET omie_code = 'SGT-TP-02', updated_at = NOW()
      WHERE id = 'prod_1790956469393' AND omie_code = '0106120101'
      RETURNING id, name, sku, omie_code;
    `);
    console.log("Fixed SGT-TP-02 omie_code:", fix1.rows[0]);

    // Pair 2: SGT-MOTOR (Limpador de Chassi) -> 'SGT-MOTOR'
    const fix2 = await client.query(`
      UPDATE products
      SET omie_code = 'SGT-MOTOR', updated_at = NOW()
      WHERE id = 'prod_sigma_limpador_de_chassi_e_motor_500ml_sgt_motor' AND omie_code = '0108090001'
      RETURNING id, name, sku, omie_code;
    `);
    console.log("Fixed SGT-MOTOR omie_code:", fix2.rows[0]);

    // Pair 3: SGT-0233 (Furadeira SGT-0233) -> 'SGT-0233'
    const fix3 = await client.query(`
      UPDATE products
      SET omie_code = 'SGT-0233', updated_at = NOW()
      WHERE id = 'prod_sigma_sgt_0233' AND omie_code = '0701022101'
      RETURNING id, name, sku, omie_code;
    `);
    console.log("Fixed SGT-0233 omie_code:", fix3.rows[0]);

    // 3. Load merges list
    const rawMerges = fs.readFileSync('/tmp/merges_list.json', 'utf8');
    const jsonStr = rawMerges.substring(rawMerges.indexOf('['));
    const merges = JSON.parse(jsonStr);

    console.log(`\n--- Processing ${merges.length} duplicate draft merges ---`);

    let mergedCount = 0;
    for (const m of merges) {
      const draftId = m.draft_id;
      const targetId = m.target_id;

      // Check draft exists
      const draftCheck = await client.query("SELECT * FROM products WHERE id = $1", [draftId]);
      if (draftCheck.rows.length === 0) {
        console.warn(`Draft ${draftId} not found, skipping.`);
        continue;
      }
      const draft = draftCheck.rows[0];

      // Check target exists
      const targetCheck = await client.query("SELECT * FROM products WHERE id = $1", [targetId]);
      if (targetCheck.rows.length === 0) {
        console.warn(`Target ${targetId} not found, skipping.`);
        continue;
      }
      const target = targetCheck.rows[0];

      // 1. Re-point any foreign keys pointing to draft
      // order_items
      await client.query(`
        UPDATE order_items SET product_id = $1 WHERE product_id = $2
      `, [targetId, draftId]);

      // inventory_reservations
      await client.query(`
        UPDATE inventory_reservations SET product_id = $1 WHERE product_id = $2
      `, [targetId, draftId]);

      // loyalty_rewards
      await client.query(`
        UPDATE loyalty_rewards SET product_id = $1 WHERE product_id = $2
      `, [targetId, draftId]);

      // product_slug_aliases: record alias if draft had slug
      if (draft.slug && draft.slug !== target.slug) {
        await client.query(`
          INSERT INTO product_slug_aliases (old_slug, target_product_id, target_slug, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (old_slug) DO UPDATE
            SET target_product_id = EXCLUDED.target_product_id,
                target_slug = EXCLUDED.target_slug
        `, [draft.slug, targetId, target.slug]);
      }

      // 2. Clear unique fields on draft or delete draft so constraint doesn't block target update
      await client.query("DELETE FROM products WHERE id = $1", [draftId]);

      // 3. Prepare updates for target product:
      // - omie_product_id: update if target is null and draft has it
      // - omie_code: update if target omie_code equals slug/name and draft has real omie_code
      // - price: update if target price is 0 and draft price > 0
      const updates = [];
      const values = [];
      let paramIdx = 1;

      if (!target.omie_product_id && draft.omie_product_id) {
        updates.push(`omie_product_id = $${paramIdx++}`);
        values.push(draft.omie_product_id);
      }

      const isTargetOmieCodeSlug = target.omie_code && (target.omie_code === target.slug || target.omie_code.includes('-'));
      if ((!target.omie_code || isTargetOmieCodeSlug) && draft.omie_code && !draft.omie_code.includes('-')) {
        updates.push(`omie_code = $${paramIdx++}`);
        values.push(draft.omie_code);
      }

      if (Number(target.price) === 0 && Number(draft.price) > 0) {
        updates.push(`price = $${paramIdx++}`);
        values.push(draft.price);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(targetId);
        const q = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
        await client.query(q, values);
      }

      mergedCount++;
      console.log(`[${mergedCount}/${merges.length}] Merged draft ${draftId} -> published ${targetId}`);
    }

    // 4. Final Verifications
    console.log("\n--- Verification Queries ---");
    const countAfter = await client.query(`
      SELECT count(*) as total,
             count(*) FILTER (WHERE status = 'published') as published,
             count(*) FILTER (WHERE status = 'draft') as draft
      FROM products;
    `);
    console.log("Count AFTER:", countAfter.rows[0]);

    // Check shared omie codes
    const sharedOmieAfter = await client.query(`
      SELECT omie_code, count(*)
      FROM products
      WHERE omie_code IS NOT NULL AND trim(omie_code) != ''
      GROUP BY omie_code
      HAVING count(*) > 1;
    `);
    console.log("Shared omie codes remaining (should be 0):", sharedOmieAfter.rows);

    if (sharedOmieAfter.rows.length > 0) {
      throw new Error("Shared omie codes still exist! Rolling back.");
    }

    // Check duplicate SKUs
    const dupSkuAfter = await client.query(`
      SELECT sku, count(*)
      FROM products
      WHERE sku IS NOT NULL AND trim(sku) != ''
      GROUP BY sku
      HAVING count(*) > 1;
    `);
    console.log("Duplicate SKUs remaining (should be 0):", dupSkuAfter.rows);

    await client.query("COMMIT");
    console.log("\n=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cleanup error - transaction rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup().catch(console.error);
