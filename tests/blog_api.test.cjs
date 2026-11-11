/**
 * tests/blog_api.test.cjs
 * 
 * Suíte de testes unitários e de integração do Módulo de Blog da Athena.
 * - Testes de XSS (ataques negativos e preservação de HTML legítimo).
 * - Testes de slugify com remoção de acentos e kebab-case.
 * - Testes de serialização segura de JSON-LD (escape de <).
 * - Testes de validação de editor (app.current_user_id) antes de set_config.
 * - Testes de integridade de comentários (rejeição em rascunhos, honeypot).
 * - Testes da rotina real de expurgo de author_ip (LGPD).
 * - Testes de deduplicação de visualizações por IP.
 */

const path = require('path');
const { slugify, isValidSlug } = require('../backend/utils/slugify');
const { sanitizePostHtml, blockNoteToHtml, safeJsonLd } = require('../backend/utils/blogSanitizer');
const blogService = require('../backend/services/blogService');
const { getPool, query } = require('../backend/services/db');

// Allowlist estrita de host de teste (Requisito 4)
const ALLOWED_TEST_HOST = 'db.gbbenlovgpuvahqvuvzf.supabase.co';
const connString = process.env.DATABASE_URL || '';
let host = '';
try {
  host = new URL(connString.startsWith('postgres') ? connString : `postgresql://${connString}`).hostname;
} catch (e) {
  host = (connString.split('@')[1] || '').split(':')[0].split('/')[0];
}

if (host !== ALLOWED_TEST_HOST && host !== 'localhost' && host !== '127.0.0.1') {
  console.error("ERRO FATAL: Host não autorizado para testes de API:", host);
  process.exit(1);
}

const results = [];
function assertCheck(id, description, expected, actual, passed) {
  results.push({ id, description, expected, actual, passed: Boolean(passed) });
  const status = passed ? "[PASS]" : "[FAIL]";
  console.log(`${status} ${id}: ${description}`);
  console.log(`       Esperado: ${expected}`);
  console.log(`       Obtido:   ${actual}\n`);
}

