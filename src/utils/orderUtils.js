/**
 * orderUtils.js
 *
 * Utilitários puros de domínio para Pedidos Comerciais e Logística (Athena OS).
 * Centraliza regras de negócio de identificação de origem (Site vs Omie ERP),
 * higienização de descrições fiscais, classificação geográfica e filtragem operacional.
 */

/**
 * Mapeamento oficial das Macro-Regiões brasileiras por UF.
 */
export const MACRO_REGIONS = {
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
  'Sul': ['PR', 'SC', 'RS'],
  'Nordeste': ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'],
  'Norte': ['AM', 'PA', 'TO', 'RO', 'AC', 'AP', 'RR']
};

/**
 * Decodifica entidades HTML vindas de notas e descrições do ERP (ex: 8&quot; -> 8").
 *
 * @param {string} str - Texto bruto
 * @returns {string} Texto limpo e legível
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Retorna a Macro-Região brasileira correspondente à sigla de UF.
 *
 * @param {string} uf - Sigla do estado (ex: 'DF', 'SP')
 * @returns {string} Nome da Macro-Região
 */
export function getMacroRegionByState(uf) {
  if (!uf) return 'Não Informado';
  const cleanUf = String(uf).trim().toUpperCase();
  for (const [region, states] of Object.entries(MACRO_REGIONS)) {
    if (states.includes(cleanUf)) return region;
  }
  return 'Outros';
}

/**
 * Determina a origem exata de um pedido ou remessa (Site Athena vs Omie ERP),
 * garantindo que compras feitas no Site que também foram enviadas ao Omie
 * preservem a identidade primária de "Compra no Site" (com selo de integração).
 *
 * Regras de domínio:
 * - Pedidos importados exclusivamente do faturamento direto no ERP possuem:
 *   `id` iniciado por `ord_omie_` OU `order_number` iniciado por `OMIE-` OU `customer_id` iniciado por `usr_omie_`.
 * - Pedidos originados no checkout / resgate do Site possuem UUID próprio e numeração sequencial
 *   (ex: `#10060` ou `#R-0012`), mesmo quando possuem `omie_pedido_id` preenchido após sincronização.
 *
 * @param {Object} record - Objeto de pedido (order) ou remessa (shipment)
 * @returns {{
 *   originKey: 'site' | 'omie',
 *   label: string,
 *   shortLabel: string,
 *   isSyncedWithOmie: boolean,
 *   omieRef: string | null,
 *   badgeClass: string
 * }}
 */
export function resolveOrderOrigin(record) {
  if (!record) {
    return {
      originKey: 'site',
      label: 'Site Athena',
      shortLabel: 'Site',
      isSyncedWithOmie: false,
      omieRef: null,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
    };
  }

  const orderId = String(record.order_id || record.id || '');
  const orderNumber = String(record.order_number || '');
  const customerId = String(record.customer_id || '');
  const omiePedidoId = record.omie_pedido_id ? String(record.omie_pedido_id) : null;

  const isDirectOmieImport =
    orderId.startsWith('ord_omie_') ||
    orderNumber.toUpperCase().startsWith('OMIE-') ||
    customerId.startsWith('usr_omie_');

  if (isDirectOmieImport) {
    return {
      originKey: 'omie',
      label: 'Omie ERP',
      shortLabel: 'Omie ERP',
      isSyncedWithOmie: true,
      omieRef: omiePedidoId || orderNumber.replace(/^OMIE-/i, ''),
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200'
    };
  }

  // Nasceu no Site (Venda Online ou Resgate A-Points), podendo estar espelhado no Omie
  const isSyncedWithOmie = Boolean(omiePedidoId);
  return {
    originKey: 'site',
    label: isSyncedWithOmie ? 'Site Athena (Sincronizado Omie)' : 'Site Athena',
    shortLabel: 'Site Athena',
    isSyncedWithOmie,
    omieRef: omiePedidoId,
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300'
  };
}

/**
 * Avalia se uma remessa enriquecida atende aos critérios de filtro ativos
 * (utilizado tanto na visão Kanban quanto na visão em Tabela).
 *
 * @param {Object} shipment - Remessa enriquecida com metadados (_statusKey, _originKey, _itemCount, _stateUf, _macroRegion)
 * @param {Object} filters
 * @param {string} filters.searchQuery
 * @param {string} filters.statusFilter
 * @param {string} filters.originFilter
 * @param {string} filters.itemsFilter
 * @param {string} filters.regionFilter
 * @returns {boolean}
 */
