/**
 * omieOrderService.js
 * 
 * Serviço de Integração de Pedidos e Clientes entre Athena OS e Omie ERP.
 * Responsável por:
 * 1. Autocadastro de Cliente (Upsert) no Omie via CPF/CNPJ antes de criar o pedido.
 * 2. Criação automática do Pedido de Venda oficial no Omie (IncluirPedido) com
 *    reserva fiscal e esteira de faturamento.
 * 3. Associação reversa do código do pedido Omie na tabela orders do Athena OS.
 */

const axios = require('axios');
const { query } = require('./db');

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;

const OMIE_CLIENTES_URL = 'https://app.omie.com.br/api/v1/geral/clientes/';
const OMIE_PEDIDOS_URL = 'https://app.omie.com.br/api/v1/produtos/pedido/';

// Helper de chamada segura à API do Omie
async function callOmieApi(url, callMethod, paramObj) {
  if (!OMIE_APP_KEY || !OMIE_APP_SECRET) {
    throw new Error('Credenciais OMIE_APP_KEY ou OMIE_APP_SECRET não configuradas no servidor.');
  }

  const response = await axios.post(url, {
    call: callMethod,
    app_key: OMIE_APP_KEY,
    app_secret: OMIE_APP_SECRET,
    param: [paramObj]
  }, {
    timeout: 10000
  });

  return response.data;
}

/**
 * Localiza cliente no Omie pelo CPF/CNPJ ou cadastra automaticamente se for novo cliente
 */
async function upsertOmieClient({ name, document, email, phone, address = {}, companyName = null }) {
  const cleanDoc = (document || '').replace(/\D/g, '');
  if (!cleanDoc) {
    throw new Error('CPF ou CNPJ é obrigatório para sincronizar cliente com o Omie.');
  }

  // 1. Consulta se o cliente já existe no Omie pelo CPF/CNPJ
  try {
    const searchRes = await callOmieApi(OMIE_CLIENTES_URL, 'ListarClientes', {
      pagina: 1,
      registros_por_pagina: 1,
      apenas_importado_api: 'N',
      clientesFiltro: {
        cnpj_cpf: cleanDoc
      }
    });

    if (searchRes.clientes_cadastro && searchRes.clientes_cadastro.length > 0) {
      const existing = searchRes.clientes_cadastro[0];
      console.log(`[OMIE CLIENT] Cliente já cadastrado no Omie: "${existing.razao_social}" (ID: ${existing.codigo_cliente_omie})`);
      return existing.codigo_cliente_omie;
    }
  } catch (err) {
    // Se não encontrou registros, o Omie pode devolver falha amigável de lista vazia; prossegue para cadastro
    console.log('[OMIE CLIENT] Cliente não localizado no Omie por CPF/CNPJ. Iniciando autocadastro...');
  }

  // 2. Se não existe, cadastra automaticamente (IncluirCliente)
  const isCnpj = cleanDoc.length > 11;
  const rawPhone = (phone || '').replace(/\D/g, '');
  const ddd = rawPhone.length >= 10 ? rawPhone.substring(0, 2) : '61';
  const phoneNum = rawPhone.length >= 10 ? rawPhone.substring(2) : (rawPhone || '988888888');

  const clientPayload = {
    codigo_cliente_integracao: `cust_${cleanDoc}_${Date.now()}`,
    razao_social: (companyName || name || 'Cliente Athena').trim(),
    nome_fantasia: (name || companyName || 'Cliente Athena').trim(),
    cnpj_cpf: cleanDoc,
    email: (email || '').toLowerCase().trim(),
    telefone1_ddd: ddd,
    telefone1_numero: phoneNum,
    endereco: address.street || 'Endereço Comercial / Entrega',
    endereco_numero: address.number || 'S/N',
    complemento: address.complement || '',
    bairro: address.neighborhood || 'Centro',
    cidade: address.city || 'Brasília',
    estado: (address.state || 'DF').toUpperCase(),
    cep: (address.cep || '70000-000').replace(/\D/g, ''),
    pessoa_fisica: isCnpj ? 'N' : 'S'
  };

  try {
    const createRes = await callOmieApi(OMIE_CLIENTES_URL, 'IncluirCliente', clientPayload);
    const newOmieId = createRes.codigo_cliente_omie;
    console.log(`[OMIE CLIENT] ✅ Novo cliente cadastrado com sucesso no Omie! ID: ${newOmieId} (${clientPayload.razao_social})`);
    return newOmieId;
  } catch (err) {
    const errMsg = err.response?.data?.faultstring || err.message;
    console.error('[OMIE CLIENT CREATE ERROR]:', errMsg);
    throw new Error(`Falha ao cadastrar cliente no Omie: ${errMsg}`);
  }
}

/**
 * Cria o Pedido de Venda oficial no Omie a partir de um pedido liquidado na loja virtual
 */
