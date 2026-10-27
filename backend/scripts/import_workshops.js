require("dotenv").config();
const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.CRM_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CENTROIDES_DF = {
  "SCIA Estrutural": [-15.7760, -47.9940, 0.010],
  "Ceilândia": [-15.8180, -48.1100, 0.025],
  "Taguatinga": [-15.8330, -48.0560, 0.022],
  "Samambaia": [-15.8750, -48.0850, 0.020],
  "Guará": [-15.8230, -47.9780, 0.012],
  "Gama": [-16.0150, -48.0650, 0.020],
  "Sobradinho": [-15.6500, -47.7900, 0.015],
  "Sobradinho II": [-15.6300, -47.8100, 0.012],
  "Planaltina": [-15.6200, -47.6550, 0.022],
  "Santa Maria": [-16.0150, -47.9950, 0.018],
  "Recanto das Emas": [-15.9050, -48.0650, 0.015],
  "Vicente Pires": [-15.8050, -48.0300, 0.015],
  "Águas Claras": [-15.8380, -48.0280, 0.012],
  "Plano Piloto": [-15.7900, -47.8950, 0.025],
  "São Sebastião": [-15.9050, -47.7700, 0.015],
  "Núcleo Bandeirante": [-15.8700, -47.9650, 0.008],
  "Candangolândia": [-15.8550, -47.9500, 0.006],
  "Riacho Fundo I": [-15.8800, -48.0150, 0.010],
  "Riacho Fundo II": [-15.8950, -48.0350, 0.012],
  "Paranoá": [-15.7700, -47.7800, 0.012],
  "Itapoã": [-15.7500, -47.7700, 0.010],
  "Brazlândia": [-15.6750, -48.2000, 0.015],
  "Cruzeiro / Sudoeste": [-15.7950, -47.9250, 0.010],
  "Sol Nascente/Pôr do Sol": [-15.8200, -48.1400, 0.015],
  "Arniqueira": [-15.8400, -48.0100, 0.010],
  "Arapoanga": [-15.6100, -47.6200, 0.012],
  "Jardim Botânico": [-15.8700, -47.8200, 0.015],
  "Lago Norte / Varjão": [-15.7350, -47.8650, 0.015],
  "Lago Sul": [-15.8400, -47.8700, 0.018],
  "Park Way": [-15.8900, -47.9400, 0.015],
  "Fercal": [-15.5800, -47.8700, 0.020],
  "SIG": [-15.7950, -47.9100, 0.006],
  "Água Quente": [-15.9800, -48.1800, 0.015],
  "Zona Rural / Outros": [-15.7900, -47.9000, 0.050]
};

function getLatLng(ra, cnpj, endereco) {
  const [lat, lng, raio] = CENTROIDES_DF[ra] || [-15.7900, -47.9000, 0.030];
  const hash = crypto.createHash("md5").update(`${cnpj}${endereco}`).digest("hex").slice(0, 8);
  const h = parseInt(hash, 16);
  const dx = ((h % 1000) / 500.0 - 1.0) * raio;
  const dy = (((Math.floor(h / 1000)) % 1000) / 500.0 - 1.0) * raio;
  return [Number((lat + dy).toFixed(5)), Number((lng + dx).toFixed(5))];
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

async function run() {
  const fileStream = fs.createReadStream("/home/yago/Documentos/clientes/oficinas_df_por_ra_athena.csv");
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let batch = [];
  let totalInserted = 0;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    const ra = (cols[0] || "").trim();
    const cat = (cols[1] || "").trim();
    const nome = (cols[2] || "").trim();
    const razao = (cols[3] || "").trim();
    const cnpj = (cols[4] || "").trim();
    const tel1 = (cols[5] || "").trim();
    const tel2 = (cols[6] || "").trim();
    const email = (cols[7] || "").trim();
    const end = (cols[8] || "").trim();
    const bairro = (cols[9] || "").trim();
    const cep = (cols[10] || "").trim();
    const status = (cols[12] || "Não Visitado").trim();
    const obs = (cols[14] || "").trim();

    const [lat, lng] = getLatLng(ra, cnpj, end);

    batch.push([ra, cat, nome, razao, cnpj, tel1, tel2, email, end, bairro, cep, status, obs, lat, lng]);

    if (batch.length >= 400) {
      await insertBatch(batch);
      totalInserted += batch.length;
      console.log(`Inseridos ${totalInserted} registros no Supabase...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
    totalInserted += batch.length;
  }

  console.log(`\nSUCESSO: ${totalInserted} oficinas inseridas com sucesso na tabela crm_workshops!`);
  await pool.end();
  process.exit(0);
}

async function insertBatch(rows) {
  let query = "INSERT INTO crm_workshops (regiao_administrativa, categoria, nome_fantasia, razao_social, cnpj, telefone_principal, telefone_secundario, email, endereco_completo, bairro, cep, status_visita, observacoes, latitude, longitude) VALUES ";
  const params = [];
  const valueStrings = [];

  rows.forEach((r) => {
    const valPlaceholders = [];
    r.forEach((val) => {
      params.push(val);
      valPlaceholders.push(`$${params.length}`);
    });
    valueStrings.push(`(${valPlaceholders.join(", ")})`);
  });

  query += valueStrings.join(", ");
  await pool.query(query, params);
}

run().catch(e => {
  console.error("Falha na importacao:", e);
  pool.end();
  process.exit(1);
});
