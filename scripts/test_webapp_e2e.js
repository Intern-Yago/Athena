import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/tmp/webapp_test_screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runWebappTesting() {
  console.log('[WEBAPP TESTING] Iniciando navegador Chromium Headless...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    const testUrl = 'http://localhost:5173/?utm_source=meta_ads&utm_medium=cpc&utm_campaign=blackfriday2026&utm_term=elevador4t';
    console.log(`[WEBAPP TESTING] Navegando para: ${testUrl}`);

    await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[WEBAPP TESTING] Pagina inicial carregada com sucesso.');

    // 1. Screenshot da Home com Catálogo
    const homeScreenshot = path.join(SCREENSHOTS_DIR, '01_homepage_catalog.png');
    await page.screenshot({ path: homeScreenshot, fullPage: false });
    console.log(`[WEBAPP TESTING] Screenshot salvo: ${homeScreenshot}`);

    // 2. Verificar Presença do Catálogo e Produtos
    await page.waitForSelector('main, .catalog-container, [data-testid="catalog"], section', { timeout: 10000 });

    // 3. Verificar UTMs armazenados no sessionStorage
    const storedUtm = await page.evaluate(() => {
      const session = sessionStorage.getItem('athena_utm_session');
      return session ? JSON.parse(session) : null;
    });

    console.log('[WEBAPP TESTING] UTM capturado no sessionStorage:', storedUtm);
    if (!storedUtm || storedUtm.utm_source !== 'meta_ads' || storedUtm.utm_campaign !== 'blackfriday2026') {
      throw new Error(`Falha na captura de UTMs: ${JSON.stringify(storedUtm)}`);
    }

    // 4. Inspecionar Card de Produto e Badges Black Friday / De-Por
    const productCards = await page.locator('article, .product-card, div:has(h3), div:has(h4)').all();
    console.log(`[WEBAPP TESTING] Total de cards de produtos/elementos encontrados: ${productCards.length}`);

    // Procurar por botão de WhatsApp para verificar link com UTM injetado
    const whatsappLinks = await page.locator('a[href*="wa.me"]').all();
    console.log(`[WEBAPP TESTING] Links de WhatsApp na pagina: ${whatsappLinks.length}`);

    let foundAttributedLink = false;
    for (const link of whatsappLinks) {
      const href = await link.getAttribute('href');
      if (href && decodeURIComponent(href).includes('blackfriday2026')) {
        foundAttributedLink = true;
        console.log('[WEBAPP TESTING] Link de WhatsApp com UTM validado:', href.slice(0, 100) + '...');
        break;
      }
    }

    console.log(`[WEBAPP TESTING] Link de WhatsApp com UTM presente: ${foundAttributedLink ? 'SIM' : 'PENDENTE (verificar carrinho)'}`);

    // 5. Testar abertura do Carrinho
    const cartButton = page.locator('button[aria-label*="carrinho" i], button:has-text("Carrinho"), button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    if (await cartButton.isVisible()) {
      console.log('[WEBAPP TESTING] Clicando no botao do carrinho...');
      await cartButton.click();
      await page.waitForTimeout(1000);

      const cartScreenshot = path.join(SCREENSHOTS_DIR, '02_cart_drawer.png');
      await page.screenshot({ path: cartScreenshot });
      console.log(`[WEBAPP TESTING] Screenshot do carrinho salvo: ${cartScreenshot}`);
    }

    // 6. Verificar erros de console
    const filteredErrors = consoleErrors.filter(err => 
      !err.includes('net::ERR_CONNECTION_REFUSED') && 
      !err.includes('Failed to load resource') &&
      !err.includes('favicon')
    );

    if (filteredErrors.length > 0) {
      console.error('[WEBAPP TESTING] ERROS CRITICOS NO CONSOLE/PAGINA:', filteredErrors);
      throw new Error(`Falha de execucao no navegador: ${filteredErrors.join(' | ')}`);
    } else {
      console.log('[WEBAPP TESTING] Zero erros criticos no console do navegador.');
    }

    // 7. Testar carregamento da página /blog e artigo individual sem erros de bundle
    console.log('[WEBAPP TESTING] Testando rota /blog...');
    await page.goto('http://localhost:5173/blog', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('aside[aria-label="Barra Lateral do Blog"]', { timeout: 15000 });

    if (consoleErrors.some(err => err.includes('TypeError') || err.includes('ReferenceError'))) {
      throw new Error(`Erro de runtime detectado no Blog: ${consoleErrors.join(' | ')}`);
    }

    console.log('[WEBAPP TESTING] Bateria de testes E2E do Anthropic Webapp-Testing concluida com SUCESSO!');
  } catch (error) {
    console.error('[WEBAPP TESTING ERROR]:', error);
    const errScreenshot = path.join(SCREENSHOTS_DIR, 'error_state.png');
    await page.screenshot({ path: errScreenshot }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runWebappTesting();
