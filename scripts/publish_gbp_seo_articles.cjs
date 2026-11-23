const { Pool } = require('pg');
require('dotenv').config({ path: '/home/yago/Documentos/athena/backend/.env' });

async function publishArticles() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const authorId = 'user_admin_default';

    const articles = [
      {
        title: 'Distribuidora de Equipamentos Automotivos em Brasília: Como Escolher o Fornecedor Ideal no Distrito Federal',
        slug: 'distribuidora-equipamentos-automotivos-brasilia-distrito-federal',
        category_id: 'e2d6c1db-4032-4f06-8138-aaa842b99347', // Gestão & Produtividade
        excerpt: 'Guia completo para oficinas mecânicas em Brasília e DF escolherem seu fornecedor de equipamentos automotivos: atendimento humanizado, pós-venda ativo e suporte presencial.',
        cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/lpk-1000-87ec2499d204.webp',
        reading_time_minutes: 7,
        status: 'published',
        author_id: authorId,
        meta_title: 'Distribuidora de Equipamentos Automotivos em Brasília | DF',
        meta_description: 'Procurando distribuidora de equipamentos automotivos em Brasília e DF? Conheça as soluções da Athena: atendimento humanizado, suporte técnico e pós-venda ativo.',
        content_html: `
<p>Gerenciar um centro automotivo de sucesso no Distrito Federal exige muito mais do que conhecimento mecânico: exige parceiros estratégicos de confiança. Ao buscar uma <strong>distribuidora de equipamentos automotivos em Brasília</strong> ou no entorno do DF, o reparador frequentemente se depara com compras pela internet sem suporte, prazos de entrega imprevisíveis e ausência total de assistência pós-venda.</p>

<p>Neste artigo, detalhamos os fatores decisivos para escolher o parceiro ideal em <strong>ferramentas automotivas no Distrito Federal</strong> e como aliar investimento inteligente a alta produtividade na sua oficina.</p>

<h2>1. Por Que o Atendimento Humanizado e a Consultoria Técnica Fazem a Diferença</h2>
<p>Diferente de um e-commerce genérico de ferramentas, um <strong>fornecedor de equipamentos automotivos no entorno do DF</strong> precisa compreender a rotina e o fluxo de trabalho real de cada empresa. A Athena Consultoria adota uma postura de <em>atendimento humanizado</em> e <em>consultoria para oficinas automotivas</em>:</p>
<ul>
  <li><strong>Avaliação da Estrutura Física:</strong> Cálculo de pé-direito para elevadores automotivos (Mahovi e Lapek), posicionamento elétrico e dimensionamento pneumático.</li>
  <li><strong>Demanda de Serviços:</strong> Indicação dos equipamentos certos para o perfil dos veículos atendidos (linha leve, utilitários, híbridos ou elétricos).</li>
  <li><strong>Evitar Ociosidade:</strong> Garantir que cada máquina adquirida gere retorno sobre o investimento (ROI) desde a primeira semana de operação.</li>
</ul>

<h2>2. Equipamentos para Oficinas Mecânicas em Brasília com Pós-Venda Ativo</h2>
<p>O maior pesadelo de um auto center é ter um elevador ou scanner travado esperando peças que vêm de outro estado sem qualquer previsão. Trabalhar com um distribuidor com base física e <strong>showroom em Águas Claras, Brasília-DF</strong> garante:</p>
<ul>
  <li><strong>Pós-Venda Ativo:</strong> Acompanhamento próximo da entrega, montagem técnica e primeiros testes operacionais.</li>
  <li><strong>Assistência Técnica Presencial:</strong> Técnicos capacitados que vão até a sua oficina no DF e cidades próximas de Goiás para regulagens, revisões e manutenções preventivas.</li>
  <li><strong>Soluções para Oficinas Integradas:</strong> De scanners com topologia de rede EAATA a elevadores de 4.0T a 6.0T, compressores e alinhadores 3D.</li>
</ul>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Atendimento Presencial no DF</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Visite o Showroom da Athena em Águas Claras - DF</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Conheça de perto os melhores equipamentos automotivos para oficinas mecânicas no DF. Fale com um consultor técnico especializado pelo WhatsApp (61) 98348-5671.</p>
  <a href="https://wa.me/5561983485671?text=Ol%C3%A1%21+Gostaria+de+agendar+uma+visita+ao+showroom+da+Athena+em+%C3%81guas+Claras." target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Falar com um Consultor Técnico no DF →</a>
</div>

<h2>3. Como a Tecnologia Automotiva Alavanca a Produtividade</h2>
<p>Modernizar os <em>equipamentos para oficinas mecânicas no DF</em> reduz retrabalhos em até 40%. Equipamentos profissionais como carrinhos organizadores modulares, alinhadores digitais e sangradores de freio pneumáticos economizam horas por veículo, aumentando o faturamento mensal da oficina sem a necessidade de aumentar o quadro de funcionários.</p>

<p>Se você busca um parceiro com <strong>suporte técnico especializado</strong>, marcas líderes de mercado (Mahovi, Lapek, EAATA, Sigma Tools, Wolfcar e Delta) e acompanhamento contínuo, a Athena Consultoria está pronta para transformar os resultados do seu negócio.</p>
`
      },
      {
        title: 'Equipamentos para Lanternagem, Pintura e Estética Automotiva no DF: O Guia de Produtividade',
        slug: 'equipamentos-lanternagem-pintura-estetica-automotiva-df-brasilia',
        category_id: '1bef4603-1d1b-456b-b9fe-ccabc6d9aa36', // Equipamentos & Tecnologia
        excerpt: 'Descubra os melhores equipamentos para lanternagem, pintura, estética automotiva e lava-jatos em Brasília: pistolas HVLP Sigma Tools, compressores e detalhamento profissional.',
        cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sigma-1-3-c984b8e376e3.webp',
        reading_time_minutes: 6,
        status: 'published',
        author_id: authorId,
        meta_title: 'Equipamentos para Lanternagem, Pintura e Estética no DF | Athena',
        meta_description: 'Equipamentos para lanternagem, pintura e estética automotiva em Brasília. Pistolas HVLP, compressores e produtos para lava-jato com suporte da Athena.',
        content_html: `
<p>O mercado de cuidados automotivos no Distrito Federal está em plena expansão. Clientes de Brasília exigem padrão estético de excelência, tanto na repintura de lataria quanto nos serviços de vitrificação e polimento técnico. Para os profissionais do setor, investir em <strong>equipamentos para lanternagem e pintura automotiva</strong> e <strong>produtos para estética automotiva em Brasília</strong> é o diferencial definitivo entre uma oficina comum e um centro de referência.</p>

<h2>1. Pintura de Alta Precisão com Pistolas HVLP</h2>
<p>Na etapa de repintura e acabamento, o desperdício de tinta e a névoa excessiva (overspray) aumentam custos e comprometem a saúde do operador. As pistolas de pintura de tecnologia <strong>HVLP (High Volume Low Pressure)</strong> da Sigma Tools (como as linhas SGT-3010A e SGT-3710A) garantem:</p>
<ul>
  <li><strong>Transferência Eficiente:</strong> Mais de 65% a 75% da tinta é efetivamente depositada na peça, reduzindo o consumo de material nobre.</li>
  <li><strong>Leque Uniforme:</strong> Acabamento espelhado sem efeito "casca de laranja", essencial para vernizes e tintas base poliéster e água.</li>
  <li><strong>Ergonomia para Jornadas Longas:</strong> Empunhadura leve em alumínio usinado para evitar fadiga muscular do pintor.</li>
</ul>

<h2>2. Equipamentos para Detalhamento Automotivo e Lava-Jatos no DF</h2>
<p>Os <strong>produtos e equipamentos para lava-jatos</strong> e <strong>equipamentos para detalhamento automotivo</strong> evoluíram significativamente. O uso de suportes ergonômicos para mangueiras de alta pressão, carrinhos detailer 360° com bandejas porta-politrizes e iluminação técnica com LED de alto CRI (índice de reprodução de cor) permite identificar micro-riscos (swirls) e hologramas que a luz comum não revela.</p>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Estética & Pintura no DF</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Linha Completa Sigma Tools na Athena Consultoria</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Pistolas de pintura, politrizes roto-orbitais, suportes para lava-jatos e carrinhos detailer profissionais com pronta disponibilidade em Brasília.</p>
  <a href="/marca/sigma-tools" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Equipamentos Sigma Tools →</a>
</div>

<h2>3. Produtividade para Oficinas de Lanternagem</h2>
<p>O segredo de um box de alta produtividade está na organização inteligente. Ferramentas pneumáticas específicas, repuxadeiras spotter digitais e bancadas de estiramento alinhadas a <em>equipamentos profissionais</em> reduzem o tempo de entrega dos veículos segurados e particulares, maximizando a rotatividade dos boxes e o lucro líquido da oficina.</p>
`
      },
      {
        title: 'Assistência Técnica de Equipamentos Automotivos e Cursos em Brasília: O Suporte que Sua Oficina Precisa',
        slug: 'assistencia-tecnica-equipamentos-automotivos-cursos-brasilia-df',
        category_id: 'aab4ecac-5787-4eb4-ad80-cc13ff319ef8', // Manutenção Preventiva
        excerpt: 'A importância da assistência técnica de equipamentos automotivos, suporte técnico presencial e capacitação profissional com cursos automotivos em Brasília e região.',
        cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-8aaa3ad4f931.webp',
        reading_time_minutes: 6,
        status: 'published',
        author_id: authorId,
        meta_title: 'Assistência Técnica e Cursos Automotivos em Brasília | DF',
        meta_description: 'Assistência técnica de equipamentos automotivos e cursos para profissionais em Brasília. Suporte presencial e capacitação com a Athena Consultoria no DF.',
        content_html: `
<p>Comprar uma máquina de ponta é apenas o primeiro passo. Sem o devido treinamento da equipe e sem um plano de manutenção preventiva, até os melhores equipamentos perdem precisão e podem parar a oficina no momento de maior movimento. Por isso, a <strong>assistência técnica de equipamentos automotivos</strong> e o <strong>suporte técnico para oficinas mecânicas</strong> são pilares essenciais no mercado de Brasília e Goiás.</p>

<h2>1. Assistência Técnica Presencial: O Diferencial da Athena</h2>
<p>Enquanto a maioria dos representantes atua apenas como intermediários de vendas, a Athena Consultoria estabeleceu um modelo de atuação focado no ciclo de vida completo das máquinas. Nossa equipe técnica oferece:</p>
<ul>
  <li><strong>Atendimento Presencial nas Oficinas:</strong> Técnicos realizam visitas in loco em oficinas mecânicas em Brasília, Taguatinga, Ceilândia, Águas Claras, Samambaia, Plano Piloto e entorno de Goiás.</li>
  <li><strong>Calibração e Nivelamento:</strong> Ajustes precisos de elevadores conforme as normas da NR-12 e calibração de alinhadores de direção e câmeras ADAS.</li>
  <li><strong>Diagnóstico de Redes e Scanners:</strong> Atualizações de software, liberação de gateways de segurança (SGW) e suporte operacional em protocolos CAN-FD e DoIP.</li>
</ul>

<h2>2. Cursos para Profissionais Automotivos em Brasília</h2>
<p>A tecnologia automotiva avança rapidamente com a eletrificação e as arquiteturas de redes veiculares complexas. A Athena promove <strong>cursos para profissionais automotivos em Brasília</strong> e palestras técnicas direcionadas à <em>capacitação profissional</em> dos mecânicos e gestores:</p>
<ul>
  <li>Treinamento prático de diagnóstico com osciloscópio e scanners avançados.</li>
  <li>Procedimentos seguros para desenergização e manutenção de veículos híbridos e elétricos (VEs).</li>
  <li>Gestão de processos e produtividade para líderes e donos de oficinas mecânicas.</li>
</ul>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Suporte & Treinamentos no DF</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Precisa de Assistência Técnica ou Capacitação em Brasília?</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Agende uma visita técnica presencial na sua empresa ou consulte nossa agenda de cursos automotivos em Brasília e entorno.</p>
  <a href="https://wa.me/5561983485671?text=Ol%C3%A1%21+Gostaria+de+saber+mais+sobre+a+assist%C3%AAncia+t%C3%A9cnica+e+cursos+da+Athena+em+Bras%C3%ADlia." target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Falar com o Suporte Técnico no WhatsApp →</a>
</div>

<h2>3. Construindo Parcerias Duradouras no Distrito Federal</h2>
<p>O objetivo da Athena Consultoria não é realizar uma venda pontual, mas estabelecer uma parceria de longo prazo que fortaleça a oficina mecânica. Com <em>soluções para oficinas</em> sob medida, suporte ágil e compromisso humanizado, elevamos o patamar dos centros automotivos de toda a capital federal.</p>
`
      }
    ];

    for (const art of articles) {
      let postId;
      const check = await pool.query("SELECT id FROM blog_posts WHERE slug = $1", [art.slug]);
      if (check.rows.length > 0) {
        postId = check.rows[0].id;
        console.log(`Artigo já existe, atualizando: ${art.slug}`);
        await pool.query(
          `UPDATE blog_posts 
           SET title = $1, excerpt = $2, content_html = $3, cover_image_key = $4, meta_title = $5, meta_description = $6, updated_at = NOW()
           WHERE id = $7`,
          [art.title, art.excerpt, art.content_html, art.cover_image_key, art.meta_title, art.meta_description, postId]
        );
      } else {
        console.log(`Cadastrando novo artigo: ${art.slug}`);
        const ins = await pool.query(
          `INSERT INTO blog_posts 
           (title, slug, excerpt, content_html, cover_image_key, reading_time_minutes, status, author_id, meta_title, meta_description, published_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
           RETURNING id`,
          [
            art.title,
            art.slug,
            art.excerpt,
            art.content_html,
            art.cover_image_key,
            art.reading_time_minutes,
            art.status,
            art.author_id,
            art.meta_title,
            art.meta_description
          ]
        );
        postId = ins.rows[0].id;
      }

      // Vínculo na tabela relacional de categorias
      if (art.category_id && postId) {
        await pool.query(
          `INSERT INTO blog_post_categories (post_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [postId, art.category_id]
        );
      }
    }

    console.log("Todos os 3 novos artigos com foco em SEO GBP DF foram publicados com sucesso!");
  } catch (err) {
    console.error("Erro ao publicar artigos:", err);
  } finally {
    await pool.end();
  }
}

publishArticles();
