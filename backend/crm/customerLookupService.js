/**
 * customerLookupService.js
 * 
 * Serviço unificado de consulta cadastral inteligente por CPF ou CNPJ.
 * Prioridade:
 * 1. Omie ERP (Clientes cadastrados com histórico fiscal/financeiro)
 * 2. Ploomes CRM (Contatos e histórico comercial se PLOOMES_USER_KEY existir)
 * 3. BrasilAPI / Receita Federal (Fallback público instantâneo para CNPJs novos)
 */

const axios = require('axios');

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;
const PLOOMES_USER_KEY = process.env.PLOOMES_USER_KEY || process.env.PLOOMES_KEY || process.env.PLOOMES_API_KEY;

const DF_REGIONS = [
  'Taguatinga', 'Ceilândia', 'Samambaia', 'Brasília', 'Plano Piloto',
  'Guará', 'Águas Claras', 'Gama', 'Santa Maria', 'Sobradinho',
  'Planaltina', 'Vicente Pires', 'SIA', 'SCIA', 'Estrutural',
  'São Sebastião', 'Paranoá', 'Recanto das Emas', 'Riacho Fundo',
  'Núcleo Bandeirante', 'Candangolândia', 'Cruzeiro', 'Sudoeste',
  'Octogonal', 'Lago Sul', 'Lago Norte', 'Brazlândia', 'Jardim Botânico',
  'Itapoã', 'Varjão', 'Park Way', 'Arniqueira', 'Sol Nascente'
];

function detectRa(text) {
  if (!text) return 'Taguatinga';
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const ra of DF_REGIONS) {
    const raClean = ra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes(raClean)) {
      if (ra === 'Plano Piloto') return 'Brasília';
      if (ra === 'Estrutural') return 'SCIA';
      if (ra === 'Octogonal') return 'Sudoeste / Octogonal';
      return ra;
    }
  }
  return 'Taguatinga';
}

function formatPhone(phone, ddd = '') {
  const digits = String(phone || '').replace(/\D/g, '');
  const dddDigits = String(ddd || '').replace(/\D/g, '');
  
  let full = digits;
  if (dddDigits && !digits.startsWith(dddDigits)) {
    full = dddDigits + digits;
  }
  if (!full) return '';

  if (full.length === 11) {
    return `(${full.slice(0, 2)}) ${full.slice(2, 7)}-${full.slice(7)}`;
  } else if (full.length === 10) {
    return `(${full.slice(0, 2)}) ${full.slice(2, 6)}-${full.slice(6)}`;
  }
  return full;
}

function formatCnpjCpf(doc) {
  const d = String(doc || '').replace(/\D/g, '');
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  } else if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return d;
}

/**
 * 1. Consulta no Omie ERP
 */
async function lookupOmie(cleanDoc) {
  if (!OMIE_APP_KEY || !OMIE_APP_SECRET) return null;

  try {
    const response = await axios.post('https://app.omie.com.br/api/v1/geral/clientes/', {
      call: 'ListarClientes',
      app_key: OMIE_APP_KEY,
      app_secret: OMIE_APP_SECRET,
      param: [{
        pagina: 1,
        registros_por_pagina: 1,
        apenas_importado_api: 'N',
        clientesFiltro: {
          cnpj_cpf: cleanDoc
        }
      }]
    }, { timeout: 6000 });

    const client = response.data?.clientes_cadastro?.[0];
    if (!client) return null;

    const fullAddr = [
      client.endereco,
      client.endereco_numero ? `nº ${client.endereco_numero}` : '',
      client.complemento,
      client.bairro ? `- ${client.bairro}` : '',
      client.cidade ? `${client.cidade}/${client.estado || 'DF'}` : ''
    ].filter(Boolean).join(' ').trim();

    return {
      found: true,
      source: 'omie',
      sourceLabel: 'Omie ERP (Base Interna)',
      document: formatCnpjCpf(client.cnpj_cpf || cleanDoc),
      company: client.razao_social || client.nome_fantasia || '',
      name: client.nome_fantasia || client.razao_social || '',
      phone: formatPhone(client.telefone1_numero, client.telefone1_ddd),
      email: (client.email || '').toLowerCase().trim(),
      address: fullAddr,
      ra_df: detectRa(`${client.bairro || ''} ${client.cidade || ''} ${client.endereco || ''}`),
      city: client.cidade || '',
      state: client.estado || '',
      extra: {
        codigo_cliente_omie: client.codigo_cliente_omie,
        inativo: client.inativo === 'S'
      }
    };
  } catch (err) {
    return null;
  }
}