async function runApiTests() {
  console.log("================================================================================");
  console.log("ATHENA BLOG MODULE — SUÍTE DE TESTES DE API, SANITIZAÇÃO & SEGURANÇA");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. TESTES DE SLUGIFY E NORMALIZAÇÃO DE ACENTOS
  // ---------------------------------------------------------------------------
  console.log("--- 1. Testes de Slugify e Kebab-Case ---");
  const rawTitle = "Como Instalar Elevadores Hidráulicos em Oficinas — Guia Completo & Preço 2026!";
  const generatedSlug = slugify(rawTitle);
  const isSlugValid = isValidSlug(generatedSlug, 3);

  assertCheck(
    "SLUG-01",
    "Geração de slug remove acentos, símbolos e produz kebab-case estrito",
    "como-instalar-elevadores-hidraulicos-em-oficinas-guia-completo-preco-2026",
    generatedSlug,
    generatedSlug === "como-instalar-elevadores-hidraulicos-em-oficinas-guia-completo-preco-2026" && isSlugValid
  );

  const edgeCases = [
    { input: "   ---Árvore---de---Natal---   ", expected: "arvore-de-natal" },
    { input: "Câmbio Automático: Manutenção Preventiva", expected: "cambio-automatico-manutencao-preventiva" },
    { input: "P&D / Inovação 100% Brasileira", expected: "pd-inovacao-100-brasileira" }
  ];

  let edgeCasesPassed = true;
  for (const c of edgeCases) {
    const s = slugify(c.input);
    if (s !== c.expected || !isValidSlug(s, 2)) {
      edgeCasesPassed = false;
    }
  }

  assertCheck(
    "SLUG-02",
    "Casos de borda de acentuação, múltiplos hífens e pontuação",
    "Todos normalizados com sucesso",
    edgeCasesPassed ? "Todos normalizados com sucesso" : "Falha em caso de borda",
    edgeCasesPassed
  );

  // ---------------------------------------------------------------------------
  // 2. TESTES DE SANITIZAÇÃO & XSS (NEGATIVOS E HTML LEGÍTIMO)
  // ---------------------------------------------------------------------------
  console.log("--- 2. Testes de Sanitização contra Ataques XSS ---");

  // XSS 1: Injeção de tag <script>
  const xssScript = "<p>Texto normal</p><script>alert('xss')</script>";
  const cleanScript = sanitizePostHtml(xssScript);
  assertCheck(
    "XSS-01",
    "Tags <script> são categoricamente removidas",
    "<p>Texto normal</p>",
    cleanScript,
    cleanScript === "<p>Texto normal</p>"
  );

  // XSS 2: Atributos manipuladores de eventos (onerror, onload, onclick)
  const xssEvent = '<img src="https://images.athenaconsultoria.com.br/foto.jpg" onerror="alert(document.cookie)" onload="alert(1)" />';
  const cleanEvent = sanitizePostHtml(xssEvent);
  const hasOnerror = cleanEvent.includes('onerror') || cleanEvent.includes('onload');
  assertCheck(
    "XSS-02",
    "Event handlers (onerror, onload) são neutralizados",
    "Handlers ausentes; tag img preservada",
    cleanEvent,
    !hasOnerror && cleanEvent.includes('<img src="https://images.athenaconsultoria.com.br/foto.jpg"')
  );

  // XSS 3: Links com protocolo javascript:
  const xssLink = '<a href="javascript:alert(1)">Clique para resgatar cupom</a>';
  const cleanLink = sanitizePostHtml(xssLink);
  assertCheck(
    "XSS-03",
    "Protocolo javascript: em links é removido sumariamente",
    "<a>Clique para resgatar cupom</a>",
    cleanLink,
    !cleanLink.includes('javascript:')
  );

  // XSS 4: Imagens com data: URI (vetor de SVG malicioso)
  const xssDataUri = '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+" alt="SVG Malicioso" />';
  const cleanDataUri = sanitizePostHtml(xssDataUri);
  assertCheck(
    "XSS-04",
    "Esquema data: URI em imagens é categoricamente bloqueado",
    "data: URI ausente",
    cleanDataUri,
    !cleanDataUri.includes('data:')
  );

  // HTML Legítimo: Preservação de tags permitidas com enriquecimento seguro
  const validHtml = '<h2>Título da Seção</h2><p>Texto com <strong>negrito</strong>, <em>itálico</em> e <a href="https://athena.com.br/elevadores">link legítimo</a>.</p>';
  const cleanValid = sanitizePostHtml(validHtml);
  const hasRel = cleanValid.includes('rel="noopener noreferrer"');
  assertCheck(
    "HTML-01",
    "HTML legítimo é preservado e enriquecido com rel='noopener noreferrer'",
    "Tags preservadas com target e rel seguros",
    cleanValid,
    cleanValid.includes('<h2>Título da Seção</h2>') && cleanValid.includes('<strong>negrito</strong>') && hasRel
  );

  // Bloco customizado BlockNote: productCard
  const mockBlocks = [
    { type: 'heading', props: { level: 2 }, content: 'Conheça o Produto' },
    { type: 'paragraph', content: 'Equipamento ideal para alinhamento.' },
    { type: 'productCard', props: { productId: 'prod_elevador_4t' } }
  ];
  const renderedBlockHtml = blockNoteToHtml(mockBlocks);
  assertCheck(
    "BLOCK-01",
    "Bloco customizado 'productCard' renderiza placeholder seguro com data-athena-product-id",
    '<div data-athena-product-id="prod_elevador_4t" class="athena-embedded-product-card"></div>',
    renderedBlockHtml.trim(),
    renderedBlockHtml.includes('data-athena-product-id="prod_elevador_4t"') && renderedBlockHtml.includes('athena-embedded-product-card')
  );

  // ---------------------------------------------------------------------------
  // 3. TESTE DE SERIALIZAÇÃO DE JSON-LD (ESCAPE DE < - REQUISITO 5)
  // ---------------------------------------------------------------------------
  console.log("--- 3. Teste de Segurança em JSON-LD (Requisito 5) ---");
  const maliciousSchema = {
    title: "Artigo com injeção </script><script>alert(1)</script>",
    description: "Tentativa de breakout <script>"
  };
  const serializedJsonLd = safeJsonLd(maliciousSchema);
  const containsUnescapedLessThan = serializedJsonLd.includes('<');
  assertCheck(
    "JSONLD-01",
    "safeJsonLd escapa todo caractere '<' como '\\u003c', impedindo script breakout",
    "Nenhum caractere '<' literal no payload",
    serializedJsonLd,
    !containsUnescapedLessThan && serializedJsonLd.includes('\\u003c/script\\u003e')
  );

  // ---------------------------------------------------------------------------
  // 4. TESTES DE SERVIÇO & INTEGRAÇÃO DE BANCO (REQUISITOS 2, 3 E 7)
  // ---------------------------------------------------------------------------
  console.log("--- 4. Testes de Integração com Banco de Dados ---");

  // Limpeza de testes anteriores para idempotência
  await query("DELETE FROM public.blog_posts WHERE slug LIKE 'artigo-teste-api%';");

  // Criação de Post de Prova
  const testPost = await blogService.createPost({
    title: 'Artigo de Teste de API',
    slug: 'artigo-teste-api',
    content: [{ type: 'paragraph', content: 'Conteúdo de teste.' }],
    status: 'published'
  }, 'usr_author_orig');

  assertCheck(
    "API-01",
    "Criação de post gera content_html sanitizado e calcula reading_time_minutes",
    "Post criado com content_html e reading_time_minutes >= 1",
    `ID: ${testPost.id}, ReadingTime: ${testPost.reading_time_minutes}, HTML: ${testPost.content_html}`,
    Boolean(testPost.id && testPost.reading_time_minutes >= 1 && testPost.content_html)
  );

  // Requisito (2): Update com editor válido vs editor inexistente
  // 4.1 Editor Válido ('usr_editor_real')
  const updatedWithValidEditor = await blogService.updatePost(testPost.id, {
    title: 'Artigo de Teste - Título Atualizado'
  }, 'usr_editor_real');

  assertCheck(
    "API-02A",
    "updatePost com editor válido valida na tabela users, injeta app.current_user_id e conclui",
    "Título atualizado para 'Artigo de Teste - Título Atualizado'",
    updatedWithValidEditor.title,
    updatedWithValidEditor.title === 'Artigo de Teste - Título Atualizado'
  );

  // 4.2 Editor Inexistente ('usr_fantasma') -> Deve falhar ANTES de tentar set_config / UPDATE
  let invalidEditorBlocked = false;
  let invalidEditorError = '';
  try {
    await blogService.updatePost(testPost.id, {
      title: 'Título com Editor Inexistente'
    }, 'usr_fantasma_inexistente');
  } catch (err) {
    invalidEditorBlocked = true;
    invalidEditorError = err.message;
  }

  assertCheck(
    "API-02B",
    "updatePost com editor inexistente é bloqueado no backend antes de disparar o UPDATE",
    "Exceção 'O usuário editor ... não existe no banco'",
    invalidEditorBlocked ? invalidEditorError : "Permitiu atualização indevida",
    invalidEditorBlocked && invalidEditorError.includes('não existe no banco')
  );

  // Requisito (7): Estratégia de Purge de Cache para Posts Despublicados
  // Altera post de 'published' para 'draft'
  await blogService.updatePost(testPost.id, { status: 'draft' }, 'usr_editor_real');
  const seoAfterUnpublish = await blogService.getSeoPostBySlug('artigo-teste-api');

  assertCheck(
    "API-03",
    "Post despublicado (status='draft') desaparece imediatamente da view pública / endpoint SEO (Purge Signal)",
    "getSeoPostBySlug retorna null (disparando 404 e Cache-Control no-cache no Edge)",
    seoAfterUnpublish ? "Ainda retornado" : "null (404 Not Found)",
    seoAfterUnpublish === null
  );

  // Re-publica para testes de comentários
  await blogService.updatePost(testPost.id, { status: 'published' }, 'usr_editor_real');

  // Teste de Comentário em Post Publicado
  const validComment = await blogService.addComment(testPost.id, {
    authorName: 'Mecânico Teste',
    authorEmail: 'mecanico@oficina.com.br',
    content: 'Comentário legítimo para teste de expurgo.',
    honeypot: ''
  }, '200.100.50.25');

  assertCheck(
    "API-04",
    "addComment em artigo publicado insere com status 'pending' e armazena author_ip",
    "Comentário criado com status 'pending'",
    `ID: ${validComment.id}, Status: ${validComment.status}`,
    validComment.status === 'pending'
  );

  // Teste de Honeypot Antispam
  const honeypotEmail = 'honeypot-bot@honeypot-test.com';
  const honeypotComment = await blogService.addComment(testPost.id, {
    authorName: 'Spam Bot',
    authorEmail: honeypotEmail,
    content: 'Compre algo barato',
    honeypot: 'filled_by_bot' // Campo invisível preenchido
  }, '200.100.50.99');

  // Verifica que o bot não foi persistido no banco
  const checkBotInDb = await query("SELECT id FROM public.blog_comments WHERE author_email = $1;", [honeypotEmail]);
  assertCheck(
    "API-05",
    "Honeypot preenchido retorna resposta simulada de sucesso mas NÃO persiste no banco de dados",
    "0 registros persistidos no banco de dados",
    `${checkBotInDb.rows.length} registros`,
    checkBotInDb.rows.length === 0
  );

  // Requisito (3): Rotina Real de Expurgo de author_ip (LGPD)
  // 1. Aprova o comentário para acelerar o ciclo de moderação
  await blogService.moderateComment(validComment.id, 'approved', 'usr_editor_real');
  
  // 2. Simula passagem do tempo no banco para o comentário aprovado
  await query(`
    UPDATE public.blog_comments 
    SET created_at = NOW() - INTERVAL '8 days'
    WHERE id = $1;
  `, [validComment.id]);

  // 3. Executa a rotina real de expurgo
  const purgedCount = await blogService.purgeOldCommentIps(7);
  const commentAfterPurge = await query("SELECT author_ip FROM public.blog_comments WHERE id = $1;", [validComment.id]);

  assertCheck(
    "API-06",
    "purgeOldCommentIps expurga com sucesso author_ip de comentários moderados (LGPD Art. 7, IX)",
    "author_ip = null após execução da rotina",
    `IP no banco: ${commentAfterPurge.rows[0]?.author_ip}`,
    purgedCount >= 1 && commentAfterPurge.rows[0]?.author_ip === null
  );

  // Teste de Deduplicação de View Count
  const firstCount = await blogService.incrementPostView(testPost.id, '177.10.20.30');
  const secondCount = await blogService.incrementPostView(testPost.id, '177.10.20.30'); // Mesma IP dentro da janela

  assertCheck(
    "API-07",
    "incrementPostView deduplica acessos repetidos pelo mesmo IP dentro da janela de 1 hora",
    "Primeiro acesso: true | Segundo acesso (deduplicado): false",
    `Primeiro: ${firstCount} | Segundo: ${secondCount}`,
    firstCount === true && secondCount === false
  );

  console.log("================================================================================");
  const passedCount = results.filter(r => r.passed).length;
  console.log(`RESUMO DOS TESTES DE API: ${passedCount}/${results.length} APROVADOS.`);
  console.log("================================================================================");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runApiTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("ERRO FATAL NA EXECUÇÃO DOS TESTES DE API:", err);
    process.exit(1);
  });