export function matchesShipmentFilters(shipment, {
  searchQuery = '',
  statusFilter = 'all',
  originFilter = 'all',
  itemsFilter = 'all',
  regionFilter = 'all'
} = {}) {
  // 1. Filtro de Status
  if (statusFilter !== 'all' && shipment._statusKey !== statusFilter) {
    return false;
  }

  // 2. Filtro de Origem (Site vs Omie ERP)
  if (originFilter !== 'all' && shipment._origin?.originKey !== originFilter) {
    return false;
  }

  // 3. Filtro de Volume de Itens
  if (itemsFilter !== 'all') {
    const count = shipment._itemCount || 0;
    if (itemsFilter === '1' && count !== 1) return false;
    if (itemsFilter === '2-5' && (count < 2 || count > 5)) return false;
    if (itemsFilter === '6-15' && (count < 6 || count > 15)) return false;
    if (itemsFilter === '16+' && count < 16) return false;
  }

  // 4. Filtro Geográfico (Macro-Região ou UF)
  if (regionFilter !== 'all') {
    if (regionFilter.startsWith('macro:')) {
      const targetMacro = regionFilter.replace('macro:', '');
      if (shipment._macroRegion !== targetMacro) return false;
    } else if (shipment._stateUf !== regionFilter) {
      return false;
    }
  }

  // 5. Busca Textual Livre (ID, #OMIE-X, Nome do Cliente, Cidade, Rastreio ou Item)
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    const orderCode = `#${shipment.order_number || shipment.order_id || ''}`.toLowerCase();
    const shipmentCode = String(shipment.shipment_number || '').toLowerCase();
    const customerName = String(shipment.customer_snapshot?.name || '').toLowerCase();
    const customerDoc = String(shipment.customer_snapshot?.document || '').toLowerCase();
    const cityState = `${shipment.shipping_address?.city || ''} ${shipment.shipping_address?.state || ''}`.toLowerCase();
    const itemsText = (shipment.items || []).map(i => decodeHtmlEntities(i.name)).join(' ').toLowerCase();
    const tracking = String(shipment.tracking_code || '').toLowerCase();

    const matches =
      orderCode.includes(q) ||
      shipmentCode.includes(q) ||
      customerName.includes(q) ||
      customerDoc.includes(q) ||
      cityState.includes(q) ||
      itemsText.includes(q) ||
      tracking.includes(q);

    if (!matches) return false;
  }

  return true;
}

/**
 * Calcula o estágio da Régua de Cobrança (Dunning Milestone) com base na data de criação do pedido.
 * Regra: D0 (Hoje), D1, D15, D30 e a cada 30 dias subsequentes (D60, D90, etc.).
 *
 * @param {string|number|Date} createdAt - Timestamp ou string ISO da criação do pedido
 * @param {number|Date} [nowRef] - Ponto de referência temporal (padrão: Date.now())
 * @returns {{
 *   diffDays: number,
 *   label: string,
 *   isMilestone: boolean,
 *   milestone: string|null,
 *   milestoneText: string,
 *   nextMilestoneDay: number,
 *   daysUntilNext: number
 * }}
 */