/**
 * 2. Consulta no Ploomes CRM
 */
async function lookupPloomes(cleanDoc) {
  if (!PLOOMES_USER_KEY) return null;

  try {
    const filter = cleanDoc.length === 14 
      ? `CNPJ eq '${cleanDoc}' or CNPJ eq '${formatCnpjCpf(cleanDoc)}'`
      : `CPF eq '${cleanDoc}' or CPF eq '${formatCnpjCpf(cleanDoc)}'`;

    const response = await axios.get(`https://api2.ploomes.com/Contacts?$filter=${encodeURIComponent(filter)}&$expand=Phones,Emails`, {
      headers: {
        'User-Key': PLOOMES_USER_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 6000
    });

    const contact = response.data?.value?.[0];
    if (!contact) return null;

    const phoneItem = contact.Phones?.[0]?.PhoneNumber || '';
    const emailItem = contact.Emails?.[0]?.Email || '';
    const fullAddr = [
      contact.StreetAddress,
      contact.Neighborhood,
      contact.City ? `${contact.City}/${contact.State || 'DF'}` : ''
    ].filter(Boolean).join(', ');

    return {
      found: true,
      source: 'ploomes',
      sourceLabel: 'Ploomes CRM (Comercial)',
      document: formatCnpjCpf(cleanDoc),
      company: contact.LegalName || contact.Name || '',
      name: contact.Name || contact.LegalName || '',
      phone: formatPhone(phoneItem),
      email: (emailItem || '').toLowerCase().trim(),
      address: fullAddr,
      ra_df: detectRa(`${contact.Neighborhood || ''} ${contact.City || ''} ${contact.StreetAddress || ''}`),
      city: contact.City || '',
      state: contact.State || '',
      extra: {
        ploomes_id: contact.Id
      }
    };
  } catch (err) {
    return null;
  }
}

/**
 * 3. Fallback Receita Federal (BrasilAPI) para CNPJs novos
 */
async function lookupBrasilApi(cleanCnpj) {
  if (cleanCnpj.length !== 14) return null;

  try {
    const res = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      timeout: 6000
    });
    const d = res.data;
    if (!d || !d.razao_social) return null;

    const fullAddr = [
      d.descricao_tipo_de_logradouro,
      d.logradouro,
      d.numero ? `nº ${d.numero}` : '',
      d.complemento,
      d.bairro ? `- ${d.bairro}` : '',
      d.municipio ? `${d.municipio}/${d.uf}` : '',
      d.cep ? `CEP ${d.cep}` : ''
    ].filter(Boolean).join(' ').trim();

    return {
      found: true,
      source: 'receita_federal',
      sourceLabel: 'Receita Federal / CNPJ Oficial',
      document: formatCnpjCpf(cleanCnpj),
      company: d.razao_social || '',
      name: d.nome_fantasia || d.razao_social || '',
      phone: formatPhone(d.ddd_telefone_1),
      email: (d.email || '').toLowerCase().trim(),
      address: fullAddr,
      ra_df: detectRa(`${d.bairro || ''} ${d.municipio || ''} ${d.logradouro || ''}`),
      city: d.municipio || '',
      state: d.uf || '',
      extra: {
        situacao_cadastral: d.descricao_situacao_cadastral,
        cnae: d.cnae_fiscal_descricao
      }
    };
  } catch (err) {
    return null;
  }
}

/**
 * Consulta unificada em cascata
 */
async function lookupCustomerByDoc(rawDoc) {
  const cleanDoc = String(rawDoc || '').replace(/\D/g, '');
  if (!cleanDoc || (cleanDoc.length !== 11 && cleanDoc.length !== 14)) {
    throw new Error('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
  }

  // 1. Tenta Omie primeiro (dados fiscais/financeiros internos)
  const omieRes = await lookupOmie(cleanDoc);
  if (omieRes) return omieRes;

  // 2. Tenta Ploomes (CRM comercial)
  const ploomesRes = await lookupPloomes(cleanDoc);
  if (ploomesRes) return ploomesRes;

  // 3. Fallback para Receita Federal (BrasilAPI) se for CNPJ
  if (cleanDoc.length === 14) {
    const brasilApiRes = await lookupBrasilApi(cleanDoc);
    if (brasilApiRes) return brasilApiRes;
  }

  return {
    found: false,
    message: 'Nenhum registro encontrado para este documento no Omie, Ploomes ou Receita Federal.',
    document: formatCnpjCpf(cleanDoc)
  };
}

module.exports = {
  lookupCustomerByDoc,
  formatPhone,
  formatCnpjCpf,
  detectRa
};
