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
