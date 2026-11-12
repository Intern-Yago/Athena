const { chromium } = require('playwright');
const { spawn } = require('child_process');

async function run() {
  console.log('[E2E Test] Iniciando Vite preview na porta 4173...');
  const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    stdio: 'pipe'
  });

  server.stdout.on('data', d => console.log('[Server stdout]', d.toString().trim()));
  server.stderr.on('data', d => console.error('[Server stderr]', d.toString().trim()));

  // Aguarda 3s para o preview subir
  await new Promise(r => setTimeout(r, 3000));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  page.on('pageerror', err => {
    console.error('>>> [PAGE CRITICAL ERROR]:', err.stack || err.message);
    errors.push({ type: 'pageerror', text: err.stack || err.message });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Filter out benign external tracking warnings if any
      if (!txt.includes('Failed to load resource') && !txt.includes('ERR_CONNECTION_REFUSED')) {
        console.error('>>> [CONSOLE ERROR]:', txt);
        errors.push({ type: 'console.error', text: txt });
      }
    }
  });

  try {
    // 1. Visitar Home
    console.log('\n--- ETAPA 1: Acessando Home (/) ---');
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    let body = await page.innerText('body');
    if (body.includes('Instabilidade Temporária') || body.includes('Cannot read properties of undefined')) {
      throw new Error('Tela de erro 500 detectada na Home!');
    }
    console.log('Home carregou sem erro 500!');

    // 2. Pesquisa de produtos
    console.log('\n--- ETAPA 2: Testando Pesquisa de Produtos ---');
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('scanner');
      await page.waitForTimeout(1000);
      console.log('Pesquisa preenchida com "scanner".');
      await searchInput.fill('');
      await searchInput.fill('elevador');
      await page.waitForTimeout(1000);
      console.log('Pesquisa preenchida com "elevador".');
    } else {
      console.warn('Campo de busca desktop não visível diretamente.');
    }

    // 3. Entrar em um produto
    console.log('\n--- ETAPA 3: Acessando Página de Produto ---');
    await page.goto('http://127.0.0.1:4173/produto/prod_starkx_thinktool-lite', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const productUrl = page.url();
    console.log('Navegou para produto:', productUrl);

    body = await page.innerText('body');
    if (body.includes('Instabilidade Temporária') || body.includes('Cannot read properties of undefined')) {
      throw new Error(`Tela de erro 500 detectada na página de produto (${productUrl})!`);
    }
    console.log('Página do produto carregou com sucesso!');

    // 4. Calcular Frete
    console.log('\n--- ETAPA 4: Testando Cálculo de Frete ---');
    const cepInput = page.locator('input[placeholder*="00000-000"], input[placeholder*="CEP"]').first();
    if (await cepInput.isVisible()) {
      await cepInput.fill('71996413');
      await page.waitForTimeout(500);
      const calcBtn = page.locator('button:has-text("Calcular"), button:has-text("Calcular Frete")').first();
      if (await calcBtn.isVisible()) {
        await calcBtn.click();
        await page.waitForTimeout(1500);
        console.log('Frete calculado com sucesso.');
      }
    } else {
      console.log('Input de CEP não encontrado nesta página.');
    }

    // 5. Colocar no Orçamento / Carrinho
    console.log('\n--- ETAPA 5: Colocar no Orçamento ---');
    const addBtn = page.locator('button:has-text("Adicionar ao Orçamento"), button:has-text("Colocar no Orçamento"), button:has-text("Adicionar ao Carrinho"), button:has-text("Solicitar Orçamento")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      console.log('Botão de adicionar clicado.');
    } else {
      console.log('Botão de adicionar ao orçamento não encontrado.');
    }

    // 6. Testar botão Chamar no WhatsApp
    console.log('\n--- ETAPA 6: Botão de WhatsApp ---');
    const wppBtn = page.locator('a[href*="wa.me"]').first();
    if (await wppBtn.isVisible()) {
      const href = await wppBtn.getAttribute('href');
      console.log('Botão de WhatsApp visível. Link:', href);
    }

    // 7. Visitar outras rotas críticas
    const routesToTest = [
      'http://127.0.0.1:4173/catalogo',
      'http://127.0.0.1:4173/categorias',
      'http://127.0.0.1:4173/marcas',
      'http://127.0.0.1:4173/blog',
      'http://127.0.0.1:4173/sobre'
    ];

    for (const route of routesToTest) {
      console.log(`\n--- Testando rota: ${route} ---`);
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      body = await page.innerText('body');
      if (body.includes('Instabilidade Temporária') || body.includes('Cannot read properties of undefined')) {
        throw new Error(`Tela de erro 500 detectada na rota ${route}!`);
      }
      console.log(`Rota ${route} OK!`);
    }

    console.log('\n=======================================');
    console.log('TOTAL DE ERROS DETECTADOS:', errors.length);
    errors.forEach((e, i) => console.log(`[${i+1}] ${e.type}: ${e.text}`));
    console.log('=======================================');

  } catch (err) {
    console.error('\nTESTE FALHOU COM EXCEÇÃO:', err.message);
  } finally {
    await browser.close();
    server.kill();
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

run();
