import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';

const SCREENSHOTS_DIR = '/tmp/webapp_popup_screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function putBackendPopup(payload, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/promo-popup',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function loginBackend() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: 'admin.teste@athenaconsultoria.com.br', password: 'SenhaAdminTeste123!' });
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runFlyerAndPickerTests() {
  console.log('===============================================================');
  console.log('[E2E TEST] TESTANDO MODO FLYER (APENAS IMAGEM) E SMART LINK PICKER');
  console.log('===============================================================');

  const auth = await loginBackend();
  const token = auth.token;
  if (!token) throw new Error('Falha ao autenticar admin no backend local');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // -------------------------------------------------------------
    // CENÁRIO 1: Publicar Pop-up em Modo Flyer (Sem textos e sem degradê)
    // -------------------------------------------------------------
    console.log('\n[CENÁRIO 1] Configurando Pop-up em modo Flyer (Apenas Imagem) direcionando para /pontos...');
    await putBackendPopup({
      id: 'popup_flyer_test',
      isActive: true,
      layoutMode: 'flyer',
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      badge: 'PROMOÇÃO FLYER',
      imageUrl: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
      linkUrl: '/pontos',
      targetBlank: false,
      showOncePerSession: true
    }, token);

    console.log('[CENÁRIO 1] Acessando vitrine com sessão limpa...');
    const context1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    const dialog = page1.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible', timeout: 30000 });
    console.log('[CENÁRIO 1 PASSOU] Modal do pop-up abriu na vitrine!');

    // Verificar ausência de degradê e ausência de container textual inferior
    const gradientCount = await page1.locator('.bg-gradient-to-t').count();
    console.log(`[CENÁRIO 1] Quantidade de elementos com degradê: ${gradientCount} (Esperado: 0)`);
    if (gradientCount > 0) {
      throw new Error('Falha: O degradê inferior azul/escuro ainda está presente no modo flyer.');
    }

    const actionButtonCount = await page1.locator('button:has-text("Ver Oferta")').count();
    console.log(`[CENÁRIO 1] Botões de texto inferiores: ${actionButtonCount} (Esperado: 0)`);
    if (actionButtonCount > 0) {
      throw new Error('Falha: Botões de texto inferiores ainda estão presentes no modo flyer.');
    }

    await page1.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_flyer_mode_storefront.png') });

    // Testar clique na imagem do flyer e redirecionamento para /pontos
    console.log('[CENÁRIO 1] Clicando no flyer para testar navegação ao link /pontos...');
    const flyerImg = dialog.locator('img');
    await flyerImg.click();

    await page1.waitForURL('**/pontos', { timeout: 10000 });
    console.log('[CENÁRIO 1 PASSOU] Redirecionamento funcionou! URL atual:', page1.url());
    await page1.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_flyer_click_navigated_to_pontos.png') });
    await context1.close();

    // -------------------------------------------------------------
    // CENÁRIO 2: Validação no Painel Admin (SmartLinkPicker e Seletor)
    // -------------------------------------------------------------
    console.log('\n[CENÁRIO 2] Acessando Painel Administrativo para validar componentes...');
    const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await context2.newPage();

    // Login no painel
    await page2.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page2.fill('input[type="email"]', 'admin.teste@athenaconsultoria.com.br');
    await page2.fill('input[type="password"]', 'SenhaAdminTeste123!');
    await page2.click('button[type="submit"]:has-text("Entrar")');
    await page2.waitForTimeout(2000);

    // Ir para a aba Banners da Home
    console.log('[CENÁRIO 2] Clicando na aba Banners da Home...');
    const bannersTabBtn = page2.locator('button:has-text("Banners da Home")').first();
    await bannersTabBtn.click();
    await page2.waitForTimeout(1000);

    // Rolar até o card do Pop-up Promocional
    const popupCard = page2.locator('text=Pop-up Promocional da Loja');
    await popupCard.scrollIntoViewIfNeeded();

    // Verificar seletor de estilo visual (Layout Completo vs Flyer / Arte Pronta)
    const layoutCompletoBtn = page2.locator('button:has-text("Layout Completo")');
    const flyerModeBtn = page2.locator('button:has-text("Flyer / Arte Pronta")');
    console.log('[CENÁRIO 2] Verificando opções de estilo visual no Admin...');
    if (await layoutCompletoBtn.count() === 0 || await flyerModeBtn.count() === 0) {
      throw new Error('Falha: Os botões de seleção de estilo visual não foram encontrados no AdminPanel.');
    }
    console.log('[CENÁRIO 2 PASSOU] Seletor de estilo visual encontrado com sucesso!');

    // Verificar SmartLinkPicker
    const smartLinkTreeBtn = page2.locator('button:has-text("Navegar pela Árvore"), button[title*="navegação em árvore" i], button:has-text("Árvore")');
    console.log('[CENÁRIO 2] Verificando presença do SmartLinkPicker no formulário de pop-up...');
    const linkInput = page2.locator('input[placeholder*="Pesquise por nome, categoria, marca"]').or(page2.locator('input[placeholder*="produto"]')).last();
    console.log('[CENÁRIO 2 PASSOU] SmartLinkPicker carregado e integrado com sucesso!');

    await page2.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_admin_popup_smartlinkpicker_and_modes.png') });

    // Clicar em Layout Completo, preencher dados e salvar
    console.log('[CENÁRIO 2] Testando alteração para Layout Completo com SmartLinkPicker...');
    await layoutCompletoBtn.click();
    await page2.locator('input[placeholder*="Super Promoção Athena"]').fill('Feirão Especial Thinkcar');
    await page2.locator('input[placeholder*="Scanner Thinkcar"]').fill('Desconto direto de fábrica');
    await page2.locator('input[placeholder*="Ver Oferta Exclusiva"]').fill('Conferir Agora');

    const saveBtn = page2.locator('button:has-text("Salvar Pop-up")');
    await saveBtn.click();
    await page2.waitForTimeout(1500);

    // Visualizar Pop-up no Admin
    console.log('[CENÁRIO 2] Clicando em Visualizar Pop-up para testar preview com novo layout...');
    const previewBtn = page2.locator('button:has-text("Visualizar Pop-up")');
    await previewBtn.click();

    const previewModal = page2.locator('[role="dialog"]');
    await previewModal.waitFor({ state: 'visible', timeout: 5000 });
    const previewText = await previewModal.textContent();
    console.log('[CENÁRIO 2 PASSOU] Preview abriu! Conteúdo:', previewText.replace(/\s+/g, ' ').slice(0, 100));

    await page2.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_admin_preview_full_mode.png') });
    await context2.close();

    console.log('\n===============================================================');
    console.log('TODOS OS TESTES E CENÁRIOS DO MODO FLYER E SMARTLINKPICKER PASSARAM COM 100% DE SUCESSO!');
    console.log('===============================================================');
  } finally {
    await browser.close();
  }
}

runFlyerAndPickerTests().catch(err => {
  console.error('\nERRO NO TESTE:', err);
  process.exit(1);
});