export function calculateDunningMilestone(createdAt, nowRef = Date.now()) {
  if (!createdAt) {
    return {
      diffDays: 0,
      label: 'Hoje',
      isMilestone: false,
      milestone: null,
      milestoneText: 'Aguardando processamento bancário.',
      nextMilestoneDay: 1,
      daysUntilNext: 1
    };
  }

  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) {
    return {
      diffDays: 0,
      label: 'Hoje',
      isMilestone: false,
      milestone: null,
      milestoneText: 'Aguardando processamento bancário.',
      nextMilestoneDay: 1,
      daysUntilNext: 1
    };
  }

  const currentTime = typeof nowRef === 'number' ? nowRef : new Date(nowRef).getTime();
  const diffDays = Math.max(0, Math.floor((currentTime - createdTime) / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return {
      diffDays: 0,
      label: 'Iniciado hoje',
      isMilestone: false,
      milestone: null,
      milestoneText: 'Pedido realizado hoje. Aguardando compensação da instituição financeira (PIX ou Boleto).',
      nextMilestoneDay: 1,
      daysUntilNext: 1
    };
  }

  if (diffDays === 1) {
    return {
      diffDays: 1,
      label: 'Há 1 dia (Régua D1)',
      isMilestone: true,
      milestone: 'D1',
      milestoneText: '🔔 Lembrete D1: Seu pedido foi iniciado ontem e está com estoque reservado. Conclua hoje para envio imediato!',
      nextMilestoneDay: 15,
      daysUntilNext: 14
    };
  }

  if (diffDays === 15) {
    return {
      diffDays: 15,
      label: 'Há 15 dias (Régua D15)',
      isMilestone: true,
      milestone: 'D15',
      milestoneText: '🔔 Lembrete D15: Cotação/pedido há 15 dias em aberto. Converse com seu consultor para manter as condições da proposta.',
      nextMilestoneDay: 30,
      daysUntilNext: 15
    };
  }

  if (diffDays === 30) {
    return {
      diffDays: 30,
      label: 'Há 30 dias (Régua D30)',
      isMilestone: true,
      milestone: 'D30',
      milestoneText: '🔔 Lembrete D30: Pedido em aberto há 1 mês. Caso precise de 2ª via ou novo prazo de faturamento, avise nossa equipe.',
      nextMilestoneDay: 60,
      daysUntilNext: 30
    };
  }

  if (diffDays > 30 && (diffDays - 30) % 30 === 0) {
    const cycle = Math.floor(diffDays / 30);
    const nextMilestone = diffDays + 30;
    return {
      diffDays,
      label: `Há ${diffDays} dias (${cycle}º mês)`,
      isMilestone: true,
      milestone: `D${diffDays}`,
      milestoneText: `🔔 Lembrete Periódico (${cycle}º mês): Pedido em aberto há ${diffDays} dias. Entre em contato para regularizar.`,
      nextMilestoneDay: nextMilestone,
      daysUntilNext: 30
    };
  }

  let nextMilestone = 1;
  if (diffDays >= 30) {
    nextMilestone = 30 + (Math.floor((diffDays - 30) / 30) + 1) * 30;
  } else if (diffDays >= 15) {
    nextMilestone = 30;
  } else if (diffDays >= 1) {
    nextMilestone = 15;
  }

  return {
    diffDays,
    label: `Há ${diffDays} dias`,
    isMilestone: false,
    milestone: null,
    milestoneText: `Aguardando confirmação bancária há ${diffDays} dias. Próximo lembrete no marco D${nextMilestone}.`,
    nextMilestoneDay: nextMilestone,
    daysUntilNext: Math.max(0, nextMilestone - diffDays)
  };
}

/**
 * Higieniza números de telefone e constrói links de chamada telefônica (tel:) e WhatsApp (wa.me).
 *
 * @param {string|number} rawPhone - Número de telefone em qualquer formato
 * @param {string} [customMessage] - Mensagem opcional pré-formatada para o WhatsApp
 * @returns {{
 *   raw: string,
 *   cleanDigits: string,
 *   formattedWithCountry: string,
 *   telLink: string,
 *   whatsappLink: string,
 *   hasValidPhone: boolean
 * }}
 */
export function buildContactLinks(rawPhone, customMessage = '') {
  if (!rawPhone || (typeof rawPhone !== 'string' && typeof rawPhone !== 'number')) {
    return {
      raw: '',
      cleanDigits: '',
      formattedWithCountry: '',
      telLink: '',
      whatsappLink: '',
      hasValidPhone: false
    };
  }

  const raw = String(rawPhone).trim();
  let clean = raw.replace(/\D/g, '');

  // Remove 0 inicial de DDD se houver (ex: 061 -> 61)
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.slice(1);
  } else if (clean.length === 12 && clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // Se já tiver 55 no início e mais de 12 dígitos, mantém; senão adiciona 55 se tiver DDD brasileiro (10 ou 11 dígitos)
  let countryPhone = clean;
  if (clean.length === 10 || clean.length === 11) {
    countryPhone = `55${clean}`;
  } else if (clean.length >= 12 && clean.startsWith('55')) {
    countryPhone = clean;
  }

  const hasValidPhone = clean.length >= 10;
  const telLink = hasValidPhone ? `tel:${countryPhone.startsWith('55') ? '+' + countryPhone : clean}` : '';
  const encodedMsg = customMessage ? `?text=${encodeURIComponent(customMessage)}` : '';
  const whatsappLink = hasValidPhone ? `https://wa.me/${countryPhone}${encodedMsg}` : '';

  return {
    raw,
    cleanDigits: clean,
    formattedWithCountry: countryPhone,
    telLink,
    whatsappLink,
    hasValidPhone
  };
}
