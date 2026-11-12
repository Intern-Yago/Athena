const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { query } = require('../backend/services/db');
const crypto = require('crypto');

async function main() {
  console.log('[1] Atualizando dados de SEO On-Page do EAATA 90...');
  await query(`
    UPDATE products
    SET 
      name = $1,
      alt_text = $2,
      updated_at = NOW()
    WHERE slug = $3
  `, [
    'Scanner Automotivo EAATA 90 - Diagnóstico por Topologia e IA',
    'Scanner Automotivo EAATA 90 com Diagnóstico por Topologia de Rede e IA - EAATA Brasil Athena Soluções Automotivas',
    'scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata'
  ]);
  console.log('[1] Produto EAATA 90 atualizado com sucesso!');

  console.log('[2] Criando Artigo Técnico no Blog da Athena...');
  const slug = 'scanner-topologia-de-rede-ia-eaata-90-oficina';
  const title = 'Scanner com Topologia de Rede e IA: Vale a Pena o EAATA 90 para a Sua Oficina?';
  const excerpt = 'Entenda o que é o diagnóstico por topologia de rede, como a inteligência artificial acelera a identificação de falhas elétricas e se o scanner EAATA 90 é a escolha ideal para o auto center moderno.';
  const metaTitle = 'Scanner com Topologia de Rede e IA: EAATA 90 Vale a Pena? | Blog Athena';
  const metaDesc = 'Avaliação técnica do scanner automotivo EAATA 90: diagnóstico por topologia de rede, IA integrada, 35 funções de reset, protocolos CAN-FD e DoIP. Confira o review.';

  const contentHtml = `
<p>O diagnóstico automotivo mudou drasticamente nos últimos anos. Veículos modernos não contam mais com apenas uma ou duas centrais eletrônicas isoladas; hoje, um carro de passeio comum pode ter entre 30 e 70 módulos interconectados através de barramentos de alta velocidade como CAN-FD, LIN, FlexRay e Ethernet automotiva (DoIP).</p>

<p>Nesse cenário de alta complexidade, a tradicional leitura linear de códigos de falha (DTCs) tornou-se lenta e muitas vezes enganosa. É aí que entram os scanners com <strong>mapeamento por topologia de rede e diagnóstico assistido por Inteligência Artificial</strong>, categoria liderada no Brasil pelo <strong>EAATA 90</strong>.</p>

<h2>1. O que é o Diagnóstico por Topologia de Rede?</h2>
<p>Em scanners convencionais, o técnico visualiza uma lista estática de módulos com status de comunicação individual. Quando ocorre um curto-circuito na linha CAN ou uma perda de terminação de rede, dezenas de módulos podem reportar falhas simultâneas de "comunicação perdida" (códigos da série U), gerando confusão sobre a verdadeira origem do defeito.</p>

<p>No <strong>EAATA 90</strong>, o diagnóstico por topologia de rede desenha na tela um <strong>diagrama estrutural colorido em tempo real</strong> de toda a arquitetura eletrônica do veículo. Os barramentos são separados por cores e topologia física (anel, estrela ou barramento linear):</p>
<ul>
  <li><strong>Módulos em Verde:</strong> Sistemas comunicando perfeitamente e sem avarias registradas.</li>
  <li><strong>Módulos em Amarelo/Vermelho:</strong> Módulos com falhas ativas ou históricas, permitindo clique direto para detalhamento.</li>
  <li><strong>Módulos em Cinza:</strong> Centrais sem resposta ou não equipadas na versão do veículo, isolando visualmente o ponto exato da interrupção do chicote.</li>
</ul>

<h2>2. Inteligência Artificial no Diagnóstico: Agilidade sem 'Achismo'</h2>
<p>O grande diferencial do software da EAATA é a integração de IA para triagem de sintomas. Ao invés de o reparador gastar horas consultando esquemas elétricos desatualizados, o sistema correlaciona:</p>
<ol>
  <li>O código de falha identificado pelo scanner;</li>
  <li>Os parâmetros congelados (Freeze Frame) no momento exato do evento;</li>
  <li>Uma base de dados global com milhões de reparos validados para a mesma motorização e montadora.</li>
</ol>
<p>O resultado é uma indicação probabilística dos componentes com maior probabilidade de defeito, guiando testes práticos com multímetro ou osciloscópio.</p>

<h2>3. Suporte aos Novos Protocolos: CAN-FD e DoIP sem Adaptadores Externos</h2>
<p>Montadoras como General Motors (Onix, Tracker, Montana novos), Stellantis (linha Fiat e Jeep com Security Gateway SGW), Ford e BMW já utilizam barramentos de altíssima taxa de transferência. Scanners antigos simplesmente não conseguem se comunicar com essas centrais sem adaptadores caros e desajeitados.</p>
<p>O EAATA 90 já vem equipado de fábrica com a interface VCI inteligente que suporta nativamente <strong>CAN-FD</strong> e <strong>DoIP</strong>, garantindo longevidade para os próximos anos de atendimento na oficina.</p>

<h2>4. 35 Funções Especiais de Manutenção</h2>
<p>Além do escaneamento completo de injeção, câmbio automático, ABS e airbag, o equipamento atende a rotina diária de serviços com 35 resets dedicados:</p>
<ul>
  <li>Sangria eletrônica de freios ABS;</li>
  <li>Regeneração forçada de filtro de partículas diesel (DPF);</li>
  <li>Codificação e reset de sensores de ângulo de direção (SAS);</li>
  <li>Calibração e pareamento de novas baterias (BMS);</li>
  <li>Aprendizado de corpo de borboleta eletrônico;</li>
  <li>Funções guiadas para o Grupo VAG (Volkswagen e Audi) com passo a passo ilustrado na tela.</li>
</ul>

<h2>5. Vale a Pena o Investimento?</h2>
<p>Se a sua oficina busca atender veículos nacionais e importados modernos sem depender de terceirização de diagnóstico ou passar aperto com luzes de anomalia acesas no painel, o <strong>EAATA 90</strong> é uma das ferramentas com melhor relação custo-benefício e densidade tecnológica do mercado brasileiro.</p>

<div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 24px; margin-top: 32px;">
  <h3 style="color: #f59e0b; margin-top: 0;">Conheça o Scanner EAATA 90 na Athena</h3>
  <p style="margin-bottom: 16px;">A Athena Soluções Automotivas é distribuidora oficial da linha EAATA no Brasil, oferecendo faturamento para CNPJ e CPF, pronta-entrega e suporte técnico especializado pós-venda.</p>
  <p><a href="/produto/scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata" style="display: inline-block; background-color: #f59e0b; color: #020617; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Ver Ficha Técnica do EAATA 90 &rarr;</a></p>
</div>
`.trim();

  const blocksJson = [
    { type: 'paragraph', content: 'Visão geral do diagnóstico por topologia de rede no EAATA 90.' }
  ];

  // Checa se o post já existe
  const checkPost = await query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
  let finalPostId;

  if (checkPost.rows.length > 0) {
    finalPostId = checkPost.rows[0].id;
    await query(`
      UPDATE blog_posts
      SET 
        title = $1,
        excerpt = $2,
        content_html = $3,
        meta_title = $4,
        meta_description = $5,
        status = 'published',
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = $6
    `, [title, excerpt, contentHtml, metaTitle, metaDesc, finalPostId]);
    console.log('[2] Artigo existente atualizado com sucesso!');
  } else {
    finalPostId = crypto.randomUUID();
    await query(`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, content, content_html,
        meta_title, meta_description, reading_time_minutes,
        view_count, status, published_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), NOW())
    `, [
      finalPostId, title, slug, excerpt, JSON.stringify(blocksJson), contentHtml,
      metaTitle, metaDesc, 5, 0, 'published'
    ]);
    console.log('[2] Novo artigo publicado com sucesso!');
  }

  // Vincula categoria Equipamentos & Tecnologia
  await query(`
    INSERT INTO blog_post_categories (post_id, category_id)
    VALUES ($1, '1bef4603-1d1b-456b-b9fe-ccabc6d9aa36')
    ON CONFLICT DO NOTHING
  `, [finalPostId]);

  console.log('[3] Categoria vinculada com sucesso! URL do artigo: /blog/' + slug);
  process.exit(0);
}

main().catch(e => {
  console.error('[ERRO]', e);
  process.exit(1);
});
