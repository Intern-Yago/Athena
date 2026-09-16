/**
 * Athena Soluções Automotivas — Especificação OpenAPI 3.1 & Swagger
 * Documentação centralizada e canônica de todos os microsserviços,
 * rotas REST, gateway Hermes Agent AI e integrações.
 */

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Athena Soluções Automotivas — API RESTful & Hermes Gateway',
    version: '2.1.0',
    description: `
API RESTful oficial e Gateway de Inteligência da **Athena Soluções Automotivas**.

### 🌟 Visão Geral dos Módulos
1. **Catálogo & E-commerce**: Equipamentos, Categorias, Fabricantes (Marcas), Banners e ordenação customizada via UNNEST batch.
2. **Hermes Agent Gateway (\`/api/hermes/*\`)**: Conector especializado para o Agente Autônomo Hermes (AI) e ferramentas Gemini, permitindo busca híbrida de produtos com fallback Omie ERP, consulta de clientes, crédito/débito de pontos e insights de fidelização.
3. **Fidelidade & Recompensas (A-Points)**: Sistema de pontuação comercial, resgate de brindes/descontos e extrato de transações.
4. **Integração Omie ERP**: Sincronização e conciliação de catálogo físico/fiscal com e-commerce, webhooks e vínculo de produtos.
5. **Checkout, Pedidos & Pagamentos (Asaas)**: Criação de pedidos, emissão de cobranças PIX, Boleto e Cartão com webhooks de confirmação.
6. **Mídia de Alta Performance (Cloudflare R2)**: Upload com transcodificação instantânea para WebP via Sharp e exclusão física de objetos no bucket S3/R2.
7. **Autenticação, Clientes & Staff**: JWT Bearer Tokens, RBAC (admin, vendedor, user), recuperação de senhas temporárias e histórico de auditoria.

### 🔐 Modelos de Autenticação
- **JWT Bearer Token**: Cabeçalho \`Authorization: Bearer <token>\` obtido em \`POST /api/auth/login\`.
- **Hermes Secret Key**: Cabeçalho \`x-hermes-key: <HERMES_SECRET_KEY>\` ou query parameter \`?key=<CHAVE>\` para endpoints do Hermes.
- **Swagger UI**: Protegido por HTTP Basic Auth (\`admin\` / senha configurada em ambiente).
    `,
    contact: {
      name: 'Suporte Técnico Athena Soluções Automotivas',
      email: 'athena.consultoria.automotiva@gmail.com',
      url: 'https://www.athenaconsultoria.com.br'
    }
  },
  servers: [
    { url: 'https://athena-backend-hu1m.onrender.com', description: 'Servidor de Produção (Render)' },
    { url: 'https://www.athenaconsultoria.com.br', description: 'Domínio Principal (Proxy Reverso)' },
    { url: 'http://localhost:3001', description: 'Servidor Local (Desenvolvimento)' }
  ],
  tags: [
    { name: 'Equipamentos (Produtos)', description: 'Catálogo de máquinas, elevadores, scanners e ferramentas.' },
    { name: 'Categorias', description: 'Classificação mercadológica e estrutural dos equipamentos.' },
    { name: 'Marcas Parceiras', description: 'Fabricantes parceiros homologados (Mahovi, Stärkx, Delta, etc).' },
    { name: 'Banners Promocionais', description: 'Gestão visual da vitrine e destaques da home.' },
    { name: 'Hermes Agent Gateway', description: 'Conexão e Tool Calling para o Agente Autônomo Hermes (AI).' },
    { name: 'Fidelidade & Recompensas (A-Points)', description: 'Programa de acúmulo de pontos, resgates e auditoria.' },
    { name: 'Omie ERP Sincronização', description: 'Integração fiscal, status de sincronização e reconciliação.' },
    { name: 'Checkout & Pagamentos (Asaas)', description: 'Emissão de cobranças PIX/Cartão e fluxo de pedidos.' },
    { name: 'Cupons de Desconto', description: 'Validação e campanhas de cupons promocionais.' },
    { name: 'Autenticação & Clientes', description: 'Login, cadastro, validação de e-mail e perfil do cliente.' },
    { name: 'Administração de Usuários', description: 'Gestão da equipe de vendas, senhas temporárias e logs.' },
    { name: 'Mídia & Cloudflare R2', description: 'Upload WebP de alta velocidade e gerenciamento de arquivos.' },
    { name: 'Monitoramento & Sistema', description: 'Healthchecks, pre-warming e especificação OpenAPI.' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT retornado no login. Exemplo: Bearer eyJhbGciOi...'
      },
      HermesAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-hermes-key',
        description: 'Chave secreta de autenticação do Agente Hermes configurada em HERMES_SECRET_KEY'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'dt-esc01' },
          name: { type: 'string', example: 'Kit Escareador para Assento de Injetores Diesel - Delta DT-ESC01' },
          slug: { type: 'string', example: 'kit-escareador-para-assento-de-injetores-diesel-delta-dt-esc01' },
          categoryId: { type: 'string', example: 'acessorios' },
          categoryName: { type: 'string', example: 'Acessórios diversos' },
          categorySlug: { type: 'string', example: 'acessorios-diversos' },
          brandId: { type: 'string', example: 'delta' },
          brandName: { type: 'string', example: 'Delta Ferramentas' },
          brandSlug: { type: 'string', example: 'delta-ferramentas' },
          price: { type: 'number', format: 'float', example: 450.0 },
          priceNegotiable: { type: 'boolean', example: false },
          badge: { type: 'string', example: 'Pronta Entrega' },
          tags: { type: 'array', items: { type: 'string' }, example: ['diesel', 'injetores', 'oficina'] },
          compatibleProductIds: { type: 'array', items: { type: 'string' }, example: ['scanner-launch-x431'] },
          recommendedProductIds: { type: 'array', items: { type: 'string' }, example: [] },
          status: { type: 'string', enum: ['published', 'draft', 'rascunho'], example: 'published' },
          isFeatured: { type: 'boolean', example: true },
          image: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/dt-esc01.webp' },
          images: { type: 'array', items: { type: 'string' }, example: [] },
          altText: { type: 'string', example: 'Kit de escareador para bicos injetores diesel Delta' },
          description: { type: 'string', example: 'Ferramenta especializada para limpeza e retificação da sede dos injetores.' },
          specs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', example: 'Peças' },
                value: { type: 'string', example: '17 peças em estojo' }
              }
            }
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', example: 'Manual Técnico PDF' },
                url: { type: 'string', example: 'https://.../manual.pdf' }
              }
            }
          },
          inStock: { type: 'boolean', example: true },
          videoUrl: { type: 'string', example: 'https://www.youtube.com/watch?v=...' },
          customTabs: { type: 'array', items: { type: 'object' } },
          productType: { type: 'string', example: 'machine' },
          aPoints: { type: 'integer', example: 45 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'categoryId', 'brandId'],
        properties: {
          id: { type: 'string', example: 'dt-esc01' },
          name: { type: 'string', example: 'Kit Escareador para Assento de Injetores Diesel Delta' },
          slug: { type: 'string', example: 'kit-escareador-delta-dt-esc01' },
          categoryId: { type: 'string', example: 'acessorios' },
          brandId: { type: 'string', example: 'delta' },
          price: { type: 'number', example: 450.0 },
          priceNegotiable: { type: 'boolean', example: false },
          badge: { type: 'string', example: 'Mais Vendido' },
          tags: { type: 'array', items: { type: 'string' } },
          compatibleProductIds: { type: 'array', items: { type: 'string' } },
          recommendedProductIds: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['published', 'draft', 'rascunho'], default: 'published' },
          isFeatured: { type: 'boolean', default: false },
          image: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          altText: { type: 'string' },
          description: { type: 'string' },
          specs: { type: 'array', items: { type: 'object' } },
          attachments: { type: 'array', items: { type: 'object' } },
          inStock: { type: 'boolean', default: true },
          videoUrl: { type: 'string' },
          customTabs: { type: 'array', items: { type: 'object' } },
          productType: { type: 'string', default: 'machine' },
          aPoints: { type: 'integer', default: 0 }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'elevadores' },
          name: { type: 'string', example: 'Elevadores Automotivos' },
          slug: { type: 'string', example: 'elevadores-automotivos' },
          description: { type: 'string', example: 'Elevadores pantográficos, 2 colunas e 4 colunas.' },
          icon: { type: 'string', example: 'Layers' },
          order: { type: 'integer', example: 1 }
        }
      },
      Brand: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'mahovi' },
          name: { type: 'string', example: 'Mahovi' },
          slug: { type: 'string', example: 'mahovi' },
          description: { type: 'string', example: 'Líder nacional em elevadores e rampas automotivas.' },
          logo: { type: 'string', example: 'https://.../mahovi-logo.webp' },
          websiteUrl: { type: 'string', example: 'https://www.mahovi.com.br' },
          order: { type: 'integer', example: 1 }
        }
      },
      Banner: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'banner_1' },
          title: { type: 'string', example: 'Condição Especial de Elevadores Mahovi' },
          subtitle: { type: 'string', example: 'Financiamento em até 36x' },
          imageUrl: { type: 'string', example: 'https://.../banner1.webp' },
          linkUrl: { type: 'string', example: '/marca/mahovi' },
          order: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', example: true }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_98124' },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', example: 'joao.oficina@gmail.com' },
          document: { type: 'string', example: '12.345.678/0001-90' },
          phone: { type: 'string', example: '(61) 98888-7777' },
          companyName: { type: 'string', example: 'Auto Center Silva' },
          role: { type: 'string', enum: ['admin', 'vendedor', 'cliente'], example: 'cliente' },
          aPoints: { type: 'integer', example: 350 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      HermesCustomer: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_98124' },
          name: { type: 'string', example: 'Auto Mecânica Express' },
          email: { type: 'string', example: 'contato@express.com.br' },
          phone: { type: 'string', example: '61999998888' },
          document: { type: 'string', example: '05123456000189' },
          aPoints: { type: 'integer', example: 420 },
          ordersCount: { type: 'integer', example: 3 },
          totalSpent: { type: 'number', example: 18500.0 }
        }
      },
      LoyaltyReward: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rew_desconto_200' },
          name: { type: 'string', example: 'Cupom de R$ 200 em Ferramentas' },
          description: { type: 'string', example: 'Desconto imediato em qualquer compra acima de R$ 1.000' },
          pointsCost: { type: 'integer', example: 200 },
          cashCost: { type: 'number', example: 0.0 },
          imageUrl: { type: 'string', example: 'https://.../voucher.webp' },
          isActive: { type: 'boolean', example: true }
        }
      },
      UploadResponse: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-x10.webp' },
          publicId: { type: 'string', example: 'produtos/scanner-x10-3f9a.webp' },
          format: { type: 'string', example: 'webp' },
          bytes: { type: 'integer', example: 125430 },
          provider: { type: 'string', example: 'cloudflare-r2' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem explicativa do erro ocorrido.' }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 154 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 24 },
          totalPages: { type: 'integer', example: 7 }
        }
      }
    }
  },
  paths: {
    // -----------------------------------------------------------
    // MONITORAMENTO & SISTEMA
    // -----------------------------------------------------------
    '/api/ping': {
      get: {
        tags: ['Monitoramento & Sistema'],
        summary: 'Pre-warming ultra-rápido do container',
        description: 'Endpoint leve sem toque no banco de dados para evitar hibernação (Render) e medir latência de rede.',
        responses: {
          200: {
            description: 'Container ativo',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'pong' }, timestamp: { type: 'integer' } } } } }
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Monitoramento & Sistema'],
        summary: 'Healthcheck completo com status do PostgreSQL',
        description: 'Verifica conectividade do banco de dados relacional e integridade dos serviços.',
        responses: {
          200: {
            description: 'Serviço operacional',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, database: { type: 'string', example: 'connected' } } } } }
          }
        }
      }
    },
    '/api/openapi.json': {
      get: {
        tags: ['Monitoramento & Sistema'],
        summary: 'Download da especificação OpenAPI 3.1 em JSON',
        description: 'Endpoint público para o Hermes Agent, AGY e ferramentas de Tool Calling baixarem o contrato completo da API.',
        responses: {
          200: {
            description: 'Especificação OpenAPI JSON',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },

    // -----------------------------------------------------------
    // EQUIPAMENTOS (PRODUTOS)
    // -----------------------------------------------------------
    '/api/products': {
      get: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Listar equipamentos do catálogo com filtros e paginação híbrida',
        description: 'Retorna a lista de produtos cadastrados. Suporta paginação opcional (?page=1&limit=24) e filtros avançados.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 24, maximum: 100 }, description: 'Itens por página' },
          { name: 'categoryId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por ID da categoria' },
          { name: 'brandId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por ID da marca' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['published', 'draft', 'rascunho'] }, description: 'Filtrar por status' },
          { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Apenas produtos em destaque' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Termo de busca textual' }
        ],
        responses: {
          200: {
            description: 'Produtos retornados com sucesso.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                        pagination: { $ref: '#/components/schemas/PaginationMeta' }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Cadastrar ou sincronizar um equipamento',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
        },
        responses: {
          201: { description: 'Equipamento salvo.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          401: { description: 'Não autorizado.' }
        }
      }
    },
    '/api/products/{identifier}': {
      get: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Buscar equipamento unitário por ID ou Slug',
        description: 'Retorna detalhes completos de um produto através do seu ID único ou Slug de URL amigável.',
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'ID ou Slug do produto (ex: dt-esc01 ou kit-escareador-delta)' }
        ],
        responses: {
          200: { description: 'Equipamento encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          404: { description: 'Equipamento não encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } }
        }
      }
    },
    '/api/products/{id}': {
      put: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Atualizar equipamento existente por ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
        },
        responses: {
          200: { description: 'Equipamento atualizado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          404: { description: 'Equipamento não encontrado.' }
        }
      },
      delete: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Excluir equipamento do catálogo',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Equipamento removido com sucesso.' }
        }
      }
    },
    '/api/products/reorder': {
      put: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Reordenar catálogo em lote (UNNEST batch)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' } } } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Ordem gravada com sucesso.' }
        }
      }
    },

    // -----------------------------------------------------------
    // CATEGORIAS
    // -----------------------------------------------------------
    '/api/categories': {
      get: {
        tags: ['Categorias'],
        summary: 'Listar todas as categorias em ordem comercial',
        responses: {
          200: { description: 'Lista de categorias.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } }
        }
      },
      post: {
        tags: ['Categorias'],
        summary: 'Criar ou atualizar categoria',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
        responses: { 201: { description: 'Categoria criada.' } }
      }
    },
    '/api/categories/{identifier}': {
      get: {
        tags: ['Categorias'],
        summary: 'Buscar categoria unitária por ID ou Slug',
        parameters: [{ name: 'identifier', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Categoria encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          404: { description: 'Categoria não encontrada.' }
        }
      }
    },
    '/api/categories/{id}': {
      put: {
        tags: ['Categorias'],
        summary: 'Editar categoria por ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
        responses: { 200: { description: 'Categoria atualizada.' } }
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Excluir categoria',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Categoria excluída.' } }
      }
    },
    '/api/categories/reorder': {
      put: {
        tags: ['Categorias'],
        summary: 'Reordenar categorias em lote',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { categories: { type: 'array', items: { type: 'object' } } } } } }
        },
        responses: { 200: { description: 'Categorias reordenadas.' } }
      }
    },

    // -----------------------------------------------------------
    // MARCAS PARCEIRAS
    // -----------------------------------------------------------
    '/api/brands': {
      get: {
        tags: ['Marcas Parceiras'],
        summary: 'Listar todos os fabricantes parceiros',
        responses: {
          200: { description: 'Lista de marcas parceiras.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Brand' } } } } }
        }
      },
      post: {
        tags: ['Marcas Parceiras'],
        summary: 'Cadastrar nova marca parceira',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Brand' } } } },
        responses: { 201: { description: 'Marca cadastrada.' } }
      }
    },
    '/api/brands/{identifier}': {
      get: {
        tags: ['Marcas Parceiras'],
        summary: 'Buscar marca parceira por ID ou Slug',
        parameters: [{ name: 'identifier', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Marca encontrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Brand' } } } },
          404: { description: 'Marca não encontrada.' }
        }
      }
    },
    '/api/brands/{id}': {
      put: {
        tags: ['Marcas Parceiras'],
        summary: 'Editar marca parceira',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Brand' } } } },
        responses: { 200: { description: 'Marca atualizada.' } }
      },
      delete: {
        tags: ['Marcas Parceiras'],
        summary: 'Remover marca parceira',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marca excluída.' } }
      }
    },
    '/api/brands/reorder': {
      put: {
        tags: ['Marcas Parceiras'],
        summary: 'Reordenar marcas parceiras em lote',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { brands: { type: 'array', items: { type: 'object' } } } } } }
        },
        responses: { 200: { description: 'Marcas reordenadas.' } }
      }
    },

    // -----------------------------------------------------------
    // HERMES AGENT GATEWAY
    // -----------------------------------------------------------
    '/api/hermes/status': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Healthcheck e métricas rápidas do Hermes',
        security: [{ HermesAuth: [] }],
        responses: {
          200: {
            description: 'Status operacional do conector Hermes.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'online' },
                    service: { type: 'string', example: 'Athena Hermes Intelligence Bridge' },
                    version: { type: 'string', example: '2.0.0' },
                    stats: {
                      type: 'object',
                      properties: {
                        totalClients: { type: 'integer' },
                        totalRewards: { type: 'integer' },
                        totalProducts: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/hermes/products': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Busca inteligente de produtos para o Hermes (Cache-Aside + Omie Fallback)',
        description: 'Pesquisa no PostgreSQL local e, caso não encontre ou com forceOmie=true, consulta o ERP Omie.',
        security: [{ HermesAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Termo de busca textual' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Limite de itens' },
          { name: 'forceOmie', in: 'query', schema: { type: 'boolean', default: false }, description: 'Forçar busca no Omie' }
        ],
        responses: {
          200: { description: 'Resultados da busca formatados para agentes de IA.' }
        }
      },
      post: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Busca de produtos compatível com Gemini Tool Calling',
        description: 'Recebe os argumentos em formato JSON body, permitindo chamadas diretas de Function Calling do LLM.',
        security: [{ HermesAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  search: { type: 'string', example: 'scanner launch' },
                  limit: { type: 'integer', default: 20 },
                  forceOmie: { type: 'boolean', default: false }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Produtos encontrados.' }
        }
      }
    },
    '/api/hermes/customers': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Listar clientes com saldo de fidelidade para o Hermes',
        security: [{ HermesAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filtrar por nome, documento ou telefone' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 30 } }
        ],
        responses: {
          200: {
            description: 'Lista de clientes.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/HermesCustomer' } } } }
          }
        }
      }
    },
    '/api/hermes/customers/{identifier}': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Consultar ficha de cliente por ID, CPF/CNPJ, e-mail ou telefone',
        security: [{ HermesAuth: [] }],
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'ID, documento, email ou telefone' }
        ],
        responses: {
          200: { description: 'Dados cadastrais e histórico de fidelidade do cliente.' },
          404: { description: 'Cliente não localizado.' }
        }
      }
    },
    '/api/hermes/customers/{identifier}/credit': {
      post: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Creditar pontos no saldo de um cliente via Hermes',
        security: [{ HermesAuth: [] }],
        parameters: [{ name: 'identifier', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'integer', example: 50 },
                  reason: { type: 'string', example: 'Bonificação compra elevador pantográfico' },
                  orderId: { type: 'string', example: 'ped_12940' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pontos creditados com sucesso.' }
        }
      }
    },
    '/api/hermes/customers/{identifier}/debit': {
      post: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Debitar pontos do saldo de um cliente via Hermes',
        security: [{ HermesAuth: [] }],
        parameters: [{ name: 'identifier', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'integer', example: 100 },
                  reason: { type: 'string', example: 'Resgate de brinde oficial' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pontos debitados com sucesso.' },
          400: { description: 'Saldo insuficiente.' }
        }
      }
    },
    '/api/hermes/rewards': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Consultar catálogo de recompensas disponíveis',
        security: [{ HermesAuth: [] }],
        responses: {
          200: {
            description: 'Lista de recompensas ativas.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LoyaltyReward' } } } }
          }
        }
      }
    },
    '/api/hermes/loyalty/insights': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Oportunidades de retenção e clientes próximos de recompensas',
        description: 'Retorna listas segmentadas para prospecção ativa: clientes inativos com pontos, clientes perto da próxima meta e clientes VIP.',
        security: [{ HermesAuth: [] }],
        responses: {
          200: { description: 'Relatório de insights acionáveis para vendas.' }
        }
      }
    },
    '/api/hermes/tool-declaration': {
      get: {
        tags: ['Hermes Agent Gateway'],
        summary: 'Declaração formal de Tools do Gemini para agentes autônomos',
        security: [{ HermesAuth: [] }],
        responses: {
          200: { description: 'Schema de Function Calling do Gemini pronto para injeção em prompts.' }
        }
      }
    },

    // -----------------------------------------------------------
    // FIDELIDADE & RECOMPENSAS (A-POINTS)
    // -----------------------------------------------------------
    '/api/points/me': {
      get: {
        tags: ['Fidelidade & Recompensas (A-Points)'],
        summary: 'Consultar saldo e histórico de pontos do usuário autenticado',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Extrato de pontos retornado.' }
        }
      }
    },
    '/api/rewards': {
      get: {
        tags: ['Fidelidade & Recompensas (A-Points)'],
        summary: 'Listar recompensas ativas no catálogo público',
        responses: {
          200: {
            description: 'Catálogo de prêmios.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LoyaltyReward' } } } }
          }
        }
      }
    },
    '/api/rewards/redeem': {
      post: {
        tags: ['Fidelidade & Recompensas (A-Points)'],
        summary: 'Resgatar recompensa com pontos',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rewardId'],
                properties: {
                  rewardId: { type: 'string', example: 'rew_desconto_200' },
                  deliveryMethod: { type: 'string', enum: ['pickup', 'shipping'], default: 'pickup' },
                  address: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Resgate aprovado com sucesso.' },
          400: { description: 'Pontos insuficientes.' }
        }
      }
    },
    '/api/admin/points/transactions': {
      get: {
        tags: ['Fidelidade & Recompensas (A-Points)'],
        summary: 'Auditoria geral de transações de pontos (Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Histórico de transações de fidelidade.' } }
      }
    },
    '/api/admin/points/adjust': {
      post: {
        tags: ['Fidelidade & Recompensas (A-Points)'],
        summary: 'Ajuste manual de pontos por administrador',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'points', 'type'],
                properties: {
                  userId: { type: 'string' },
                  points: { type: 'integer' },
                  type: { type: 'string', enum: ['credit', 'debit'] },
                  reason: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Saldo ajustado com sucesso.' } }
      }
    },

    // -----------------------------------------------------------
    // OMIE ERP SINCRONIZAÇÃO
    // -----------------------------------------------------------
    '/api/omie/status': {
      get: {
        tags: ['Omie ERP Sincronização'],
        summary: 'Verificar status da integração com a API do Omie',
        responses: {
          200: { description: 'Status retornado.' }
        }
      }
    },
    '/api/admin/omie/sync-status': {
      get: {
        tags: ['Omie ERP Sincronização'],
        summary: 'Métricas de produtos sincronizados vs pendentes',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Status da sincronização detalhado.' } }
      }
    },
    '/api/admin/omie/reconcile': {
      post: {
        tags: ['Omie ERP Sincronização'],
        summary: 'Executar reconciliação manual com o Omie ERP',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Reconciliação disparada.' } }
      }
    },
    '/api/admin/omie/link-product': {
      post: {
        tags: ['Omie ERP Sincronização'],
        summary: 'Vincular manualmente produto do site ao código Omie',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['siteProductId', 'omieProductCode'],
                properties: {
                  siteProductId: { type: 'string' },
                  omieProductCode: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Produto vinculado com sucesso.' } }
      }
    },

    // -----------------------------------------------------------
    // CHECKOUT & PAGAMENTOS (ASAAS)
    // -----------------------------------------------------------
    '/api/customer/orders': {
      get: {
        tags: ['Checkout & Pagamentos (Asaas)'],
        summary: 'Listar pedidos do cliente logado',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Histórico de pedidos.' } }
      },
      post: {
        tags: ['Checkout & Pagamentos (Asaas)'],
        summary: 'Criar novo pedido de compra no e-commerce',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer', 'items', 'paymentMethod'],
                properties: {
                  customer: { type: 'object' },
                  items: { type: 'array', items: { type: 'object' } },
                  paymentMethod: { type: 'string', enum: ['PIX', 'CREDIT_CARD', 'BOLETO'] },
                  couponCode: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Pedido registrado.' } }
      }
    },
    '/api/payments/charge': {
      post: {
        tags: ['Checkout & Pagamentos (Asaas)'],
        summary: 'Gerar cobrança no gateway Asaas (PIX / Cartão / Boleto)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'billingType', 'value'],
                properties: {
                  orderId: { type: 'string' },
                  billingType: { type: 'string', enum: ['PIX', 'CREDIT_CARD', 'BOLETO'] },
                  value: { type: 'number' },
                  creditCard: { type: 'object' },
                  creditCardHolderInfo: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Cobrança gerada com QR Code PIX ou confirmação de cartão.' }
        }
      }
    },
    '/api/payments/charge/{id}/status': {
      get: {
        tags: ['Checkout & Pagamentos (Asaas)'],
        summary: 'Consultar status em tempo real de uma cobrança',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Status atual do pagamento (PENDING, RECEIVED, CONFIRMED).' } }
      }
    },

    // -----------------------------------------------------------
    // CUPONS DE DESCONTO
    // -----------------------------------------------------------
    '/api/coupons': {
      get: {
        tags: ['Cupons de Desconto'],
        summary: 'Listar cupons ativos no sistema',
        responses: { 200: { description: 'Lista de cupons.' } }
      },
      post: {
        tags: ['Cupons de Desconto'],
        summary: 'Cadastrar novo cupom promocional',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'discountType', 'discountValue'],
                properties: {
                  code: { type: 'string', example: 'ATHENA10' },
                  discountType: { type: 'string', enum: ['percentage', 'fixed'] },
                  discountValue: { type: 'number', example: 10.0 },
                  minOrderValue: { type: 'number', example: 500.0 },
                  maxUses: { type: 'integer', example: 100 },
                  expiresAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Cupom cadastrado com sucesso.' } }
      }
    },
    '/api/coupons/validate': {
      post: {
        tags: ['Cupons de Desconto'],
        summary: 'Validar cupom e calcular desconto para carrinho',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'orderTotal'],
                properties: {
                  code: { type: 'string', example: 'ATHENA10' },
                  orderTotal: { type: 'number', example: 2500.0 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Cupom válido com valor de desconto calculado.' },
          400: { description: 'Cupom inválido ou expirado.' }
        }
      }
    },

    // -----------------------------------------------------------
    // AUTENTICAÇÃO & USUÁRIOS
    // -----------------------------------------------------------
    '/api/auth/login': {
      post: {
        tags: ['Autenticação & Clientes'],
        summary: 'Login com e-mail e senha (Rate limited)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@athenaconsultoria.com.br' },
                  password: { type: 'string', format: 'password', example: 'AthenaAdmin2026!' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login autorizado com JWT.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Credenciais inválidas.' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Autenticação & Clientes'],
        summary: 'Cadastro público de novo cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Oficina Central' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  phone: { type: 'string' },
                  document: { type: 'string' },
                  companyName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Cadastro realizado com sucesso.' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Autenticação & Clientes'],
        summary: 'Consultar dados do usuário autenticado atual',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Dados do usuário autenticado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }
        }
      }
    },
    '/api/customer/profile': {
      put: {
        tags: ['Autenticação & Clientes'],
        summary: 'Atualizar dados cadastrais do cliente logado',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Perfil atualizado.' } }
      }
    },
    '/api/users': {
      get: {
        tags: ['Administração de Usuários'],
        summary: 'Listar usuários com paginação híbrida e filtros (Staff)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Lista de usuários retornada.' } }
      },
      post: {
        tags: ['Administração de Usuários'],
        summary: 'Criar usuário administrativo ou vendedor (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 201: { description: 'Usuário cadastrado.' } }
      }
    },
    '/api/admin/users/{id}/generate-temp-password': {
      post: {
        tags: ['Administração de Usuários'],
        summary: 'Gerar senha temporária de emergência para usuário',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Senha temporária gerada.' } }
      }
    },

    // -----------------------------------------------------------
    // MÍDIA & CLOUDFLARE R2
    // -----------------------------------------------------------
    '/api/upload': {
      post: {
        tags: ['Mídia & Cloudflare R2'],
        summary: 'Upload de imagem com conversão automática WebP via Sharp',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  folder: { type: 'string', default: 'produtos' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Arquivo transcodificado e gravado no Cloudflare R2.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadResponse' } } }
          }
        }
      }
    },
    '/api/upload/library': {
      get: {
        tags: ['Mídia & Cloudflare R2'],
        summary: 'Listar biblioteca de arquivos gravados no Cloudflare R2',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Lista de arquivos disponíveis.' } }
      }
    },
    '/api/upload/delete': {
      post: {
        tags: ['Mídia & Cloudflare R2'],
        summary: 'Excluir fisicamente arquivo do bucket Cloudflare R2',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['publicId'],
                properties: {
                  publicId: { type: 'string', example: 'produtos/dt-esc01-7fa1.webp' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Arquivo excluído do R2.' } }
      }
    }
  }
};

module.exports = swaggerDocument;
