export const INITIAL_CATEGORIES = [
  {
    id: "cat_elevadores",
    name: "Elevadores",
    slug: "elevadores",
    order: 1,
    description: "Elevadores hidráulicos de 2 colunas, 4 colunas e tesoura para automóveis e utilitários.",
    icon: "Layers"
  },
  {
    id: "cat_scanners",
    name: "Scanners",
    slug: "scanners",
    order: 2,
    description: "Scanners e leitores de diagnóstico automotivo multimarca de última geração com IA.",
    icon: "Cpu"
  },
  {
    id: "cat_alinhadores",
    name: "Alinhadores",
    slug: "alinhadores",
    order: 3,
    description: "Sistemas de alinhamento de direção 3D computadorizados com câmeras de alta precisão.",
    icon: "Target"
  },
  {
    id: "cat_desmontadoras",
    name: "Desmontadoras & Balanceadoras",
    slug: "desmontadoras",
    order: 4,
    description: "Equipamentos para serviços de borracharia, desmontadoras pneumáticas e balanceadoras de rodas.",
    icon: "Disc"
  },
  {
    id: "cat_ferramentas",
    name: "Ferramentas Especiais",
    slug: "ferramentas",
    order: 5,
    description: "Kits de sincronismo, saca-filtros, prensas hidráulicas e ferramentas para centro automotivo.",
    icon: "Wrench"
  }
];

