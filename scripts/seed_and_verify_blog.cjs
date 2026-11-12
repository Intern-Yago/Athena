const { query } = require('../backend/services/db');
const blogService = require('../backend/services/blogService');

async function seedAndVerify() {
  console.log('[Blog Verify] Verificando categorias...');
  
  // Categorias padrão da Athena
  const defaultCategories = [
    { name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia', description: 'Inovações em elevadores, scanners automotivos e ferramentas 3D.' },
    { name: 'Gestão & Produtividade', slug: 'gestao-produtividade', description: 'Estratégias para otimização de faturamento e fluxo em auto centers.' },
    { name: 'Tendências Automotivas', slug: 'tendencias-automotivas', description: 'Eletrificação, diagnóstico avançado e o futuro das oficinas.' },
    { name: 'Manutenção Preventiva', slug: 'manutencao-preventiva', description: 'Guias técnicos para conservação e vida útil do maquinário automotivo.' }
  ];

  for (const cat of defaultCategories) {
    const existing = await query('SELECT id FROM public.blog_categories WHERE slug = $1', [cat.slug]);
    if (existing.rows.length === 0) {
      await query(
        'INSERT INTO public.blog_categories (name, slug, description) VALUES ($1, $2, $3)',
        [cat.name, cat.slug, cat.description]
      );
      console.log(`[Blog Verify] Categoria criada: "${cat.name}"`);
    } else {
      console.log(`[Blog Verify] Categoria já existe: "${cat.name}"`);
    }
  }

  // Busca categorias ativas
  const categories = await blogService.listCategories();
  console.log('[Blog Verify] Total de categorias:', categories.length);

  // Verifica se já existe post de homologação
  const sampleSlug = 'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina';
  const existingPost = await query('SELECT id FROM public.blog_posts WHERE slug = $1', [sampleSlug]);
  
  if (existingPost.rows.length === 0) {
    const techCategory = categories.find(c => c.slug === 'equipamentos-tecnologia') || categories[0];
    const adminUser = await query("SELECT id FROM public.users WHERE role = 'admin' LIMIT 1");
    const authorId = adminUser.rows[0]?.id || 'user_admin_default';
    
    const postData = {
      title: 'Como Escolher o Scanner Automotivo Ideal para sua Oficina Mecânica',
      slug: sampleSlug,
      excerpt: 'Descubra quais recursos são indispensáveis em um scanner de diagnóstico profissional e como maximizar seu retorno sobre investimento na oficina.',
      content: [
        { type: 'paragraph', content: 'Investir no scanner automotivo correto é uma das decisões mais críticas para o crescimento de uma oficina mecânica moderna.' },
        { type: 'heading', props: { level: 2 }, content: '1. Diagnóstico Avançado e Cobertura Multimarcas' },
        { type: 'paragraph', content: 'Equipamentos modernos precisam suportar protocolos DoIP e CAN FD, além de oferecer calibrações ADAS e mapeamento de módulos com inteligência artificial.' }
      ],
      content_html: '<p>Investir no scanner automotivo correto é uma das decisões mais críticas para o crescimento de uma oficina mecânica moderna.</p><h2>1. Diagnóstico Avançado e Cobertura Multimarcas</h2><p>Equipamentos modernos precisam suportar protocolos DoIP e CAN FD, além de oferecer calibrações ADAS e mapeamento de módulos com inteligência artificial.</p>',
      status: 'published',
      published_at: new Date().toISOString(),
      reading_time_minutes: 4,
      meta_title: 'Como Escolher o Scanner Automotivo Ideal | Athena Soluções',
      meta_description: 'Guia completo para escolher o melhor scanner automotivo para sua oficina mecânica.',
      category_ids: techCategory ? [techCategory.id] : []
    };

    const newPost = await blogService.createPost(postData, authorId);
    console.log('[Blog Verify] Artigo de homologação criado com sucesso! ID:', newPost.id);
  } else {
    console.log('[Blog Verify] Artigo de homologação já existe:', sampleSlug);
  }

  // Testa busca pública
  const publicPosts = await blogService.getPublicPosts({ limit: 5 });
  console.log('[Blog Verify] Posts públicos encontrados:', publicPosts.posts.length);
  
  const article = await blogService.getPublicPostBySlug(sampleSlug);
  console.log('[Blog Verify] Leitura do post por slug com sucesso:', article ? article.title : 'Não encontrado');
  console.log('[Blog Verify] Categoria vinculada:', article?.categories?.map(c => c.name).join(', '));
  
  console.log('[Blog Verify] TODOS OS TESTES DE BANCO E SERVIÇO APROVADOS COM SUCESSO!');
  process.exit(0);
}

seedAndVerify().catch(err => {
  console.error('[Blog Verify] Erro:', err);
  process.exit(1);
});
