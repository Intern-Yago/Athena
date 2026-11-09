/**
 * register_equipment_catalog_specs.js
 * 
 * Calibração e Registro Rigoroso de Dimensões Reais de Equipamentos e Ferramentas Athena.
 * Cobre: Mahovi, Lapek, EAATA Brasil, Thinkcar / Stärkx, Delta Ferramentas, Planatc e Sigma Tools.
 * 
 * Atualiza:
 * - model_3d.dimensions (width, height, depth em metros)
 * - width, height, length (em centímetros)
 * - weight (em kg)
 */

const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function cleanKey(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Tabela de Engenharia Expandida: Equipamentos, Máquinas e Ferramentas
 * Dimensões em metros: width (largura), height (altura), depth (profundidade/comprimento)
 * Peso em kg: weight
 */
function getEquipmentDimensions(sku, name) {
  const cleanSku = (sku || '').trim().toUpperCase();
  const cleanName = (name || '').toLowerCase();

  // Licenças e Atualizações de Software NÃO possuem dimensões físicas
  if (cleanSku === '3D' || cleanName.includes('atualização de banco de dados') || cleanName.includes('licença')) {
    return { isDigital: true };
  }

  // ==========================================
  // 1. DUPLICADORES DE VAGAS E ESTACIONAMENTO
  // ==========================================
  if (cleanSku === 'MAH-3041' || cleanName.includes('duplicador de vagas automotivo lateral 4t')) {
    return { width: 5.12, height: 2.46, depth: 5.97, weight: 1380 };
  }
  if (cleanSku === 'MAH-3045' || cleanName.includes('duplicador de vagas automotivo torre 3t')) {
    return { width: 2.41, height: 2.11, depth: 4.72, weight: 624 };
  }
  if (cleanSku === 'MAH-3046' || cleanName.includes('duplicador de vagas automotivo torre 4t')) {
    return { width: 3.21, height: 2.46, depth: 5.96, weight: 856 };
  }

  // ==========================================
  // 2. MESAS ELEVATÓRIAS E ELEVADORES DE CARGA
  // ==========================================
  if (cleanSku === 'MAH-3005' || cleanName.includes('mesa elevatória hidráulica 1 tonelada')) {
    return { width: 0.60, height: 1.00, depth: 1.30, weight: 215 };
  }

  // ==========================================
  // 3. MÁQUINAS PARA TROCA DE FLUIDO DA TRANSMISSÃO (ATF)
  // ==========================================
  if (cleanSku === 'MAH-4001' || cleanName.includes('trocadora de fluido de câmbio automático 100% automática')) {
    return { width: 0.44, height: 1.18, depth: 0.69, weight: 65.4 };
  }
  if (cleanSku === 'MAH-4002' || cleanName.includes('troca de fluido da transmissão automática 20 litros')) {
    return { width: 0.45, height: 1.17, depth: 0.63, weight: 65 };
  }
  if (cleanSku === 'MAH-4003' || cleanName.includes('troca de fluido da transmissão automática 30 litros')) {
    return { width: 0.46, height: 1.11, depth: 0.59, weight: 38.5 };
  }
  if (cleanSku === 'DT-MFT01' || cleanSku === 'ATF001' || (cleanName.includes('máquina para troca de fluido') && cleanName.includes('transmissão'))) {
    return { width: 0.50, height: 1.15, depth: 0.55, weight: 38 };
  }

  // ==========================================
  // 4. MÁQUINAS DE ARREFECIMENTO, NITROGÊNIO E INJETORES
  // ==========================================
  if (cleanSku.startsWith('MAH-4014') || cleanName.includes('calibragem de pneus com nitrogênio')) {
    return { width: 0.65, height: 1.35, depth: 0.55, weight: 75 };
  }
  if (cleanSku.startsWith('MAH-4015') || cleanName.includes('troca de líquido do sistema de arrefecimento')) {
    return { width: 0.50, height: 1.05, depth: 0.50, weight: 35 };
  }
  if (cleanSku === 'MAH-4030' || cleanName.includes('máquina testadora e limpadora ultrassônica de bicos injetores gdi')) {
    return { width: 0.41, height: 0.43, depth: 0.39, weight: 16.6 };
  }
  if (cleanSku === 'MAH-4031' || cleanName.includes('limpador e testador de injetores de combustível')) {
    return { width: 0.40, height: 0.42, depth: 0.38, weight: 15 };
  }
  if (cleanSku === 'MAH-4040' || cleanName.includes('gerador de fumaça profissional')) {
    return { width: 0.19, height: 0.21, depth: 0.34, weight: 3.1 };
  }

  // ==========================================
  // 5. COLETORES, EXTRATORES E SANGRADORES
  // ==========================================
  if (cleanSku === 'MAH-4017' || cleanSku === 'MAH-4018' || cleanName.includes('coletor e extrator pneumático de fluidos')) {
    return { width: 0.50, height: 1.50, depth: 0.50, weight: 28 };
  }
  if (cleanSku === 'MAH-4004' || cleanName.includes('sangrador de freio pneumático 6 litros')) {
    return { width: 0.28, height: 0.55, depth: 0.28, weight: 8 };
  }
  if (cleanSku === 'MAH-4005' || cleanName.includes('sangrador de freio pneumático 10 litros')) {
    return { width: 0.32, height: 0.65, depth: 0.32, weight: 10 };
  }
  if (cleanSku === 'MAH-4009' || cleanName.includes('unidade pneumática para troca de pneus e fluido de freio')) {
    return { width: 0.45, height: 0.95, depth: 0.45, weight: 22 };
  }
  if (cleanSku === 'MAH-4010' || cleanName.includes('oxi-sanitizadora')) {
    return { width: 0.25, height: 0.35, depth: 0.20, weight: 4.5 };
  }
  if (cleanSku === 'MAH-4011' || cleanName.includes('extrator elétrico de óleo')) {
    return { width: 0.25, height: 0.30, depth: 0.25, weight: 5 };
  }

  // ==========================================
  // 6. CARRINHOS DE FERRAMENTAS E ESTAÇÕES DE DIAGNÓSTICO
  // ==========================================
  if (cleanSku === 'TTK-333' || cleanSku === 'TTK-88' || cleanName.includes('carrinho de ferramentas completo 7 gavetas')) {
    return { width: 0.69, height: 1.01, depth: 0.47, weight: 75 };
  }
  if (cleanSku === 'TPC-400' || cleanName.includes('carrinho estação de diagnóstico automotivo')) {
    return { width: 0.50, height: 1.11, depth: 0.42, weight: 25 };
  }
  if (cleanSku.includes('CARRINHO DIAGNÓSTICO') || cleanName.includes('carrinho de diagnóstico automotivo com rodízios')) {
    return { width: 0.60, height: 1.10, depth: 0.50, weight: 30 };
  }
  if (cleanSku.startsWith('120510062') || cleanName.includes('carrinho de ferramentas 7 gavetas')) {
    return { width: 0.68, height: 0.98, depth: 0.46, weight: 62 };
  }
  if (cleanSku.startsWith('120510060') || cleanName.includes('carrinho de ferramentas 6 gavetas')) {
    return { width: 0.68, height: 0.88, depth: 0.46, weight: 55 };
  }
  if (cleanSku === '87B31-16BA' || cleanName.includes('carrinho metálico extra largo')) {
    return { width: 1.15, height: 1.05, depth: 0.56, weight: 145 };
  }
  if (cleanSku.startsWith('069999006') || cleanName.includes('carrinho 3 bandejas')) {
    return { width: 0.45, height: 0.85, depth: 0.75, weight: 11 };
  }
  if (cleanSku === 'MAH-104' || cleanName.includes('carrinho profissional para mecânico')) {
    return { width: 0.47, height: 0.13, depth: 1.01, weight: 6 };
  }
  if (cleanSku === 'MAH-103' || cleanName.includes('trolley móvel')) {
    return { width: 0.60, height: 0.15, depth: 0.40, weight: 12 };
  }
  if (cleanSku === '0761091050' || cleanName.includes('spray para chassi (undercar)')) {
    return { width: 0.45, height: 1.20, depth: 0.40, weight: 8.5 };
  }
  if (cleanSku === 'WAL-101' || cleanSku === '0699990011' || cleanName.includes('banqueta multiuso') || cleanName.includes('banqueta 360')) {
    return { width: 0.40, height: 0.45, depth: 0.40, weight: 6 };
  }

  // ==========================================
  // 7. MACACOS HIDRÁULICOS, PNEUMÁTICOS E GUINCHOS
  // ==========================================
  if (cleanSku === '0761100042' || cleanName.includes('guincho hidráulico dobrável 2')) {
    return { width: 0.98, height: 1.45, depth: 1.47, weight: 60 };
  }
  if (cleanSku === 'TFJ-340' || cleanName.includes('jacaré rebaixado 4 toneladas')) {
    return { width: 0.38, height: 0.18, depth: 0.75, weight: 42 };
  }
  if (cleanSku === 'SGT-2030' || cleanName.includes('macaco jacaré rebaixado hidráulico 3')) {
    return { width: 0.34, height: 0.17, depth: 0.57, weight: 22.4 };
  }
  if (cleanSku === 'SGT-2025' || cleanName.includes('macaco jacaré rebaixado hidráulico 2,5')) {
    return { width: 0.22, height: 0.13, depth: 0.56, weight: 12.7 };
  }
  if (cleanSku === 'SGT-3035' || cleanName.includes('macaco pneumático 3,5')) {
    return { width: 0.30, height: 0.35, depth: 0.30, weight: 17.5 };
  }

  // ==========================================
  // 8. CAVALETES INDUSTRIAIS
  // ==========================================
  if (
    cleanSku.startsWith('LPK-SUP') || cleanSku === 'LPK-2TC' || cleanSku === 'LPK-3TC' || 
    cleanSku === 'LPK-12TC' || cleanName.includes('par de cavalete industrial')
  ) {
    return { width: 0.35, height: 0.60, depth: 0.35, weight: 26.8 };
  }

  // ==========================================
  // 9. SCANNERS, DIAGNÓSTICO E PROGRAMADORES
  // ==========================================
  if (cleanSku === 'EAATA360' || cleanName.includes('eaata 360pro')) {
    return { width: 0.28, height: 0.19, depth: 0.04, weight: 1.5 };
  }
  if (cleanSku.includes('PLATINUM-S10') || cleanName.includes('platinum s10 pro')) {
    return { width: 0.28, height: 0.19, depth: 0.04, weight: 1.5 };
  }
  if (cleanSku.includes('THINKTOOL-399') || cleanName.includes('thinktool expert 399')) {
    return { width: 0.30, height: 0.21, depth: 0.05, weight: 1.8 };
  }
  if (cleanSku.includes('THINKTOOL-LITE') || cleanName.includes('thinktool lite')) {
    return { width: 0.18, height: 0.13, depth: 0.03, weight: 0.45 };
  }
  if (cleanSku.startsWith('VENU-90') || cleanSku.startsWith('VENU-I-PRO') || cleanName.includes('venu 90') || cleanName.includes('venu i-pro')) {
    return { width: 0.15, height: 0.25, depth: 0.04, weight: 0.6 };
  }
  if (cleanSku === 'EPD002' || cleanName.includes('estabilizador de bateria 12v 70a')) {
    return { width: 0.32, height: 0.18, depth: 0.25, weight: 6.5 };
  }
  if (cleanSku === 'PROG-5' || cleanSku === 'PROG360BOX' || cleanSku === 'PROG2' || cleanName.includes('prog 5') || cleanName.includes('prog360box')) {
    return { width: 0.22, height: 0.08, depth: 0.18, weight: 1.2 };
  }
  if (cleanSku === 'ECM-45' || cleanName.includes('módulos ecm 45')) {
    return { width: 0.20, height: 0.06, depth: 0.15, weight: 0.9 };
  }
  if (cleanSku === 'M-TESTER' || cleanName.includes('m-tester')) {
    return { width: 0.25, height: 0.08, depth: 0.18, weight: 1.4 };
  }
  if (cleanSku === 'TBT360PRO' || cleanName.includes('tbt 360pro')) {
    return { width: 0.15, height: 0.22, depth: 0.05, weight: 0.8 };
  }
  if (cleanSku === 'TES-402' || cleanSku.includes('SCOPE USB') || cleanName.includes('videoscópio hd') || cleanName.includes('camera endoscopica')) {
    return { width: 0.15, height: 0.25, depth: 0.05, weight: 0.6 };
  }
  if (cleanSku === 'SKX-108' || cleanName.includes('skx-108')) {
    return { width: 0.10, height: 0.03, depth: 0.17, weight: 0.5 };
  }
  if (cleanSku === 'SKX-208' || cleanName.includes('skx-208')) {
    return { width: 0.08, height: 0.20, depth: 0.04, weight: 0.35 };
  }
  if (cleanSku === 'DT-TBD01' || cleanName.includes('teste de bateria digital')) {
    return { width: 0.15, height: 0.25, depth: 0.06, weight: 0.8 };
  }

  // ==========================================
  // 10. EQUIPAMENTOS PLANATC
  // ==========================================
  if (cleanSku.startsWith('TVP-4000') || cleanSku.startsWith('TVPD-1000') || cleanSku.startsWith('TVP-1500') || cleanName.includes('teste de pressão e vazão')) {
    return { width: 0.30, height: 0.13, depth: 0.33, weight: 2.4 };
  }
  if (cleanSku.startsWith('LI-3000') || cleanSku.startsWith('DBD-500') || cleanName.includes('limpeza de bicos injetores no veículo') || cleanName.includes('descarbonizador')) {
    return { width: 0.20, height: 0.45, depth: 0.20, weight: 3.5 };
  }
  if (cleanSku === 'AD-1000' || cleanName.includes('mini usina de produção de água desmineralizada')) {
    return { width: 0.40, height: 0.60, depth: 0.25, weight: 8.5 };
  }
  if (cleanSku.startsWith('CLB-850') || cleanName.includes('calibrador de pneus digital de parede')) {
    return { width: 0.30, height: 0.30, depth: 0.12, weight: 5.0 };
  }
  if (cleanSku.startsWith('CVT-VACUUM') || cleanName.includes('testador de vácuo pneumático para corpo de válvulas')) {
    return { width: 0.35, height: 0.25, depth: 0.20, weight: 4.0 };
  }
  if (cleanSku.startsWith('BVM-') || cleanName.includes('bomba de vácuo')) {
    return { width: 0.25, height: 0.08, depth: 0.32, weight: 1.8 };
  }
  if (cleanSku === 'AFA-500' || cleanName.includes('trava e auxiliar de pedal')) {
    return { width: 0.12, height: 0.08, depth: 0.75, weight: 2.1 };
  }

  // ==========================================
  // 11. CHAVES DE IMPACTO ELÉTRICAS E PNEUMÁTICAS (SIGMA TOOLS)
  // ==========================================
  if (cleanSku.startsWith('SGT-4502') || cleanName.includes('chave de impacto elétrica 1" 5.000 nm')) {
    return { width: 0.16, height: 0.15, depth: 0.50, weight: 16.2 };
  }
  if (cleanSku.startsWith('SGT-4501') || cleanName.includes('chave de impacto 1/2" - 700nm - eletrica')) {
    return { width: 0.12, height: 0.26, depth: 0.30, weight: 3.8 };
  }
  if (
    cleanSku.startsWith('SGT-0562') || cleanSku.startsWith('SGT-0563') || 
    cleanSku.startsWith('SGT-0568') || cleanName.includes('chave de impacto 1" longa') ||
    cleanName.includes('chave de impacto 1" eixo curto')
  ) {
    return { width: 0.18, height: 0.22, depth: 0.55, weight: 15.0 };
  }
  if (
    cleanSku.startsWith('SGT-0516') || cleanSku.startsWith('SGT-0518') || 
    cleanSku.startsWith('SGT-0531') || cleanName.includes('chave de impacto pneumática 1/2"')
  ) {
    return { width: 0.08, height: 0.20, depth: 0.19, weight: 2.6 };
  }
  if (cleanSku === '0703750400' || cleanSku === '0703750503' || cleanName.includes('mini chave de impacto 1/2"') || cleanName.includes('pwr-35')) {
    return { width: 0.08, height: 0.24, depth: 0.15, weight: 1.8 };
  }

  // ==========================================
  // 12. POLITRIZES E LIXADEIRAS (SIGMA TOOLS)
  // ==========================================
  if (cleanSku.startsWith('SGT-5122') || cleanSku.startsWith('SGT-5123') || cleanName.includes('sgt-5122') || cleanName.includes('sgt-5123')) {
    return { width: 0.08, height: 0.13, depth: 0.44, weight: 2.8 };
  }
  if (cleanSku.startsWith('SGT-5106') || cleanSku.startsWith('SGT-5118') || cleanName.includes('sgt-5106') || cleanName.includes('sgt-5118')) {
    return { width: 0.11, height: 0.12, depth: 0.48, weight: 2.6 };
  }
  if (cleanSku.startsWith('SGT-5125') || cleanSku.startsWith('SGT-5126') || cleanName.includes('sgt-5125') || cleanName.includes('sgt-5126')) {
    return { width: 0.09, height: 0.11, depth: 0.48, weight: 3.2 };
  }
  if (cleanSku.startsWith('SGT-5145') || cleanName.includes('sgt-5145')) {
    return { width: 0.09, height: 0.12, depth: 0.44, weight: 2.3 };
  }
  if (cleanSku.startsWith('SGT-5109') || cleanName.includes('sgt-5109')) {
    return { width: 0.08, height: 0.10, depth: 0.32, weight: 2.0 };
  }
  if (cleanSku.startsWith('SGT-1116') || cleanSku.startsWith('SGT-1119') || cleanName.includes('sgt-1116') || cleanName.includes('sgt-1119')) {
    return { width: 0.08, height: 0.10, depth: 0.20, weight: 0.9 };
  }
  if (cleanSku.startsWith('SGT-4305') || cleanName.includes('lixadeira parede 1050w')) {
    return { width: 0.26, height: 0.28, depth: 1.10, weight: 4.2 };
  }
  if (cleanSku.startsWith('SGT-4320') || cleanName.includes('lixadeira elétrica aspirada roto orbital 6"')) {
    return { width: 0.15, height: 0.12, depth: 0.24, weight: 1.1 };
  }
  if (cleanSku.startsWith('SGT-0308') || cleanSku.startsWith('SGT-0309') || cleanSku.startsWith('SGT-0320') || cleanName.includes('lixadeira orbital')) {
    return { width: 0.12, height: 0.11, depth: 0.18, weight: 1.0 };
  }

  // ==========================================
  // 13. COMPRESSORES, SOPRADORES E CARRETEIS
  // ==========================================
  if (cleanSku.startsWith('070801010') || cleanName.includes('compressor de ar isento de oleo com carretel')) {
    return { width: 0.32, height: 0.48, depth: 0.48, weight: 14.0 };
  }
  if (cleanSku === '0702560000' || cleanName.includes('pwr-5600') || cleanName.includes('soprador e aspirador de ar e pó 500w')) {
    return { width: 0.18, height: 0.20, depth: 0.40, weight: 1.6 };
  }
  if (cleanSku.startsWith('SGT-5601') || cleanSku.startsWith('SGT-5606') || cleanName.includes('soprador hurricane')) {
    return { width: 0.20, height: 0.22, depth: 0.42, weight: 1.9 };
  }
  if (cleanSku.startsWith('SGT-9001') || cleanSku.startsWith('SGT-9010') || cleanSku.startsWith('MAH-800') || cleanName.includes('carretel enrolador')) {
    return { width: 0.22, height: 0.42, depth: 0.42, weight: 7.5 };
  }
  if (cleanSku.startsWith('SGT-T-') || cleanSku.startsWith('SGT-TP-') || cleanName.includes('torquímetro de estalo')) {
    return { width: 0.06, height: 0.06, depth: 0.50, weight: 1.5 };
  }
  if (cleanSku.startsWith('SGT-3010') || cleanSku.startsWith('SGT-3710') || cleanSku.startsWith('SGT-3815') || cleanSku.startsWith('SGT-3112') || cleanName.includes('pistola de pintura')) {
    return { width: 0.11, height: 0.32, depth: 0.18, weight: 0.65 };
  }
  if (cleanSku.startsWith('SGT-9945') || cleanName.includes('tornador aspirador')) {
    return { width: 0.14, height: 0.28, depth: 0.32, weight: 1.1 };
  }
  if (cleanSku === '0699990105' || cleanName.includes('bacia coletora de óleo')) {
    return { width: 0.45, height: 0.12, depth: 0.58, weight: 4.5 };
  }

  // ==========================================
  // 14. MALETAS DE CONECTORES E EXTRACTORES
  // ==========================================
  if (cleanSku === 'MAH-4100' || cleanSku.includes('MALETA COM 85') || cleanName.includes('maleta com 85 conectores')) {
    return { width: 0.45, height: 0.15, depth: 0.35, weight: 7.5 };
  }
  if (cleanSku.includes('WAL-4000M') || cleanSku.includes('MALETA DE CONECTORES') || cleanName.includes('maleta com 19 conectores') || cleanName.includes('maleta com 20 conectores')) {
    return { width: 0.38, height: 0.12, depth: 0.28, weight: 4.0 };
  }
  if (cleanSku === 'DT-KMF01' || cleanName.includes('maleta com flanges e adaptadores')) {
    return { width: 0.45, height: 0.15, depth: 0.35, weight: 6.5 };
  }
  if (cleanSku === 'DT-SAC08' || cleanName.includes('kit extrator para injetores diesel')) {
    return { width: 0.38, height: 0.10, depth: 0.30, weight: 5.2 };
  }
  if (cleanSku === 'DT-SAC20' || cleanName.includes('kit de ferramentas com 21 peças para sacar')) {
    return { width: 0.35, height: 0.08, depth: 0.28, weight: 4.8 };
  }

  return null;
}

/**
 * Parser de dimensões explícitas no array de specs
 */
function parseSpecsDims(specs) {
  if (!Array.isArray(specs)) return null;
  let w = 0, h = 0, d = 0, weight = 0;

  for (const item of specs) {
    const s = String(item).toLowerCase();

    // Comprimento / Profundidade
    const mComp = s.match(/(?:comprimento|profundidade|longitud)\s*(?:total)?\s*[:=]\s*([\d.,]+)\s*(mm|cm|m\b)/i);
    if (mComp) {
      let val = parseFloat(mComp[1].replace(/\./g, '').replace(',', '.'));
      const unit = mComp[2].toLowerCase();
      if (unit === 'mm') val = val / 1000;
      else if (unit === 'cm') val = val / 100;
      if (val > 0.01 && val < 15) d = val;
    }

    // Largura
    const mLarg = s.match(/largura\s*(?:total)?\s*[:=]\s*([\d.,]+)\s*(mm|cm|m\b)/i);
    if (mLarg) {
      let val = parseFloat(mLarg[1].replace(/\./g, '').replace(',', '.'));
      const unit = mLarg[2].toLowerCase();
      if (unit === 'mm') val = val / 1000;
      else if (unit === 'cm') val = val / 100;
      if (val > 0.01 && val < 15) w = val;
    }

    // Altura
    const mAlt = s.match(/altura\s*(?:total|corpo)?\s*[:=]\s*([\d.,]+)\s*(mm|cm|m\b)/i);
    if (mAlt) {
      let val = parseFloat(mAlt[1].replace(/\./g, '').replace(',', '.'));
      const unit = mAlt[2].toLowerCase();
      if (unit === 'mm') val = val / 1000;
      else if (unit === 'cm') val = val / 100;
      if (val > 0.01 && val < 15) h = val;
    }

    // Peso
    const mPeso = s.match(/peso\s*(?:l[íi]quido|bruto|total|aparelho)?\s*[:=]\s*([\d.,]+)\s*(kg|g\b)/i);
    if (mPeso) {
      let val = parseFloat(mPeso[1].replace(/\./g, '').replace(',', '.'));
      const unit = mPeso[2].toLowerCase();
      if (unit === 'g') val = val / 1000;
      if (val > 0.05 && val < 20000) weight = val;
    }

    // Formato triplo: 440 x 80 x 130 mm ou 44 x 12 x 9 cm
    const mTriple = s.match(/dimens[õo]es[^\d]*([\d.,]+)\s*[xX*×]\s*([\d.,]+)\s*[xX*×]\s*([\d.,]+)\s*(mm|cm|m\b)/i);
    if (mTriple) {
      let v1 = parseFloat(mTriple[1].replace(/\./g, '').replace(',', '.'));
      let v2 = parseFloat(mTriple[2].replace(/\./g, '').replace(',', '.'));
      let v3 = parseFloat(mTriple[3].replace(/\./g, '').replace(',', '.'));
      const unit = mTriple[4].toLowerCase();
      if (unit === 'mm') { v1 /= 1000; v2 /= 1000; v3 /= 1000; }
      else if (unit === 'cm') { v1 /= 100; v2 /= 100; v3 /= 100; }
      if (v1 > 0 && v2 > 0 && v3 > 0) {
        d = v1; w = v2; h = v3;
      }
    }
  }

  if (w > 0 && h > 0 && d > 0) {
    if (Math.abs(w - 0.2) < 0.01 && Math.abs(h - 0.15) < 0.01 && Math.abs(d - 0.25) < 0.01) return null;
    return {
      width: Number(w.toFixed(2)),
      height: Number(h.toFixed(2)),
      depth: Number(d.toFixed(2)),
      weight: weight > 0 ? Number(weight.toFixed(2)) : undefined
    };
  }
  return null;
}

async function run() {
  console.log('========================================================================');
  console.log(' REGISTRO E CALIBRAÇÃO DE EQUIPAMENTOS E FERRAMENTAS ATHENA ');
  console.log('========================================================================\n');

  const { rows: products } = await pool.query(`
    SELECT id, name, sku, specs, description, height, width, length, weight, model_3d
    FROM products
    ORDER BY id ASC
  `);

  console.log(`Auditando catálogo total: ${products.length} itens.`);

  let countCalibrated = 0;
  let countSpecsExtracted = 0;
  let countPreserved = 0;

  for (const p of products) {
    const currentModel3d = (typeof p.model_3d === 'object' && p.model_3d !== null) ? p.model_3d : null;
    let finalDims = null;
    let finalWeight = Number(p.weight) || 0;
    let reason = '';

    // Se já tinha dimensões calibradas válidas, verifica se não é a dummy
    if (currentModel3d?.dimensions) {
      const curW = Number(currentModel3d.dimensions.width) || 0;
      const curH = Number(currentModel3d.dimensions.height) || 0;
      const curD = Number(currentModel3d.dimensions.depth) || 0;
      const isDummy = (Math.abs(curW - 0.2) < 0.01 && Math.abs(curH - 0.15) < 0.01 && Math.abs(curD - 0.25) < 0.01);
      if (!isDummy && curW > 0 && curH > 0 && curD > 0) {
        countPreserved++;
        continue; // Mantém intacto
      }
    }

    // 1. Tabela de Engenharia de Equipamentos e Ferramentas (Mahovi, Lapek, Sigma, EAATA, Planatc, Delta)
    const eqSpec = getEquipmentDimensions(p.sku, p.name);
    if (eqSpec) {
      if (eqSpec.isDigital) {
        finalDims = null;
        reason = 'digital_license';
      } else {
        finalDims = {
          width: eqSpec.width,
          height: eqSpec.height,
          depth: eqSpec.depth
        };
        finalWeight = eqSpec.weight || finalWeight;
        reason = 'calibrated_engineering';
        countCalibrated++;
      }
    }

    // 2. Parser estrito de specs caso não esteja na tabela direta
    if (!finalDims && reason !== 'digital_license') {
      const parsed = parseSpecsDims(p.specs);
      if (parsed) {
        finalDims = {
          width: parsed.width,
          height: parsed.height,
          depth: parsed.depth
        };
        if (parsed.weight) finalWeight = parsed.weight;
        reason = 'specs_extracted';
        countSpecsExtracted++;
      }
    }

    // Se encontramos dimensões reais e verificadas:
    if (finalDims) {
      const updatedModel = {
        ...(currentModel3d || {}),
        dimensions: {
          width: finalDims.width,
          height: finalDims.height,
          depth: finalDims.depth
        }
      };

      const wCm = Math.round(finalDims.width * 100);
      const hCm = Math.round(finalDims.height * 100);
      const lCm = Math.round(finalDims.depth * 100);

      await pool.query(`
        UPDATE products
        SET 
          model_3d = $1::jsonb,
          width = $2::numeric,
          height = $3::numeric,
          length = $4::numeric,
          weight = CASE WHEN $5::numeric > 0 THEN $5::numeric ELSE weight END
        WHERE id = $6::text
      `, [
        JSON.stringify(updatedModel),
        wCm,
        hCm,
        lCm,
        finalWeight > 0 ? finalWeight : null,
        p.id
      ]);
    }
  }

  console.log('\n========================================================================');
  console.log(' RESULTADO DA CALIBRAÇÃO DE EQUIPAMENTOS');
  console.log('========================================================================');
  console.log(`✅ Equipamentos já calibrados previamente preservados: ${countPreserved}`);
  console.log(`🔧 Novos equipamentos e ferramentas registrados (Mahovi, Sigma, EAATA, Planatc, Delta, Lapek): ${countCalibrated}`);
  console.log(`📐 Produtos com medidas comprovadas extraídas das especificações técnicas: ${countSpecsExtracted}`);
  console.log(`🚀 Total calibrado nesta etapa: ${countCalibrated + countSpecsExtracted}`);
  console.log('========================================================================');

  await pool.end();
}

run().catch(err => {
  console.error('Erro na calibração:', err);
  process.exit(1);
});
