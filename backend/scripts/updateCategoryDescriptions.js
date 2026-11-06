const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/DATABASE_URL=([^\r\n]+)/);
if (!match) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const { Pool } = require('../node_modules/pg');
const pool = new Pool({
  connectionString: match[1].replace(/[\"']/g, ''),
  ssl: { rejectUnauthorized: false }
});

const categoryDescriptions = {
  // ELEVAÇÃO & MECÂNICA PESADA
  'cat_elevadores': 'Elevadores hidráulicos automotivos de 2 e 4 colunas com travas de segurança mecânicas e elétricas, capacidade de 4 a 5 toneladas para veículos leves, SUVs e caminhonetes.',
  'cat_1787862527630': 'Elevadores pantográficos tipo tesoura de embutir e sobrepor o piso, com dupla sincronização hidráulica, ideais para centros automotivos com otimização de espaço e agilidade no atendimento.',
  'cat_1788192370106': 'Mesas e elevadores pantográficos especializados para remoção, sustentação e instalação segura de pacotes de baterias de veículos elétricos (VE) e híbridos, com isolamento e ajuste milimétrico.',
  'cat_1787859780339': 'Duplicadores de vagas automotivas e estacionamento vertical de 2 colunas, com sistema de bloqueio de queda e operação hidráulica suave para concessionárias, garagens e oficinas.',
  'cat_1787861438469': 'Rampas para alinhamento de direção computadorizado e rampas plásticas reforçadas para elevação rápida, garantindo nivelamento perfeito e alta segurança para geometria veicular.',
  'cat_1789587656316': 'Macacos hidráulicos tipo jacaré de perfil rebaixado, macacos garrafa para linha pesada, macacos telescópicos para transmissão e suportes para sustentação veicular.',
  'cat_1790178421551': 'Cavaletes giratórios e suportes universais para sustentação, desmontagem e retífica de motores com travas de rotação 360° e base estrutural de alta estabilidade.',

  // BORRACHARIA, PNEUS & ALINHAMENTO
  'cat_alinhadores': 'Sistemas de alinhamento de direção 3D computadorizados de alta precisão com leitura instantânea por câmeras digitais, torres móveis e alvos passivos sem cabos ou eletrônica nas rodas.',
  'cat_desmontadoras': 'Desmontadoras automáticas com braço auxiliar pneumático para pneus de perfil baixo e Run-Flat, balanceadoras digitais 3D com autocalibração e linha pesada para caminhões e ônibus.',
  'cat_1790016852133': 'Calibradores eletrônicos de pneus com display digital e sinal sonoro, manômetros analógicos de precisão, medidores de profundidade de sulco e réguas de cambagem.',
  'cat_1790004280111': 'Bicos de inflagem rápida, mangueiras espirais reforçadas, engates automáticos, garras auxiliares de montagem e protetores de aro em polímero resistente a riscos.',
  'cat_1789998064578': 'Válvulas padrão TR414, TR413 e metálicas para rodas esportivas, núcleos de retenção de alta pressão, adaptadores de extensão e tampas com vedação para linha leve e pesada.',
  'cat_1790018712284': 'Manchões radiais e diagonais, vulcanizadores elétricos, lixas rotativas, raspadeiras, agulhas aplicadoras e cimento vulcanizante para conserto a frio e a quente.',

  // AUTO ELÉTRICA & DIAGNÓSTICO
  'cat_scanners': 'Scanners automotivos profissionais multimarca com inteligência artificial, leitura de protocolos CAN-FD/DoIP, diagnóstico guiado, osciloscópio integrado e videoscópios de alta definição.',
  'cat_1789414354078': 'Testadores digitais de condutância para baterias chumbo-ácido, EFB e AGM com emissão de laudo impresso, analisadores de alternador e de sistema de partida 12V e 24V.',
  'cat_1788377224759': 'Máquinas computadorizadas de limpeza e teste de bicos injetores convencionais e injeção direta (GDI/FSI/THP), com cuba de ultrassom aquecida e ensaio de estanqueidade e leque.',
  'cat_1789665153180': 'Analisadores de gases de escape de 4 e 5 gases, opacímetros para motores ciclo Diesel e geradores de fumaça para diagnóstico rápido de vazamentos de admissão e EVAP.',
  'cat_1788270975595': 'Assinaturas anuais e pacotes de atualização de software para scanners de diagnóstico, com liberação de novos esquemas elétricos, calibração ADAS e procedimentos guiados.',
  'cat_1790625158162': 'Wallboxes e estações de carregamento para veículos elétricos e híbridos plug-in (AC 7kW a 22kW), com conectividade Wi-Fi/4G, controle de acesso RFID e protocolos OCPP.',
  'cat_1790625361659': 'Carregadores portáteis de emergência e residenciais para veículos elétricos, com conector Tipo 2 (Mennekes), display digital informativo e proteções contra sobretensão.',
  'cat_1790625264032': 'Cabos de extensão para carregamento de veículos elétricos (Tipo 2 para Tipo 2), suportes de parede para cabos e plugs, pedestais para totens e capas protetoras.',
  'cat_1790705648938': 'Quadros de proteção elétrica dedicados para eletropostos com disjuntor termomagnético, dispositivo contra surtos (DPS) e interruptor DR Tipo B sensível a correntes residuais DC.',
  'cat_1790627904180': 'Multímetros digitais True-RMS com certificação CAT IV para alta tensão de híbridos e elétricos, alicates amperímetros DC e ferramentas de medição isoladas 1000V.',

  // FERRAMENTAS MANUAIS & SOQUETES
  'cat_ferramentas': 'Jogos completos de soquetes sextavados e estriados, chaves combinadas, alicates universais, esmerilhadeiras e ferramentas especiais em aço Cromo-Vanádio para manutenção mecânica pesada.',
  'cat_1790341668541': 'Kits de fasagem, travas de comando de válvulas e ferramentas de ponto para troca correta de correia e corrente de sincronismo em motores VW, GM, Fiat, Renault, BMW, Volvo e Mercedes.',
  'cat_1789498107322': 'Sacadores de polias, engrenagens e rolamentos com garras ajustáveis, extratores de juntas homocinéticas, pistas de rolamento e saca-pivôs sem danificar as peças.',
  'cat_1789499887542': 'Ferramentas para recolhimento e retorno de êmbolos de pinças de freio a disco, alicates para molas de sapatas de tambor e sangradores de fluido de freio manuais e pneumáticos.',
  'cat_1789405752776': 'Soquetes manuais e de impacto com encaixes de 1/4", 3/8", 1/2", 3/4" e 1", perfis Torx, Allen, estriados e sextavados longos para acesso a locais difíceis.',
  'cat_1789067073450': 'Catracas reversíveis de liberação rápida com mecanismos de 72 dentes de alta resistência, cabos emborrachados ergonômicos e extensões flexíveis para aperto rápido.',
  'cat_1789075823822': 'Torquímetros de estalo e digitais com certificado de calibração, para controle rigoroso de torque de aperto em cabeçotes, bielas, rodas e componentes críticos do motor.',
  'cat_1789496349243': 'Manifolds digitais e analógicos, kits de desacoplamento Spring Lock para linhas de A/C, chaves de válvula de serviço e extratores de embreagem de compressores.',
  'cat_1790615097459': 'Manômetros de pressão e vazão para linha de combustível, alicates de engate rápido para mangueiras de filtro e chaves de soltar porca plástica de bomba de combustível.',
  'cat_1790615634326': 'Encolhedores de molas de suspensão helicoidal manuais e pneumáticos, extratores de terminais de direção e chaves especiais para remoção de buchas e amortecedores.',
  'cat_1790616153068': 'Centralizadores universais de disco de embreagem, ferramentas de reset e instalação de embreagens duplas (Powershift/DSG) e kits de reparo de câmbio manual e automático.',
  'cat_1789073912116': 'Multiplicadores de torque (desforcímetros mecânicos planetários) para soltar porcas emperradas de rodas de caminhões, tratores e linha automotiva pesada com esforço mínimo.',

  // PNEUMÁTICA & FERRAMENTAS A BATERIA
  'cat_1788453768939': 'Chaves de impacto pneumáticas e a bateria de 1/2", 3/4" e 1" com mecanismo Twin Hammer de alto torque, carcaça reforçada em compósito e controle de velocidade reversível.',
  'cat_1789409045834': 'Parafusadeiras pneumáticas e elétricas sem escovas de carvão (Brushless), com mandril de aperto rápido, múltiplos níveis de regulagem de torque e iluminação LED de trabalho.',
  'cat_1789407125697': 'Furadeiras retas e angulares pneumáticas para locais de difícil acesso, além de modelos elétricos de alta rotação com mandril metálico e botão de inversão de sentido.',
  'cat_1789410127824': 'Parafusadeiras de impacto compactas a bateria com encaixe sextavado de 1/4", garantindo alta velocidade de aparafusamento em painéis, forros e montagens mecânicas rápidas.',

  // TROCA DE ÓLEO, FLUIDOS & LUBRIFICAÇÃO
  'cat_1788371138282': 'Máquinas automáticas e manuais para troca e limpeza de fluido de transmissão automática (ATF), sistema de arrefecimento do radiador e fluido de direção hidráulica com visores de fluxo.',
  'cat_1790179785560': 'Coletores e drenadores de óleo automotivo por gravidade e vácuo, com câmara de medição graduada transparente, rodas reforçadas e mangueiras de descarte rápido.',
  'cat_1790191269984': 'Engraxadeiras manuais e pneumáticas com bico acoplador reforçado, bombas manuais de transferência de óleo para diferenciais e caixas de câmbio.',

  // FUNILARIA, PINTURA & ESTÉTICA
  'cat_estetica_pintura': 'Politrizes rotativas e roto-orbitais para polimento e espelhamento técnico de pintura, lixadeiras pneumáticas, canhões de espuma Snow Foam, tornadores de limpeza interna e aplicadores cerâmicos.',
  'cat_1788296844334': 'Geradores de ozônio (oxi-sanitização) e máquinas nebulizadoras ultrassônicas para higienização profissional de dutos de ventilação veicular, eliminando odores, ácaros, bactérias e vírus.',

  // MOBILIÁRIO & ORGANIZAÇÃO DE OFICINA
  'cat_1790345836898': 'Armários modulares de oficina com lixeira e pia integradas, bancadas de trabalho pesadas, carrinhos porta-ferramentas com gavetas chaveadas e gaveteiros rolamentados Wolfcar e Sigma.',
  'cat_1789401844085': 'Carrinhos ergonômicos de apoio para chave de impacto pesada de 1" e bancos giratórios acolchoados para mecânicos, prevenindo fadiga lombar e aumentando a produtividade.',
  'cat_1789413477954': 'Luminárias automotivas de LED articuladas sob o capô, bandejas magnéticas porta-parafusos, esteiras dobráveis de mecânico e organizadores de bancada.'
};

async function execute() {
  try {
    await pool.query('BEGIN');
    let updatedCount = 0;
    for (const [id, desc] of Object.entries(categoryDescriptions)) {
      const res = await pool.query('UPDATE categories SET description = $1 WHERE id = $2', [desc, id]);
      if (res.rowCount > 0) updatedCount++;
    }
    await pool.query('COMMIT');
    console.log(`✅ PostgreSQL atualizado: ${updatedCount} categorias receberam descrições profissionais!`);

    // Atualizar athena-db.json local também
    const dbPath = path.join(__dirname, '../data/athena-db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(db.categories)) {
        db.categories.forEach(c => {
          if (categoryDescriptions[c.id]) {
            c.description = categoryDescriptions[c.id];
          }
        });
      }
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      console.log('✅ athena-db.json atualizado com as novas descrições!');
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Erro na execução:', err);
  } finally {
    pool.end();
  }
}

execute();
