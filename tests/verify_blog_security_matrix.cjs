const fs = require('fs');
const path = require('path');
let pg;
try {
  pg = require('pg');
} catch (e) {
  try {
    pg = require(path.resolve(__dirname, '../backend/node_modules/pg'));
  } catch (err) {
    throw new Error("Não foi possível carregar o módulo 'pg'. Instale dependências no backend.");
  }
}
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERRO: DATABASE_URL não definida em .env.test.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runTestMatrix() {
  const client = await pool.connect();
  console.log("================================================================================");
  console.log("ATHENA BLOG MODULE — MATRIZ DE TESTES DE SEGURANÇA (SUPABASE DESPOSÍTAVEL)");
  console.log("================================================================================\n");

  const results = [];
  function assertCheck(id, description, expected, actual, passed) {
    results.push({ id, description, expected, actual, passed: Boolean(passed) });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id}: ${description}`);
    console.log(`       Esperado: ${expected}`);
    console.log(`       Obtido:   ${actual}\n`);
  }

  try {
    // -------------------------------------------------------------------------
    // 0. RESET E SETUP DO BANCO DESPOSÍTAVEL
    // -------------------------------------------------------------------------
    console.log("--- 0. Limpeza e Aplicação das Migrations no Schema Public ---");
    await client.query(`
      DROP VIEW IF EXISTS public.blog_comments_public CASCADE;
      DROP VIEW IF EXISTS public.blog_posts_public CASCADE;
      DROP TABLE IF EXISTS public.blog_post_categories CASCADE;
      DROP TABLE IF EXISTS public.blog_categories CASCADE;
      DROP TABLE IF EXISTS public.blog_comments CASCADE;
      DROP TABLE IF EXISTS public.blog_post_revisions CASCADE;
      DROP TABLE IF EXISTS public.blog_slug_aliases CASCADE;
      DROP TABLE IF EXISTS public.blog_posts CASCADE;
      DROP FUNCTION IF EXISTS public.is_blog_admin_or_editor() CASCADE;
      DROP FUNCTION IF EXISTS public.check_blog_slug_collision() CASCADE;
      DROP FUNCTION IF EXISTS public.validate_blog_comment_thread() CASCADE;
      DROP FUNCTION IF EXISTS public.record_blog_post_revision() CASCADE;
      DROP FUNCTION IF EXISTS public.increment_blog_post_view(UUID) CASCADE;
    `);

    // Aplica Stubs (users e set_updated_at_timestamp)
    const stubsSql = fs.readFileSync(path.join(__dirname, 'sql/00_stubs.sql'), 'utf8');
    await client.query(stubsSql);

    // Aplica a Migration V5 Oficial SEM NENHUMA ALTERAÇÃO
    const migrationSql = fs.readFileSync(path.join(__dirname, '../backend/migrations/2026_11_10_blog_module_baseline.sql'), 'utf8');
    await client.query(migrationSql);
    console.log("Stubs e Migration V5 aplicados com sucesso no schema public.\n");

    // -------------------------------------------------------------------------
    // 1. POPULAÇÃO DE DADOS DE PROVA (via service_role / superusuário)
    // -------------------------------------------------------------------------
    console.log("--- 1. Criação dos Dados de Prova ---");
    // Usuários
    await client.query(`
      DELETE FROM public.users WHERE id IN ('usr_author_orig', 'usr_editor_real', 'usr_customer_common');
      INSERT INTO public.users (id, name, email, password_hash, role) VALUES
      ('usr_author_orig', 'Autor Original', 'autor@athena.com', 'hash', 'vendedor'),
      ('usr_editor_real', 'Editor Real', 'editor@athena.com', 'hash', 'editor'),
      ('usr_customer_common', 'Cliente Comum', 'cliente@oficina.com', 'hash', 'customer');
    `);

    // 3 Artigos com status e datas distintas
    const p1 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, author_id, published_at)
      VALUES ('Post Publicado Passado', 'post-passado', 'published', 'usr_author_orig', NOW() - INTERVAL '2 days')
      RETURNING id;
    `);
    const idPub = p1.rows[0].id;

    const p2 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, author_id, published_at)
      VALUES ('Post Agendado Futuro', 'post-futuro', 'published', 'usr_author_orig', NOW() + INTERVAL '3 days')
      RETURNING id;
    `);
    const idFut = p2.rows[0].id;

    const p3 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, author_id)
      VALUES ('Post Rascunho', 'post-rascunho', 'draft', 'usr_author_orig')
      RETURNING id;
    `);
    const idDraft = p3.rows[0].id;

    // 1 Categoria e 2 vínculos
    const c1 = await client.query(`
      INSERT INTO public.blog_categories (name, slug)
      VALUES ('Elevadores', 'elevadores') RETURNING id;
    `);
    const idCat = c1.rows[0].id;

    await client.query(`
      INSERT INTO public.blog_post_categories (post_id, category_id)
      VALUES ($1, $3), ($2, $3);
    `, [idPub, idDraft, idCat]);

    // Comentários: 2 no post publicado (1 aprovado, 1 pendente), 1 no rascunho (aprovado)
    const com1 = await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, content, status)
      VALUES ($1, 'Cliente Joao', 'joao@oficina.com', 'Excelente!', 'approved')
      RETURNING id;
    `, [idPub]);
    const idComAppr = com1.rows[0].id;

    await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, content, status)
      VALUES ($1, 'Spam Bot', 'bot@spam.com', 'Compre barato', 'pending');
    `, [idPub]);

    await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, content, status)
      VALUES ($1, 'Tester', 'test@draft.com', 'Comentario em rascunho', 'approved');
    `, [idDraft]);

    console.log("Setup concluído: 3 posts criados, 2 vínculos de categoria, 3 comentários, 3 usuários.\n");

    // -------------------------------------------------------------------------
    // 2. MATRIZ DE AUDITORIA: ROLE anon
    // -------------------------------------------------------------------------
    console.log("--- 2. Auditoria da Role: anon ---");
    await client.query("SET ROLE anon;");

    // TEST-01: Listagem pública de posts via view
    const anonViewPosts = await client.query("SELECT slug FROM public.blog_posts_public;");
    assertCheck(
      "TEST-01",
      "Anon lê estritamente artigos publicados no passado via blog_posts_public",
      "1 post ('post-passado') de um total de 3 no banco",
      `${anonViewPosts.rows.length} post(s) retornado(s): [${anonViewPosts.rows.map(p => p.slug).join(', ')}]`,
      anonViewPosts.rows.length === 1 && anonViewPosts.rows[0].slug === 'post-passado'
    );

    // TEST-02: Bloqueio de leitura na tabela base blog_posts (author_id blindado)
    let anonBasePostBlocked = false;
    let anonBasePostCode = '';
    try {
      await client.query("SELECT author_id FROM public.blog_posts;");
    } catch (e) {
      anonBasePostBlocked = true;
      anonBasePostCode = e.code;
    }
    assertCheck(
      "TEST-02",
      "Anon é impedido de consultar a tabela base blog_posts (author_id blindado)",
      "Erro 42501 (permission_denied)",
      anonBasePostBlocked ? `Erro ${anonBasePostCode}` : "Consulta permitida",
      anonBasePostBlocked && anonBasePostCode === '42501'
    );

    // TEST-03: Categorias de rascunhos não vazam
    const anonCats = await client.query("SELECT post_id FROM public.blog_post_categories;");
    assertCheck(
      "TEST-03",
      "Anon não visualiza categorias associadas a rascunhos",
      "1 vínculo (apenas post-passado) de um total de 2 no banco",
      `${anonCats.rows.length} vínculo(s) retornado(s): post_id=${anonCats.rows[0]?.post_id}`,
      anonCats.rows.length === 1 && anonCats.rows[0].post_id === idPub
    );

    // TEST-04: Bloqueio total na tabela base blog_comments (author_email blindado)
    let anonBaseCommentsBlocked = false;
    let anonBaseCommentsCode = '';
    try {
      await client.query("SELECT author_email FROM public.blog_comments;");
    } catch (e) {
      anonBaseCommentsBlocked = true;
      anonBaseCommentsCode = e.code;
    }
    assertCheck(
      "TEST-04",
      "Anon impedido de consultar tabela base blog_comments (author_email blindado)",
      "Erro 42501 (permission_denied)",
      anonBaseCommentsBlocked ? `Erro ${anonBaseCommentsCode}` : "Consulta permitida",
      anonBaseCommentsBlocked && anonBaseCommentsCode === '42501'
    );

    // TEST-05: View pública blog_comments_public
    const anonViewComments = await client.query("SELECT * FROM public.blog_comments_public;");
    const hasEmailCol = Object.prototype.hasOwnProperty.call(anonViewComments.rows[0] || {}, 'author_email');
    assertCheck(
      "TEST-05",
      "View pública retorna apenas aprovados de posts públicos e omite author_email",
      "1 comentário ('Cliente Joao') de um total de 3 no banco; author_email ausente",
      `${anonViewComments.rows.length} comentário(s); autor='${anonViewComments.rows[0]?.author_name}'; coluna author_email existe: ${hasEmailCol}`,
      anonViewComments.rows.length === 1 && anonViewComments.rows[0]?.author_name === 'Cliente Joao' && !hasEmailCol
    );

    // TEST-06: Escrita proibida para anon em todas as tabelas
    let anonWriteBlocked = true;
    const writeErrors = [];
    const ops = [
      () => client.query("INSERT INTO public.blog_categories (name, slug) VALUES ('X', 'x');"),
      () => client.query("UPDATE public.blog_categories SET name = 'Y';"),
      () => client.query("DELETE FROM public.blog_categories;"),
      () => client.query("INSERT INTO public.blog_posts (title, slug) VALUES ('X', 'x');"),
      () => client.query("DELETE FROM public.blog_posts;"),
      () => client.query("INSERT INTO public.blog_comments (post_id, author_name, author_email, content) VALUES ('" + idPub + "', 'H', 'h@h.com', 'C');")
    ];

    for (const op of ops) {
      try {
        await op();
        anonWriteBlocked = false;
      } catch (e) {
        writeErrors.push(e.code);
      }
    }
    const all42501 = writeErrors.length === 6 && writeErrors.every(c => c === '42501');
    assertCheck(
      "TEST-06",
      "Anon tem escrita (INSERT, UPDATE, DELETE) 100% negada em todas as tabelas",
      "6 tentativas bloqueadas com erro 42501",
      `${writeErrors.length} bloqueios; Códigos: [${[...new Set(writeErrors)].join(', ')}]`,
      anonWriteBlocked && all42501
    );

    // TEST-07: RPC increment_blog_post_view negada para anon
    let rpcAnonBlocked = false;
    let rpcAnonCode = '';
    try {
      await client.query("SELECT public.increment_blog_post_view('" + idPub + "');");
    } catch (e) {
      rpcAnonBlocked = true;
      rpcAnonCode = e.code;
    }
    assertCheck(
      "TEST-07",
      "RPC increment_blog_post_view é estritamente negada para anon",
      "Erro 42501 (permission_denied)",
      rpcAnonBlocked ? `Erro ${rpcAnonCode}` : "Execução permitida",
      rpcAnonBlocked && rpcAnonCode === '42501'
    );

    // -------------------------------------------------------------------------
    // 3. MATRIZ DE AUDITORIA: ROLE authenticated (Cliente Comum)
    // -------------------------------------------------------------------------
    console.log("--- 3. Auditoria da Role: authenticated (Cliente Comum) ---");
    await client.query("SET ROLE authenticated;");

    // TEST-08: Cliente comum não tem privilégio de escrita nem acesso a rascunhos
    let authBasePostBlocked = false;
    try {
      await client.query("SELECT * FROM public.blog_posts;");
    } catch (e) {
      authBasePostBlocked = (e.code === '42501');
    }

    let authWriteBlocked = false;
    try {
      await client.query("INSERT INTO public.blog_posts (title, slug) VALUES ('Hacked', 'hacked');");
    } catch (e) {
      authWriteBlocked = (e.code === '42501');
    }

    let authRpcBlocked = false;
    try {
      await client.query("SELECT public.increment_blog_post_view('" + idPub + "');");
    } catch (e) {
      authRpcBlocked = (e.code === '42501');
    }

    assertCheck(
      "TEST-08",
      "Authenticated comum tem acesso idêntico a anon: leitura base negada, escrita negada, RPC negada",
      "Leitura base 42501, Escrita 42501, RPC 42501",
      `Leitura: ${authBasePostBlocked ? '42501' : 'OK'}, Escrita: ${authWriteBlocked ? '42501' : 'OK'}, RPC: ${authRpcBlocked ? '42501' : 'OK'}`,
      authBasePostBlocked && authWriteBlocked && authRpcBlocked
    );

    // -------------------------------------------------------------------------
    // 4. MATRIZ DE AUDITORIA: ROLE service_role / postgres (Backend da Athena)
    // -------------------------------------------------------------------------
    console.log("--- 4. Auditoria da Role: service_role / Backend ---");
    await client.query("RESET ROLE;"); // Retorna a postgres / service_role

    // TEST-09: service_role lê todos os comentários com author_email para moderação
    const srComments = await client.query("SELECT id, author_name, author_email, status FROM public.blog_comments ORDER BY created_at;");
    assertCheck(
      "TEST-09",
      "Backend (service_role) acessa todos os 3 comentários com author_email visível para moderação",
      "3 comentários com e-mails reais ('joao@oficina.com', 'bot@spam.com', 'test@draft.com')",
      `${srComments.rows.length} comentários lidos; e-mails: [${srComments.rows.map(c => c.author_email).join(', ')}]`,
      srComments.rows.length === 3 && srComments.rows.some(c => c.author_email === 'joao@oficina.com')
    );

    // TEST-10: RPC increment_blog_post_view por service_role
    // 10.1 Post publicado: incrementa
    await client.query("SELECT public.increment_blog_post_view($1);", [idPub]);
    const pPubAfter = await client.query("SELECT view_count FROM public.blog_posts WHERE id = $1;", [idPub]);

    // 10.2 Post rascunho: no-op
    await client.query("SELECT public.increment_blog_post_view($1);", [idDraft]);
    const pDraftAfter = await client.query("SELECT view_count FROM public.blog_posts WHERE id = $1;", [idDraft]);

    // 10.3 UUID inexistente: no-op sem exceção
    const randomUuid = '00000000-0000-0000-0000-000000000000';
    let randomUuidSucceeded = true;
    try {
      await client.query("SELECT public.increment_blog_post_view($1);", [randomUuid]);
    } catch (e) {
      randomUuidSucceeded = false;
    }

    assertCheck(
      "TEST-10",
      "increment_blog_post_view via backend incrementa publicado e ignora rascunho/inexistente",
      "Publicado: 1 view | Rascunho: 0 views | UUID inexistente: sem erro",
      `Publicado: ${pPubAfter.rows[0].view_count} | Rascunho: ${pDraftAfter.rows[0].view_count} | UUID inexistente executou: ${randomUuidSucceeded}`,
      pPubAfter.rows[0].view_count === 1 && pDraftAfter.rows[0].view_count === 0 && randomUuidSucceeded
    );

    // -------------------------------------------------------------------------
    // 5. TESTES DE REVISÕES, AUDITORIA REAL DE AUTORIA E SLUGS/ALIASES
    // -------------------------------------------------------------------------
    console.log("--- 5. Auditoria de Revisões, Autoria Real e Aliases ---");

    // TEST-11: view_count NÃO gera snapshot de revisão
    const revCountAfterViews = await client.query("SELECT count(*) FROM public.blog_post_revisions WHERE post_id = $1;", [idPub]);
    assertCheck(
      "TEST-11",
      "Incremento de view_count NÃO dispara trigger de revisão (WHEN cláusula restritiva)",
      "0 revisões registradas",
      `${revCountAfterViews.rows[0].count} revisão(ões)`,
      Number(revCountAfterViews.rows[0].count) === 0
    );

    // TEST-12: Edição de post com autoria real capturada via app.current_user_id
    await client.query("BEGIN;");
    await client.query("SELECT set_config('app.current_user_id', 'usr_editor_real', true);");
    await client.query(`
      UPDATE public.blog_posts
      SET title = 'Post Publicado Passado - Titulo Editado',
          slug = 'post-passado-v2'
      WHERE id = $1;
    `, [idPub]);
    await client.query("COMMIT;");

    const revs = await client.query("SELECT title, edited_by, post_id FROM public.blog_post_revisions WHERE post_id = $1;", [idPub]);
    assertCheck(
      "TEST-12",
      "Edição dispara revisão capturando app.current_user_id ('usr_editor_real') e não o author_id original",
      "1 revisão; title='Post Publicado Passado'; edited_by='usr_editor_real'",
      `${revs.rows.length} revisão; title='${revs.rows[0]?.title}'; edited_by='${revs.rows[0]?.edited_by}'`,
      revs.rows.length === 1 && revs.rows[0]?.title === 'Post Publicado Passado' && revs.rows[0]?.edited_by === 'usr_editor_real'
    );

    // TEST-13: Cadeia de Aliases A -> B -> C colapsa A diretamente para C
    // Mudança 1 já ocorreu: post-passado -> post-passado-v2 (Alias criado: post-passado -> post-passado-v2)
    // Mudança 2 agora: post-passado-v2 -> post-passado-v3
    await client.query(`
      UPDATE public.blog_posts
      SET slug = 'post-passado-v3'
      WHERE id = $1;
    `, [idPub]);

    const aliasesChain = await client.query("SELECT old_slug, target_slug FROM public.blog_slug_aliases WHERE target_post_id = $1 ORDER BY old_slug;", [idPub]);
    const alias1Collapses = aliasesChain.rows.find(a => a.old_slug === 'post-passado')?.target_slug === 'post-passado-v3';
    const alias2Points = aliasesChain.rows.find(a => a.old_slug === 'post-passado-v2')?.target_slug === 'post-passado-v3';
    assertCheck(
      "TEST-13",
      "Cadeia de aliases (post-passado -> v2 -> v3) colapsa todos os aliases anteriores para o destino final 'post-passado-v3'",
      "post-passado -> post-passado-v3 E post-passado-v2 -> post-passado-v3",
      aliasesChain.rows.map(a => `${a.old_slug} -> ${a.target_slug}`).join(' | '),
      alias1Collapses && alias2Points
    );

    // TEST-14: Colisão de Slug (Post B tenta usar slug que já é alias ativo do Post A)
    let collisionBlocked = false;
    let collisionErrMsg = '';
    try {
      await client.query(`
        INSERT INTO public.blog_posts (title, slug, status, author_id)
        VALUES ('Post Invasor', 'post-passado', 'draft', 'usr_author_orig');
      `);
    } catch (e) {
      collisionBlocked = true;
      collisionErrMsg = e.message;
    }
    assertCheck(
      "TEST-14",
      "Trigger trg_check_blog_slug_collision impede que outro post adote slug que já é alias ativo",
      "Exceção 'Colisão de URL'",
      collisionBlocked ? `Bloqueado com mensagem: "${collisionErrMsg}"` : "Permitiu criação indevida",
      collisionBlocked && collisionErrMsg.includes('Colisão de URL')
    );

    // TEST-15: Reassunção de slug antigo pelo próprio artigo destrói o alias redundante
    await client.query(`
      UPDATE public.blog_posts
      SET slug = 'post-passado'
      WHERE id = $1;
    `, [idPub]);

    const aliasesAfterReclaim = await client.query("SELECT old_slug, target_slug FROM public.blog_slug_aliases WHERE target_post_id = $1;", [idPub]);
    const oldSlugDestroyed = !aliasesAfterReclaim.rows.some(a => a.old_slug === 'post-passado');
    assertCheck(
      "TEST-15",
      "Artigo reassume seu slug original ('post-passado') e remove o alias redundante automaticamente",
      "Alias 'post-passado' removido da tabela de aliases",
      `Aliases remanescentes: [${aliasesAfterReclaim.rows.map(a => a.old_slug).join(', ')}]`,
      oldSlugDestroyed
    );

    // -------------------------------------------------------------------------
    // 6. INTEGRIDADE DE THREADING DE COMENTÁRIOS
    // -------------------------------------------------------------------------
    console.log("--- 6. Auditoria de Threading de Comentários ---");

    // TEST-16: Thread válido no mesmo post permitido
    const validReply = await client.query(`
      INSERT INTO public.blog_comments (post_id, parent_id, author_name, author_email, content, status)
      VALUES ($1, $2, 'Tecnico Athena', 'suporte@athena.com', 'Resposta valida', 'approved')
      RETURNING id;
    `, [idPub, idComAppr]);
    assertCheck(
      "TEST-16",
      "Resposta vinculada ao mesmo post_id é permitida com sucesso",
      "Resposta criada com ID válido",
      `Resposta criada com ID: ${validReply.rows[0]?.id}`,
      Boolean(validReply.rows[0]?.id)
    );

    // TEST-17: Thread cross-post (parent_id de outro post) rejeitado
    let crossThreadBlocked = false;
    let crossThreadErr = '';
    try {
      await client.query(`
        INSERT INTO public.blog_comments (post_id, parent_id, author_name, author_email, content, status)
        VALUES ($1, $2, 'Invasor', 'inv@mal.com', 'Cross reply', 'pending');
      `, [idDraft, idComAppr]); // idComAppr pertence a idPub, não a idDraft
    } catch (e) {
      crossThreadBlocked = true;
      crossThreadErr = e.message;
    }
    assertCheck(
      "TEST-17",
      "Trigger trg_validate_blog_comment_thread impede resposta amarrada a comentário de outro artigo",
      "Exceção 'Violação de integridade'",
      crossThreadBlocked ? `Bloqueado: "${crossThreadErr}"` : "Permitiu cross-thread",
      crossThreadBlocked && crossThreadErr.includes('Violação de integridade')
    );

    console.log("================================================================================");
    const passedCount = results.filter(r => r.passed).length;
    console.log(`RESUMO DA MATRIZ: ${passedCount}/${results.length} TESTES APROVADOS.`);
    console.log("================================================================================");

    if (passedCount !== results.length) {
      process.exit(1);
    }
  } catch (err) {
    console.error("ERRO CRÍTICO NA AUDITORIA:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runTestMatrix().catch(console.error);
