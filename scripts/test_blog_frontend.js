import { chromium } from 'playwright';

async function run() {
  console.log('[TEST] Iniciando verificacao automatizada do frontend do Blog...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER]', msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  // Test 1: Navegar para /blog
  console.log('[TEST 1] Acessando /blog...');
  await page.goto('http://localhost:5173/blog', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('article', { timeout: 15000 });

  // Verificar título da página
  const heading = await page.locator('h1').first();
  const headingText = await heading.textContent();
  console.log(`[TEST 1] Titulo h1 encontrado: "${headingText?.trim()}"`);
  if (!headingText || !headingText.includes('Blog Athena')) {
    throw new Error(`Titulo do blog inesperado: ${headingText}`);
  }

  // Verificar botões de categoria
  const categoryCount = await page.locator('button:has-text("Todos"), button:has-text("Artigos"), button:has-text("Diagnóstico")').count();
  console.log(`[TEST 1] Filtros de categoria encontrados: ${categoryCount}`);
  if (categoryCount === 0) {
    throw new Error('Filtros de categoria nao foram encontrados na pagina de listagem.');
  }

  // Verificar artigos na página
  const articleElements = await page.locator('article').count();
  console.log(`[TEST 1] Artigos renderizados na pagina: ${articleElements}`);
  if (articleElements === 0) {
    throw new Error('Nenhum artigo foi renderizado na listagem do blog.');
  }

  // Screenshot listagem
  await page.screenshot({ path: 'scripts/blog_listing.png', fullPage: false });
  console.log('[TEST 1] Screenshot salva em scripts/blog_listing.png');

  // Test 2: Navegar para artigo individual
  console.log('[TEST 2] Navegando para leitura de artigo...');
  const firstArticleLink = page.locator('article a[href*="/blog/"]').first();
  const linkCount = await firstArticleLink.count();
  console.log(`[TEST 2] Links de artigo encontrados dentro de article: ${linkCount}`);
  if (linkCount > 0) {
    const href = await firstArticleLink.getAttribute('href');
    console.log(`[TEST 2] Clicando no link: ${href}`);
    await firstArticleLink.click();
  } else {
    console.log('[TEST 2] Clicando no article element diretamente...');
    await page.locator('article').first().click();
  }

  await page.waitForTimeout(2000);
  console.log(`[TEST 2] URL atual: ${page.url()}`);
  await page.screenshot({ path: 'scripts/after_click.png', fullPage: false });

  const articleTitle = await page.locator('article h1').first().textContent();
  console.log(`[TEST 2] Titulo do artigo lido: "${articleTitle?.trim()}"`);
  if (!articleTitle) {
    throw new Error('Titulo h1 do artigo nao encontrado.');
  }

  // Verificar componentes essenciais: Compartilhar, Comentários, Form de Comentário
  const shareButtons = await page.locator('button[title*="WhatsApp"], button[title*="LinkedIn"], button:has-text("Copiar Link")').count();
  console.log(`[TEST 2] Botoes de compartilhamento: ${shareButtons}`);
  if (shareButtons === 0) {
    throw new Error('Botoes de compartilhamento nao encontrados no artigo.');
  }

  const commentHeading = await page.locator('text=Comentários Técnicos').count();
  console.log(`[TEST 2] Secao de comentarios tecnicos: ${commentHeading}`);
  if (commentHeading === 0) {
    throw new Error('Secao de comentarios tecnicos nao encontrada.');
  }

  const honeypotField = await page.locator('input[name="empresa_fantasma_hp"]').count();
  console.log(`[TEST 2] Campo Honeypot antispam: ${honeypotField > 0 ? 'PRESENTE' : 'AUSENTE'}`);
  if (honeypotField === 0) {
    throw new Error('Campo Honeypot de seguranca nao encontrado no formulario.');
  }

  await page.screenshot({ path: 'scripts/blog_article.png', fullPage: false });
  console.log('[TEST 2] Screenshot salva em scripts/blog_article.png');

  // Test 3: Links no Header e Footer
  console.log('[TEST 3] Verificando presenca do Blog no Header e Footer...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  const headerBlog = await page.locator('header button:has-text("Blog"), header a:has-text("Blog")').count();
  console.log(`[TEST 3] Link Blog Header: ${headerBlog > 0 ? 'OK' : 'NAO ENCONTRADO'}`);

  const footerBlog = await page.locator('footer button:has-text("Blog"), footer a:has-text("Blog")').count();
  console.log(`[TEST 3] Link Blog Footer: ${footerBlog > 0 ? 'OK' : 'NAO ENCONTRADO'}`);

  if (headerBlog === 0 || footerBlog === 0) {
    throw new Error('Link do Blog nao encontrado no Header ou no Footer.');
  }

  // Test 4: Aba de Gestão do Blog no Painel Administrativo
  console.log('[TEST 4] Testando acesso e componentes do Painel Administrativo do Blog...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  console.log('[TEST 4] Preenchendo credenciais do admin de teste...');
  await page.fill('input[type="email"]', 'admin.teste@athenaconsultoria.com.br');
  await page.fill('input[type="password"]', 'SenhaAdminTeste123!');

  const submitBtn = page.locator('button[type="submit"]:has-text("Entrar")');
  await submitBtn.click();
  console.log('[TEST 4] Login submetido. Aguardando montagem do AdminPanel...');
  await page.waitForTimeout(2500);

  // Aguarda o painel admin carregar completamente
  console.log('[TEST 4] Aguardando carregamento do Painel Admin...');
  await page.waitForSelector('aside', { timeout: 30000 });
  console.log('[TEST 4] Elemento aside (sidebar) encontrado.');

  const asideBlogBtn = page.locator('aside button:has-text("Blog & Artigos")');
  await asideBlogBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log('[TEST 4] Botao Blog & Artigos na sidebar visivel.');

  await asideBlogBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'scripts/blog_admin_tab_clicked.png' });
  const h2Texts = await page.locator('h2').allTextContents();
  console.log('[TEST 4] H2s presentes apos clique na sidebar:', h2Texts);

  // Verificar se a aba abriu (procurando o h2 da Gestão do Blog)
  const blogTabHeading = page.locator('h2:has-text("Gestão do Blog")');
  await blogTabHeading.waitFor({ state: 'visible', timeout: 15000 });
  console.log('[TEST 4] Aba Gestão do Blog confirmada aberta.');

  // Verificar botão Novo Artigo
  const newPostBtn = page.locator('button:has-text("Novo Artigo")').first();
  await newPostBtn.click();
  await page.waitForSelector('h3:has-text("Novo Artigo")', { timeout: 10000 });
  console.log('[TEST 4] Modal de criacao de artigo aberto com sucesso.');

  // Fechar modal
  await page.locator('button:has-text("Cancelar")').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scripts/blog_admin.png', fullPage: false });
  console.log('[TEST 4] Screenshot da gestao administrativa salva em scripts/blog_admin.png');

  console.log('[TEST] SUCESSO: Todos os testes do frontend do Blog e Painel Administrativo foram aprovados com êxito!');
  await browser.close();
}

run().catch((err) => {
  console.error('[ERRO TESTE BLOG]:', err);
  process.exit(1);
});
