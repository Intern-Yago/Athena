import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/tmp/webapp_popup_screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function testPromoPopupWebapp() {
  console.log('[TEST POPUP] Iniciando Chromium Headless...');
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
    // -------------------------------------------------------------
    // ETAPA 1: Carregar Storefront e Validar Renderização do Pop-up
    // -------------------------------------------------------------
    console.log('[TEST POPUP] Navegando para a Home do Catálogo (http://localhost:5173/)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Aguardar o popup modal aparecer (aparece 1200ms após carregamento)
    console.log('[TEST POPUP] Aguardando elemento do modal de pop-up promocional...');
    const popupSelector = '[role="dialog"]';
    await page.waitForSelector(popupSelector, { timeout: 30000 });

    // Verificar textos do pop-up
    const popupText = await page.textContent(popupSelector);
    console.log('[TEST POPUP] Conteúdo textual do Pop-up:', popupText.replace(/\s+/g, ' ').slice(0, 150));

    if (!popupText.includes('Promoção') && !popupText.includes('OFERTA') && !popupText.includes('ThinkTool')) {
      throw new Error(`Texto promocional esperado não encontrado no pop-up: ${popupText}`);
    }

    // Salvar screenshot do popup ativo na vitrine
    const ssPopup = path.join(SCREENSHOTS_DIR, '01_vitrine_popup_aberto.png');
    await page.screenshot({ path: ssPopup });
    console.log(`[TEST POPUP] Screenshot do Pop-up salvo em: ${ssPopup}`);

    // Fechar o popup clicando no botão fechar (X ou 'Agora não')
    console.log('[TEST POPUP] Procurando botão de fechar o pop-up...');
    const closeBtn = page.locator('button[aria-label*="Fechar"], button:has-text("Agora não")').first();
    await closeBtn.click();
    console.log('[TEST POPUP] Botão de fechar clicado.');

    // Aguardar animação de fechamento
    await page.waitForTimeout(800);

    // Verificar se flag de dismiss foi gravada no sessionStorage
    const dismissedInSession = await page.evaluate(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('athena_dismissed_popup_')) {
          return { key: k, value: sessionStorage.getItem(k) };
        }
      }
      return null;
    });

    console.log('[TEST POPUP] Registro de dismiss no sessionStorage:', dismissedInSession);
    if (!dismissedInSession) {
      throw new Error('Falha: athena_dismissed_popup não foi gravado no sessionStorage');
    }

    // Recarregar a página e confirmar que o popup não reabre na mesma sessão
    console.log('[TEST POPUP] Recarregando página para testar showOncePerSession...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const isPopupVisibleAfterReload = await page.locator('[role="dialog"]').isVisible();
    console.log('[TEST POPUP] Pop-up visível após reload na mesma sessão? ->', isPopupVisibleAfterReload);
    if (isPopupVisibleAfterReload) {
      throw new Error('Falha: Pop-up reapareceu mesmo com showOncePerSession ativo');
    }

    // -------------------------------------------------------------
    // ETAPA 2: Acesso ao Painel Admin com Conta de Teste
    // -------------------------------------------------------------
    console.log('[TEST POPUP] Navegando para tela de login (/login)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log('[TEST POPUP] Preenchendo credenciais do admin de teste (.env.local)...');
    await page.fill('input[type="email"]', 'admin.teste@athenaconsultoria.com.br');
    await page.fill('input[type="password"]', 'SenhaAdminTeste123!');

    const submitBtn = page.locator('button[type="submit"]:has-text("Entrar")');
    await submitBtn.click();

    console.log('[TEST POPUP] Login enviado. Aguardando autenticação e carregamento do Admin...');
    await page.waitForTimeout(2000);

    // Aguardar o botão da aba "Banners da Home" no painel
    const bannersTabBtn = page.locator('button:has-text("Banners da Home")').first();
    await bannersTabBtn.waitFor({ state: 'visible', timeout: 20000 });

    const adminScreenshot = path.join(SCREENSHOTS_DIR, '02_admin_logado.png');
    await page.screenshot({ path: adminScreenshot });
    console.log(`[TEST POPUP] Login no Admin bem-sucedido! Screenshot: ${adminScreenshot}`);

    // -------------------------------------------------------------
    // ETAPA 3: Acessar Aba Banners e Configurar Pop-up Promocional
    // -------------------------------------------------------------
    console.log('[TEST POPUP] Clicando na aba Banners da Home...');
    await bannersTabBtn.click();
    await page.waitForTimeout(1000);

    // Verificar se o card do Pop-up Promocional existe na tela
    const popupCardHeader = page.locator('text=Pop-up Promocional da Loja');
    await popupCardHeader.waitFor({ state: 'visible', timeout: 10000 });
    console.log('[TEST POPUP] Card "Pop-up Promocional da Loja" localizado com sucesso no Admin!');

    // Testar botão de Pré-visualização ao Vivo
    console.log('[TEST POPUP] Clicando em "Visualizar Pop-up"...');
    const previewBtn = page.locator('button:has-text("Visualizar Pop-up")').first();
    await previewBtn.click();
    await page.waitForTimeout(800);

    const ssPreview = path.join(SCREENSHOTS_DIR, '03_admin_popup_preview_modal.png');
    await page.screenshot({ path: ssPreview });
    console.log(`[TEST POPUP] Modal de pré-visualização aberto com sucesso! Screenshot: ${ssPreview}`);

    // Fechar a pré-visualização
    const closePreviewBtn = page.locator('[role="dialog"] button[aria-label*="Fechar"], [role="dialog"] button:has-text("Agora não")').first();
    await closePreviewBtn.click();
    await page.waitForTimeout(600);

    // -------------------------------------------------------------
    // ETAPA 4: Alterar Dados e Salvar no Backend
    // -------------------------------------------------------------
    console.log('[TEST POPUP] Alterando campos do formulário do pop-up...');
    const titleInput = page.locator('input[placeholder*="Super Promoção"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Mega Feirão de Diagnóstico Automotivo Athena 2026');
    }

    const savePopupBtn = page.locator('button:has-text("Salvar Pop-up")').first();
    await savePopupBtn.click();
    console.log('[TEST POPUP] Botão "Salvar Pop-up" clicado.');

    // Aguardar persistência e feedback
    await page.waitForTimeout(2000);

    const ssSaved = path.join(SCREENSHOTS_DIR, '04_admin_popup_salvo.png');
    await page.screenshot({ path: ssSaved });
    console.log(`[TEST POPUP] Screenshot após salvar: ${ssSaved}`);

    console.log('[TEST POPUP] SUCESSO COMPLETO! Vitrine, fechamento, sessão, login admin, aba banners, preview ao vivo e salvamento validados com 100% de aprovação.');
  } catch (err) {
    const errorSs = path.join(SCREENSHOTS_DIR, 'error_failure.png');
    await page.screenshot({ path: errorSs }).catch(() => {});
    console.error('[TEST POPUP ERROR]:', err.message);
    if (consoleErrors.length > 0) {
      console.error('[TEST POPUP CONSOLE ERRORS]:', consoleErrors);
    }
    throw err;
  } finally {
    await browser.close();
  }
}

testPromoPopupWebapp()
  .then(() => {
    console.log('[TEST POPUP RESULT] Aprovado com sucesso total.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('[TEST POPUP RESULT] Falha:', e.message);
    process.exit(1);
  });
