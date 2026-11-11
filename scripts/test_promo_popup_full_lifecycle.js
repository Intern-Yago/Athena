import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';

const SCREENSHOTS_DIR = '/tmp/webapp_popup_screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Helper para consultar o backend diretamente via HTTP
function fetchBackendPopup() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/promo-popup', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runFullPopupLifecycleTest() {
  console.log('===============================================================');
  console.log('[E2E LIFECYCLE] INICIANDO TESTE COMPLETO DO CICLO DO POP-UP');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const uniqueId = Date.now().toString().slice(-4);
  const customTitle = `Mega Feirão Diagnóstico Athena #${uniqueId}`;
  const customBadge = `DESCONTO VIP #${uniqueId}`;

  try {
    // ------------------------------------------------------------------
    // TESTE 1: O pop-up abre na vitrine inicial?
    // ------------------------------------------------------------------
    console.log('\n[TESTE 1] Verificando se o pop-up abre na vitrine inicial para novos visitantes...');
    const context1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page1 = await context1.newPage();

    await page1.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const popupModal = page1.locator('[role="dialog"]');
    await popupModal.waitFor({ state: 'visible', timeout: 30000 });

    const initialText = await popupModal.textContent();
    console.log('[TESTE 1 PASSOU] Pop-up abriu com sucesso na vitrine!');
    console.log('[TESTE 1] Conteúdo inicial detectado:', initialText.replace(/\s+/g, ' ').slice(0, 100));

    await page1.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_lifecycle_popup_inicial.png') });

    // Fechar o popup e verificar dismiss
    const closeBtn = page1.locator('button[aria-label*="Fechar"], button:has-text("Agora não")').first();
    await closeBtn.click();
    await page1.waitForTimeout(600);

    const dismissed = await page1.evaluate(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('athena_dismissed_popup_')) return true;
      }
      return false;
    });
    console.log('[TESTE 1 PASSOU] Pop-up fechado e flag gravada no sessionStorage?', dismissed);
    if (!dismissed) throw new Error('Flag de dismiss não gravada no sessionStorage');

    await context1.close();

    // ------------------------------------------------------------------
    // TESTE 2: Registro e Persistência no Admin (consegue registrar e realmente salva?)
    // ------------------------------------------------------------------
    console.log('\n[TESTE 2] Acessando Admin para registrar e salvar novas configurações...');
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await adminPage.fill('input[type="email"]', 'admin.teste@athenaconsultoria.com.br');
    await adminPage.fill('input[type="password"]', 'SenhaAdminTeste123!');
    await adminPage.click('button[type="submit"]:has-text("Entrar")');
    await adminPage.waitForTimeout(2000);

    const bannersTabBtn = adminPage.locator('button:has-text("Banners da Home")').first();
    await bannersTabBtn.waitFor({ state: 'visible', timeout: 20000 });
    await bannersTabBtn.click();
    await adminPage.waitForTimeout(1000);

    await adminPage.locator('text=Pop-up Promocional da Loja').waitFor({ state: 'visible', timeout: 10000 });

    // Preencher novo Título e novo Selo / Badge
    console.log(`[TESTE 2] Inserindo Título customizado: "${customTitle}"`);
    console.log(`[TESTE 2] Inserindo Selo customizado: "${customBadge}"`);

    const titleInput = adminPage.locator('input[placeholder*="Super Promoção"]').first();
    await titleInput.fill(customTitle);

    const badgeInput = adminPage.locator('input[placeholder*="OFERTA EXCLUSIVA"]').first();
    await badgeInput.fill(customBadge);

    // Clicar em Salvar Pop-up e interceptar a resposta HTTP
    const [response] = await Promise.all([
      adminPage.waitForResponse(res => res.url().includes('/api/promo-popup') && res.request().method() === 'PUT', { timeout: 10000 }),
      adminPage.click('button:has-text("Salvar Pop-up")')
    ]);

    console.log('[TESTE 2] Resposta HTTP do salvamento no backend:', response.status());
    if (response.status() !== 200) {
      throw new Error(`Falha ao salvar no backend, status retornado: ${response.status()}`);
    }

    await adminPage.waitForTimeout(1000);
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_lifecycle_admin_salvo.png') });

    // Consulta direta à API do backend para provar persistência no banco
    const backendDataAfterSave = await fetchBackendPopup();
    console.log('[TESTE 2 PASSOU] Dados confirmados no backend/banco de dados:', {
      title: backendDataAfterSave.title,
      badge: backendDataAfterSave.badge,
      isActive: backendDataAfterSave.isActive
    });

    if (backendDataAfterSave.title !== customTitle || backendDataAfterSave.badge !== customBadge) {
      throw new Error(`Dados salvos no backend divergem do esperado! Esperado: ${customTitle}, Obtido: ${backendDataAfterSave.title}`);
    }

    // ------------------------------------------------------------------
    // TESTE 3: O pop-up abre quando salvo, exibindo exatamente os novos dados?
    // ------------------------------------------------------------------
    console.log('\n[TESTE 3] Abrindo vitrine com nova sessão limpa para checar se abre com os novos dados salvos...');
    const context2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page2 = await context2.newPage();

    await page2.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    const popupModal2 = page2.locator('[role="dialog"]');
    await popupModal2.waitFor({ state: 'visible', timeout: 30000 });

    // Aguardar o título customizado ser refletido no pop-up ativo da vitrine
    await page2.waitForSelector(`[role="dialog"]:has-text("${customTitle}")`, { timeout: 15000 });

    const newPopupText = await popupModal2.textContent();
    console.log('[TESTE 3] Texto do pop-up na vitrine:', newPopupText.replace(/\s+/g, ' ').slice(0, 150));

    if (!newPopupText.includes(customTitle)) {
      throw new Error(`O pop-up abriu na vitrine, mas não continha o título recém-salvo: "${customTitle}"`);
    }
    if (!newPopupText.includes(customBadge)) {
      throw new Error(`O pop-up abriu na vitrine, mas não continha o badge recém-salvo: "${customBadge}"`);
    }

    console.log('[TESTE 3 PASSOU] O pop-up abriu na vitrine exibindo perfeitamente os novos dados salvos!');
    await page2.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_lifecycle_vitrine_novos_dados.png') });
    await context2.close();

    // ------------------------------------------------------------------
    // TESTE 4: Se desativar o pop-up, ele realmente salva como desativado?
    // ------------------------------------------------------------------
    console.log('\n[TESTE 4] Desativando o pop-up no Painel Admin (Status Desligado)...');
    // Clicar no card do toggle de ativação
    const toggleCard = adminPage.locator('text=Status do Pop-up').locator('..').locator('..');
    await toggleCard.click();
    await adminPage.waitForTimeout(500);

    const [toggleResponse] = await Promise.all([
      adminPage.waitForResponse(res => res.url().includes('/api/promo-popup') && res.request().method() === 'PUT', { timeout: 10000 }),
      adminPage.click('button:has-text("Salvar Pop-up")')
    ]);

    console.log('[TESTE 4] Status HTTP do salvamento após desativar:', toggleResponse.status());
    await adminPage.waitForTimeout(1000);

    const backendDataAfterDisable = await fetchBackendPopup();
    console.log('[TESTE 4 PASSOU] Status do pop-up no backend após desativar:', { isActive: backendDataAfterDisable.isActive });
    if (backendDataAfterDisable.isActive !== false) {
      throw new Error('Falha: o backend ainda retornou isActive: true após desativação');
    }

    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_lifecycle_admin_desativado.png') });

    // ------------------------------------------------------------------
    // TESTE 5: Se não tiver nada ativo no pop-up, ele NÃO aparece na vitrine?
    // ------------------------------------------------------------------
    console.log('\n[TESTE 5] Verificando se na vitrine o pop-up NÃO aparece quando desativado...');
    const context3 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page3 = await context3.newPage();

    await page3.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    // Aguardar tempo suficiente para o timer de 1200ms expirar
    await page3.waitForTimeout(3000);

    const isVisibleWhenDisabled = await page3.locator('[role="dialog"]').isVisible();
    console.log('[TESTE 5] Pop-up visível na vitrine quando desativado? ->', isVisibleWhenDisabled);

    if (isVisibleWhenDisabled) {
      throw new Error('Falha grave: O pop-up apareceu na vitrine mesmo estando desativado no painel!');
    }
    console.log('[TESTE 5 PASSOU] Confirmado! O pop-up não aparece quando está desativado.');
    await page3.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_lifecycle_vitrine_sem_popup.png') });
    await context3.close();

    // ------------------------------------------------------------------
    // TESTE 6: Reativar o pop-up e confirmar que volta a aparecer
    // ------------------------------------------------------------------
    console.log('\n[TESTE 6] Reativando o pop-up para restaurar vitrine...');
    await toggleCard.click();
    await adminPage.waitForTimeout(500);

    await Promise.all([
      adminPage.waitForResponse(res => res.url().includes('/api/promo-popup') && res.request().method() === 'PUT', { timeout: 10000 }),
      adminPage.click('button:has-text("Salvar Pop-up")')
    ]);
    await adminPage.waitForTimeout(1000);

    const context4 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page4 = await context4.newPage();
    await page4.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page4.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 30000 });
    console.log('[TESTE 6 PASSOU] Pop-up reativado com sucesso e visível novamente na vitrine!');

    await adminContext.close();
    await context4.close();

    console.log('\n===============================================================');
    console.log('[E2E LIFECYCLE] TODOS OS 6 CENÁRIOS FORAM VALIDADOS COM 100% DE SUCESSO!');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n[E2E LIFECYCLE ERROR]:', err.message);
    throw err;
  } finally {
    await browser.close();
  }
}

runFullPopupLifecycleTest()
  .then(() => {
    console.log('[TEST RESULT] APROVADO COM LOUVOR!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('[TEST RESULT] FALHA:', e.message);
    process.exit(1);
  });
