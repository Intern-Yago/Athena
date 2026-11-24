/**
 * publish_unaware_articles.cjs
 * Publica os 3 artigos de Nível 1 (Inconsciente / Topo de Funil de Eugene Schwartz)
 * com as palavras-chave secundárias e de apoio do GBP.
 */

require('dotenv').config({ path: '/home/yago/Documentos/athena/backend/.env' });
const { query } = require('../backend/services/db');

const AUTHOR_ID = 'user_admin_default';

const ARTICLES = [
  {
    title: 'Os 4 Gargalos Invisíveis que Impedem Oficinas Mecânicas de Dobrar o Faturamento Mensal',
    slug: 'gargalos-invisiveis-produtividade-oficinas-mecanicas-brasilia',
    category_id: 'e2d6c1db-4032-4f06-8138-aaa842b99347', // Gestão & Produtividade
    excerpt: 'Descubra como o tempo perdido procurando ferramentas, gargalos em boxes mecânicos e falta de processos drenam até 35% do lucro líquido de oficinas mecânicas no DF.',
    meta_title: 'Os 4 Gargalos que Travam o Lucro de Oficinas | Blog Athena DF',
    meta_description: 'Sua oficina está sempre cheia mas o caixa no fim do mês não sobra? Veja os 4 gargalos invisíveis de produtividade para oficinas mecânicas em Brasília e no DF.',
    cover_image_key: 'uploads/blog-cover-gargalos-produtividade-oficina-unaware.webp',
    reading_time_minutes: 8,
    tags: ['Produtividade para oficinas', 'Soluções para oficinas', 'Equipamentos profissionais', 'Brasília DF', 'Gestão de Oficinas'],
    content_html: `
<p>É uma cena comum em muitas oficinas mecânicas no Distrito Federal e em todo o Brasil: o pátio está abarrotado de veículos, o telefone não para de tocar, a equipe corre o dia inteiro de um lado para o outro... mas, ao fechar o balanço financeiro no fim do mês, <strong>a margem de lucro líquido é decepcionante</strong>.</p>

<p>A reação imediata da maioria dos gestores é pensar: <em>"Preciso cobrar mais caro na mão de obra"</em> ou <em>"Preciso atrair mais clientes novos"</em>. Na esmagadora maioria das vezes, o diagnóstico está completamente equivocado. O problema não é a captação de clientes, mas sim <strong>gargalos invisíveis de produtividade para oficinas</strong> que drenam horas valiosas e dinheiro pelo ralo todos os dias.</p>

<h2>1. O "Passeio do Mecânico": Tempo Perdido Procurando Ferramentas</h2>
<p>Em uma oficina desorganizada ou com bancadas mal dimensionadas, um reparador chega a caminhar entre <strong>2 a 3 quilômetros por dia</strong> dentro do próprio galpão procurando chaves combinadas, soquetes específicos, adaptadores pneumáticos ou torquímetros que foram emprestados para o box vizinho.</p>
<p>Se um mecânico perde apenas 40 minutos diários procurando ferramentas ou esperando liberação de bancada, em uma equipe de 4 profissionais são <strong>160 minutos desperdiçados todos os dias</strong> — o equivalente a mais de 50 horas de mão de obra técnica faturável jogadas fora por mês. Implementar <strong>soluções para oficinas</strong> com carrinhos organizadores móveis 360° individuais por box estanca esse sangramento imediatamente.</p>

<h2>2. Carros Imobilizados por Diagnósticos Inconclusivos</h2>
<p>Outro vazamento crítico de caixa: o veículo que sobe no elevador para uma revisão simples, mas durante o teste acusa falha intermitente em barramento de comunicação ou sensor eletrônico. Sem <strong>equipamentos profissionais</strong> de diagnóstico com varredura visual e suporte técnico especializado, o carro fica ocupando o box mecânico por 3 a 5 dias úteis, impedindo a entrada de outros 10 serviços rápidos de alta liquidez.</p>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Consultoria para Oficinas Automotivas</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Quer Identificar os Gargalos Operacionais do Seu Auto Center?</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">A Athena Soluções Automotivas oferece atendimento humanizado e consultoria técnica presencial em Brasília e em todo o DF para transformar o fluxo do seu box e elevar sua lucratividade.</p>
  <a href="/sobre" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Conheça Nossa Assessoria no Distrito Federal →</a>
</div>

<h2>3. Dependência de Terceirização em Serviços de Alta Rentabilidade</h2>
<p>Quantas vezes por semana sua oficina precisa enviar um cliente para fora para fazer reprogramação de módulo, troca de fluido de transmissão automática por diálise ou alinhamento 3D? Ao repassar o serviço para terceiros, além de perder 70% da margem de contribuição, você corre o risco de entregar um prazo longo e perder a fidelidade do cliente para o concorrente.</p>

<h2>4. Como a Athena Transforma Produtividade em Brasília e DF</h2>
<p>Como a principal <strong>distribuidora de equipamentos automotivos em Brasília</strong>, a Athena não entrega apenas maquinário em caixas: oferecemos <strong>tecnologia automotiva</strong> de ponta, <strong>capacitação profissional</strong> para o time de reparadores, pós-venda ativo e suporte presencial no seu box mecânico.</p>
`
  },
  {
    title: 'Sua Oficina Corre Risco com o Ministério do Trabalho? O Que a Fiscalização da NR-12 Exige nos Elevadores',
    slug: 'fiscalizacao-nr12-elevadores-automotivos-riscos-oficinas',
    category_id: 'aab4ecac-5787-4eb4-ad80-cc13ff319ef8', // Manutenção Preventiva
    excerpt: 'Conheça as exigências legais da Norma Regulamentadora NR-12 para elevadores automotivos, travas de segurança obrigatórias e como evitar interdições graves no DF.',
    meta_title: 'NR-12 em Elevadores Automotivos: Riscos e Fiscalização | Athena DF',
    meta_description: 'Entenda os riscos jurídicos e trabalhistas da fiscalização da NR-12 em elevadores automotivos de oficinas no DF e a importância da manutenção preventiva certificada.',
    cover_image_key: 'uploads/blog-cover-nr12-seguranca-elevadores-unaware.webp',
    reading_time_minutes: 7,
    tags: ['Assistência técnica de equipamentos automotivos', 'Suporte técnico para oficinas mecânicas', 'NR-12', 'Segurança no Trabalho', 'Manutenção Preventiva'],
    content_html: `
<p>Muitos proprietários de oficinas mecânicas no Distrito Federal enxergam seus elevadores automotivos como meras ferramentas de elevação que só demandam atenção quando algum barulho estranho surge ou quando um braço hidráulico começa a vazar óleo. O que poucos sabem é que um equipamento sem conformidade técnica pode gerar <strong>multas pesadíssimas e até a interdição imediata do estabelecimento pelo Ministério do Trabalho</strong>.</p>

<h2>1. O Que É a NR-12 e Como Ela se Aplica a Oficinas Mecânicas?</h2>
<p>A Norma Regulamentadora nº 12 (<strong>NR-12</strong>) do Ministério do Trabalho e Emprego estabelece parâmetros rígidos para a segurança no trabalho em máquinas e equipamentos. No contexto de <strong>equipamentos para oficinas mecânicas no DF</strong>, os elevadores de duas e quatro colunas e elevadores pantográficos tesoura são alvos prioritários de fiscalizações trabalhistas.</p>

<h3>Os Itens Obrigatórios que os Fiscais Inspecionam:</h3>
<ul>
  <li><strong>Travas Mecânicas Automáticas de Braços:</strong> Os braços telescópicos do elevador devem travar mecanicamente de forma automática assim que saem do nível do piso, impedindo o giro involuntário durante o içamento.</li>
  <li><strong>Válvulas Paracaídas e Travas Hidráulicas:</strong> Em caso de rompimento de mangueira hidráulica de alta pressão, o elevador não pode descer em queda livre; o fluxo deve ser bloqueado instantaneamente.</li>
  <li><strong>Dispositivos de Parada de Emergência e Proteção Elétrica:</strong> Painel de comando com chave seletora, botão de emergência acessível e conformidade com a NR-10 (painéis blindados contra choque elétrico e umidade).</li>
  <li><strong>Livro de Registro e Histórico de Manutenção Preventiva:</strong> Laudo técnico assinado com <strong>assistência técnica presencial</strong> periódica.</li>
</ul>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Segurança & Suporte Técnico Especializado</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Seus Elevadores Cumprem as Exigências da NR-12?</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Na Athena Soluções Automotivas, todos os elevadores Mahovi acompanham certificação integral de segurança, manual em português e suporte técnico para oficinas mecânicas em Brasília.</p>
  <a href="/categoria/elevadores-automotivos" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Conheça a Linha Mahovi Certificada NR-12 →</a>
</div>

<h2>2. O Perigo de Equipamentos sem Procedência ou Reformados sem Laudo</h2>
<p>Comprar elevadores usados em ferros-velhos ou de fornecedores sem registro formal no entorno do DF é uma armadilha clássica. Em caso de acidente de trabalho com colaboradores ou queda de veículo de cliente, a responsabilidade civil e criminal recai integralmente sobre o proprietário da oficina.</p>

<p>Contar com um <strong>fornecedor de equipamentos automotivos no entorno do DF</strong> que ofereça <strong>assistência técnica de equipamentos automotivos</strong> e pós-venda ativo é a garantia indispensável para manter as portas abertas com total tranquilidade jurídica.</p>
`
  },
  {
    title: 'O Que Acontece Quando um Carro Híbrido ou Elétrico Entra na Sua Oficina Hoje?',
    slug: 'preparacao-oficinas-carros-hibridos-eletricos-brasilia-df',
    category_id: 'd7ad4420-ad06-4830-b80a-69d74d24b55e', // Tendências Automotivas
    excerpt: 'Sua oficina está pronta para atender BYD, GWM e híbridos no DF ou está recusando serviços por falta de ferramentas isoladas 1000V e protocolos de alta tensão?',
    meta_title: 'Carros Híbridos e Elétricos na Oficina no DF | Blog Athena',
    meta_description: 'Entenda os riscos de choque elétrico letal, EPIs classe 0, ferramentas isoladas 1000V e oportunidades de lucro para oficinas com a frota EV em Brasília.',
    cover_image_key: 'uploads/blog-cover-carros-eletricos-oficina-preparacao-unaware.webp',
    reading_time_minutes: 8,
    tags: ['Cursos para profissionais automotivos em Brasília', 'Tecnologia automotiva', 'Veículos Elétricos', 'Capacitação profissional', 'Equipamentos profissionais'],
    content_html: `
<p>Brasília já é uma das capitais com a maior densidade de veículos híbridos e 100% elétricos (EV) por habitante no Brasil. Modelos como BYD Dolphin, Seal, Song Plus, GWM Haval H6 e Ora 03 tornaram-se presença diária no trânsito do Plano Piloto, Águas Claras, Taguatinga e em todo o Distrito Federal.</p>

<p>No entanto, quando um desses carros precisa de reparo no sistema de freios regenerativos, suspensão, arrefecimento ou geometria após o término da garantia de concessionária, <strong>mais de 80% das oficinas mecânicas independentes do DF simplesmente recusam o atendimento</strong> por medo ou falta de conhecimento dos riscos reais.</p>

<h2>1. O Risco Silencioso da Linha Laranja (Alta Tensão)</h2>
<p>Ao abrir o capô ou o assoalho de um veículo elétrico, o mecânico se depara com conduítes e cabos de cor laranja viva. Esses cabos operam em corrente contínua (DC) com tensões que variam de <strong>400V a mais de 800V</strong> — o suficiente para provocar arco elétrico fulminante e choques fatais instantâneos caso procedimentos incorretos de desenergização sejam adotados.</p>

<h3>Os Três Pilares para Atender Veículos Elétricos com Segurança:</h3>
<ul>
  <li><strong>Desenergização do Service Plug (MSD):</strong> Procedimento de bloqueio e etiquetagem (Lockout/Tagout) com chave mecânica de desconexão e medição residual de voltagem zero com multímetro CAT IV 1000V.</li>
  <li><strong>Ferramentas Manuais com Certificação IEC 60900 (1000V):</strong> Jogos de soquetes, catracas e alicates com duplo isolamento para evitar curto-circuitos entre barramentos de bateria e chassi.</li>
  <li><strong>EPIs Específicos para Alta Tensão:</strong> Luvas isolantes de borracha classe 0 (1000V) com sobreluva de couro, viseira de proteção contra arco elétrico e tapete isolante no box.</li>
</ul>

<div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Capacitação Técnica & Ferramental Seguro</span>
  <h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Prepare Sua Oficina para Faturar Alto com a Nova Frota Elétrica</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">A Athena Soluções Automotivas fornece adaptadores de recarga, carregadores portáteis tipo 2 homologados e cursos para profissionais automotivos em Brasília com suporte técnico especializado.</p>
  <a href="/blog/recarga-veiculos-eletricos-adaptador-ccs2-gbt-carregador-portatil-7kw" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Leia Mais Sobre Infraestrutura EV no Blog →</a>
</div>

<h2>2. Por Que a Capacitação Técnica É a Chave da Rentabilidade?</h2>
<p>Oficinas que dominam os protocolos de desenergização e possuem <strong>ferramentas automotivas no Distrito Federal</strong> adequadas conseguem cobrar ticket médio até 3 vezes maior na hora técnica do que em veículos a combustão convencionais, garantindo exclusividade e reputação de alto padrão na capital.</p>

<p>Com o apoio da Athena Soluções Automotivas, sua oficina tem acesso a <strong>atendimento humanizado</strong>, orientação de segurança presencial e o maquinário necessário para transformar a transição energética em uma oportunidade real de expansão do seu negócio.</p>
`
  }
];

