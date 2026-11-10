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
  console.error("ERRO FATAL: DATABASE_URL não definida em .env.test.");
  process.exit(1);
}

// -----------------------------------------------------------------------------
// TRAVA DE SEGURANÇA 1: Validação de Host da URL
// -----------------------------------------------------------------------------
const isAllowedTestHost = connectionString.includes('gbbenlovgpuvahqvuvzf') || 
                          connectionString.includes('localhost') || 
                          connectionString.includes('127.0.0.1') || 
                          connectionString.includes('_test');

if (!isAllowedTestHost) {
  console.error("================================================================================");
  console.error("BLOQUEIO DE SEGURANÇA: A DATABASE_URL não corresponde ao projeto de teste aprovado!");
  console.error("Host recebido:", connectionString.split('@')[1] || 'desconhecido');
  console.error("Abortando imediatamente para proteger bancos que não sejam de teste.");
  console.error("================================================================================");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const results = [];

function assertCheck(id, description, expected, actual, passed) {
  results.push({ id, description, expected, actual, passed: Boolean(passed) });
  const status = passed ? "[PASS]" : "[FAIL]";
  console.log(`${status} ${id}: ${description}`);
  console.log(`       Esperado: ${expected}`);
  console.log(`       Obtido:   ${actual}\n`);
}

async function runTestMatrix() {
  const client = await pool.connect();

  try {
    console.log("================================================================================");
    console.log("ATHENA BLOG MODULE — MATRIZ DE TESTES DE SEGURANÇA & INTEGRIDADE");
    console.log("Banco de Testes Verificado: db.gbbenlovgpuvahqvuvzf.supabase.co");
    console.log("================================================================================\n");

    // -------------------------------------------------------------------------
    // TRAVA DE SEGURANÇA 2: Bloqueio Fatal se a Tabela products Existir
    // -------------------------------------------------------------------------
    const precheck = await client.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'products';
    `);

    if (precheck.rows.length > 0) {
      console.error("================================================================================");
      console.error("TRAVA FATAL DE SEGURANÇA: A tabela 'products' do e-commerce da Athena foi detectada!");
      console.error("Este script roda APENAS em bases descartáveis de teste sem dados de catálogo.");
      console.error("Execução abortada sem alterar qualquer dado.");
      console.error("================================================================================");
      process.exit(1);
    }

    // -------------------------------------------------------------------------
    // 0. RESET E CARGA LIMPA DE MIGRATION NO SCHEMA PUBLIC
    // -------------------------------------------------------------------------
    console.log("--- 0. Limpeza e Aplicação das Migrations no Schema Public ---");
    await client.query("DROP VIEW IF EXISTS public.blog_comments_public CASCADE;");
    await client.query("DROP VIEW IF EXISTS public.blog_posts_public CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_post_categories CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_slug_aliases CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_post_revisions CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_comments CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_posts CASCADE;");
    await client.query("DROP TABLE IF EXISTS public.blog_categories CASCADE;");

    // Aplica Stubs isolados (users e set_updated_at_timestamp)
    const stubsSql = fs.readFileSync(path.resolve(__dirname, 'sql/00_stubs.sql'), 'utf-8');
    await client.query(stubsSql);

    // Aplica Migration V5 limpa
    const migrationSql = fs.readFileSync(path.resolve(__dirname, '../backend/migrations/2026_11_10_blog_module_baseline.sql'), 'utf-8');
    await client.query(migrationSql);
    console.log("Stubs e Migration V5 aplicados com sucesso no schema public.\n");

    // -------------------------------------------------------------------------
    // 1. SETUP DE DADOS DE PROVA (Positivos e Negativos)
    // -------------------------------------------------------------------------
    console.log("--- 1. Criação dos Dados de Prova ---");
    // Usuários de auditoria
    await client.query(`
      INSERT INTO public.users (id, email, name, password_hash, role)
      VALUES 
        ('usr_author_orig', 'autor@athena.com', 'Autor Original', 'hash_pass', 'editor'),
        ('usr_editor_real', 'editor@athena.com', 'Editor Real', 'hash_pass', 'editor'),
        ('usr_cliente', 'cliente@athena.com', 'Cliente Comum', 'hash_pass', 'cliente')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    `);

    // 1 Post publicado no passado
    const p1 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, published_at, author_id)
      VALUES ('Post Publicado Passado', 'post-passado', 'published', NOW() - INTERVAL '1 day', 'usr_author_orig')
      RETURNING id;
    `);
    const idPub = p1.rows[0].id;

    // 1 Post publicado no futuro (agendado)
    const p2 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, published_at, author_id)
      VALUES ('Post Futuro Agendado', 'post-futuro', 'published', NOW() + INTERVAL '2 days', 'usr_author_orig')
      RETURNING id;
    `);
    const idFut = p2.rows[0].id;

    // 1 Post rascunho
    const p3 = await client.query(`
      INSERT INTO public.blog_posts (title, slug, status, author_id)
      VALUES ('Post Rascunho', 'post-rascunho', 'draft', 'usr_author_orig')
      RETURNING id;
    `);
    const idDraft = p3.rows[0].id;

    // 1 Categoria e 2 vínculos
    const c1 = await client.query(`
      INSERT INTO public.blog_categories (name, slug, display_order)
      VALUES ('Elevadores', 'elevadores', 10) RETURNING id;
    `);
    const idCat = c1.rows[0].id;

    await client.query(`
      INSERT INTO public.blog_post_categories (post_id, category_id)
      VALUES ($1, $3), ($2, $3);
    `, [idPub, idDraft, idCat]);

    // Comentários: 2 no post publicado (1 aprovado, 1 pendente), 1 no rascunho (aprovado)
    const com1 = await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, author_ip, content, status)
      VALUES ($1, 'Cliente Joao', 'joao@oficina.com', '189.10.20.30', 'Excelente!', 'approved')
      RETURNING id;
    `, [idPub]);
    const idComAppr = com1.rows[0].id;

    await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, author_ip, content, status)
      VALUES ($1, 'Spam Bot', 'bot@spam.com', '190.20.30.40', 'Compre barato', 'pending');
    `, [idPub]);

    await client.query(`
      INSERT INTO public.blog_comments (post_id, author_name, author_email, author_ip, content, status)
      VALUES ($1, 'Tester', 'test@draft.com', '191.30.40.50', 'Comentario em rascunho', 'approved');
    `, [idDraft]);

    console.log("Setup concluído: 3 posts criados, 2 vínculos de categoria, 3 comentários, 3 usuários.\n");

    // -------------------------------------------------------------------------
    // 2. MATRIZ DE CONSTRAINTS DE INTEGRIDADE (CHECK CONSTRAINTS)
    // -------------------------------------------------------------------------
    console.log("--- 2. Auditoria de Constraints de Integridade ---");

    // TEST-C1: Título de post curto (< 3 caracteres)
    let c1Blocked = false;
    let c1Code = '';
    try {
      await client.query(`
        INSERT INTO public.blog_posts (title, slug, status, author_id)
        VALUES ('Oi', 'post-curto', 'draft', 'usr_author_orig');
      `);
    } catch (e) {
      c1Blocked = true;
      c1Code = e.code;
    }
    assertCheck(
      "TEST-C1",
      "Constraint de título curto (< 3 chars) rejeita inserção na tabela blog_posts",
      "Erro 23514 (check_violation)",
      c1Blocked ? `Erro ${c1Code}` : "Inserção permitida indevidamente",
      c1Blocked && c1Code === '23514'
    );

    // TEST-C2: Post publicado sem published_at
    let c2Blocked = false;
    let c2Code = '';
    try {
      await client.query(`
        INSERT INTO public.blog_posts (title, slug, status, published_at, author_id)
        VALUES ('Post Publicado Sem Data', 'post-sem-data', 'published', NULL, 'usr_author_orig');
      `);
    } catch (e) {
      c2Blocked = true;
      c2Code = e.code;
    }
    assertCheck(
      "TEST-C2",
      "Constraint chk_blog_posts_published_date rejeita status='published' com published_at NULO",
      "Erro 23514 (check_violation)",
      c2Blocked ? `Erro ${c2Code}` : "Inserção permitida indevidamente",
      c2Blocked && c2Code === '23514'
    );

    // TEST-C3: Slug com caracteres inválidos (letras maiúsculas ou underline)
    let c3Blocked = false;
    let c3Code = '';
    try {
      await client.query(`
        INSERT INTO public.blog_posts (title, slug, status, author_id)
        VALUES ('Post Slug Invalido', 'Post_Slug_Invalido!', 'draft', 'usr_author_orig');
      `);
    } catch (e) {
      c3Blocked = true;
      c3Code = e.code;
    }
    assertCheck(
      "TEST-C3",
      "Constraint de regex de slug rejeita caracteres maiúsculos ou especiais fora do padrão kebab-case",
      "Erro 23514 (check_violation)",
      c3Blocked ? `Erro ${c3Code}` : "Inserção permitida indevidamente",
      c3Blocked && c3Code === '23514'
    );

    // TEST-C4: Comentário com e-mail inválido
    let c4Blocked = false;
    let c4Code = '';
    try {
      await client.query(`
        INSERT INTO public.blog_comments (post_id, author_name, author_email, content, status)
        VALUES ($1, 'Tester', 'email-invalido-sem-arroba', 'Ola', 'pending');
      `, [idPub]);
    } catch (e) {
      c4Blocked = true;
      c4Code = e.code;
    }
    assertCheck(
      "TEST-C4",
      "Constraint de regex de author_email rejeita e-mail mal formatado",
      "Erro 23514 (check_violation)",
      c4Blocked ? `Erro ${c4Code}` : "Inserção permitida indevidamente",
      c4Blocked && c4Code === '23514'
    );

    // TEST-C5: Comentário com conteúdo vazio ou < 2 chars
    let c5Blocked = false;
    let c5Code = '';
    try {
      await client.query(`
        INSERT INTO public.blog_comments (post_id, author_name, author_email, content, status)
        VALUES ($1, 'Tester', 'teste@oficina.com', ' ', 'pending');
      `, [idPub]);
    } catch (e) {
      c5Blocked = true;
      c5Code = e.code;
    }
    assertCheck(
      "TEST-C5",
      "Constraint de conteúdo de comentário rejeita string vazia ou whitespace",
      "Erro 23514 (check_violation)",
      c5Blocked ? `Erro ${c5Code}` : "Inserção permitida indevidamente",
      c5Blocked && c5Code === '23514'
    );

    // -------------------------------------------------------------------------
    // 3. MATRIZ DE AUDITORIA: ROLE anon
    // -------------------------------------------------------------------------
    console.log("--- 3. Auditoria da Role: anon ---");
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
      "Anon não visualiza categorias associadas a rascunhos (via policy que consulta blog_posts_public)",
      "1 vínculo (apenas post-passado) de um total de 2 no banco",
      `${anonCats.rows.length} vínculo(s) retornado(s): post_id=${anonCats.rows[0]?.post_id}`,
      anonCats.rows.length === 1 && anonCats.rows[0].post_id === idPub
    );

    // TEST-04: Bloqueio total na tabela base blog_comments (author_email e author_ip blindados)
    let anonBaseCommentsBlocked = false;
    let anonBaseCommentsCode = '';
    try {
      await client.query("SELECT author_email, author_ip FROM public.blog_comments;");
    } catch (e) {
      anonBaseCommentsBlocked = true;
      anonBaseCommentsCode = e.code;
    }
    assertCheck(
      "TEST-04",
      "Anon impedido de consultar tabela base blog_comments (author_email e author_ip blindados)",
      "Erro 42501 (permission_denied)",
      anonBaseCommentsBlocked ? `Erro ${anonBaseCommentsCode}` : "Consulta permitida",
      anonBaseCommentsBlocked && anonBaseCommentsCode === '42501'
    );

    // TEST-05: View pública blog_comments_public
    const anonViewComments = await client.query("SELECT * FROM public.blog_comments_public;");
    const hasEmailCol = Object.prototype.hasOwnProperty.call(anonViewComments.rows[0] || {}, 'author_email');
    const hasIpCol = Object.prototype.hasOwnProperty.call(anonViewComments.rows[0] || {}, 'author_ip');
    assertCheck(
      "TEST-05",
      "View pública retorna apenas aprovados de posts públicos e omite author_email e author_ip",
      "1 comentário ('Cliente Joao') de um total de 3; author_email e author_ip ausentes",
      `${anonViewComments.rows.length} comentário(s); autor='${anonViewComments.rows[0]?.author_name}'; email_presente: ${hasEmailCol}, ip_presente: ${hasIpCol}`,
      anonViewComments.rows.length === 1 && anonViewComments.rows[0]?.author_name === 'Cliente Joao' && !hasEmailCol && !hasIpCol
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
    // 4. MATRIZ DE AUDITORIA: ROLE authenticated (Cliente Comum & Tentativa de Escalada)
    // -------------------------------------------------------------------------
    console.log("--- 4. Auditoria da Role: authenticated (Cliente Comum & Escalada) ---");
    await client.query("SET ROLE authenticated;");

    // TEST-08: Cliente comum tem leitura base negada em posts
    let authBasePostBlocked = false;
    try {
      await client.query("SELECT * FROM public.blog_posts;");
    } catch (e) {
      authBasePostBlocked = (e.code === '42501');
    }

    // TEST-08B: Cliente comum tem leitura base negada em comments (author_email/ip blindados)
    let authBaseCommentsBlocked = false;
    try {
      await client.query("SELECT author_email, author_ip FROM public.blog_comments;");
    } catch (e) {
      authBaseCommentsBlocked = (e.code === '42501');
    }

    // TEST-08C: Cliente comum tem escrita negada
    let authWriteBlocked = false;
    try {
      await client.query("INSERT INTO public.blog_posts (title, slug) VALUES ('Hacked', 'hacked');");
    } catch (e) {
      authWriteBlocked = (e.code === '42501');
    }

    // TEST-08D: Cliente comum tem RPC negada
    let authRpcBlocked = false;
    try {
      await client.query("SELECT public.increment_blog_post_view('" + idPub + "');");
    } catch (e) {
      authRpcBlocked = (e.code === '42501');
    }

    assertCheck(
      "TEST-08",
      "Authenticated comum tem acesso base bloqueado em posts e comments, escrita e RPC negadas",
      "Posts 42501, Comments 42501, Escrita 42501, RPC 42501",
      `Posts: ${authBasePostBlocked ? '42501' : 'FAIL'}, Comments: ${authBaseCommentsBlocked ? '42501' : 'FAIL'}, Escrita: ${authWriteBlocked ? '42501' : 'FAIL'}, RPC: ${authRpcBlocked ? '42501' : 'FAIL'}`,
      authBasePostBlocked && authBaseCommentsBlocked && authWriteBlocked && authRpcBlocked
    );

    // TEST-08E: Tentativa de escalada forjando app.current_user_id
    let forgeEscalationBlocked = false;
    let forgeCode = '';
    try {
      await client.query("SELECT set_config('app.current_user_id', 'usr_editor_real', false);");
      await client.query("INSERT INTO public.blog_categories (name, slug) VALUES ('Hack', 'hack');");
    } catch (e) {
      forgeEscalationBlocked = true;
      forgeCode = e.code;
    }
    assertCheck(
      "TEST-08E",
      "Forjar app.current_user_id como editor sob role authenticated continua bloqueado por falta de GRANT",
      "Erro 42501 (permission_denied)",
      forgeEscalationBlocked ? `Erro ${forgeCode}` : "Escalada permitida indevidamente",
      forgeEscalationBlocked && forgeCode === '42501'
    );

    // -------------------------------------------------------------------------
    // 5. MATRIZ DE AUDITORIA: ROLE service_role / postgres (Backend da Athena)
    // -------------------------------------------------------------------------
    console.log("--- 5. Auditoria da Role: service_role / Backend ---");
    await client.query("RESET ROLE;");

    // TEST-09: service_role lê todos os comentários com author_email e author_ip para moderação
    const srComments = await client.query("SELECT id, author_name, author_email, author_ip, status FROM public.blog_comments ORDER BY created_at;");
    assertCheck(
      "TEST-09",
      "Backend (service_role) acessa todos os 3 comentários com author_email e author_ip visíveis para moderação",
      "3 comentários com e-mails reais ('joao@oficina.com', 'bot@spam.com', 'test@draft.com') e IPs",
      `${srComments.rows.length} comentários lidos; e-mails: [${srComments.rows.map(c => c.author_email).join(', ')}]`,
      srComments.rows.length === 3 && srComments.rows.some(c => c.author_email === 'joao@oficina.com' && c.author_ip === '189.10.20.30')
    );

    // TEST-10: RPC increment_blog_post_view por service_role
    // Estado inicial de view_counts
    const viewsBefore = await client.query("SELECT id, view_count FROM public.blog_posts ORDER BY slug;");

    // 10.1 Post publicado: incrementa
    await client.query("SELECT public.increment_blog_post_view($1);", [idPub]);
    const pPubAfter = await client.query("SELECT view_count FROM public.blog_posts WHERE id = $1;", [idPub]);

    // 10.2 Post rascunho: no-op (não incrementa)
    await client.query("SELECT public.increment_blog_post_view($1);", [idDraft]);
    const pDraftAfter = await client.query("SELECT view_count FROM public.blog_posts WHERE id = $1;", [idDraft]);

    // 10.3 UUID inexistente: no-op comprovado (nenhum post é alterado)
    const randomUuid = '00000000-0000-0000-0000-000000000000';
    await client.query("SELECT public.increment_blog_post_view($1);", [randomUuid]);
    const viewsAfterRandom = await client.query("SELECT id, view_count FROM public.blog_posts WHERE id != $1 ORDER BY slug;", [idPub]);
    const noOtherPostChanged = viewsAfterRandom.rows.every(r => Number(r.view_count) === 0);

    assertCheck(
      "TEST-10",
      "increment_blog_post_view via backend incrementa publicado e não altera rascunho nem UUID inexistente",
      "Publicado: 1 view | Rascunho: 0 views | Demais posts inalterados (0 views)",
      `Publicado: ${pPubAfter.rows[0].view_count} | Rascunho: ${pDraftAfter.rows[0].view_count} | Demais inalterados: ${noOtherPostChanged}`,
      pPubAfter.rows[0].view_count === '1' && pDraftAfter.rows[0].view_count === '0' && noOtherPostChanged
    );

    // -------------------------------------------------------------------------
    // 6. TESTES DE REVISÕES, AUDITORIA REAL DE AUTORIA E SLUGS/ALIASES
    // -------------------------------------------------------------------------
    console.log("--- 6. Auditoria de Revisões, Autoria Real e Aliases ---");

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

    // TEST-12B: Tentativa de update com app.current_user_id inexistente falha por FK
    let invalidUserFkBlocked = false;
    let invalidUserFkCode = '';
    try {
      await client.query("BEGIN;");
      await client.query("SELECT set_config('app.current_user_id', 'usr_fantasma_inexistente', true);");
      await client.query(`
        UPDATE public.blog_posts
        SET title = 'Post com Usuario Inexistente'
        WHERE id = $1;
      `, [idPub]);
      await client.query("COMMIT;");
    } catch (e) {
      await client.query("ROLLBACK;");
      invalidUserFkBlocked = true;
      invalidUserFkCode = e.code;
    }
    assertCheck(
      "TEST-12B",
      "app.current_user_id com ID inexistente falha por Foreign Key ao gravar blog_post_revisions",
      "Erro 23503 (foreign_key_violation)",
      invalidUserFkBlocked ? `Erro ${invalidUserFkCode}` : "Permitiu gravacao indevida",
      invalidUserFkBlocked && invalidUserFkCode === '23503'
    );

    // TEST-13: Cadeia de Aliases A -> B -> C colapsa todos os anteriores para C
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
    // 7. INTEGRIDADE DE THREADING DE COMENTÁRIOS
    // -------------------------------------------------------------------------
    console.log("--- 7. Auditoria de Threading de Comentários ---");

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
      `, [idDraft, idComAppr]);
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