async function createOmieSalesOrder(orderId) {
  if (!orderId) throw new Error('orderId é obrigatório para envio de pedido ao Omie.');

  // 1. Carrega o pedido completo e seus itens do PostgreSQL
  const orderRes = await query(`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'variant_sku', oi.variant_sku,
               'name', oi.name,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price,
               'fulfillment_type', oi.fulfillment_type
             )
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.id = $1 OR o.order_number = $1
    GROUP BY o.id
  `, [String(orderId)]);

  if (orderRes.rows.length === 0) {
    throw new Error(`Pedido #${orderId} não encontrado no banco de dados.`);
  }

  const order = orderRes.rows[0];

  // Se o pedido já possui omie_pedido_id vinculado, não duplica
  if (order.omie_pedido_id) {
    console.log(`[OMIE ORDER SKIP] Pedido #${order.order_number} já está sincronizado com Omie (ID: ${order.omie_pedido_id}).`);
    return { alreadyCreated: true, omiePedidoId: order.omie_pedido_id };
  }

  const customerSnapshot = order.customer_snapshot || {};
  const shippingAddress = order.shipping_address || {};

  // 2. Garante que o cliente existe no Omie (Upsert automático)
  const codigoClienteOmie = await upsertOmieClient({
    name: customerSnapshot.name || order.user_name || 'Cliente Athena',
    document: customerSnapshot.document || '',
    email: customerSnapshot.email || order.user_email || '',
    phone: customerSnapshot.phone || '',
    companyName: customerSnapshot.companyName || null,
    address: shippingAddress
  });

  // 3. Mapeia os itens do pedido com o catálogo do Omie
  const items = Array.isArray(order.items) ? order.items : [];
  const detList = [];

  for (const it of items) {
    const qty = Math.max(1, parseInt(it.quantity || 1, 10));
    const unitPrice = Number(it.unit_price || (Number(it.total_price || 0) / qty) || 0);

    // Busca o código do produto Omie correspondente na tabela products
    let omieProdId = null;
    let prodSku = it.variant_sku || null;

    if (it.product_id) {
      const pRes = await query('SELECT omie_codigo_produto, omie_product_id, sku, omie_code FROM products WHERE id = $1', [it.product_id]);
      if (pRes.rows.length > 0) {
        omieProdId = pRes.rows[0].omie_codigo_produto || pRes.rows[0].omie_product_id || null;
        prodSku = prodSku || pRes.rows[0].sku || pRes.rows[0].omie_code || null;
      }
    }

    const produtoObj = {
      quantidade: qty,
      valor_unitario: unitPrice
    };

    if (omieProdId) {
      produtoObj.codigo_produto = Number(omieProdId);
    } else if (prodSku) {
      produtoObj.codigo = String(prodSku);
    } else {
      produtoObj.descricao = it.name || 'Produto Athena Loja Virtual';
    }

    detList.push({
      ide: {
        codigo_item_integracao: String(it.id || `item_${Date.now()}`)
      },
      produto: produtoObj
    });
  }

  // 4. Formata data de previsão para DD/MM/AAAA
  const now = new Date();
  const dataPrevisao = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const omiePayload = {
    cabecalho: {
      codigo_cliente: Number(codigoClienteOmie),
      codigo_cenario_impostos: '11876021380', // Cenário Tributário padrão Athena
      codigo_parcela: '999',                  // À vista / Liquidado
      data_previsao: dataPrevisao,
      etapa: '20',                            // Etapa 20 = Separar Estoque / Pronto para Faturar
      numero_pedido: String(order.order_number),
      origem_pedido: 'SITE',
      quantidade_itens: detList.length
    },
    det: detList,
    informacoes_adicionais: {
      codigo_categoria: '1.01.01',            // Vendas de Mercadorias
      codigo_conta_corrente: 11873002379,     // Conta Corrente Athena
      consumidor_final: 'S',
      dados_adicionais_nf: `Pedido #${order.order_number} liquidado na Loja Virtual Athena via ${order.payment_method || 'PIX/Cartão'}.`
    }
  };

  console.log(`[OMIE ORDER CREATE] Enviando Pedido #${order.order_number} para o Omie ERP...`);

  try {
    const omieRes = await callOmieApi(OMIE_PEDIDOS_URL, 'IncluirPedido', omiePayload);
    const codigoPedidoOmie = omieRes.codigo_pedido;
    const numeroPedidoOmie = omieRes.numero_pedido;

    // 5. Salva referências do Omie no pedido do Athena OS
    await query(`
      UPDATE orders 
      SET omie_pedido_id = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [String(codigoPedidoOmie), order.id]);

    // 6. Registra evento na timeline do pedido
    await query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, metadata, created_at
      ) VALUES ($1, $2, 'OMIE_ORDER_CREATED', $3, 'system', 'Integração Omie ERP', $4, $5, NOW())
    `, [
      `evt_omie_ord_${order.id}_${Date.now()}`,
      order.id,
      null,
      `Pedido oficial criado com sucesso no Omie ERP! Pedido Omie #${numeroPedidoOmie} (Código: ${codigoPedidoOmie}). Reserva física garantida.`,
      JSON.stringify({ codigoPedidoOmie, numeroPedidoOmie })
    ]);

    console.log(`[OMIE ORDER SUCCESS] ✅ Pedido #${order.order_number} integrado ao Omie ERP! Omie ID: ${codigoPedidoOmie} (Número: ${numeroPedidoOmie})`);
    return {
      success: true,
      omiePedidoId: codigoPedidoOmie,
      omieNumeroPedido: numeroPedidoOmie
    };
  } catch (err) {
    const errMsg = err.response?.data?.faultstring || err.message;
    console.error(`[OMIE ORDER ERROR] Falha ao criar pedido no Omie para Pedido #${order.order_number}:`, errMsg);
    
    // Registra falha na timeline para auditoria operacional
    await query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, metadata, created_at
      ) VALUES ($1, $2, 'OMIE_ORDER_SYNC_FAILED', $3, 'system', 'Integração Omie ERP', $4, $5, NOW())
    `, [
      `evt_omie_err_${order.id}_${Date.now()}`,
      order.id,
      null,
      `Aviso: O pedido foi pago na loja, mas a criação automática no Omie falhou: "${errMsg}". O pedido aguarda conciliação manual no painel.`,
      JSON.stringify({ error: errMsg })
    ]);

    return { success: false, error: errMsg };
  }
}

module.exports = {
  upsertOmieClient,
  createOmieSalesOrder
};