async function main() {
  console.log('Iniciando cadastro dos 3 artigos de Nível 1 (Inconsciente)...');
  
  for (const art of ARTICLES) {
    const existing = await query('SELECT id FROM blog_posts WHERE slug = $1', [art.slug]);
    
    let postId;
    if (existing.rows.length > 0) {
      postId = existing.rows[0].id;
      await query(`
        UPDATE blog_posts
        SET title = $1,
            excerpt = $2,
            content_html = $3,
            cover_image_key = $4,
            meta_title = $5,
            meta_description = $6,
            reading_time_minutes = $7,
            view_count = 0,
            status = 'published',
            updated_at = NOW()
        WHERE id = $8
      `, [
        art.title,
        art.excerpt,
        art.content_html,
        art.cover_image_key,
        art.meta_title,
        art.meta_description,
        art.reading_time_minutes,
        postId
      ]);
      console.log(`Artigo atualizado: ${art.slug} (${postId})`);
    } else {
      const inserted = await query(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content_html, cover_image_key, 
          status, author_id, meta_title, meta_description, 
          reading_time_minutes, view_count, published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 
          'published', $6, $7, $8, 
          $9, 0, NOW(), NOW(), NOW()
        ) RETURNING id
      `, [
        art.title,
        art.slug,
        art.excerpt,
        art.content_html,
        art.cover_image_key,
        AUTHOR_ID,
        art.meta_title,
        art.meta_description,
        art.reading_time_minutes
      ]);
      postId = inserted.rows[0].id;
      console.log(`Artigo criado: ${art.slug} (${postId})`);
    }

    // Vincular categoria
    await query('DELETE FROM blog_post_categories WHERE post_id = $1', [postId]);
    await query('INSERT INTO blog_post_categories (post_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      postId,
      art.category_id
    ]);
  }

  console.log('Todos os 3 artigos de Nível 1 foram cadastrados/atualizados com sucesso!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