export const INITIAL_BRANDS = [
  {
    id: "brand_engecass",
    name: "Engecass",
    slug: "engecass",
    order: 1,
    description: "Líder nacional em elevadores automotivos de alta resistência.",
    logo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "brand_launch",
    name: "Launch",
    slug: "launch",
    order: 2,
    description: "Tecnologia global em scanners de diagnóstico e codificação de módulos.",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "brand_raven",
    name: "Raven",
    slug: "raven",
    order: 3,
    description: "Referência em ferramentas especiais e diagnóstico para oficinas.",
    logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "brand_napro",
    name: "Napro",
    slug: "napro",
    order: 4,
    description: "Pioneira em sistemas informatizados de diagnóstico automotivo.",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "brand_sun",
    name: "Sun Equipment",
    slug: "sun-equipment",
    order: 5,
    description: "Sistemas de alinhamento 3D e diagnóstico premium.",
    logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod_1",
    slug: "elevador-automotivo-2-colunas-4000kg-engecass",
    name: "Elevador Automotivo 2 Colunas 4.000kg Trifásico - Engecass",
    categoryId: "cat_elevadores",
    brandId: "brand_engecass",
    price: 18900.00,
    priceNegotiable: true,
    badge: "Disponível",
    status: "published",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
    altText: "Elevador Automotivo 2 Colunas 4 toneladas Engecass Trifásico",
    description: "Elevador eletro-hidráulico de 2 colunas com capacidade de carga para 4 toneladas. Ideal para carros de passeio, SUVs e caminhonetes leves. Trava mecânica de segurança automática e sistema de subida rápida.",
    specs: [
      "Capacidade: 4.000 kg",
      "Altura Máxima de Elevação: 1.900 mm",
      "Tempo de Elevação: ~45 segundos",
      "Motor: 3.0 HP Trifásico (220V/380V)",
      "Trava de Segurança: Automática dupla"
    ],
    attachments: [
      {
        id: "att_1",
        fileName: "Ficha_Tecnica_Elevador_Engecass.pdf",
        url: "data:application/pdf;base64,JVBERi0xLjQKJQ==",
        fileSize: "1.4 MB"
      },
      {
        id: "att_2",
        fileName: "Manual_de_Instrucoes_Elevação.pdf",
        url: "data:application/pdf;base64,JVBERi0xLjQKJQ==",
        fileSize: "2.8 MB"
      }
    ],
    inStock: true
  },
  {
    id: "prod_2",
    slug: "scanner-automotivo-multimarca-x431-pad-vii-launch",
    name: "Scanner Automotivo Multimarca X-431 PAD VII - Launch",
    categoryId: "cat_scanners",
    brandId: "brand_launch",
    price: 24500.00,
    priceNegotiable: true,
    badge: "Disponível",
    status: "published",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    altText: "Scanner Automotivo Multimarca Launch X-431 PAD VII com suporte CAN-FD",
    description: "Scanner de nível fabril com suporte a protocolos DoIP e CAN-FD. Diagnóstico completo de todos os sistemas eletrônicos, codificação online de módulos, programação de chaves e suporte a calibração ADAS.",
    specs: [
      "Tela: 13.3 polegadas IPS Full HD",
      "Processador: 8-Core 2.0GHz + 8GB RAM",
      "Conectividade: Wi-Fi 5GHz + Bluetooth Smart",
      "Suporte: Leves, Pesados e Híbridos/Elétricos"
    ],
    attachments: [
      {
        id: "att_3",
        fileName: "Ficha_Tecnica_Launch_PAD_VII.pdf",
        url: "data:application/pdf;base64,JVBERi0xLjQKJQ==",
        fileSize: "3.1 MB"
      }
    ],
    inStock: true
  },
  {
    id: "prod_3",
    slug: "alinhador-3d-de-direcao-computadorizado-sun",
    name: "Alinhador 3D de Direção Computadorizado com Torre Móvel - Sun",
    categoryId: "cat_alinhadores",
    brandId: "brand_sun",
    price: 45900.00,
    priceNegotiable: true,
    badge: "Disponível",
    status: "published",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80",
    altText: "Alinhador 3D de Direção Computadorizado Sun Equipment com Câmeras HD",
    description: "Alinhador 3D de alta precisão com 2 câmeras digitais de alta resolução e garras de fixação rápida (11\" a 25\"). Software com banco de dados atualizado de veículos nacionais e importados.",
    specs: [
      "Câmeras: 2x Câmeras HD de Alta Velocidade",
      "Garras: Fixação no pneu (não risca as rodas)",
      "Banco de Dados: Mais de 50.000 veículos"
    ],
    attachments: [],
    inStock: true
  },
  {
    id: "prod_4",
    slug: "desmontadora-de-pneus-automatica-engecass",
    name: "Desmontadora de Pneus Automática com Braço Auxiliar - Engecass",
    categoryId: "cat_desmontadoras",
    brandId: "brand_engecass",
    price: 14200.00,
    priceNegotiable: true,
    badge: "Disponível",
    status: "published",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80",
    altText: "Desmontadora de Pneus Pneumática Automática Engecass",
    description: "Desmontadora pneumática para aros de 10\" a 24\". Possui braço auxiliar articulado para montagem e desmontagem de pneus perfil baixo e Run Flat com total facilidade e segurança.",
    specs: [
      "Fixação Externa: 10\" a 22\"",
      "Fixação Interna: 12\" a 24\"",
      "Pressão de Trabalho: 8 a 10 bar",
      "Braço Auxiliar: Robótico Pneumático"
    ],
    attachments: [],
    inStock: true
  },
  {
    id: "prod_5",
    slug: "scanner-diagnostico-napro-pc-scan3000",
    name: "Scanner de Diagnóstico Avançado Napro PC SCAN3000",
    categoryId: "cat_scanners",
    brandId: "brand_napro",
    price: 12800.00,
    priceNegotiable: true,
    badge: "Disponível",
    status: "published",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
    altText: "Scanner Napro PC SCAN3000 Bluetooth para oficinas mecânicas",
    description: "O mais completo scanner para a frota brasileira de veículos leves e utilitários. Interface Bluetooth robusta e software intuitivo em português para notebook ou PC.",
    specs: [
      "Conexão sem fio Bluetooth de longo alcance",
      "Leitura de parâmetros em tempo real com gráfico",
      "Suporte técnico direto do fabricante nacional"
    ],
    attachments: [],
    inStock: true
  }
];
