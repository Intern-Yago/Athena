/**
 * fix_omie_sgt_descriptions.js
 * 
 * Corrige as descrições/nomes de produtos no Omie ERP que possuem código SGT
 * mas onde no nome faltava o hífen ("SGT<codigo>" -> "SGT-<codigo>")
 * ou continha espaçamento irregular.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;
const OMIE_URL = 'https://app.omie.com.br/api/v1/geral/produtos/';

const CORRECTIONS = [
  {
    id: 11876342004,
    codigo: 'SGT-8520',
    oldDesc: 'SGT8520  LANTERNA LED RECARREGAVEL PARA CAPO E INTERIOR AUTOMOTIVO 3 EM 1  5W  1.200LM',
    newDesc: 'SGT-8520  LANTERNA LED RECARREGAVEL PARA CAPO E INTERIOR AUTOMOTIVO 3 EM 1  5W  1.200LM'
  },
  {
    id: 11876341998,
    codigo: 'SGT-9002',
    oldDesc: 'SGT9002  CARRETEL ENROLADOR MANGUEIRA DE AR HIBRIDA  8MM X 12MM  10 METROS',
    newDesc: 'SGT-9002  CARRETEL ENROLADOR MANGUEIRA DE AR HIBRIDA  8MM X 12MM  10 METROS'
  },
  {
    id: 11876443472,
    codigo: 'SGT-9950',
    oldDesc: 'SGT9950  MANGUEIRA COM ENROLADOR E ESGUICHO 12M',
    newDesc: 'SGT-9950  MANGUEIRA COM ENROLADOR E ESGUICHO 12M'
  },
  {
    id: 11903089138,
    codigo: 'SGT-9943',
    oldDesc: 'SGT9943  SPRAYER 360 GRAUS RESISTENTE A QUIMICOS  1L',
    newDesc: 'SGT-9943  SPRAYER 360 GRAUS RESISTENTE A QUIMICOS  1L'
  },
  {
    id: 11878342663,
    codigo: 'SGT-0617S',
    oldDesc: 'SGT 0617S - RETIFICA RETA 1/4&quot; PLUS - 0,5 HP - 2 ROLAMENTOS FRONTAIS 75 DB(A) - EXAUSTAO MANGUEIRA',
    newDesc: 'SGT-0617S - RETIFICA RETA 1/4&quot; PLUS - 0,5 HP - 2 ROLAMENTOS FRONTAIS 75 DB(A) - EXAUSTAO MANGUEIRA'
  },
  {
    id: 11876276605,
    codigo: 'SGT-TP-01-DUP',
    oldDesc: 'SGT-TP01  TORQUIMETRO ESTALO 1/4 -5 A 25 NM',
    newDesc: 'SGT-TP-01  TORQUIMETRO ESTALO 1/4 -5 A 25 NM'
  },
  {
    id: 11878069373,
    codigo: 'SGT-3050',
    oldDesc: 'SGT- 3050 - MACACO PARA CAMBIO 500KG',
    newDesc: 'SGT-3050 - MACACO PARA CAMBIO 500KG'
  },
  {
    id: 11878361478,
    codigo: 'SGT-1515',
    oldDesc: 'SGT- 1515- MINI MARTELETE RETO',
    newDesc: 'SGT-1515 - MINI MARTELETE RETO'
  },
  {
    id: 11882200646,
    codigo: 'SGT-0409',
    oldDesc: 'SGT- 0409- ESMERILHADEIRA ANGULAR 5&quot; - 0,5HP - 11.000RPM - M14',
    newDesc: 'SGT-0409 - ESMERILHADEIRA ANGULAR 5&quot; - 0,5HP - 11.000RPM - M14'
  },
  {
    id: 11882200749,
    codigo: 'SGT-0423',
    oldDesc: 'SGT - 0423 -  ESMERILHADEIRA ANGULAR 7&quot; - 2,5HP -  7.500 RPM 5/8&quot;',
    newDesc: 'SGT-0423 -  ESMERILHADEIRA ANGULAR 7&quot; - 2,5HP -  7.500 RPM 5/8&quot;'
  },
  {
    id: 11882200811,
    codigo: 'SGT-0425',
    oldDesc: 'SGT - 0425 - ESMERILHADEIRA INDUSTRIAL VERTICAL 7&quot; - 3HP - 6.000RPM -5/8&quot;',
    newDesc: 'SGT-0425 - ESMERILHADEIRA INDUSTRIAL VERTICAL 7&quot; - 3HP - 6.000RPM -5/8&quot;'
  },
  {
    id: 11882201702,
    codigo: 'SGT-0143',
    oldDesc: 'SGT - 0143 - PARAFUSADEIRA RETA 1/4&quot; - 3 A 15NM',
    newDesc: 'SGT-0143 - PARAFUSADEIRA RETA 1/4&quot; - 3 A 15NM'
  },
  {
    id: 11882200687,
    codigo: 'SGT-0411',
    oldDesc: 'SGT -0411 - ESMERILHADEIRA ANGULAR 5&quot; - 0,5HP - 11.000RPM - M14',
    newDesc: 'SGT-0411 - ESMERILHADEIRA ANGULAR 5&quot; - 0,5HP - 11.000RPM - M14'
  },
  {
    id: 11882200711,
    codigo: 'SGT-0412',
    oldDesc: 'SGT - 0412 - ESMERILHADEIRA INDUSTRIAL ANGULAR 5&quot; - 1,2HP - 12.000RPM - M14',
    newDesc: 'SGT-0412 - ESMERILHADEIRA INDUSTRIAL ANGULAR 5&quot; - 1,2HP - 12.000RPM - M14'
  },
  {
    id: 11882335072,
    codigo: 'SGT-9906',
    oldDesc: 'SGT- 9906 - PISTOLA  PARA LAVADORA DE ALTA PRESSAO P/ VAZAO ACIMA 250 L/H',
    newDesc: 'SGT-9906 - PISTOLA  PARA LAVADORA DE ALTA PRESSAO P/ VAZAO ACIMA 250 L/H'
  }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('========================================================================');
  console.log(' CORREÇÃO DE NOMES DE PRODUTOS SGT NO OMIE ERP (INSERÇÃO DO HÍFEN)');
  console.log('========================================================================\n');

  for (let i = 0; i < CORRECTIONS.length; i++) {
    const item = CORRECTIONS[i];
    console.log(`[${i + 1}/${CORRECTIONS.length}] Atualizando ID ${item.id} (${item.codigo})...`);
    console.log(`   De:   "${item.oldDesc}"`);
    console.log(`   Para: "${item.newDesc}"`);

    try {
      const res = await axios.post(OMIE_URL, {
        call: 'AlterarProduto',
        app_key: OMIE_APP_KEY,
        app_secret: OMIE_APP_SECRET,
        param: [{
          codigo_produto: item.id,
          codigo: item.codigo,
          descricao: item.newDesc
        }]
      });

      console.log(`   Status Omie: ${res.data.descricao_status || 'OK'}\n`);
    } catch (err) {
      const errData = err.response ? err.response.data : err.message;
      console.error(`   Erro ao atualizar ID ${item.id}:`, JSON.stringify(errData), '\n');
    }

    await sleep(350); // Proteção contra rate limit
  }

  // Atualizar os arquivos de cache locais
  const cacheFiles = [
    path.join(__dirname, '../data/omie_products_cache.json'),
    path.join(__dirname, '../data/omie_live_products.json')
  ];

  for (const file of cacheFiles) {
    if (fs.existsSync(file)) {
      try {
        const list = JSON.parse(fs.readFileSync(file, 'utf8'));
        let updatedCount = 0;
        for (const item of CORRECTIONS) {
          const found = list.find(p => Number(p.codigo_produto) === Number(item.id));
          if (found) {
            found.descricao = item.newDesc;
            updatedCount++;
          }
        }
        fs.writeFileSync(file, JSON.stringify(list, null, 2));
        console.log(`Atualizado ${updatedCount} itens em ${path.basename(file)}.`);
      } catch (e) {
        console.warn(`Aviso ao atualizar cache ${file}:`, e.message);
      }
    }
  }

  console.log('\nProcesso finalizado com sucesso no Omie ERP!');
}

run().catch(console.error);
