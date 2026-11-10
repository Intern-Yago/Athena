const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSecurityMatrixTest() {
  const client = await pool.connect();
  console.log("==================================================================");
  console.log("INICIANDO BATERIA DE TESTES DE SEGURANÇA E RLS: MÓDULO BLOG (ISOLADO)");
  console.log("Trava estrita: Execução dentro de transação temporária com ROLLBACK 100%");
  console.log("==================================================================\n");

  const results = [];
  function assertTest(name, condition, details = '') {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? 'PASS' : 'FAIL'}] ${name} ${details ? `(${details})` : ''}`);
  }

  try {
    await client.query("BEGIN;");

    // 1. Criar schema isolado para testes para zero impacto no banco
    await client.query("CREATE SCHEMA test_blog_sandbox;");
    await client.query("GRANT USAGE ON SCHEMA test_blog_sandbox TO anon, authenticated;");
    await client.query("SET search_path = test_blog_sandbox, public;");

    // 2. Carregar e adaptar migration para o schema isolado
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '../migrations/2026_11_10_blog_module_baseline.sql'),
      'utf8'
    );
    // Substitui 'public.blog_' por 'test_blog_sandbox.blog_' e funções relacionadas, mantendo public.users e public.set_updated_at_timestamp
    let sandboxSql = migrationSql
      .replace(/public\.blog_/g, 'test_blog_sandbox.blog_')
      .replace(/public\.is_blog_admin_or_editor/g, 'test_blog_sandbox.is_blog_admin_or_editor')
      .replace(/public\.validate_blog_comment_thread/g, 'test_blog_sandbox.validate_blog_comment_thread')
      .replace(/public\.record_blog_post_revision/g, 'test_blog_sandbox.record_blog_post_revision')
      .replace(/public\.increment_blog_post_view/g, 'test_blog_sandbox.increment_blog_post_view');
    await client.query(sandboxSql);
    console.log("Migration aplicada com sucesso no schema temporário test_blog_sandbox.\n");

    // -------------------------------------------------------------------------
    // TESTE 1: Inserção de Dados de Teste via service_role / superusuário
    // -------------------------------------------------------------------------
    console.log("--- FASE 1: Setup de Dados de Teste ---");
    // Artigo 1: Publicado no passado
    const p1 = await client.query(`
      INSERT INTO test_blog_sandbox.blog_posts (
        title, slug, excerpt, content, content_html, status, published_at
      ) VALUES (
        'Artigo Publicado Passado', 'artigo-passado', 'Resumo', '[]'::jsonb, '<p>HTML</p>', 'published', NOW() - INTERVAL '1 day'
      ) RETURNING id;
    `);
    const postPublishedId = p1.rows[0].id;

    // Artigo 2: Agendado para o futuro
    const p2 = await client.query(`
      INSERT INTO test_blog_sandbox.blog_posts (
        title, slug, excerpt, content, content_html, status, published_at
      ) VALUES (
        'Artigo Futuro Agendado', 'artigo-futuro', 'Resumo', '[]'::jsonb, '<p>HTML</p>', 'published', NOW() + INTERVAL '5 days'
      ) RETURNING id;
    `);
    const postFutureId = p2.rows[0].id;

    // Artigo 3: Rascunho
    const p3 = await client.query(`
      INSERT INTO test_blog_sandbox.blog_posts (
        title, slug, excerpt, content, content_html, status
      ) VALUES (
        'Artigo em Rascunho', 'artigo-rascunho', 'Resumo', '[]'::jsonb, '<p>HTML</p>', 'draft'
      ) RETURNING id;
    `);
    const postDraftId = p3.rows[0].id;

    // Categorias
    const catRes = await client.query(`
      INSERT INTO test_blog_sandbox.blog_categories (name, slug) 
      VALUES ('Equipamentos', 'equipamentos') RETURNING id;
    `);
    const catId = catRes.rows[0].id;

    // Vincula categorias a publicado e a rascunho
    await client.query(`
      INSERT INTO test_blog_sandbox.blog_post_categories (post_id, category_id)
      VALUES ($1, $3), ($2, $3);
    `, [postPublishedId, postDraftId, catId]);

    // Comentário 1: Aprovado no post publicado
    const c1 = await client.query(`
      INSERT INTO test_blog_sandbox.blog_comments (
        post_id, author_name, author_email, content, status
      ) VALUES (
        $1, 'Cliente Joao', 'joao.privado@oficina.com.br', 'Excelente elevador!', 'approved'
      ) RETURNING id;
    `, [postPublishedId]);
    const comment1Id = c1.rows[0].id;

    // Comentário 2: Pendente no post publicado
    await client.query(`
      INSERT INTO test_blog_sandbox.blog_comments (
        post_id, author_name, author_email, content, status
      ) VALUES (
        $1, 'Spammer', 'spam@malicioso.com', 'Compre aqui barato', 'pending'
      );
    `, [postPublishedId]);

    console.log("Dados de teste preparados.\n");

    // -------------------------------------------------------------------------
    // TESTE 2: Proteção de Posts - anon lê rascunho ou post futuro?
    // -------------------------------------------------------------------------
    console.log("--- FASE 2: Matriz de Leitura Pública (Role: anon) ---");
    await client.query("SET LOCAL ROLE anon;");

    // Teste 2.1: Leitura de posts sob anon
    const anonPosts = await client.query("SELECT id, slug, status FROM test_blog_sandbox.blog_posts;");
    assertTest(
      "Anon não pode listar rascunhos",
      !anonPosts.rows.some(p => p.slug === 'artigo-rascunho'),
      `Retornou ${anonPosts.rows.length} posts`
    );
    assertTest(
      "Anon não pode listar artigos agendados para o futuro",
      !anonPosts.rows.some(p => p.slug === 'artigo-futuro'),
      `Artigo futuro oculto com sucesso`
    );
    assertTest(
      "Anon visualiza apenas artigos publicados no passado",
      anonPosts.rows.length === 1 && anonPosts.rows[0].slug === 'artigo-passado',
      `Visível: ${anonPosts.rows.map(p => p.slug).join(', ')}`
    );

    // Teste 2.2: Categorias de posts - vazamento de rascunhos
    const anonPostCats = await client.query("SELECT post_id FROM test_blog_sandbox.blog_post_categories;");
    assertTest(
      "Anon não pode ver vínculo de categorias de artigos em rascunho",
      !anonPostCats.rows.some(pc => pc.post_id === postDraftId),
      `Vínculos visíveis: ${anonPostCats.rows.length}`
    );

    // -------------------------------------------------------------------------
    // TESTE 3: Blindagem LGPD / PII de Comentários
    // -------------------------------------------------------------------------
    console.log("\n--- FASE 3: Blindagem de PII (author_email) sob Role: anon ---");
    
    // Teste 3.1: Tentativa direta de consultar author_email na tabela base
    let emailLeakBlocked = false;
    await client.query("SAVEPOINT sp_email;");
    try {
      await client.query("SELECT author_email FROM test_blog_sandbox.blog_comments;");
    } catch (err) {
      if (err.code === '42501') { // permission_denied
        emailLeakBlocked = true;
      } else {
        console.error("Erro inesperado ao consultar email:", err);
      }
      await client.query("ROLLBACK TO SAVEPOINT sp_email;");
    }
    assertTest(
      "Tentativa de SELECT (author_email) por anon é bloqueada pelo banco (Erro 42501)",
      emailLeakBlocked,
      "Privilégio negado com sucesso"
    );

    // Teste 3.2: Consulta na VIEW pública segura
    const publicComments = await client.query("SELECT * FROM test_blog_sandbox.blog_comments_public;");
    const hasEmailField = Object.prototype.hasOwnProperty.call(publicComments.rows[0] || {}, 'author_email');
    assertTest(
      "View pública blog_comments_public NÃO possui coluna author_email",
      !hasEmailField,
      "LGPD preservada"
    );
    assertTest(
      "View pública retorna apenas comentários com status = 'approved'",
      publicComments.rows.length === 1 && publicComments.rows[0].author_name === 'Cliente Joao',
      `Comentários aprovados visíveis: ${publicComments.rows.length}`
    );

    // -------------------------------------------------------------------------
    // TESTE 4: Tentativas Públicas de Inserção Indevida
    // -------------------------------------------------------------------------
    console.log("\n--- FASE 4: Trava de Inserção de Comentários sob Role: anon ---");

    // Teste 4.1: Tentar inserir comentário em artigo em rascunho
    let insertInDraftBlocked = false;
    await client.query("SAVEPOINT sp_draft_comment;");
    try {
      await client.query(`
        INSERT INTO test_blog_sandbox.blog_comments (
          post_id, author_name, author_email, content, status
        ) VALUES (
          $1, 'Visitante', 'vis@teste.com', 'Comentando no rascunho', 'pending'
        );
      `, [postDraftId]);
    } catch (err) {
      insertInDraftBlocked = true;
      await client.query("ROLLBACK TO SAVEPOINT sp_draft_comment;");
    }
    assertTest(
      "Anon não pode comentar em artigos com status = draft (RLS Check)",
      insertInDraftBlocked,
      "Inserção em rascunho rejeitada"
    );

    // Teste 4.2: Tentar inserir comentário forjando status = 'approved'
    let insertForgedStatusBlocked = false;
    await client.query("SAVEPOINT sp_forged_status;");
    try {
      await client.query(`
        INSERT INTO test_blog_sandbox.blog_comments (
          post_id, author_name, author_email, content, status
        ) VALUES (
          $1, 'Hacker', 'hacker@teste.com', 'Bypassing moderation', 'approved'
        );
      `, [postPublishedId]);
    } catch (err) {
      insertForgedStatusBlocked = true;
      await client.query("ROLLBACK TO SAVEPOINT sp_forged_status;");
    }
    assertTest(
      "Anon não pode forjar status = 'approved' na inserção (RLS Check)",
      insertForgedStatusBlocked,
      "Auto-aprovação rejeitada"
    );

    // Teste 4.3: Tentar inserir comentário forjando is_official = true
    let insertForgedOfficialBlocked = false;
    await client.query("SAVEPOINT sp_forged_official;");
    try {
      await client.query(`
        INSERT INTO test_blog_sandbox.blog_comments (
          post_id, author_name, author_email, content, status, is_official
        ) VALUES (
          $1, 'Falso Suporte', 'suporte@teste.com', 'Sou suporte oficial', 'pending', true
        );
      `, [postPublishedId]);
    } catch (err) {
      insertForgedOfficialBlocked = true;
      await client.query("ROLLBACK TO SAVEPOINT sp_forged_official;");
    }
    assertTest(
      "Anon não pode forjar is_official = true na inserção (RLS Check)",
      insertForgedOfficialBlocked,
      "Selos falsos rejeitados"
    );

    // -------------------------------------------------------------------------
    // TESTE 5: Retorno ao Role Administrativo para Teste de Triggers & Integridade
    // -------------------------------------------------------------------------
    await client.query("RESET ROLE;");
    console.log("\n--- FASE 5: Triggers de Integridade, Threading e Histórico Automático ---");

    // Teste 5.1: Threading Cross-Post - parent_id de outro post
    let crossPostThreadBlocked = false;
    await client.query("SAVEPOINT sp_cross_post;");
    try {
      await client.query(`
        INSERT INTO test_blog_sandbox.blog_comments (
          post_id, parent_id, author_name, author_email, content, status
        ) VALUES (
          $1, $2, 'Invasor', 'inv@teste.com', 'Tentando amarrar comentário no post errado', 'pending'
        );
      `, [postFutureId, comment1Id]);
    } catch (err) {
      if (err.message.includes('Violação de integridade')) {
        crossPostThreadBlocked = true;
      }
      await client.query("ROLLBACK TO SAVEPOINT sp_cross_post;");
    }
    assertTest(
      "Trigger trg_validate_blog_comment_thread impede respostas em artigos diferentes",
      crossPostThreadBlocked,
      "Threading estrito garantido"
    );

    // Teste 5.2: Contador de views atômico via RPC increment_blog_post_view
    await client.query("SELECT test_blog_sandbox.increment_blog_post_view($1);", [postPublishedId]);
    const postAfterView = await client.query("SELECT view_count FROM test_blog_sandbox.blog_posts WHERE id = $1;", [postPublishedId]);
    assertTest(
      "RPC increment_blog_post_view incrementa visualização com atomicidade",
      postAfterView.rows[0].view_count === 1,
      `view_count atual: ${postAfterView.rows[0].view_count}`
    );

    // Teste 5.3: Trigger de Histórico de Revisões e Redirecionamento 301 de Slug
    await client.query(`
      UPDATE test_blog_sandbox.blog_posts
      SET title = 'Artigo Passado Atualizado com Novo Titulo',
          slug = 'artigo-passado-novo-slug',
          content_html = '<p>HTML Versão 2</p>'
      WHERE id = $1;
    `, [postPublishedId]);

    const revisions = await client.query("SELECT * FROM test_blog_sandbox.blog_post_revisions WHERE post_id = $1;", [postPublishedId]);
    assertTest(
      "Trigger trg_record_blog_post_revision grava snapshot pré-edição automaticamente",
      revisions.rows.length === 1 && revisions.rows[0].title === 'Artigo Publicado Passado',
      `Snapshot registrado com título original`
    );

    const aliases = await client.query("SELECT * FROM test_blog_sandbox.blog_slug_aliases WHERE target_post_id = $1;", [postPublishedId]);
    assertTest(
      "Alteração de slug gera automaticamente alias para redirecionamento 301",
      aliases.rows.length === 1 && aliases.rows[0].old_slug === 'artigo-passado' && aliases.rows[0].target_slug === 'artigo-passado-novo-slug',
      `Alias gerado: ${aliases.rows[0]?.old_slug} -> ${aliases.rows[0]?.target_slug}`
    );

    // -------------------------------------------------------------------------
    // ROLLBACK TOTAL: Zero resíduos no banco compartilhado
    // -------------------------------------------------------------------------
    await client.query("ROLLBACK;");
    console.log("\n==================================================================");
    console.log("ROLLBACK EXECUTADO COM SUCESSO: ZERO ALTERAÇÕES NO SUPABASE");
    console.log("==================================================================");

    const passedCount = results.filter(r => r.passed).length;
    console.log(`\nRESUMO FINAL: ${passedCount}/${results.length} TESTES APROVADOS.`);
    if (passedCount !== results.length) {
      process.exit(1);
    }
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("FALHA NA EXECUÇÃO DO TESTE:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSecurityMatrixTest().catch(console.error);
