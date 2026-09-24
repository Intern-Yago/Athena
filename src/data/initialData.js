export const INITIAL_CATEGORIES = [
  {
    "id": "cat_elevadores",
    "name": "Elevadores",
    "slug": "elevadores",
    "order": 1,
    "description": "Elevadores hidráulicos de 2 colunas, 4 colunas, pantográficos tesoura e mesas para baterias EV.",
    "icon": "Layers"
  },
  {
    "id": "cat_scanners",
    "name": "Scanners & Diagnóstico",
    "slug": "scanners",
    "order": 2,
    "description": "Scanners multimarca, testadores de bateria com laudo, videoscópios e programadores TPMS.",
    "icon": "Cpu"
  },
  {
    "id": "cat_alinhadores",
    "name": "Alinhadores 3D",
    "slug": "alinhadores",
    "order": 3,
    "description": "Sistemas de alinhamento de direção 3D computadorizados com câmeras de alta precisão e torres móveis.",
    "icon": "Target"
  },
  {
    "id": "cat_desmontadoras",
    "name": "Desmontadoras & Balanceadoras",
    "slug": "desmontadoras",
    "order": 4,
    "description": "Desmontadoras automáticas com braço auxiliar Run-Flat, balanceadoras 3D e linha pesada Truck.",
    "icon": "Disc"
  },
  {
    "id": "cat_ferramentas",
    "name": "Ferramentas & Armários",
    "slug": "ferramentas",
    "order": 5,
    "description": "Armários modulares, bancadas de trabalho, chaves de impacto, trocadoras de fluido e ferramentas especiais.",
    "icon": "Wrench"
  }
];

export const INITIAL_BRANDS = [
  {
    "id": "brand_starkx",
    "name": "Stärkx",
    "slug": "starkx",
    "order": 1,
    "description": "Especialista em equipamentos eletrônicos, testadores de bateria, videoscópios, diagnóstico avançado e TPMS.",
    "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/starkx-5e830ec912b7.webp",
    "websiteUrl": "https://www.starkx.com.br"
  },
  {
    "id": "brand_mahovi",
    "name": "Mahovi",
    "slug": "mahovi",
    "order": 2,
    "description": "Líder em elevadores automotivos, alinhadores 3D, desmontadoras de pneus e equipamentos pesados de centro automotivo.",
    "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/mahovi-d2fca4c6358b.webp",
    "websiteUrl": "https://www.mahovi.com.br"
  },
  {
    "id": "brand_delta",
    "name": "Delta Ferramentas",
    "slug": "delta",
    "order": 3,
    "description": "Referência nacional em ferramentas especiais de injeção, elétrica, motor, arrefecimento e suspensão.",
    "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/delta-47d4582fff78.webp",
    "websiteUrl": "https://www.deltaferramentasautomotivas.com.br"
  },
  {
    "id": "brand_wolfcar",
    "name": "Wolfcar",
    "slug": "wolfcar",
    "order": 4,
    "description": "Soluções modulares para organização de oficinas, armários reforçados, bancadas industriais e painéis de ferramentas.",
    "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/wolfcar-63a7bd61556f.webp",
    "websiteUrl": "https://wolfcardiagnosticos.com.br"
  },
  {
    "id": "brand_sigmatools",
    "name": "Sigma Tools",
    "slug": "sigma-tools",
    "order": 5,
    "description": "Máquinas e ferramentas pneumáticas, chaves de impacto a bateria e equipamentos para estética e reparação.",
    "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/sigma-tools-7ceda13e30aa.webp",
    "websiteUrl": "https://www.sigmatools.com.br"
  }
];

export const INITIAL_PRODUCTS = [
  {
    "id": "prod_wolfcar_w1058",
    "name": "Conjunto Modular de Armários de Oficina 4915mm Wolfcar W1058",
    "slug": "conjunto-modular-de-armarios-de-oficina-4915mm-wolfcar-w1058",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Linha Pesada",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-de-armarios-d-f06d12d6aa71.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-de-armarios-d-8d18e32c7a91.webp"
    ],
    "altText": "Conjunto Modular de Armários de Oficina 4915mm Wolfcar W1058 Athena Soluções Automotivas",
    "description": "Conjunto modular completo para organização profissional de oficinas e concessionárias. Com 4915mm de comprimento, conta com armários verticais duplos, 5 módulos inferiores, 4 armários aéreos e painéis perfurados em chapa 0.8mm com pintura epóxi.",
    "specs": [
      "Comprimento Total: 4.915 mm",
      "Altura Total: 2.000 mm",
      "Espessura da Chapa: 0.8 mm reforçada",
      "Opções de Tampo: Aço Inoxidável ou Madeira Naval",
      "Módulos: 2 Armários verticais, 5 módulos inferiores, 4 aéreos e 4 painéis",
      "Pintura: Eletrostática a pó anticorrosiva"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1059",
    "name": "Conjunto Modular com Lixeira Embutida 4235mm Wolfcar W1059",
    "slug": "conjunto-modular-com-lixeira-embutida-4235mm-wolfcar-w1059",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mais Vendido",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-lixeira-e-fe20dc33864e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-lixeira-e-0f9378d85a0e.webp"
    ],
    "altText": "Conjunto Modular com Lixeira Embutida 4235mm Wolfcar W1059 Athena Soluções Automotivas",
    "description": "Conjunto modular para centros automotivos com 4235mm de extensão. Inclui módulo inferior com lixeira basculante integrada para descarte limpo, gavetas telescópicas e armários aéreos com pistões a gás.",
    "specs": [
      "Comprimento Total: 4.235 mm",
      "Altura Total: 2.000 mm",
      "Espessura da Chapa: 0.8 mm",
      "Módulo de Lixeira: Basculante integrado",
      "Gavetas: Trilhos telescópicos com travas de segurança",
      "Tampo: Aço Inoxidável 304 ou Madeira Tratada"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1081",
    "name": "Conjunto Modular com 3 Painéis de Ferramentas 2955mm Wolfcar W1081",
    "slug": "conjunto-modular-com-3-paineis-de-ferramentas-2955mm-wolfcar-w1081",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Alta Produtividade",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-3-paineis-f1193f7d42cf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-3-paineis-e0794d7cf32e.webp"
    ],
    "altText": "Conjunto Modular com 3 Painéis de Ferramentas 2955mm Wolfcar W1081 Athena Soluções Automotivas",
    "description": "Conjunto modular versátil de 2955mm de largura, equipado com 3 painéis de ferramentas perfurados, 3 armários aéreos e armário vertical lateral para ferramentas pesadas.",
    "specs": [
      "Comprimento Total: 2.955 mm",
      "Altura Total: 2.000 mm",
      "Painéis Perfurados: 3 módulos para ganchos e suportes",
      "Armários Aéreos: 3 módulos superiores com amortecedores",
      "Espessura da Chapa: 0.8 mm industrial"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1082",
    "name": "Conjunto Modular com Carrinho Móvel de 5 Gavetas 2640mm Wolfcar W1082",
    "slug": "conjunto-modular-com-carrinho-movel-de-5-gavetas-2640mm-wolfcar-w1082",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Praticidade",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-carrinho--3c43b543160a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/conjunto-modular-com-carrinho--a0cd7729723c.webp"
    ],
    "altText": "Conjunto Modular com Carrinho Móvel de 5 Gavetas 2640mm Wolfcar W1082 Athena Soluções Automotivas",
    "description": "Conjunto modular de 2640mm com carrinho móvel embutido de 5 gavetas com rodízios reforçados e trava, permitindo levar ferramentas diretamente ao elevador no box.",
    "specs": [
      "Comprimento Total: 2.640 mm",
      "Altura Total: 2.000 mm",
      "Carrinho Móvel: Embutido sob bancada com 5 gavetas e rodízios",
      "Estrutura: Aço carbono 0.8mm de alta resistência",
      "Tampo: Madeira Naval ou Aço Inoxidável"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1068",
    "name": "Armário Modular de Canto 90 Graus com Painel Wolfcar W1068",
    "slug": "armario-modular-de-canto-90-graus-com-painel-wolfcar-w1068",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Aproveitamento",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-modular-de-canto-90-gr-03b070b1b96d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-modular-de-canto-90-gr-629bbb689ead.webp"
    ],
    "altText": "Armário Modular de Canto 90 Graus com Painel Wolfcar W1068 Athena Soluções Automotivas",
    "description": "Módulo de canto para união em 'L' de bancadas modulares Wolfcar. Permite o aproveitamento de 100% das esquinas da oficina com painel de ferramentas e armário aéreo de canto.",
    "specs": [
      "Dimensões do Produto: 810 x 810 x 2.000 mm",
      "Peso Líquido: 37 kg",
      "Aplicação: União em 90 graus de bancadas e armários modulares",
      "Estrutura: Chapa de aço tratada com pintura epóxi"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1083",
    "name": "Módulo Inferior com Lixeira e Gaveta Wolfcar W1083",
    "slug": "modulo-inferior-com-lixeira-e-gaveta-wolfcar-w1083",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Organização",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/modulo-inferior-com-lixeira-e--d525dadcda7b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/modulo-inferior-com-lixeira-e--30363ce79897.webp"
    ],
    "altText": "Módulo Inferior com Lixeira e Gaveta Wolfcar W1083 Athena Soluções Automotivas",
    "description": "Módulo inferior para integração em bancadas Wolfcar, equipado com gaveta superior para consumíveis e compartimento basculante com lixeira integrada para descarte limpo de panos e peças usadas.",
    "specs": [
      "Dimensões: 680 x 460 x 910 mm",
      "Compartimento: Lixeira basculante integrada",
      "Gaveta: 1 gaveta superior reforçada",
      "Pintura: Eletrostática a pó anticorrosiva"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1067",
    "name": "Módulo com Cuba e Pia Integrada em Aço Inox Wolfcar W1067",
    "slug": "modulo-com-cuba-e-pia-integrada-em-aco-inox-wolfcar-w1067",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Higiene",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/modulo-com-cuba-e-pia-integrad-3a95a2846a8f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/modulo-com-cuba-e-pia-integrad-a0adf91612f3.webp"
    ],
    "altText": "Módulo com Cuba e Pia Integrada em Aço Inox Wolfcar W1067 Athena Soluções Automotivas",
    "description": "Módulo com pia em aço inoxidável e gabinete inferior de duas portas. Perfeito para higienização rápida de peças e mãos no ambiente de trabalho sem sair do box da oficina.",
    "specs": [
      "Dimensões: 680 x 460 x 910 mm",
      "Tampo: Aço Inoxidável 304 com cuba estampada",
      "Gabinete: 2 portas com prateleira interna",
      "Compatibilidade: 100% alinhado com a linha Wolfcar"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1071",
    "name": "Armário Vertical de 2 Portas 915mm Wolfcar W1071",
    "slug": "armario-vertical-de-2-portas-915mm-wolfcar-w1071",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Armazenamento",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-vertical-de-2-portas-9-c90588c52c6f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-vertical-de-2-portas-9-3c32f6a818b1.webp"
    ],
    "altText": "Armário Vertical de 2 Portas 915mm Wolfcar W1071 Athena Soluções Automotivas",
    "description": "Armário vertical alto de 2 portas com 4 prateleiras internas reforçadas e reguláveis, pés ajustáveis para pisos irregulares e fechadura central com chave.",
    "specs": [
      "Dimensões do Produto: 915 x 460 x 2.000 mm",
      "Peso Líquido: 80 kg",
      "Portas: 2 portas de abrir com reforço interno",
      "Prateleiras: 4 prateleiras reguláveis de alta capacidade",
      "Pés: Niveladores reguláveis em altura"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_wolfcar_w1076",
    "name": "Armário Vertical Compacto de 1 Porta 600mm Wolfcar W1076",
    "slug": "armario-vertical-compacto-de-1-porta-600mm-wolfcar-w1076",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_wolfcar",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Compacto",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-vertical-compacto-de-1-906b4b2e5585.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/armario-vertical-compacto-de-1-3acc0b8d434d.webp"
    ],
    "altText": "Armário Vertical Compacto de 1 Porta 600mm Wolfcar W1076 Athena Soluções Automotivas",
    "description": "Armário vertical estreito ideal para fechamento lateral de bancadas ou boxes de espaço reduzido. Conta com 4 prateleiras internas reforçadas e porta com trava com chave.",
    "specs": [
      "Dimensões do Produto: 600 x 460 x 2.000 mm",
      "Peso Líquido: 55 kg",
      "Porta: 1 porta com abertura reversível",
      "Prateleiras: Prateleiras internas com ajuste de altura",
      "Estrutura: Aço reforçado de 0.8mm"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-018",
    "name": "Auxiliar de Partida Portátil 10.000mAh 12V/6V Stärkx SKX-018",
    "slug": "auxiliar-de-partida-portatil-10-000mah-12v-6v-starkx-skx-018",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Emergência",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/auxiliar-de-partida-portatil-1-a3ce607f249f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/auxiliar-de-partida-portatil-1-710031da7670.webp"
    ],
    "altText": "Auxiliar de Partida Portátil 10.000mAh 12V/6V Stärkx SKX-018 Athena Soluções Automotivas",
    "description": "Auxiliar de partida compacto de alta potência para veículos 12V e 6V. Bateria de lítio de 10.000mAh, lanterna LED integrada de emergência e portas USB para carregamento rápido de dispositivos.",
    "specs": [
      "Capacidade da Bateria: 10.000 mAh",
      "Tensão de Saída: 12V / 6V Automotivo",
      "Entrada de Carga: 5V-2A / 9V-2A / 14V-1A",
      "Portas USB: 5V-3A com carga rápida",
      "Temperatura de Operação: -30°C a 65°C",
      "Proteções: Contra inversão de polaridade, curto-circuito e sobrecarga"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-028",
    "name": "Testador Digital de Baterias 12V/24V com Impressora Térmica Stärkx SKX-028",
    "slug": "testador-digital-de-baterias-12v-24v-com-impressora-termica-starkx-skx-028",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Diagnóstico",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/testador-digital-de-baterias-1-724958b72e45.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/testador-digital-de-baterias-1-ddba0c18ea5c.webp"
    ],
    "altText": "Testador Digital de Baterias 12V/24V com Impressora Térmica Stärkx SKX-028 Athena Soluções Automotivas",
    "description": "Testador de baterias digital profissional com impressora térmica embutida. Analisa estado de saúde (SOH), estado de carga (SOC), corrente de partida a frio (CCA), sistema de partida e alternador com laudo para o cliente.",
    "specs": [
      "Tensão de Teste: 12V e 24V (Baterias de 30 a 200 Ah)",
      "Display: LCD gráfico 128x64 iluminado",
      "Impressora: Térmica integrada para laudo instantâneo",
      "Normas Suportadas: CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB",
      "Faixa de CCA: 100 a 2.000 CCA",
      "Idioma: Português"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-038",
    "name": "Carregador Inteligente de Baterias 12V/24V Sistema PWM Stärkx SKX-038",
    "slug": "carregador-inteligente-de-baterias-12v-24v-sistema-pwm-starkx-skx-038",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Inteligente",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/carregador-inteligente-de-bate-4fb20c389b3f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/carregador-inteligente-de-bate-81c19a04e989.webp"
    ],
    "altText": "Carregador Inteligente de Baterias 12V/24V Sistema PWM Stärkx SKX-038 Athena Soluções Automotivas",
    "description": "Carregador de baterias com microprocessador e modulação por largura de pulso (PWM). Aumenta a taxa de absorção da bateria sem estufamento e recupera baterias com leve sulfatação.",
    "specs": [
      "Tensão de Aplicação: 12V e 24V automático",
      "Tecnologia de Carga: Sistema Inteligente PWM multi-estágios",
      "Proteções: Curto-circuito, superaquecimento, inversão de polaridade e subtensão",
      "Construção: Compacto, portátil e de alta eficiência energética"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-088",
    "name": "Detector de Continuidade e Rastreador de Fios e Chicotes Stärkx SKX-088",
    "slug": "detector-de-continuidade-e-rastreador-de-fios-e-chicotes-starkx-skx-088",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Elétrica",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/detector-de-continuidade-e-ras-40137ec15d3e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/detector-de-continuidade-e-ras-a25383c08fef.webp"
    ],
    "altText": "Detector de Continuidade e Rastreador de Fios e Chicotes Stärkx SKX-088 Athena Soluções Automotivas",
    "description": "Kit profissional composto por Transmissor e Receptor para rastreamento de condutores simples e pares em chicotes elétricos automotivos complexos sem danificar o isolamento dos cabos.",
    "specs": [
      "Funções: Rastreia cabos, detecta curto-circuito e testa continuidade",
      "Componentes: Transmissor SKX-088 + Receptor SKX-088 com controle de sensibilidade",
      "Acessórios: Fone de ouvido para ambientes ruidosos e pontas de prova",
      "Alimentação: Baterias 9V inclusas"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-108",
    "name": "Câmera de Inspeção Endoscópica Dupla Lente Tela 4.3\" Stärkx SKX-108",
    "slug": "camera-de-inspecao-endoscopica-dupla-lente-tela-4-3-starkx-skx-108",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Alta Resolução",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/camera-de-inspecao-endoscopica-87722466959c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/camera-de-inspecao-endoscopica-8ce9b8e76e2e.webp"
    ],
    "altText": "Câmera de Inspeção Endoscópica Dupla Lente Tela 4.3\" Stärkx SKX-108 Athena Soluções Automotivas",
    "description": "Videoscópio automotivo de alta resolução com câmera frontal e lateral simultâneas, iluminação LED ajustável e sonda semi-rígida à prova d'água para inspeção interna de cilindros, válvulas, câmbios e evaporadores.",
    "specs": [
      "Tela: LCD colorido de 4,3 polegadas HD",
      "Câmeras: Lente Frontal + Lente Lateral (visão simultânea ou individual)",
      "Iluminação: LEDs ultra-brilhantes com 3 níveis de intensidade",
      "Sonda: Flexível com proteção IP67 à prova d'água e óleo",
      "Recursos: Foto e gravação de vídeo em alta definição com cartão micro SD"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_skx-208",
    "name": "Analisador Eletrônico de Fluido de Freio DOT 3/4/5.1 Stärkx SKX-208",
    "slug": "analisador-eletronico-de-fluido-de-freio-dot-3-4-5-1-starkx-skx-208",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Segurança",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/analisador-eletronico-de-fluid-55ae8d69f59b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/analisador-eletronico-de-fluid-3643cbeddc9e.webp"
    ],
    "altText": "Analisador Eletrônico de Fluido de Freio DOT 3/4/5.1 Stärkx SKX-208 Athena Soluções Automotivas",
    "description": "Instrumento digital de alta precisão para medição do percentual de umidade em fluidos de freio sintéticos, garantindo a segurança do sistema de frenagem do veículo.",
    "specs": [
      "Fluidos Testados: DOT 3, DOT 4, DOT 5.1",
      "Sonda: Flexível de aço inox de alta sensibilidade",
      "Indicação: Display digital com escala percentual de água e alarme sonoro",
      "Alimentação: Bateria recarregável com desligamento automático"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_venu-90",
    "name": "Programador e Ativador de Sensores TPMS Thinkcar VENU 90",
    "slug": "programador-e-ativador-de-sensores-tpms-thinkcar-venu-90",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "TPMS Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/programador-e-ativador-de-sens-c2beb5e2d406.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/programador-e-ativador-de-sens-78a142518d7c.webp"
    ],
    "altText": "Programador e Ativador de Sensores TPMS Thinkcar VENU 90 Athena Soluções Automotivas",
    "description": "Ferramenta profissional especializada para diagnóstico, leitura de status, ativação e programação de sensores de pressão de pneus (TPMS) para veículos nacionais e importados.",
    "specs": [
      "Funções: Leitura de ID, pressão, temperatura, bateria do sensor e reaprendizado na ECU",
      "Programação: Ilimitada de sensores universais Thinkcar VENU 5",
      "Frequências: Suporta Dual Band 315 MHz e 433 MHz",
      "Atualizações: Wi-Fi integrado com atualizações de software gratuitas"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_venu-5",
    "name": "Sensor Universal de Pressão de Pneus TPMS Dual 315/433MHz Thinkcar VENU 5",
    "slug": "sensor-universal-de-pressao-de-pneus-tpms-dual-315-433mhz-thinkcar-venu-5",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Universal",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sensor-universal-de-pressao-de-641a2d0540d7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sensor-universal-de-pressao-de-fe6806a20bdb.webp"
    ],
    "altText": "Sensor Universal de Pressão de Pneus TPMS Dual 315/433MHz Thinkcar VENU 5 Athena Soluções Automotivas",
    "description": "Sensor TPMS universal programável de dupla frequência compatível com mais de 98% dos veículos equipados com TPMS de fábrica no mundo.",
    "specs": [
      "Frequência: Dual 315 MHz e 433 MHz no mesmo sensor",
      "Opções de Válvula: Válvula de Metal em alumínio ou Válvula de Borracha flexível",
      "Vida Útil da Bateria: Mais de 5 anos de durabilidade contínua",
      "Pressão Máxima: 900 kPa (130 PSI)"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_thinktool-lite",
    "name": "Scanner Automotivo Multimarcas Thinkcar THINKTOOL LITE",
    "slug": "scanner-automotivo-multimarcas-thinkcar-thinktool-lite",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Lançamento",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-automotivo-multimarcas-a86254530c83.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-automotivo-multimarcas-05d8489ab958.webp"
    ],
    "altText": "Scanner Automotivo Multimarcas Thinkcar THINKTOOL LITE Athena Soluções Automotivas",
    "description": "Scanner de diagnóstico completo para linha leve, utilitários, híbridos e elétricos. Realiza diagnóstico completo de todos os sistemas, testes de atuadores, ajustes, programações e mais de 28 funções de reset.",
    "specs": [
      "Display: Touchscreen HD de 6 polegadas",
      "Conectividade: VCI Bluetooth sem fio de longo alcance",
      "Cobertura: Veículos Ciclo Otto, Diesel Leve, Híbridos e 100% Elétricos",
      "Funções Especiais: 28+ resets (óleo, SAS, freio elétrico, BMS, DPF, TPMS, sangria ABS, etc.)",
      "Suporte Remoto: TeamViewer integrado de fábrica",
      "Atualizações: 2 anos de atualizações online inclusas"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_starkx_platinum-s10-pro",
    "name": "Scanner Automotivo Avançado J2534 com Topologia Thinkcar PLATINUM S10 PRO",
    "slug": "scanner-automotivo-avancado-j2534-com-topologia-thinkcar-platinum-s10-pro",
    "categoryId": "cat_scanners",
    "brandId": "brand_starkx",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Topo de Linha",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-automotivo-avancado-j2-6b5fc99d4534.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-automotivo-avancado-j2-268acf2fe36c.webp"
    ],
    "altText": "Scanner Automotivo Avançado J2534 com Topologia Thinkcar PLATINUM S10 PRO Athena Soluções Automotivas",
    "description": "O scanner topo de linha com interface J2534 PassThru, display de 10 polegadas e Topologia de Redes colorida. Suporta protocolos CAN-FD, DoIP e programação online de ECUs.",
    "specs": [
      "Display: 10 polegadas IPS Touchscreen de alta resolução",
      "Sistema & Hardware: Android 10, processador 8-Core, 4GB RAM + 64GB ROM",
      "Topologia de Rede: Mapeamento gráfico colorido de todos os módulos do veículo",
      "Protocolos Avançados: J2534 PassThru, CAN-FD, DoIP, ISO 14229",
      "Programação Online: Codificação e parametrização de módulos avançados",
      "Câmera: 13 MP traseira para laudos fotográficos",
      "Bateria: 6.000 mAh com alta autonomia"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1008",
    "name": "Equipamento MAH-1008 Mahovi",
    "slug": "equipamento-mah-1008-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1008-mahovi-e0d88e5aacb2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1008-mahovi-ga-30652d4c22a4.webp"
    ],
    "altText": "Equipamento MAH-1008 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1008 Mahovi.",
    "specs": [
      "Modelo: MAH-1008",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1006s",
    "name": "Equipamento MAH-1006S Mahovi",
    "slug": "equipamento-mah-1006s-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1006s-mahovi-ee0a3a3f7d76.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1006s-mahovi-g-b790d8beaa11.webp"
    ],
    "altText": "Equipamento MAH-1006S Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1006S Mahovi.",
    "specs": [
      "Modelo: MAH-1006S",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1006",
    "name": "Equipamento MAH-1006 Mahovi",
    "slug": "equipamento-mah-1006-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1006-mahovi-ab868615051d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1006-mahovi-ga-d18ac1f94768.webp"
    ],
    "altText": "Equipamento MAH-1006 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1006 Mahovi.",
    "specs": [
      "Modelo: MAH-1006",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1005",
    "name": "Equipamento MAH-1005 Mahovi",
    "slug": "equipamento-mah-1005-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1005-mahovi-2892b8e82532.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1005-mahovi-ga-edfab9b33afe.webp"
    ],
    "altText": "Equipamento MAH-1005 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1005 Mahovi.",
    "specs": [
      "Modelo: MAH-1005",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1010",
    "name": "Equipamento MAH-1010 Mahovi",
    "slug": "equipamento-mah-1010-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1010-mahovi-de8d219434c0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1010-mahovi-ga-0d0df69aea2b.webp"
    ],
    "altText": "Equipamento MAH-1010 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1010 Mahovi.",
    "specs": [
      "Modelo: MAH-1010",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1010s",
    "name": "Equipamento MAH-1010S Mahovi",
    "slug": "equipamento-mah-1010s-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1010s-mahovi-76b97fd34718.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1010s-mahovi-g-415ec286f4dd.webp"
    ],
    "altText": "Equipamento MAH-1010S Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1010S Mahovi.",
    "specs": [
      "Modelo: MAH-1010S",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1012",
    "name": "Equipamento MAH-1012 Mahovi",
    "slug": "equipamento-mah-1012-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1012-mahovi-97e4170378fc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1012-mahovi-ga-c410bedaf2b1.webp"
    ],
    "altText": "Equipamento MAH-1012 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1012 Mahovi.",
    "specs": [
      "Modelo: MAH-1012",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1014",
    "name": "Equipamento MAH-1014 Mahovi",
    "slug": "equipamento-mah-1014-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1014-mahovi-a9de1f9c3e81.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1014-mahovi-ga-eaaa080c5a03.webp"
    ],
    "altText": "Equipamento MAH-1014 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1014 Mahovi.",
    "specs": [
      "Modelo: MAH-1014",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1015",
    "name": "Equipamento MAH-1015 Mahovi",
    "slug": "equipamento-mah-1015-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1015-mahovi-8906c3f8a606.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1015-mahovi-ga-a38488597a33.webp"
    ],
    "altText": "Equipamento MAH-1015 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1015 Mahovi.",
    "specs": [
      "Modelo: MAH-1015",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1030",
    "name": "Equipamento MAH-1030 Mahovi",
    "slug": "equipamento-mah-1030-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1030-mahovi-59e710cd6726.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1030-mahovi-ga-68181be90415.webp"
    ],
    "altText": "Equipamento MAH-1030 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1030 Mahovi.",
    "specs": [
      "Modelo: MAH-1030",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1004",
    "name": "Equipamento MAH-1004 Mahovi",
    "slug": "equipamento-mah-1004-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1004-mahovi-98bf400a3b75.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1004-mahovi-ga-cec725133eb3.webp"
    ],
    "altText": "Equipamento MAH-1004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1004 Mahovi.",
    "specs": [
      "Modelo: MAH-1004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1020",
    "name": "Equipamento MAH-1020 Mahovi",
    "slug": "equipamento-mah-1020-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1020-mahovi-e9ae769be7d7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1020-mahovi-ga-f53a00b3c158.webp"
    ],
    "altText": "Equipamento MAH-1020 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1020 Mahovi.",
    "specs": [
      "Modelo: MAH-1020",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1001",
    "name": "Equipamento MAH-1001 Mahovi",
    "slug": "equipamento-mah-1001-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1001-mahovi-e3a0b7f72950.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1001-mahovi-ga-e017bd86b9a0.webp"
    ],
    "altText": "Equipamento MAH-1001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1001 Mahovi.",
    "specs": [
      "Modelo: MAH-1001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1002",
    "name": "Equipamento MAH-1002 Mahovi",
    "slug": "equipamento-mah-1002-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1002-mahovi-960b8986acc4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1002-mahovi-ga-ca5f1e11275a.webp"
    ],
    "altText": "Equipamento MAH-1002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1002 Mahovi.",
    "specs": [
      "Modelo: MAH-1002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1011",
    "name": "Equipamento MAH-1011 Mahovi",
    "slug": "equipamento-mah-1011-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1011-mahovi-9a11bd634427.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1011-mahovi-ga-3ecd7c748e85.webp"
    ],
    "altText": "Equipamento MAH-1011 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1011 Mahovi.",
    "specs": [
      "Modelo: MAH-1011",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-1001",
    "name": "Equipamento WAL-1001 Mahovi",
    "slug": "equipamento-wal-1001-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-1001-mahovi-84aff315dd79.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-1001-mahovi-ga-370cfb5bafb9.webp"
    ],
    "altText": "Equipamento WAL-1001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-1001 Mahovi.",
    "specs": [
      "Modelo: WAL-1001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-1002",
    "name": "Equipamento WAL-1002 Mahovi",
    "slug": "equipamento-wal-1002-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-1002-mahovi-d79827868682.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-1002-mahovi-ga-b133a133df3c.webp"
    ],
    "altText": "Equipamento WAL-1002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-1002 Mahovi.",
    "specs": [
      "Modelo: WAL-1002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-3012",
    "name": "Equipamento WAL-3012 Mahovi",
    "slug": "equipamento-wal-3012-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3012-mahovi-7cba04a4a2fb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3012-mahovi-ga-8ceec15e864e.webp"
    ],
    "altText": "Equipamento WAL-3012 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-3012 Mahovi.",
    "specs": [
      "Modelo: WAL-3012",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-3002",
    "name": "Equipamento WAL-3002 Mahovi",
    "slug": "equipamento-wal-3002-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3002-mahovi-5380297c9206.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3002-mahovi-ga-19485c5a305d.webp"
    ],
    "altText": "Equipamento WAL-3002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-3002 Mahovi.",
    "specs": [
      "Modelo: WAL-3002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1000",
    "name": "Equipamento MAH-1000 Mahovi",
    "slug": "equipamento-mah-1000-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1000-mahovi-e2c54ecc6a86.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1000-mahovi-ga-2a11786bf452.webp"
    ],
    "altText": "Equipamento MAH-1000 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1000 Mahovi.",
    "specs": [
      "Modelo: MAH-1000",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3041",
    "name": "Duplicadores MAH-3041 Mahovi",
    "slug": "duplicadores-mah-3041-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3041-mahovi-a0d9c95d4d45.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3041-mahovi-g-5dfce602ddc0.webp"
    ],
    "altText": "Duplicadores MAH-3041 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3041 Mahovi.",
    "specs": [
      "Modelo: MAH-3041",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3045",
    "name": "Duplicadores MAH-3045 Mahovi",
    "slug": "duplicadores-mah-3045-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3045-mahovi-02f965ef2b1d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3045-mahovi-g-e3159817c229.webp"
    ],
    "altText": "Duplicadores MAH-3045 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3045 Mahovi.",
    "specs": [
      "Modelo: MAH-3045",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3046",
    "name": "Duplicadores MAH-3046 Mahovi",
    "slug": "duplicadores-mah-3046-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3046-mahovi-530f4456d642.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/duplicadores-mah-3046-mahovi-g-96194971021f.webp"
    ],
    "altText": "Duplicadores MAH-3046 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3046 Mahovi.",
    "specs": [
      "Modelo: MAH-3046",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-3010",
    "name": "Rampas WAL-3010 Mahovi",
    "slug": "rampas-wal-3010-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-wal-3010-mahovi-eb62536bc878.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-wal-3010-mahovi-galeria-cb8cdc062e9e.webp"
    ],
    "altText": "Rampas WAL-3010 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-3010 Mahovi.",
    "specs": [
      "Modelo: WAL-3010",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-3013",
    "name": "Rampas WAL-3013 Mahovi",
    "slug": "rampas-wal-3013-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-wal-3013-mahovi-1531c51a4144.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-wal-3013-mahovi-galeria-284cb2da0bbb.webp"
    ],
    "altText": "Rampas WAL-3013 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-3013 Mahovi.",
    "specs": [
      "Modelo: WAL-3013",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3001",
    "name": "Rampas MAH-3001 Mahovi",
    "slug": "rampas-mah-3001-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-mah-3001-mahovi-66a6a1ae658d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-mah-3001-mahovi-galeria-ac215320388c.webp"
    ],
    "altText": "Rampas MAH-3001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3001 Mahovi.",
    "specs": [
      "Modelo: MAH-3001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3004",
    "name": "Rampas MAH-3004 Mahovi",
    "slug": "rampas-mah-3004-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-mah-3004-mahovi-dfe2dc717962.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/rampas-mah-3004-mahovi-galeria-f12c120253e5.webp"
    ],
    "altText": "Rampas MAH-3004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3004 Mahovi.",
    "specs": [
      "Modelo: MAH-3004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2001",
    "name": "Equipamento MAH-2001 Mahovi",
    "slug": "equipamento-mah-2001-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2001-mahovi-d8e08006866b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2001-mahovi-ga-4558b6224ab0.webp"
    ],
    "altText": "Equipamento MAH-2001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2001 Mahovi.",
    "specs": [
      "Modelo: MAH-2001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2002",
    "name": "Equipamento MAH-2002 Mahovi",
    "slug": "equipamento-mah-2002-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2002-mahovi-c12273446221.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2002-mahovi-ga-10dfa6bd0155.webp"
    ],
    "altText": "Equipamento MAH-2002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2002 Mahovi.",
    "specs": [
      "Modelo: MAH-2002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2003",
    "name": "Equipamento MAH-2003 Mahovi",
    "slug": "equipamento-mah-2003-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2003-mahovi-0712e5500972.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2003-mahovi-ga-0fccf46f79a8.webp"
    ],
    "altText": "Equipamento MAH-2003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2003 Mahovi.",
    "specs": [
      "Modelo: MAH-2003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2004",
    "name": "Equipamento MAH-2004 Mahovi",
    "slug": "equipamento-mah-2004-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2004-mahovi-d9256a7167d4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2004-mahovi-ga-03c2f5358f47.webp"
    ],
    "altText": "Equipamento MAH-2004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2004 Mahovi.",
    "specs": [
      "Modelo: MAH-2004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2006",
    "name": "Equipamento MAH-2006 Mahovi",
    "slug": "equipamento-mah-2006-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2006-mahovi-56f61e4826a4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2006-mahovi-ga-6fb7159917b3.webp"
    ],
    "altText": "Equipamento MAH-2006 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2006 Mahovi.",
    "specs": [
      "Modelo: MAH-2006",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2007",
    "name": "Equipamento MAH-2007 Mahovi",
    "slug": "equipamento-mah-2007-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2007-mahovi-b92c065e65a8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2007-mahovi-ga-d6524a36f6b9.webp"
    ],
    "altText": "Equipamento MAH-2007 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2007 Mahovi.",
    "specs": [
      "Modelo: MAH-2007",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-2008",
    "name": "Equipamento MAH-2008 Mahovi",
    "slug": "equipamento-mah-2008-mahovi",
    "categoryId": "cat_elevadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2008-mahovi-2ce21fab3e0e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-2008-mahovi-ga-4cbf288f18d5.webp"
    ],
    "altText": "Equipamento MAH-2008 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-2008 Mahovi.",
    "specs": [
      "Modelo: MAH-2008",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3002",
    "name": "Equipamento MAH-3002 Mahovi",
    "slug": "equipamento-mah-3002-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3002-mahovi-afcdcc08f484.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3002-mahovi-ga-f0334814e1e1.webp"
    ],
    "altText": "Equipamento MAH-3002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3002 Mahovi.",
    "specs": [
      "Modelo: MAH-3002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3003",
    "name": "Equipamento MAH-3003 Mahovi",
    "slug": "equipamento-mah-3003-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3003-mahovi-2d37e955c41d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3003-mahovi-ga-a89f8b6b20a8.webp"
    ],
    "altText": "Equipamento MAH-3003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3003 Mahovi.",
    "specs": [
      "Modelo: MAH-3003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-3003",
    "name": "Equipamento WAL-3003 Mahovi",
    "slug": "equipamento-wal-3003-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3003-mahovi-7427cf23ca3f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-3003-mahovi-ga-fb89aa918574.webp"
    ],
    "altText": "Equipamento WAL-3003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-3003 Mahovi.",
    "specs": [
      "Modelo: WAL-3003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3005",
    "name": "Equipamento MAH-3005 Mahovi",
    "slug": "equipamento-mah-3005-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3005-mahovi-6cd6ade233f4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-3005-mahovi-ga-e0041f131727.webp"
    ],
    "altText": "Equipamento MAH-3005 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3005 Mahovi.",
    "specs": [
      "Modelo: MAH-3005",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-6001",
    "name": "Balanceadoras MAH-6001 Mahovi",
    "slug": "balanceadoras-mah-6001-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6001-mahovi-e8fd871f49f5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6001-mahovi--549f78de444c.webp"
    ],
    "altText": "Balanceadoras MAH-6001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-6001 Mahovi.",
    "specs": [
      "Modelo: MAH-6001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-6003",
    "name": "Balanceadoras MAH-6003 Mahovi",
    "slug": "balanceadoras-mah-6003-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6003-mahovi-a4f95f4005aa.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6003-mahovi--79da18630542.webp"
    ],
    "altText": "Balanceadoras MAH-6003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-6003 Mahovi.",
    "specs": [
      "Modelo: MAH-6003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-6004",
    "name": "Balanceadoras MAH-6004 Mahovi",
    "slug": "balanceadoras-mah-6004-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6004-mahovi-a65e3798e14c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-mah-6004-mahovi--9a8c5b7c84f1.webp"
    ],
    "altText": "Balanceadoras MAH-6004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-6004 Mahovi.",
    "specs": [
      "Modelo: MAH-6004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-600",
    "name": "Balanceadoras De Rodas MAH-600 Mahovi",
    "slug": "balanceadoras-de-rodas-mah-600-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-de-rodas-mah-600-3c2625a6f7e2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/balanceadoras-de-rodas-mah-600-caa25ddb0d14.webp"
    ],
    "altText": "Balanceadoras De Rodas MAH-600 Mahovi Athena Soluções Automotivas",
    "description": "BALANCEADORAS DE RODAS Balanceadora de Rodas para A MAH-6001 é o modelo de entrada da linha de balanceamento MAHOVI, oferecendo excelente",
    "specs": [
      "EM NOSSO SITE:",
      "SKU: MAH6001",
      "65 Kg",
      "Monofásico 220V",
      "92 Kg",
      "Código do Produto: MAH-600",
      "Garantia: 12 meses oficial Mahovi"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5001",
    "name": "Desmontadoras MAH-5001 Mahovi",
    "slug": "desmontadoras-mah-5001-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5001-mahovi-01ad08b01788.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5001-mahovi--091c5967ec02.webp"
    ],
    "altText": "Desmontadoras MAH-5001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5001 Mahovi.",
    "specs": [
      "Modelo: MAH-5001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5002",
    "name": "Desmontadoras MAH-5002 Mahovi",
    "slug": "desmontadoras-mah-5002-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5002-mahovi-7706cee8f265.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5002-mahovi--baa378ce058b.webp"
    ],
    "altText": "Desmontadoras MAH-5002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5002 Mahovi.",
    "specs": [
      "Modelo: MAH-5002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5003",
    "name": "Desmontadoras MAH-5003 Mahovi",
    "slug": "desmontadoras-mah-5003-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5003-mahovi-21cbfe2913a0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5003-mahovi--599c819c5556.webp"
    ],
    "altText": "Desmontadoras MAH-5003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5003 Mahovi.",
    "specs": [
      "Modelo: MAH-5003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5004",
    "name": "Desmontadoras MAH-5004 Mahovi",
    "slug": "desmontadoras-mah-5004-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5004-mahovi-9c0095d5938e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5004-mahovi--f3cc721e9ada.webp"
    ],
    "altText": "Desmontadoras MAH-5004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5004 Mahovi.",
    "specs": [
      "Modelo: MAH-5004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5005",
    "name": "Desmontadoras MAH-5005 Mahovi",
    "slug": "desmontadoras-mah-5005-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5005-mahovi-31f6bdcdc628.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5005-mahovi--b87adefa755e.webp"
    ],
    "altText": "Desmontadoras MAH-5005 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5005 Mahovi.",
    "specs": [
      "Modelo: MAH-5005",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5006",
    "name": "Desmontadoras MAH-5006 Mahovi",
    "slug": "desmontadoras-mah-5006-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5006-mahovi-59ac86dc1551.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-5006-mahovi--7fd9199d5973.webp"
    ],
    "altText": "Desmontadoras MAH-5006 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5006 Mahovi.",
    "specs": [
      "Modelo: MAH-5006",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4009",
    "name": "Desmontadoras MAH-4009 Mahovi",
    "slug": "desmontadoras-mah-4009-mahovi",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-4009-mahovi-252884094936.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desmontadoras-mah-4009-mahovi--54baec3f6c52.webp"
    ],
    "altText": "Desmontadoras MAH-4009 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4009 Mahovi.",
    "specs": [
      "Modelo: MAH-4009",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3d1",
    "name": "Alinhadores MAH-3D1 Mahovi",
    "slug": "alinhadores-mah-3d1-mahovi",
    "categoryId": "cat_alinhadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d1-mahovi-4eed62d3b0e9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d1-mahovi-gal-cf9733853ad0.webp"
    ],
    "altText": "Alinhadores MAH-3D1 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3D1 Mahovi.",
    "specs": [
      "Modelo: MAH-3D1",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3d2",
    "name": "Alinhadores MAH-3D2 Mahovi",
    "slug": "alinhadores-mah-3d2-mahovi",
    "categoryId": "cat_alinhadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d2-mahovi-cc96a72e7a8a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d2-mahovi-gal-dc131f1e92fe.webp"
    ],
    "altText": "Alinhadores MAH-3D2 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3D2 Mahovi.",
    "specs": [
      "Modelo: MAH-3D2",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-3d3",
    "name": "Alinhadores MAH-3D3 Mahovi",
    "slug": "alinhadores-mah-3d3-mahovi",
    "categoryId": "cat_alinhadores",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d3-mahovi-d3a424072f71.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/alinhadores-mah-3d3-mahovi-gal-12a35a6186d1.webp"
    ],
    "altText": "Alinhadores MAH-3D3 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-3D3 Mahovi.",
    "specs": [
      "Modelo: MAH-3D3",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4012",
    "name": "Equipamento MAH-4012 Mahovi",
    "slug": "equipamento-mah-4012-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4012-mahovi-0a3d9a1d70bf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4012-mahovi-ga-48a77347827a.webp"
    ],
    "altText": "Equipamento MAH-4012 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4012 Mahovi.",
    "specs": [
      "Modelo: MAH-4012",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4010",
    "name": "Equipamento MAH-4010 Mahovi",
    "slug": "equipamento-mah-4010-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4010-mahovi-c252341b6f69.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4010-mahovi-ga-cdf0a5aff64b.webp"
    ],
    "altText": "Equipamento MAH-4010 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4010 Mahovi.",
    "specs": [
      "Modelo: MAH-4010",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4013",
    "name": "Equipamento MAH-4013 Mahovi",
    "slug": "equipamento-mah-4013-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4013-mahovi-f07f8209e7c5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4013-mahovi-ga-e211102a6332.webp"
    ],
    "altText": "Equipamento MAH-4013 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4013 Mahovi.",
    "specs": [
      "Modelo: MAH-4013",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4016",
    "name": "Equipamento MAH-4016 Mahovi",
    "slug": "equipamento-mah-4016-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4016-mahovi-ba98417b46a4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4016-mahovi-ga-05b85741d254.webp"
    ],
    "altText": "Equipamento MAH-4016 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4016 Mahovi.",
    "specs": [
      "Modelo: MAH-4016",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4008",
    "name": "Equipamento MAH-4008 Mahovi",
    "slug": "equipamento-mah-4008-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4008-mahovi-74dda1c7cb3c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4008-mahovi-ga-c22c6740d7e4.webp"
    ],
    "altText": "Equipamento MAH-4008 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4008 Mahovi.",
    "specs": [
      "Modelo: MAH-4008",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4100",
    "name": "Equipamento MAH-4100 Mahovi",
    "slug": "equipamento-mah-4100-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4100-mahovi-344bdd422f10.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4100-mahovi-ga-420db8cea9ea.webp"
    ],
    "altText": "Equipamento MAH-4100 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4100 Mahovi.",
    "specs": [
      "Modelo: MAH-4100",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-4000m-kit",
    "name": "Equipamento WAL-4000M-KIT Mahovi",
    "slug": "equipamento-wal-4000m-kit-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-4000m-kit-maho-dc7df3d5ff18.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-4000m-kit-maho-38baa5acca01.webp"
    ],
    "altText": "Equipamento WAL-4000M-KIT Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-4000M-KIT Mahovi.",
    "specs": [
      "Modelo: WAL-4000M-KIT",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4003",
    "name": "Equipamento MAH-4003 Mahovi",
    "slug": "equipamento-mah-4003-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4003-mahovi-18aa34a5a302.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4003-mahovi-ga-abca829b266b.webp"
    ],
    "altText": "Equipamento MAH-4003 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4003 Mahovi.",
    "specs": [
      "Modelo: MAH-4003",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4004",
    "name": "Equipamento MAH-4004 Mahovi",
    "slug": "equipamento-mah-4004-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4004-mahovi-91823f04e2f4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4004-mahovi-ga-a0c38e1ab404.webp"
    ],
    "altText": "Equipamento MAH-4004 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4004 Mahovi.",
    "specs": [
      "Modelo: MAH-4004",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4005",
    "name": "Equipamento MAH-4005 Mahovi",
    "slug": "equipamento-mah-4005-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4005-mahovi-0ef03aa8b2a4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4005-mahovi-ga-12fff9101f5a.webp"
    ],
    "altText": "Equipamento MAH-4005 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4005 Mahovi.",
    "specs": [
      "Modelo: MAH-4005",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4011",
    "name": "Equipamento MAH-4011 Mahovi",
    "slug": "equipamento-mah-4011-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4011-mahovi-2f0605918c14.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4011-mahovi-ga-fad39252e1f2.webp"
    ],
    "altText": "Equipamento MAH-4011 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4011 Mahovi.",
    "specs": [
      "Modelo: MAH-4011",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4015",
    "name": "Equipamento MAH-4015 Mahovi",
    "slug": "equipamento-mah-4015-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4015-mahovi-10657ea9ff1b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4015-mahovi-ga-d09451917ecd.webp"
    ],
    "altText": "Equipamento MAH-4015 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4015 Mahovi.",
    "specs": [
      "Modelo: MAH-4015",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4017",
    "name": "Equipamento MAH-4017 Mahovi",
    "slug": "equipamento-mah-4017-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4017-mahovi-774c08895b9b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4017-mahovi-ga-831987acbaa1.webp"
    ],
    "altText": "Equipamento MAH-4017 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4017 Mahovi.",
    "specs": [
      "Modelo: MAH-4017",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4018",
    "name": "Equipamento MAH-4018 Mahovi",
    "slug": "equipamento-mah-4018-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4018-mahovi-6ed145d4ec93.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4018-mahovi-ga-879d4b7ca02d.webp"
    ],
    "altText": "Equipamento MAH-4018 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4018 Mahovi.",
    "specs": [
      "Modelo: MAH-4018",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-9001",
    "name": "Equipamento WAL-9001 Mahovi",
    "slug": "equipamento-wal-9001-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-9001-mahovi-a8eb5a607057.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-9001-mahovi-ga-5510f2896b20.webp"
    ],
    "altText": "Equipamento WAL-9001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-9001 Mahovi.",
    "specs": [
      "Modelo: WAL-9001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4002",
    "name": "Equipamento MAH-4002 Mahovi",
    "slug": "equipamento-mah-4002-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4002-mahovi-b2d62240b383.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4002-mahovi-ga-10e3db68e0bb.webp"
    ],
    "altText": "Equipamento MAH-4002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4002 Mahovi.",
    "specs": [
      "Modelo: MAH-4002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4001",
    "name": "Equipamento MAH-4001 Mahovi",
    "slug": "equipamento-mah-4001-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4001-mahovi-544094276e6a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4001-mahovi-ga-389fba633c48.webp"
    ],
    "altText": "Equipamento MAH-4001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4001 Mahovi.",
    "specs": [
      "Modelo: MAH-4001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4040",
    "name": "Equipamento MAH-4040 Mahovi",
    "slug": "equipamento-mah-4040-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4040-mahovi-93c88478f3e9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4040-mahovi-ga-fbc7c6b8f4c6.webp"
    ],
    "altText": "Equipamento MAH-4040 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4040 Mahovi.",
    "specs": [
      "Modelo: MAH-4040",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4014",
    "name": "Equipamento MAH-4014 Mahovi",
    "slug": "equipamento-mah-4014-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4014-mahovi-45614019c5ab.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4014-mahovi-ga-816ccbafe6a0.webp"
    ],
    "altText": "Equipamento MAH-4014 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4014 Mahovi.",
    "specs": [
      "Modelo: MAH-4014",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4030",
    "name": "Equipamento MAH-4030 Mahovi",
    "slug": "equipamento-mah-4030-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4030-mahovi-eec118826123.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4030-mahovi-ga-31f58b76ebd8.webp"
    ],
    "altText": "Equipamento MAH-4030 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4030 Mahovi.",
    "specs": [
      "Modelo: MAH-4030",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4031",
    "name": "Equipamento MAH-4031 Mahovi",
    "slug": "equipamento-mah-4031-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4031-mahovi-9a48b7b52a93.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4031-mahovi-ga-fade6bf173b1.webp"
    ],
    "altText": "Equipamento MAH-4031 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4031 Mahovi.",
    "specs": [
      "Modelo: MAH-4031",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-1009-01",
    "name": "Equipamento MAH-1009-01 Mahovi",
    "slug": "equipamento-mah-1009-01-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1009-01-mahovi-f222d3b83e32.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-1009-01-mahovi-435d385e1614.webp"
    ],
    "altText": "Equipamento MAH-1009-01 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-1009-01 Mahovi.",
    "specs": [
      "Modelo: MAH-1009-01",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-110",
    "name": "Equipamento MAH-110 Mahovi",
    "slug": "equipamento-mah-110-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-110-mahovi-7015d9283aa9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-110-mahovi-gal-3d7c6f729eeb.webp"
    ],
    "altText": "Equipamento MAH-110 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-110 Mahovi.",
    "specs": [
      "Modelo: MAH-110",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-104",
    "name": "Equipamento MAH-104 Mahovi",
    "slug": "equipamento-mah-104-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-104-mahovi-e7bbbfd7f22f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-104-mahovi-gal-abf12bf3629d.webp"
    ],
    "altText": "Equipamento MAH-104 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-104 Mahovi.",
    "specs": [
      "Modelo: MAH-104",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-103",
    "name": "Equipamento MAH-103 Mahovi",
    "slug": "equipamento-mah-103-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-103-mahovi-e3755c15f5d9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-103-mahovi-gal-3ae3f83252d9.webp"
    ],
    "altText": "Equipamento MAH-103 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-103 Mahovi.",
    "specs": [
      "Modelo: MAH-103",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4001-44",
    "name": "Equipamento MAH-4001-44 Mahovi",
    "slug": "equipamento-mah-4001-44-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4001-44-mahovi-a5c23d75fcbd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4001-44-mahovi-31f73b02b3d1.webp"
    ],
    "altText": "Equipamento MAH-4001-44 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4001-44 Mahovi.",
    "specs": [
      "Modelo: MAH-4001-44",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-4020",
    "name": "Equipamento MAH-4020 Mahovi",
    "slug": "equipamento-mah-4020-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4020-mahovi-1af4964c1e6b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-4020-mahovi-ga-0944fc044ff8.webp"
    ],
    "altText": "Equipamento MAH-4020 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-4020 Mahovi.",
    "specs": [
      "Modelo: MAH-4020",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-5010",
    "name": "Equipamento MAH-5010 Mahovi",
    "slug": "equipamento-mah-5010-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-5010-mahovi-0e6d23a8a116.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-5010-mahovi-ga-002362a5df08.webp"
    ],
    "altText": "Equipamento MAH-5010 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-5010 Mahovi.",
    "specs": [
      "Modelo: MAH-5010",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-cap01",
    "name": "Equipamento WAL-CAP01 Mahovi",
    "slug": "equipamento-wal-cap01-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-cap01-mahovi-a6f83d6f69bb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-cap01-mahovi-g-eecfdb361fb0.webp"
    ],
    "altText": "Equipamento WAL-CAP01 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-CAP01 Mahovi.",
    "specs": [
      "Modelo: WAL-CAP01",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-4128",
    "name": "Equipamento WAL-4128 Mahovi",
    "slug": "equipamento-wal-4128-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-4128-mahovi-0771f7df78e7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-4128-mahovi-ga-a88e791692dc.webp"
    ],
    "altText": "Equipamento WAL-4128 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-4128 Mahovi.",
    "specs": [
      "Modelo: WAL-4128",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-101",
    "name": "Equipamento WAL-101 Mahovi",
    "slug": "equipamento-wal-101-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-101-mahovi-62972b044368.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-101-mahovi-gal-6fb24540e800.webp"
    ],
    "altText": "Equipamento WAL-101 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-101 Mahovi.",
    "specs": [
      "Modelo: WAL-101",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-8002",
    "name": "Equipamento MAH-8002 Mahovi",
    "slug": "equipamento-mah-8002-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-8002-mahovi-509254897988.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-8002-mahovi-ga-953492b09528.webp"
    ],
    "altText": "Equipamento MAH-8002 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-8002 Mahovi.",
    "specs": [
      "Modelo: MAH-8002",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_mah-8001",
    "name": "Equipamento MAH-8001 Mahovi",
    "slug": "equipamento-mah-8001-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-8001-mahovi-28cff772e866.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-mah-8001-mahovi-ga-2bba3703bf7e.webp"
    ],
    "altText": "Equipamento MAH-8001 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo MAH-8001 Mahovi.",
    "specs": [
      "Modelo: MAH-8001",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-102",
    "name": "Equipamento WAL-102 Mahovi",
    "slug": "equipamento-wal-102-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-102-mahovi-003b2809f311.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-102-mahovi-gal-a1ce5c47a4d9.webp"
    ],
    "altText": "Equipamento WAL-102 Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-102 Mahovi.",
    "specs": [
      "Modelo: WAL-102",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_mahovi_wal-fun",
    "name": "Equipamento WAL-FUN Mahovi",
    "slug": "equipamento-wal-fun-mahovi",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_mahovi",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Mahovi Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-fun-mahovi-7c092b5f411b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/equipamento-wal-fun-mahovi-gal-307c4910a510.webp"
    ],
    "altText": "Equipamento WAL-FUN Mahovi Athena Soluções Automotivas",
    "description": "Equipamento de alta performance para oficina mecânica e centro automotivo modelo WAL-FUN Mahovi.",
    "specs": [
      "Modelo: WAL-FUN",
      "Fabricante: Mahovi Equipamentos Automotivos",
      "Garantia: 12 meses de fábrica com suporte técnico nacional",
      "Certificação: Homologado para centros automotivos e concessionárias"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-can03",
    "name": "Ferramenta Especial DT-CAN03 Delta",
    "slug": "ferramenta-especial-dt-can03-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-can03-d-1d6026daa621.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-can03-d-76ca1dbb522a.webp"
    ],
    "altText": "Ferramenta Especial DT-CAN03 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-CAN03.",
    "specs": [
      "Código de Referência: DT-CAN03",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac20",
    "name": "KIT DE FERRAMENTAS COM 21 PEÇAS PARA SACAR (DT-SAC20) Delta",
    "slug": "kit-de-ferramentas-com-21-pecas-para-sacar-dt-sac20-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-com-21-peca-b8337efce190.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-com-21-peca-a79c0095fac4.webp"
    ],
    "altText": "KIT DE FERRAMENTAS COM 21 PEÇAS PARA SACAR (DT-SAC20) Delta Athena Soluções Automotivas",
    "description": "INJETORES (PNEUMÁTICO) Sacador pneumatico desenvolvido para sacar injetores emperrados ou travados com facilidade principalmente para linha diesel. Acompanha vários adaptadores. Mais completo do mercado. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Código de Referência: DT-SAC20",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-atb01",
    "name": "CABO OBD PARA AUXILIAR NA TROCA DE BATERIA (DT-ATB01) Delta",
    "slug": "cabo-obd-para-auxiliar-na-troca-de-bateria-dt-atb01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/cabo-obd-para-auxiliar-na-troc-084eb6617baf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/cabo-obd-para-auxiliar-na-troc-e7b4ce660ff2.webp"
    ],
    "altText": "CABO OBD PARA AUXILIAR NA TROCA DE BATERIA (DT-ATB01) Delta Athena Soluções Automotivas",
    "description": "Equipamento que auxilia o reparador automotivo a efetuar a troca da bateria com segurança sem perder os dados armazenados do veículo. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-ATB01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tbd02",
    "name": "TESTE DE BATERIA DIGITAL COM IMPRESSÃO (DT-TBD02) Delta",
    "slug": "teste-de-bateria-digital-com-impressao-dt-tbd02-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-de-bateria-digital-com-i-2b553e52f6d3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-de-bateria-digital-com-i-2615ca42e4d0.webp"
    ],
    "altText": "TESTE DE BATERIA DIGITAL COM IMPRESSÃO (DT-TBD02) Delta Athena Soluções Automotivas",
    "description": "Ideal para medir com rapidez e precisão a capacidade real da corrente (Amperes), assim como o estado de saúde da bateria. Adota atualmente a tecnologia de teste de condutância mais avançada",
    "specs": [
      "Idioma: Português",
      "Funções: Estado de Saúde (%); Estado de Carga (%);",
      "Código: DT-TBD02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tbd01",
    "name": "TESTE DE BATERIA DIGITAL (DT-TBD01) Delta",
    "slug": "teste-de-bateria-digital-dt-tbd01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-de-bateria-digital-dt-tb-521899033636.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-de-bateria-digital-dt-tb-1cd3a1059a68.webp"
    ],
    "altText": "TESTE DE BATERIA DIGITAL (DT-TBD01) Delta Athena Soluções Automotivas",
    "description": "Ideal para medir com rapidez e precisão a capacidade real da corrente (Amperes), assim como o estado de saúde da bateria. Adota atualmente a tecnologia de teste de condutância mais avançada do mundo. Estado de Saúde (%); Estado de Carga (%);",
    "specs": [
      "Idioma: Português",
      "Código: DT-TBD01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-esc01",
    "name": "FABRICADO COM ALTA QUALIDADE (DT-ESC01) Delta",
    "slug": "fabricado-com-alta-qualidade-dt-esc01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/fabricado-com-alta-qualidade-d-f161d1cec14d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/fabricado-com-alta-qualidade-d-8dfce6662bac.webp"
    ],
    "altText": "FABRICADO COM ALTA QUALIDADE (DT-ESC01) Delta Athena Soluções Automotivas",
    "description": "14 x 14mm escareador plano 17 x 17mm escareador plano",
    "specs": [
      "Medidas:",
      "15 x 19mm escareador plano",
      "Código: DT-ESC01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mpb01",
    "name": "MEDIDOR DE PRESSÃO DA BOMBA DE COMBUSTÍVEL (DT-MPB01) Delta",
    "slug": "medidor-de-pressao-da-bomba-de-combustivel-dt-mpb01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-pressao-da-bomba-de-ca4f606dfdd0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-pressao-da-bomba-de-5e6e82059a0e.webp"
    ],
    "altText": "MEDIDOR DE PRESSÃO DA BOMBA DE COMBUSTÍVEL (DT-MPB01) Delta Athena Soluções Automotivas",
    "description": "COM 17 MANGUEIRAS Manômetro de pressão da bomba de combustível com sistema anti-vibração desenvolvido com a ﬁnalidade de auxiliar o reparador automotivo testar a bomba elétrica do veículo.",
    "specs": [
      "Manômetro 14 BAR com borracha.",
      "Jogo de mangueiras contendo 17 mangueiras (sendo 2 no corpo",
      "Código: DT-MPB01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac01",
    "name": "KIT ADAPATADOR PARA MAQUINAS DE LIMPEZA DE (DT-SAC01) Delta",
    "slug": "kit-adapatador-para-maquinas-de-limpeza-de-dt-sac01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-adapatador-para-maquinas-d-7db8ab97682b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-adapatador-para-maquinas-d-76416abcfb4c.webp"
    ],
    "altText": "KIT ADAPATADOR PARA MAQUINAS DE LIMPEZA DE (DT-SAC01) Delta Athena Soluções Automotivas",
    "description": "BICOS PARA CARROS IMPORTADOS (4PÇS) GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-SAC01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ada01",
    "name": "As características dos produtos podem sofrer alterações sem prévio aviso (DT-ADA01) Delta",
    "slug": "as-caracteristicas-dos-produtos-podem-sofrer-alteracoes-sem-previo-aviso-dt-ada01-delta",
    "categoryId": "cat_scanners",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/as-caracteristicas-dos-produto-87b7fe36fc51.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/as-caracteristicas-dos-produto-29fe09e126f8.webp"
    ],
    "altText": "As características dos produtos podem sofrer alterações sem prévio aviso (DT-ADA01) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-ADA01.",
    "specs": [
      "Código de Referência: DT-ADA01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_ali06",
    "name": "Ferramenta Especial ALI06 Delta",
    "slug": "ferramenta-especial-ali06-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-ali06-delt-9c1c4f59f7d1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-ali06-delt-4e2ad0692d3c.webp"
    ],
    "altText": "Ferramenta Especial ALI06 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo ALI06.",
    "specs": [
      "Código de Referência: ALI06",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_sac14",
    "name": "KIT DE FERRAMENTAS COM CABO PARA EXTRAIR (SAC14) Delta",
    "slug": "kit-de-ferramentas-com-cabo-para-extrair-sac14-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-com-cabo-pa-b2204e489890.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-com-cabo-pa-b5ce519df372.webp"
    ],
    "altText": "KIT DE FERRAMENTAS COM CABO PARA EXTRAIR (SAC14) Delta Athena Soluções Automotivas",
    "description": "TERMINAIS DE CONECTORES AUTOMOTIVO 23 PÇS GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE Kit proﬁssional de alta qualidade para remover a maior parte dos terminais de conectores automotivos. O cabo de borracha proporciona excelente",
    "specs": [
      "Código de Referência: SAC14",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_sac15",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (SAC15) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-sac15-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-5c72ff4be426.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-01394cad33d2.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (SAC15) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE Kit fabricado em aço e plástico resistente. Adequado para a maioria dos terminais de conectores automotivos. KIT DE FERRAMENTAS PARA EXTRAIR TERMINAIS DE CONECTORES AUTOMOTIVOS 18 PÇS",
    "specs": [
      "Código de Referência: SAC15",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-lpb01",
    "name": "Ferramenta Especial DT-LPB01 Delta",
    "slug": "ferramenta-especial-dt-lpb01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-lpb01-d-9421f561f588.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-lpb01-d-528220f15e74.webp"
    ],
    "altText": "Ferramenta Especial DT-LPB01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-LPB01.",
    "specs": [
      "Código de Referência: DT-LPB01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_can-01",
    "name": "Ferramenta Especial CAN-01 Delta",
    "slug": "ferramenta-especial-can-01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-can-01-del-3383300ac11f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-can-01-del-c4672b52f393.webp"
    ],
    "altText": "Ferramenta Especial CAN-01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo CAN-01.",
    "specs": [
      "Código de Referência: CAN-01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_jep-01",
    "name": "Ferramenta Especial JEP-01 Delta",
    "slug": "ferramenta-especial-jep-01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-jep-01-del-14f746340711.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-jep-01-del-53ad37b31f45.webp"
    ],
    "altText": "Ferramenta Especial JEP-01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo JEP-01.",
    "specs": [
      "Código de Referência: JEP-01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_fra-01",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (FRA-01) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-fra-01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-a4024ee80496.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-e7964eb3c7a7.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (FRA-01) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: FRA-01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sso02",
    "name": "JOGO DE SOQUETES PARA SENSOR DE OXIGÊNIO (DT-SSO02) Delta",
    "slug": "jogo-de-soquetes-para-sensor-de-oxigenio-dt-sso02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-soquetes-para-sensor-d-47ff8d5b34cf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-soquetes-para-sensor-d-dcf7f9ee2034.webp"
    ],
    "altText": "JOGO DE SOQUETES PARA SENSOR DE OXIGÊNIO (DT-SSO02) Delta Athena Soluções Automotivas",
    "description": "COM 7 PEÇAS Kit de ferramentas especiais, tipo soquetes, para sonda lambda. estojo para acomodação dos soquetes. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Acompanha:",
      "Código: DT-SSO02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sso03",
    "name": "JOGO DE SOQUETES PARA SENSOR DE OXIGÊNIO (DT-SSO03) Delta",
    "slug": "jogo-de-soquetes-para-sensor-de-oxigenio-dt-sso03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-soquetes-para-sensor-d-cfe03a1cfef1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-soquetes-para-sensor-d-363061422f5c.webp"
    ],
    "altText": "JOGO DE SOQUETES PARA SENSOR DE OXIGÊNIO (DT-SSO03) Delta Athena Soluções Automotivas",
    "description": "COM 10 PEÇAS Kit de ferramentas especiais, tipo soquetes, para sonda lambda. Ideal para remover sensores de oxigênio, injetores e outros sensores automotivos. estojo para acomodação dos soquetes.",
    "specs": [
      "Acompanha:",
      "Código: DT-SSO03",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sso04",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SSO04) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sso04-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-e70586c9e456.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-82535445ccc2.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SSO04) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE SOQUETE PARA SENSOR DE OXIGÊNIO (SONDA LAMBDA) Ferramenta especial, tipo soquete, para sonda lambda. Modelo curto.",
    "specs": [
      "Encaixe 1/2'’  Medida: 22mm",
      "Código: DT-SSO04",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sso01",
    "name": "07 (DT-SSO01) Delta",
    "slug": "07-dt-sso01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/07-dt-sso01-delta-f7f1df083393.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/07-dt-sso01-delta-galeria-1-52e271138ebe.webp"
    ],
    "altText": "07 (DT-SSO01) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SSO01.",
    "specs": [
      "Código de Referência: DT-SSO01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac08",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC08) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac08-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-882ec50b25cc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-5f6b7a68c2c4.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC08) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE KIT EXTRATOR PARA INJETORES DIESEL 40 PÇS O kit vem com vários adaptadores e extratores para injetores diesel. Fabricado em aço carbono de alta qualidade, para uma longa vida útil no uso diário da oﬁcina.",
    "specs": [
      "Código de Referência: DT-SAC08",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac07",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC07) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac07-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-7116613d248b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-1f40807d459c.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC07) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-SAC07",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sfb01",
    "name": "Ferramenta Especial DT-SFB01 Delta",
    "slug": "ferramenta-especial-dt-sfb01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sfb01-d-ad72a55ed8e3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sfb01-d-ff2d2ebe8317.webp"
    ],
    "altText": "Ferramenta Especial DT-SFB01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SFB01.",
    "specs": [
      "Código de Referência: DT-SFB01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac02",
    "name": "08 (DT-SAC02) Delta",
    "slug": "08-dt-sac02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/08-dt-sac02-delta-f71187aa0d5b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/08-dt-sac02-delta-galeria-1-2ed3c280dcdb.webp"
    ],
    "altText": "08 (DT-SAC02) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SAC02.",
    "specs": [
      "Código de Referência: DT-SAC02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali08",
    "name": "Ferramenta Especial DT-ALI08 Delta",
    "slug": "ferramenta-especial-dt-ali08-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali08-d-6c953880f781.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali08-d-b35b62a94868.webp"
    ],
    "altText": "Ferramenta Especial DT-ALI08 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-ALI08.",
    "specs": [
      "Código de Referência: DT-ALI08",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali09",
    "name": "Ferramenta Especial DT-ALI09 Delta",
    "slug": "ferramenta-especial-dt-ali09-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali09-d-6b83053b5d29.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali09-d-bbdbd8b5b54a.webp"
    ],
    "altText": "Ferramenta Especial DT-ALI09 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-ALI09.",
    "specs": [
      "Código de Referência: DT-ALI09",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fsm05",
    "name": "Aplicação: Motores N20 e N26 (DT-FSM05) Delta",
    "slug": "aplicacao-motores-n20-e-n26-dt-fsm05-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/aplicacao-motores-n20-e-n26-dt-d6cb7d3eb48e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/aplicacao-motores-n20-e-n26-dt-a0b19c62f958.webp"
    ],
    "altText": "Aplicação: Motores N20 e N26 (DT-FSM05) Delta Athena Soluções Automotivas",
    "description": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-FSM05",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fun01",
    "name": "FUNIL UNIVERSAL PARA ÓLEO DO MOTOR (DT-FUN01) Delta",
    "slug": "funil-universal-para-oleo-do-motor-dt-fun01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/funil-universal-para-oleo-do-m-d26b08292ea4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/funil-universal-para-oleo-do-m-697322a8a58e.webp"
    ],
    "altText": "FUNIL UNIVERSAL PARA ÓLEO DO MOTOR (DT-FUN01) Delta Athena Soluções Automotivas",
    "description": "da passagem do óleo. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Uso universal em todos os veículos;",
      "Grampo ajustável ao tamanho do orifício;",
      "Parte inferior do funil transparente, facilitando a visualização",
      "Material: plástico super resistente",
      "Código: DT-FUN01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fun02",
    "name": "KIT UNIVERSAL COM FUNIL E ACESSÓRIOS PARA (DT-FUN02) Delta",
    "slug": "kit-universal-com-funil-e-acessorios-para-dt-fun02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-universal-com-funil-e-aces-2b87938e5989.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-universal-com-funil-e-aces-d5b58f4ee3a7.webp"
    ],
    "altText": "KIT UNIVERSAL COM FUNIL E ACESSÓRIOS PARA (DT-FUN02) Delta Athena Soluções Automotivas",
    "description": "SISTEMA DE ARREFECIMENTO e a manutenção do sistema de arrefecimento. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Ideal para carros asiáticos, facilitando retirada de ar, abastecimento",
      "Código: DT-FUN02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac18",
    "name": "Ferramenta Especial DT-SAC18 Delta",
    "slug": "ferramenta-especial-dt-sac18-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac18-d-25e180f25bdd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac18-d-f46a671e4c58.webp"
    ],
    "altText": "Ferramenta Especial DT-SAC18 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SAC18.",
    "specs": [
      "Código de Referência: DT-SAC18",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac19",
    "name": "FERRAMENTA PARA DESACOPLAR UNIDADE (DT-SAC19) Delta",
    "slug": "ferramenta-para-desacoplar-unidade-dt-sac19-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-desacoplar-uni-6b1782cb8e7c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-desacoplar-uni-81d402a64489.webp"
    ],
    "altText": "FERRAMENTA PARA DESACOPLAR UNIDADE (DT-SAC19) Delta Athena Soluções Automotivas",
    "description": "MECATRÔNICA NO CÂMBIO DSG Facilita o trabalho durante a desmontagem e montagem da unidade mecatrônica da caixa de transmissão automática. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-SAC19",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tjc01",
    "name": "TESTE DA JUNTA DE CABEÇOTE (DT-TJC01) Delta",
    "slug": "teste-da-junta-de-cabecote-dt-tjc01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-da-junta-de-cabecote-dt--805c6e7f647e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-da-junta-de-cabecote-dt--5c3823092e13.webp"
    ],
    "altText": "TESTE DA JUNTA DE CABEÇOTE (DT-TJC01) Delta Athena Soluções Automotivas",
    "description": "Equipamento utilizado para detectar a presença de gases de escape no sistema de arrefecimento do motor, de forma rápida e eﬁcaz, normalmente causados por uma junta de cabeçote queimada, cabeçote e bloco do motor rachado. Sua ponteira em formato cônico permite que atenda uma gama bastante vasta de veículos, será acoplado no reservatório de",
    "specs": [
      "Código de Referência: DT-TJC01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali02",
    "name": "Ferramenta Especial DT-ALI02 Delta",
    "slug": "ferramenta-especial-dt-ali02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali02-d-e37236397f24.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ali02-d-806b78cee2bb.webp"
    ],
    "altText": "Ferramenta Especial DT-ALI02 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-ALI02.",
    "specs": [
      "Código de Referência: DT-ALI02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali03",
    "name": "JOGO DE ALICATES PARA REMOÇÃO DE (DT-ALI03) Delta",
    "slug": "jogo-de-alicates-para-remocao-de-dt-ali03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-alicates-para-remocao--b01f5c78e660.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-alicates-para-remocao--042c662a73cc.webp"
    ],
    "altText": "JOGO DE ALICATES PARA REMOÇÃO DE (DT-ALI03) Delta Athena Soluções Automotivas",
    "description": "MANGUEIRAS DE ÁGUA, ÓLEO, COMBUSTÍVEL, COM 9 PEÇAS Conjunto proﬁssional de alta qualidade; Apresenta alicates indicados para a maioria das abraçadeiras que",
    "specs": [
      "Código de Referência: DT-ALI03",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali04",
    "name": "•É conhecido também como anéis de segmento, onde são montados (DT-ALI04) Delta",
    "slug": "e-conhecido-tambem-como-aneis-de-segmento-onde-sao-montados-dt-ali04-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/e-conhecido-tambem-como-aneis--e375aea235c9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/e-conhecido-tambem-como-aneis--b24dd4b62967.webp"
    ],
    "altText": "•É conhecido também como anéis de segmento, onde são montados (DT-ALI04) Delta Athena Soluções Automotivas",
    "description": "nos sulcos ao redor do pistão; Fabricação em ótima qualidade; GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Capacidade: 40100mm",
      "Código: DT-ALI04",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-bfm01",
    "name": "•Design arrojado e altamente revolucionário; (DT-BFM01) Delta",
    "slug": "design-arrojado-e-altamente-revolucionario-dt-bfm01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/design-arrojado-e-altamente-re-323c3d0db279.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/design-arrojado-e-altamente-re-71047be16fa0.webp"
    ],
    "altText": "•Design arrojado e altamente revolucionário; (DT-BFM01) Delta Athena Soluções Automotivas",
    "description": "Capacidade para 10 litros de extração de vários tipos de líquido e óleo de motor de automóveis, caminhões, ônibus e para linha náutica; Fácil de operar e transportar;",
    "specs": [
      "Operação: manual ou pneumática;",
      "Código: DT-BFM01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-bft01",
    "name": "Ferramenta Especial DT-BFT01 Delta",
    "slug": "ferramenta-especial-dt-bft01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-bft01-d-c4348b21b567.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-bft01-d-aa016939db42.webp"
    ],
    "altText": "Ferramenta Especial DT-BFT01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-BFT01.",
    "specs": [
      "Código de Referência: DT-BFT01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ali05",
    "name": "•É conhecido também como anéis de segmento, onde são montados (DT-ALI05) Delta",
    "slug": "e-conhecido-tambem-como-aneis-de-segmento-onde-sao-montados-dt-ali05-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/e-conhecido-tambem-como-aneis--2dc6f005b803.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/e-conhecido-tambem-como-aneis--5a1abd12d895.webp"
    ],
    "altText": "•É conhecido também como anéis de segmento, onde são montados (DT-ALI05) Delta Athena Soluções Automotivas",
    "description": "nos sulcos ao redor do pistão; Fabricação em ótima qualidade; GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Capacidade: 80120mm",
      "Código: DT-ALI05",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-bvm01",
    "name": "BOMBA MANUAL DE PRESSÃO E VÁCUO (DT-BVM01) Delta",
    "slug": "bomba-manual-de-pressao-e-vacuo-dt-bvm01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/bomba-manual-de-pressao-e-vacu-9dbc942a6103.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/bomba-manual-de-pressao-e-vacu-23adf3ac6f80.webp"
    ],
    "altText": "BOMBA MANUAL DE PRESSÃO E VÁCUO (DT-BVM01) Delta Athena Soluções Automotivas",
    "description": "Utilizada para testar uma grande variedade de conﬁgurações e operações essenciais no veículo. Possui gatilho e acabamento resistente. Veriﬁca tubulações do sistema de freio e de combustível; Veriﬁca ar falso, avanço à vácuo no carburador;",
    "specs": [
      "Código de Referência: DT-BVM01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-cma01",
    "name": "KIT DE FERRAMENTAS PARA COMPRESSÃO DE MOLAS (DT-CMA01) Delta",
    "slug": "kit-de-ferramentas-para-compressao-de-molas-dt-cma01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-compre-433197f5afc2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-compre-80da2353dfa1.webp"
    ],
    "altText": "KIT DE FERRAMENTAS PARA COMPRESSÃO DE MOLAS (DT-CMA01) Delta Athena Soluções Automotivas",
    "description": "Ferramentas para compressão de molas universal. Fabricado em Aço especial de alta qualidade; Produto em excelente acabamento, evitando que as molas se curvem; Capacidade 1.000 kg;",
    "specs": [
      "Código de Referência: DT-CMA01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mcd01",
    "name": "Ferramenta Especial DT-MCD01 Delta",
    "slug": "ferramenta-especial-dt-mcd01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mcd01-d-0f5285fb3d42.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mcd01-d-0bf977a186cd.webp"
    ],
    "altText": "Ferramenta Especial DT-MCD01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MCD01.",
    "specs": [
      "Código de Referência: DT-MCD01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-cin",
    "name": "MEDIDOR DE COMPRESSÃO DE CILINDRO (DT-CIN) Delta",
    "slug": "medidor-de-compressao-de-cilindro-dt-cin-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-compressao-de-cilin-1001434a3202.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-compressao-de-cilin-fe27c5e54997.webp"
    ],
    "altText": "MEDIDOR DE COMPRESSÃO DE CILINDRO (DT-CIN) Delta Athena Soluções Automotivas",
    "description": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE MEDIDOR DE COMPRESSÃO DE CILINDRO LINHA DIESEL COM 17 PEÇAS Jogo de ferramentas para medir a compressão de cilindro",
    "specs": [
      "Código de Referência: DT-CIN",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mcc01",
    "name": "Ferramenta Especial DT-MCC01 Delta",
    "slug": "ferramenta-especial-dt-mcc01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mcc01-d-c0ce8f4d64ee.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mcc01-d-858d03eb0c39.webp"
    ],
    "altText": "Ferramenta Especial DT-MCC01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MCC01.",
    "specs": [
      "Código de Referência: DT-MCC01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mpo01",
    "name": "O jogo mais completo do mercado, serve também para medir pressão (DT-MPO01) Delta",
    "slug": "o-jogo-mais-completo-do-mercado-serve-tambem-para-medir-pressao-dt-mpo01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/o-jogo-mais-completo-do-mercad-d7a2e6ed5665.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/o-jogo-mais-completo-do-mercad-69150c8c241c.webp"
    ],
    "altText": "O jogo mais completo do mercado, serve também para medir pressão (DT-MPO01) Delta Athena Soluções Automotivas",
    "description": "da bomba de óleo do câmbio automático. Jogo de ferramentas para analisar as condições da bomba de óleo do motor. Atende LINHA LEVE e PESADA. manômetro de 0 a 28 BAR ou 0 a 400 PSI, 11 adaptadores, manual de instruções, maleta para acomodação.",
    "specs": [
      "Acompanha:",
      "Código: DT-MPO01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mvc01",
    "name": "MEDIDOR DE VAZÃO DE CILINDRO DO MOTOR (DT-MVC01) Delta",
    "slug": "medidor-de-vazao-de-cilindro-do-motor-dt-mvc01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-vazao-de-cilindro-d-f2a5ce8e143d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/medidor-de-vazao-de-cilindro-d-3f589356cd5a.webp"
    ],
    "altText": "MEDIDOR DE VAZÃO DE CILINDRO DO MOTOR (DT-MVC01) Delta Athena Soluções Automotivas",
    "description": "Equipamento ideal para medir vazão de cilindro de motores da linha leve. Veriﬁca perda de ar comprimido no cilindro diagnosticando sede de válvulas, juntas e cabeçotes, folga em pistões, anéis e cilindros.",
    "specs": [
      "Acompanha:",
      "Código: DT-MVC01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac06",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC06) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac06-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-002a98075452.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-37d8f4c854ca.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC06) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE FERRAMENTA PARA SACAR O BUJÃO DO ÓLEO DO CÁRTER DE PLÁSTICO AUDI, WV Fabricado em material resistente e de alta durabilidade. Audi A1, A3, A4, A5, A6, A7, Q3, Q5, Q7, TT, TTS,",
    "specs": [
      "Aplicação:",
      "Código: DT-SAC06",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac03",
    "name": "JOGO DE EXTRATOR PARA ROLAMENTOS (DT-SAC03) Delta",
    "slug": "jogo-de-extrator-para-rolamentos-dt-sac03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-extrator-para-rolament-f4e9ea70edbb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-extrator-para-rolament-a14cefcc0160.webp"
    ],
    "altText": "JOGO DE EXTRATOR PARA ROLAMENTOS (DT-SAC03) Delta Athena Soluções Automotivas",
    "description": "Jogo ideal para a utilização em alternadores/Câmbio. Possui também a função de saca pista de rolamentos de cubo de roda 2 extratores de diâmetro externo medindo 30mm - 50 mm e",
    "specs": [
      "dianteira (Ex: GMCorsa).",
      "Acompanha:",
      "Código: DT-SAC03",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac05",
    "name": "EXTRATOR DO TERMINAL DE DIREÇÃO UNIVERSAL (DT-SAC05) Delta",
    "slug": "extrator-do-terminal-de-direcao-universal-dt-sac05-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/extrator-do-terminal-de-direca-e21e8d1ac074.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/extrator-do-terminal-de-direca-cb8cedbe3789.webp"
    ],
    "altText": "EXTRATOR DO TERMINAL DE DIREÇÃO UNIVERSAL (DT-SAC05) Delta Athena Soluções Automotivas",
    "description": "Extrator do terminal de direção. Uso universal; Fabricação em aço forjado com excelente acabamento. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Código de Referência: DT-SAC05",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rep01",
    "name": "JOGO DE FERRAMENTAS PARA REPARO (DT-REP01) Delta",
    "slug": "jogo-de-ferramentas-para-reparo-dt-rep01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-ferramentas-para-repar-47ad3a30da77.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-ferramentas-para-repar-76c87bce13ac.webp"
    ],
    "altText": "JOGO DE FERRAMENTAS PARA REPARO (DT-REP01) Delta Athena Soluções Automotivas",
    "description": "DE ROSCAS DO CÁRTER COM 120 PEÇAS Ideal para reparar roscas do cárter de óleo. É muito comum durante as trocas de óleo que a rosca do cárter acabe se daniﬁcando, com este jogo você pode recuperar a rosca e efetuar a substituição do parafuso evitando a troca de peças. Fabricado com a mais alta qualidade de aço.",
    "specs": [
      "Código de Referência: DT-REP01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sfo01",
    "name": "JOGO DE SACA FILTRO DE ÓLEO COM (DT-SFO01) Delta",
    "slug": "jogo-de-saca-filtro-de-oleo-com-dt-sfo01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-saca-filtro-de-oleo-co-a1427ccb5d9e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-saca-filtro-de-oleo-co-ed741d6fef12.webp"
    ],
    "altText": "JOGO DE SACA FILTRO DE ÓLEO COM (DT-SFO01) Delta Athena Soluções Automotivas",
    "description": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-SFO01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sfo02",
    "name": "Ferramenta Especial DT-SFO02 Delta",
    "slug": "ferramenta-especial-dt-sfo02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sfo02-d-e79401546f1a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sfo02-d-ffd9db0a813f.webp"
    ],
    "altText": "Ferramenta Especial DT-SFO02 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SFO02.",
    "specs": [
      "Código de Referência: DT-SFO02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-vac01",
    "name": "GERADOR DE VÁCUO PARA SISTEMA DE (DT-VAC01) Delta",
    "slug": "gerador-de-vacuo-para-sistema-de-dt-vac01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/gerador-de-vacuo-para-sistema--31a68f48f292.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/gerador-de-vacuo-para-sistema--ba5f97240145.webp"
    ],
    "altText": "GERADOR DE VÁCUO PARA SISTEMA DE (DT-VAC01) Delta Athena Soluções Automotivas",
    "description": "ARREFECIMENTO Ideal para retirar o ar do sistema de arrefecimento. Retira e coloca o líquido de arrefecimento com facilidade sem entrar ar no sistema. Ideal para veículos com 2 válvulas termostáticas e para auxiliar na troca de bomba d’água.",
    "specs": [
      "Código de Referência: DT-VAC01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac09",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC09) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac09-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-09c39cf68270.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-feff8a6b3bbd.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC09) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE KIT EXTRATOR PARA TRANSMISSÃO DE EMBREAGEM Conjunto de ferramentas para desmontar o sistema de dupla embreagem do cambio DSG-7 velocidades - Audi TSFI / Jetta / Golf / Tiguan / Passat 2.0 TSI",
    "specs": [
      "Código de Referência: DT-SAC09",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac10",
    "name": "Ferramenta Especial DT-SAC10 Delta",
    "slug": "ferramenta-especial-dt-sac10-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac10-d-df5e30e453f8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac10-d-628e9efff95c.webp"
    ],
    "altText": "Ferramenta Especial DT-SAC10 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SAC10.",
    "specs": [
      "Código de Referência: DT-SAC10",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fsm02",
    "name": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM02) Delta",
    "slug": "kit-de-ferramentas-para-sincronismo-dos-dt-fsm02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-ea0c29ce697b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-299fa0a20aa2.webp"
    ],
    "altText": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM02) Delta Athena Soluções Automotivas",
    "description": "MOTORES MINI COOPER GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Aplicação: BMW, MINI, Citroen, Peugeot, Motores THP",
      "Código: DT-FSM02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fsm03",
    "name": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM03) Delta",
    "slug": "kit-de-ferramentas-para-sincronismo-dos-dt-fsm03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-71588aefccf9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-80b93d21d1b1.webp"
    ],
    "altText": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM03) Delta Athena Soluções Automotivas",
    "description": "MOTORES BMW 2.5 E 3.0 6 CILINDROS GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Aplicação: Motores N51 / N52 / N52K / N55 / N53 / N54 Aspirado",
      "Código: DT-FSM03",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fsm04",
    "name": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM04) Delta",
    "slug": "kit-de-ferramentas-para-sincronismo-dos-dt-fsm04-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-cb81ea4aff3b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-de-ferramentas-para-sincro-2504b04265d9.webp"
    ],
    "altText": "KIT DE FERRAMENTAS PARA SINCRONISMO DOS (DT-FSM04) Delta Athena Soluções Automotivas",
    "description": "MOTORES LAND TOVER GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-FSM04",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-trf01",
    "name": "20 (DT-TRF01) Delta",
    "slug": "20-dt-trf01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/20-dt-trf01-delta-de565fac6193.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/20-dt-trf01-delta-galeria-1-2fc00e7d08f7.webp"
    ],
    "altText": "20 (DT-TRF01) Delta Athena Soluções Automotivas",
    "description": "Sedona (motor K V6 2.5 - Correia)",
    "specs": [
      "Aplicação: Land Rover Freelander 1 (19992005) / KIA carnival e",
      "Código: DT-TRF01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fsm01",
    "name": "Ferramenta Especial DT-FSM01 Delta",
    "slug": "ferramenta-especial-dt-fsm01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fsm01-d-4d6944bf3ae1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fsm01-d-8ff243bc84c0.webp"
    ],
    "altText": "Ferramenta Especial DT-FSM01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-FSM01.",
    "specs": [
      "Código de Referência: DT-FSM01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mft01",
    "name": "MÁQUINA PARA TROCA DE FLUÍDO DA (DT-MFT01) Delta",
    "slug": "maquina-para-troca-de-fluido-da-dt-mft01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquina-para-troca-de-fluido-d-a2626c9388af.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquina-para-troca-de-fluido-d-ec175563c82f.webp"
    ],
    "altText": "MÁQUINA PARA TROCA DE FLUÍDO DA (DT-MFT01) Delta Athena Soluções Automotivas",
    "description": "TRANSMISSÃO AUTOMÁTICA 220V (NACIONAL) A máquina DT-MFT01 é a mais nova tecnologia para troca de ﬂuído da transmissão automática de veículos. Seus tanques transparentes permitem facilmente visualizar a coloração e quantidade do ﬂuído de entrada e saída. Possui iluminação.",
    "specs": [
      "Código de Referência: DT-MFT01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mft02",
    "name": "sem aquecimento (DT-MFT02) Delta",
    "slug": "sem-aquecimento-dt-mft02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sem-aquecimento-dt-mft02-delta-9eb2978a6efd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sem-aquecimento-dt-mft02-delta-2fcd5a2e3a76.webp"
    ],
    "altText": "sem aquecimento (DT-MFT02) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MFT02.",
    "specs": [
      "Código de Referência: DT-MFT02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fpc-01",
    "name": "Ferramenta Especial DT-FPC-01 Delta",
    "slug": "ferramenta-especial-dt-fpc-01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fpc-01--e0b81066cd7c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fpc-01--a2de62fa14e0.webp"
    ],
    "altText": "Ferramenta Especial DT-FPC-01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-FPC-01.",
    "specs": [
      "Código de Referência: DT-FPC-01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac13",
    "name": "Ferramenta Especial DT-SAC13 Delta",
    "slug": "ferramenta-especial-dt-sac13-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac13-d-235b5c0c6924.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac13-d-48ab3ecc0d05.webp"
    ],
    "altText": "Ferramenta Especial DT-SAC13 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SAC13.",
    "specs": [
      "Código de Referência: DT-SAC13",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac16",
    "name": "FERRAMENTA PNEUMÁTICA PARA INSTALAR (DT-SAC16) Delta",
    "slug": "ferramenta-pneumatica-para-instalar-dt-sac16-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-pneumatica-para-ins-0a46607dbd89.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-pneumatica-para-ins-f492e290002b.webp"
    ],
    "altText": "FERRAMENTA PNEUMÁTICA PARA INSTALAR (DT-SAC16) Delta Athena Soluções Automotivas",
    "description": "COIFA AUTOMOTIVA Equipamento que facilita a troca da coifa, evitando a desmontagem do semi eixo sem daniﬁcar o componente e a homocinética. APLICAR SOMENTE COIFA ELASTICA. KIT PARA EXTRAIR E INSTALAR RETENTORES AUTOMOTIVOS COM 20 PEÇAS",
    "specs": [
      "Código de Referência: DT-SAC16",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac11",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC11) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac11-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-ddd0ae7cafac.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-3e2b946a0e7d.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC11) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE JOGO DE SACA ROLAMENTOS INTERNO COM MARRETA DINÂMICA 10 PÇS Fabricado em aço de alta qualidade. Facilita a retirada de rolamentos interno fazendo tração. Jogo completo com marreta deslizante. Ideal para rolamentos de 8 a 32mm (diâmetro interno).",
    "specs": [
      "Código de Referência: DT-SAC11",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tor01",
    "name": "TORQUÍMETRO DE VARETA (DT-TOR01) Delta",
    "slug": "torquimetro-de-vareta-dt-tor01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/torquimetro-de-vareta-dt-tor01-2cbab3dbdef5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/torquimetro-de-vareta-dt-tor01-97c2dbf5982f.webp"
    ],
    "altText": "TORQUÍMETRO DE VARETA (DT-TOR01) Delta Athena Soluções Automotivas",
    "description": "0-300Nm (0-30kg) Aço Cromo Vanádio GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO",
    "specs": [
      "Encaixe: 1/2'’",
      "Capacidade do torque:",
      "Material:",
      "Código: DT-TOR01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-est01",
    "name": "ESTETOSCÓPIO AUTOMOTIVO (DT-EST01) Delta",
    "slug": "estetoscopio-automotivo-dt-est01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/estetoscopio-automotivo-dt-est-8a2fac7c60d4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/estetoscopio-automotivo-dt-est-821cc57efa6a.webp"
    ],
    "altText": "ESTETOSCÓPIO AUTOMOTIVO (DT-EST01) Delta Athena Soluções Automotivas",
    "description": "O estetoscópio é muito utilizado para localizar com precisão ruídos haste prolongadora. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "em: motores, rolamentos, tencionadores, etc.",
      "Código: DT-EST01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ftp01",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-FTP01) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-ftp01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-eebeace8dfb2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-daf60bb0a10b.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-FTP01) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE KIT DE FERRAMENTAS PARA TRAVAR POLIAS Utilizado para travar diversos tipos de polias. Ferramenta de alta qualidade e durabilidade.",
    "specs": [
      "Código de Referência: DT-FTP01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac12",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC12) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac12-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-6183dbb9d947.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-e33104e945f6.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC12) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-SAC12",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac-17",
    "name": "Ferramenta Especial DT-SAC-17 Delta",
    "slug": "ferramenta-especial-dt-sac-17-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac-17--83d8f240edcc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-sac-17--4e9a3214494a.webp"
    ],
    "altText": "Ferramenta Especial DT-SAC-17 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-SAC-17.",
    "specs": [
      "Código de Referência: DT-SAC-17",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mat01",
    "name": "Fabricado em aço de alta qualidade. (DT-MAT01) Delta",
    "slug": "fabricado-em-aco-de-alta-qualidade-dt-mat01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/fabricado-em-aco-de-alta-quali-2934760dfe83.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/fabricado-em-aco-de-alta-quali-0759018357aa.webp"
    ],
    "altText": "Fabricado em aço de alta qualidade. (DT-MAT01) Delta Athena Soluções Automotivas",
    "description": "Realiza o trabalho com menor esforço e maior segurança. MEDIDOR ANGULAR DE TORQUE",
    "specs": [
      "Contém 9 Garras:",
      "3 Garras 4\"",
      "3 Garras 6\"",
      "3Garras 8\"",
      "Código: DT-MAT01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-cma02",
    "name": "FERRAMENTA PARA COMPRESSÃO DE MOLAS (DT-CMA02) Delta",
    "slug": "ferramenta-para-compressao-de-molas-dt-cma02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-compressao-de--a3cc814819b7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-compressao-de--557731f84bdf.webp"
    ],
    "altText": "FERRAMENTA PARA COMPRESSÃO DE MOLAS (DT-CMA02) Delta Athena Soluções Automotivas",
    "description": "O encolhedor ou compressor para molas é ideal para instalar ou remover molas de veículos. Possui encaixe quadrado de 1/2\" e abertura de até 370mm aproximadamente. Fabricado em aço carbono de qualidade, oferecendo maior resistência e durabilidade. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-CMA02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-jsq01",
    "name": "Ferramenta Especial DT-JSQ01 Delta",
    "slug": "ferramenta-especial-dt-jsq01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-jsq01-d-2165e65306c2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-jsq01-d-df32099799f5.webp"
    ],
    "altText": "Ferramenta Especial DT-JSQ01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-JSQ01.",
    "specs": [
      "Código de Referência: DT-JSQ01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rel01",
    "name": "RELÓGIO COMPARADOR (DT-REL01) Delta",
    "slug": "relogio-comparador-dt-rel01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/relogio-comparador-dt-rel01-de-59ebe86260b8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/relogio-comparador-dt-rel01-de-a0c2bfe38e9d.webp"
    ],
    "altText": "RELÓGIO COMPARADOR (DT-REL01) Delta Athena Soluções Automotivas",
    "description": "Relógio comparador 0 a 10mm em aluminio com graduação de 0,01mm. Produto de ótima qualidade.",
    "specs": [
      "Especiﬁcações técnicas:",
      "Capacidade 01 a 10mm",
      "Diâmetro do mostrador 58mm",
      "Graduação 0,01mm",
      "Código: DT-REL01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tsa01",
    "name": "TESTE PARA SISTEMA DE ARREFECIMENTO (DT-TSA01) Delta",
    "slug": "teste-para-sistema-de-arrefecimento-dt-tsa01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-para-sistema-de-arrefeci-5174d33af44a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/teste-para-sistema-de-arrefeci-6ab98e400f63.webp"
    ],
    "altText": "TESTE PARA SISTEMA DE ARREFECIMENTO (DT-TSA01) Delta Athena Soluções Automotivas",
    "description": "Testa o radiador e a tampa do reservatório, analisando todo o sistema de arrefecimento. NÃO NECESSITA DE TAMPAS. O teste é feito através da conexão do reservatório com o radiador pela mangueira do retorno. Manômetro de 2,5 Bar.",
    "specs": [
      "Código de Referência: DT-TSA01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fpf03",
    "name": "JOGO DE FERRAMENTAS PARA AJUSTE E REPARO (DT-FPF03) Delta",
    "slug": "jogo-de-ferramentas-para-ajuste-e-reparo-dt-fpf03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-ferramentas-para-ajust-7cf10ac8163e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-de-ferramentas-para-ajust-72fce39bd9d2.webp"
    ],
    "altText": "JOGO DE FERRAMENTAS PARA AJUSTE E REPARO (DT-FPF03) Delta Athena Soluções Automotivas",
    "description": "NO SISTEMA DE FREIO GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Código de Referência: DT-FPF03",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fpf02",
    "name": "FERRAMENTA PARA RETORNAR O ÊMBOLO DA (DT-FPF02) Delta",
    "slug": "ferramenta-para-retornar-o-embolo-da-dt-fpf02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-retornar-o-emb-730581924fba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-para-retornar-o-emb-224e660d406d.webp"
    ],
    "altText": "FERRAMENTA PARA RETORNAR O ÊMBOLO DA (DT-FPF02) Delta Athena Soluções Automotivas",
    "description": "PINÇA DE FREIO DIANTEIRO GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE Ideal para retornar o êmbolo da pinça de freio durante a troca das pastilhas do freio dianteiro, sem esforço e sem causar nenhum dano ao sistema hidráulico. Fabricada em aço especial de alta qualidade.",
    "specs": [
      "Código de Referência: DT-FPF02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sgf",
    "name": "JOGO PARA RETORNAR O ÊMBOLO DA PINÇA DE FREIO (DT-SGF) Delta",
    "slug": "jogo-para-retornar-o-embolo-da-pinca-de-freio-dt-sgf-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-para-retornar-o-embolo-da-b59e1cf7e3f0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-para-retornar-o-embolo-da-331f47969953.webp"
    ],
    "altText": "JOGO PARA RETORNAR O ÊMBOLO DA PINÇA DE FREIO (DT-SGF) Delta Athena Soluções Automotivas",
    "description": "TRASEIRO COM 21 PEÇAS Jogo com 21 peças de ferramentas ideais para retornar (pressionar) o êmbolo da pinça de freio a disco traseiro de automóveis e utilitários nacionais e importados. Ajuda a prevenir dados aos pistões e selos. Maleta para acomodação",
    "specs": [
      "Acompanha:",
      "Código: DT-SGF",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-fpf01",
    "name": "Ferramenta Especial DT-FPF01 Delta",
    "slug": "ferramenta-especial-dt-fpf01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fpf01-d-232a3803b6c6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-fpf01-d-9356b98faff2.webp"
    ],
    "altText": "Ferramenta Especial DT-FPF01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-FPF01.",
    "specs": [
      "Código de Referência: DT-FPF01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sgf02-r",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SGF02.R) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sgf02-r-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-36a1f6f5ebad.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-1a522f0451fd.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SGF02.R) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE RESERVATÓRIO DE REABASTECIMENTO PARA SANGRIA DE FREIOS",
    "specs": [
      "Código de Referência: DT-SGF02.R",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-tff01",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-TFF01) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-tff01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-49f4b0e4a52d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-d255e3f64577.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-TFF01) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE TESTE DE FLUÍDO DE FREIO TIPO CANETA Ideal para analisar a umidade do ﬂuído de freio. Rápido diagnóstico e precisão nos resultados.",
    "specs": [
      "Utilizado para: DOT 3 e DOT 4",
      "Código: DT-TFF01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ven01",
    "name": "Ferramenta Especial DT-VEN01 Delta",
    "slug": "ferramenta-especial-dt-ven01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ven01-d-691ecb3b22fe.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ven01-d-61821d6654f7.webp"
    ],
    "altText": "Ferramenta Especial DT-VEN01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-VEN01.",
    "specs": [
      "Código de Referência: DT-VEN01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ven02",
    "name": "Ferramenta Especial DT-VEN02 Delta",
    "slug": "ferramenta-especial-dt-ven02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ven02-d-8a0111618ad5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-ven02-d-7bbca93b4ebe.webp"
    ],
    "altText": "Ferramenta Especial DT-VEN02 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-VEN02.",
    "specs": [
      "Código de Referência: DT-VEN02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-ven03",
    "name": "VENTOSA COM ALÇA PARA MARTELINHO DE OURO (DT-VEN03) Delta",
    "slug": "ventosa-com-alca-para-martelinho-de-ouro-dt-ven03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ventosa-com-alca-para-martelin-bd4e05c8bc3b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ventosa-com-alca-para-martelin-fe437dbdf7b8.webp"
    ],
    "altText": "VENTOSA COM ALÇA PARA MARTELINHO DE OURO (DT-VEN03) Delta Athena Soluções Automotivas",
    "description": "Confeccionada em silicone; Apresenta ótima sucção com apoio para 3 dedos para melhor precisão no repuxo. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE",
    "specs": [
      "Medida (diâmetro): 110mm",
      "Código: DT-VEN03",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_ali07",
    "name": "Ferramenta Especial ALI07 Delta",
    "slug": "ferramenta-especial-ali07-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-ali07-delt-5ecab8933440.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-ali07-delt-3fc8c7a3f29d.webp"
    ],
    "altText": "Ferramenta Especial ALI07 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo ALI07.",
    "specs": [
      "Código de Referência: ALI07",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mar01",
    "name": "KIT MARRETA DINÂMICA PARA MARTELINHO (DT-MAR01) Delta",
    "slug": "kit-marreta-dinamica-para-martelinho-dt-mar01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-marreta-dinamica-para-mart-b134871febcf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/kit-marreta-dinamica-para-mart-c38d485573cb.webp"
    ],
    "altText": "KIT MARRETA DINÂMICA PARA MARTELINHO (DT-MAR01) Delta Athena Soluções Automotivas",
    "description": "DE OURO 9 PEÇAS Marreta dinâmica para martelinho de ouro fabricada com materiais de excelente qualidade e grande durabilidade. 1 repuxadeira (marreta dinâmica) com 46cm e batedor de 780g, 1 ventosa de silicone de 110m com alça,",
    "specs": [
      "Acompanha:",
      "Código: DT-MAR01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rec01",
    "name": "de ar condicionado R134A (DT-REC01) Delta",
    "slug": "de-ar-condicionado-r134a-dt-rec01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r134a-dt-re-169e6a5e2d78.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r134a-dt-re-b72e95956bd4.webp"
    ],
    "altText": "de ar condicionado R134A (DT-REC01) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-REC01.",
    "specs": [
      "Recicladora Semi Automática para manutenção do",
      "Código: DT-REC01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rec02",
    "name": "sistema de ar condicionado R134A (DT-REC02) Delta",
    "slug": "sistema-de-ar-condicionado-r134a-dt-rec02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sistema-de-ar-condicionado-r13-e3dcf6129000.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sistema-de-ar-condicionado-r13-c4bfd7e6736f.webp"
    ],
    "altText": "sistema de ar condicionado R134A (DT-REC02) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-REC02.",
    "specs": [
      "Recicladora Semi Automática para manutenção do sistema",
      "Código: DT-REC02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rec03",
    "name": "de ar condicionado R1234YF (DT-REC03) Delta",
    "slug": "de-ar-condicionado-r1234yf-dt-rec03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r1234yf-dt--15c8001f013c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r1234yf-dt--d3e92bf797da.webp"
    ],
    "altText": "de ar condicionado R1234YF (DT-REC03) Delta Athena Soluções Automotivas",
    "description": "Produzido na Itália, Delta Ferramentas representante oﬁcial ISC no Brasil.",
    "specs": [
      "Código de Referência: DT-REC03",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-rec",
    "name": "de ar condicionado R134A (DT-REC) Delta",
    "slug": "de-ar-condicionado-r134a-dt-rec-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r134a-dt-re-499c690450cd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/de-ar-condicionado-r134a-dt-re-8f4b961a33e9.webp"
    ],
    "altText": "de ar condicionado R134A (DT-REC) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-REC.",
    "specs": [
      "Recicladora Semi Automática para manutenção do",
      "Código: DT-REC",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-sac04",
    "name": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC04) Delta",
    "slug": "garantia-de-6-meses-contra-defeitos-de-fabricacao-dt-sac04-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-aad48f6fdc05.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/garantia-de-6-meses-contra-def-737859db6477.webp"
    ],
    "altText": "GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO (DT-SAC04) Delta Athena Soluções Automotivas",
    "description": "E ASSISTÊNCIA TÉCNICA PERMANENTE CONJUNTO DE SPRING LOCK PARA CONEXÕES DE AR CONDICIONADO COM 9 PEÇAS GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE MANIFOLD PARA GÁS DE AR CONDICIONADO",
    "specs": [
      "Código de Referência: DT-SAC04",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mga01",
    "name": "Ferramenta Especial DT-MGA01 Delta",
    "slug": "ferramenta-especial-dt-mga01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mga01-d-5cc60089938a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mga01-d-8f1a6b045f27.webp"
    ],
    "altText": "Ferramenta Especial DT-MGA01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MGA01.",
    "specs": [
      "Código de Referência: DT-MGA01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mga01eb",
    "name": "Ferramenta Especial DT-MGA01EB Delta",
    "slug": "ferramenta-especial-dt-mga01eb-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mga01eb-4fc6507f97e0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-mga01eb-f8dde74171b9.webp"
    ],
    "altText": "Ferramenta Especial DT-MGA01EB Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MGA01EB.",
    "specs": [
      "Código de Referência: DT-MGA01EB",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-mga01ea",
    "name": "32 (DT-MGA01EA) Delta",
    "slug": "32-dt-mga01ea-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/32-dt-mga01ea-delta-801140815ed9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/32-dt-mga01ea-delta-galeria-1-4f8bd5db6482.webp"
    ],
    "altText": "32 (DT-MGA01EA) Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-MGA01EA.",
    "specs": [
      "Código de Referência: DT-MGA01EA",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-lan02",
    "name": "Ferramenta Especial DT-LAN02 Delta",
    "slug": "ferramenta-especial-dt-lan02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-lan02-d-e37ad232eef4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-lan02-d-4a7361669ed2.webp"
    ],
    "altText": "Ferramenta Especial DT-LAN02 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-LAN02.",
    "specs": [
      "Código de Referência: DT-LAN02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-lan03",
    "name": "LANTERNA LED DE CABEÇA (DT-LAN03) Delta",
    "slug": "lanterna-led-de-cabeca-dt-lan03-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanterna-led-de-cabeca-dt-lan0-33266fbe39c1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanterna-led-de-cabeca-dt-lan0-7bae2dc9175d.webp"
    ],
    "altText": "LANTERNA LED DE CABEÇA (DT-LAN03) Delta Athena Soluções Automotivas",
    "description": "Lanterna de cabeça proﬁssional, recarregável. Possui botão e sensor de toque para facilitar o liga/desliga. Possui lâmpada auxiliar lateral. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE LANTERNA LED DE CABEÇA COM 3 LEDS.",
    "specs": [
      "Código de Referência: DT-LAN03",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-cap01",
    "name": "Ferramenta Especial DT-CAP01 Delta",
    "slug": "ferramenta-especial-dt-cap01-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-cap01-d-4b6a10015c89.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-especial-dt-cap01-d-ca26133f76da.webp"
    ],
    "altText": "Ferramenta Especial DT-CAP01 Delta Athena Soluções Automotivas",
    "description": "Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo DT-CAP01.",
    "specs": [
      "Código de Referência: DT-CAP01",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_delta_dt-cap02",
    "name": "CAPA DE BANCO PARA MECÂNICO (DT-CAP02) Delta",
    "slug": "capa-de-banco-para-mecanico-dt-cap02-delta",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_delta",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Delta Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/capa-de-banco-para-mecanico-dt-fd26d14a9c97.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/capa-de-banco-para-mecanico-dt-140b3c1b4839.webp"
    ],
    "altText": "CAPA DE BANCO PARA MECÂNICO (DT-CAP02) Delta Athena Soluções Automotivas",
    "description": "Evita mancha de graxas e sujeiras. Capa produzida em courino. Acabamento reforçado, excelente qualidade e alta durabilidade. Impermeável e fácil de lavar. GARANTIA DE 6 MESES CONTRA DEFEITOS DE FABRICAÇÃO E ASSISTÊNCIA TÉCNICA PERMANENTE JOGO DE CAPAS PARA MECÂNICO COM 5 PEÇAS",
    "specs": [
      "Código de Referência: DT-CAP02",
      "Fabricante: Delta Ferramentas Automotivas",
      "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_car-10",
    "name": "Chave De Impacto Elétrica CAR-10 Sigma Tools",
    "slug": "chave-de-impacto-eletrica-car-10-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chave-de-impacto-eletrica-car--3cbb19b8f247.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chave-de-impacto-eletrica-car--423db907b36d.webp"
    ],
    "altText": "Chave De Impacto Elétrica CAR-10 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo CAR-10 Sigma Tools.",
    "specs": [
      "Chaves de Impacto Pneumáticas",
      "Chaves de Impacto à Bateria",
      "Chave de Impacto Elétrica",
      "Chaves Catraca Pneumáticas",
      "Chaves Catraca à Bateria",
      "Juntas Universais",
      "Código do Produto: CAR-10",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_car-20",
    "name": "Chave De Impacto Elétrica CAR-20 Sigma Tools",
    "slug": "chave-de-impacto-eletrica-car-20-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chave-de-impacto-eletrica-car--9cae11c8c8de.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chave-de-impacto-eletrica-car--ded6b5606f3b.webp"
    ],
    "altText": "Chave De Impacto Elétrica CAR-20 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo CAR-20 Sigma Tools.",
    "specs": [
      "Chaves de Impacto Pneumáticas",
      "Chaves de Impacto à Bateria",
      "Chave de Impacto Elétrica",
      "Chaves Catraca Pneumáticas",
      "Chaves Catraca à Bateria",
      "Juntas Universais",
      "Código do Produto: CAR-20",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0528a",
    "name": "Ferramenta SGT-0528A Sigma Tools",
    "slug": "ferramenta-sgt-0528a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0528a-sigma-too-02aee37f2c93.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0528a-sigma-too-382838e5b375.webp"
    ],
    "altText": "Ferramenta SGT-0528A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0528A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0517",
    "name": "Ferramenta SGT-0517 Sigma Tools",
    "slug": "ferramenta-sgt-0517-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0517-sigma-tool-ed2c92d532cb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0517-sigma-tool-bf9d57931bdb.webp"
    ],
    "altText": "Ferramenta SGT-0517 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0517",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0529ak",
    "name": "Ferramenta SGT-0529AK Sigma Tools",
    "slug": "ferramenta-sgt-0529ak-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0529ak-sigma-to-3ee97a837f09.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0529ak-sigma-to-6f7ca1e94241.webp"
    ],
    "altText": "Ferramenta SGT-0529AK Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0529AK",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0517b",
    "name": "Ferramenta SGT-0517B Sigma Tools",
    "slug": "ferramenta-sgt-0517b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0517b-sigma-too-6005805e2d6c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0517b-sigma-too-1059a114f457.webp"
    ],
    "altText": "Ferramenta SGT-0517B Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0517B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0529a",
    "name": "Ferramenta SGT-0529A Sigma Tools",
    "slug": "ferramenta-sgt-0529a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0529a-sigma-too-e2561ea177b8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0529a-sigma-too-ec2f5b7c67c2.webp"
    ],
    "altText": "Ferramenta SGT-0529A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0529A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0532a",
    "name": "Ferramenta SGT-0532A Sigma Tools",
    "slug": "ferramenta-sgt-0532a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0532a-sigma-too-a3a5deee13cf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0532a-sigma-too-81df59a2549b.webp"
    ],
    "altText": "Ferramenta SGT-0532A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0532A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0532ak",
    "name": "Ferramenta SGT-0532AK Sigma Tools",
    "slug": "ferramenta-sgt-0532ak-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0532ak-sigma-to-a75dbdb371d8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0532ak-sigma-to-f20c99c39d7e.webp"
    ],
    "altText": "Ferramenta SGT-0532AK Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0532AK",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0536a",
    "name": "Ferramenta SGT-0536A Sigma Tools",
    "slug": "ferramenta-sgt-0536a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0536a-sigma-too-130e06c624ee.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0536a-sigma-too-a6b6bdd8cca8.webp"
    ],
    "altText": "Ferramenta SGT-0536A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0536A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0539",
    "name": "Ferramenta SGT-0539 Sigma Tools",
    "slug": "ferramenta-sgt-0539-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0539-sigma-tool-9a0f932e68a1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0539-sigma-tool-6347d3a4efbc.webp"
    ],
    "altText": "Ferramenta SGT-0539 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO CAPACIDADE DO PARAFUSO",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/8” e 1/2”",
      "68 kgf.m",
      "5 PCM",
      "1,7 kg",
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "LEVE",
      "82 kgf.m",
      "Código do Produto: SGT-0539",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0544",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0544 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0544-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--c57e0e9cad92.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--68fafa8865d1.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0544 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0544 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0544",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0545",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0545 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0545-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--8cd3e46c6abb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--ae90e9a3c7ee.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0545 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0545 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0545",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0542",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0542 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0542-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--a96bf4203966.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--7bf8fed46448.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0542 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0542 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0542",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0540b",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0540B Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0540b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--5bcd8b15fae6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--a24b277e3e90.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0540B Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0540B Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0540B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0546a",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0546A Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0546a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--33f7a452af81.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--6af345168c1a.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0546A Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0546A Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0546A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0556",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0556 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0556-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--3e5804c791d5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--2cda46549fb5.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0556 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0556 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0556",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0555",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0555 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0555-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--16ab0e0f9248.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--c491cc30c3ae.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0555 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0555 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0555",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0554",
    "name": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0554 Sigma Tools",
    "slug": "chaves-de-impacto-pneumaticas-3-4-tipo-pistola-sgt-0554-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--4b8ac05fcaa7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-pneumaticas--2dc4e69ef8ab.webp"
    ],
    "altText": "Chaves De Impacto Pneumáticas 3/4” Tipo Pistola SGT-0554 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0554 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 3/4” TIPO PISTOLA",
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” TIPO PISTOLA",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "184 kgf.m",
      "22 PCM",
      "6,9 kg",
      "4.600 RPM",
      "Código do Produto: SGT-0554",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0569",
    "name": "Ferramenta SGT-0569 Sigma Tools",
    "slug": "ferramenta-sgt-0569-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0569-sigma-tool-6fc160ef69cc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0569-sigma-tool-b7468d24a2c2.webp"
    ],
    "altText": "Ferramenta SGT-0569 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0569 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0569",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0559",
    "name": "Ferramenta SGT-0559 Sigma Tools",
    "slug": "ferramenta-sgt-0559-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0559-sigma-tool-f10aedee2b6e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0559-sigma-tool-5d434d00fddb.webp"
    ],
    "altText": "Ferramenta SGT-0559 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0559 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0559",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0569c",
    "name": "Ferramenta SGT-0569C Sigma Tools",
    "slug": "ferramenta-sgt-0569c-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0569c-sigma-too-79a88c30d0ad.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0569c-sigma-too-dfe981ad12ca.webp"
    ],
    "altText": "Ferramenta SGT-0569C Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0569C Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0569C",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0564",
    "name": "Ferramenta SGT-0564 Sigma Tools",
    "slug": "ferramenta-sgt-0564-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0564-sigma-tool-d9d991b0b1dc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0564-sigma-tool-ac66a0f909a7.webp"
    ],
    "altText": "Ferramenta SGT-0564 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0564 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0564",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0566",
    "name": "Ferramenta SGT-0566 Sigma Tools",
    "slug": "ferramenta-sgt-0566-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0566-sigma-tool-1f1375d9e09d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0566-sigma-tool-dbb77a750b7c.webp"
    ],
    "altText": "Ferramenta SGT-0566 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0566 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0566",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0564c",
    "name": "Ferramenta SGT-0564C Sigma Tools",
    "slug": "ferramenta-sgt-0564c-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0564c-sigma-too-a5e7cfedec3d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0564c-sigma-too-b75f8f27fbad.webp"
    ],
    "altText": "Ferramenta SGT-0564C Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0564C Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "LEVE",
      "TWIN",
      "VELOCIDADE LIVRE",
      "TWIN HAMMER",
      "235 kgf.m",
      "22 PCM",
      "9,6 kg",
      "Código do Produto: SGT-0564C",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0565",
    "name": "Ferramenta SGT-0565 Sigma Tools",
    "slug": "ferramenta-sgt-0565-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0565-sigma-tool-a7bd8f254589.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0565-sigma-tool-e13e6843d70d.webp"
    ],
    "altText": "Ferramenta SGT-0565 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0565 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "VELOCIDADE LIVRE",
      "629 kgf.m",
      "22 PCM",
      "21,5 kg",
      "2.800 RPM",
      "VELOCIDADE LIVRE",
      "735 kgf.m",
      "Código do Produto: SGT-0565",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0575c",
    "name": "Ferramenta SGT-0575C Sigma Tools",
    "slug": "ferramenta-sgt-0575c-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0575c-sigma-too-e3916ef39537.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0575c-sigma-too-dd7f88c8d02d.webp"
    ],
    "altText": "Ferramenta SGT-0575C Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0575C Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "VELOCIDADE LIVRE",
      "629 kgf.m",
      "22 PCM",
      "21,5 kg",
      "2.800 RPM",
      "VELOCIDADE LIVRE",
      "735 kgf.m",
      "Código do Produto: SGT-0575C",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0570",
    "name": "Ferramenta SGT-0570 Sigma Tools",
    "slug": "ferramenta-sgt-0570-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0570-sigma-tool-4fdfd5b54f50.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0570-sigma-tool-96a9cdd239a9.webp"
    ],
    "altText": "Ferramenta SGT-0570 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0570 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "VELOCIDADE LIVRE",
      "629 kgf.m",
      "22 PCM",
      "21,5 kg",
      "2.800 RPM",
      "VELOCIDADE LIVRE",
      "735 kgf.m",
      "Código do Produto: SGT-0570",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0566c",
    "name": "Ferramenta SGT-0566C Sigma Tools",
    "slug": "ferramenta-sgt-0566c-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0566c-sigma-too-993c2221e3bc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0566c-sigma-too-9668efc46080.webp"
    ],
    "altText": "Ferramenta SGT-0566C Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0566C Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "VELOCIDADE LIVRE",
      "629 kgf.m",
      "22 PCM",
      "21,5 kg",
      "2.800 RPM",
      "VELOCIDADE LIVRE",
      "735 kgf.m",
      "Código do Produto: SGT-0566C",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0571",
    "name": "Ferramenta SGT-0571 Sigma Tools",
    "slug": "ferramenta-sgt-0571-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0571-sigma-tool-dec1a877328e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0571-sigma-tool-d76a9e3a6e6c.webp"
    ],
    "altText": "Ferramenta SGT-0571 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-0571 Sigma Tools.",
    "specs": [
      "CHAVES DE IMPACTO PNEUMÁTICAS 1” e 1.1/2” LONGAS/CURTAS",
      "VELOCIDADE LIVRE",
      "629 kgf.m",
      "22 PCM",
      "21,5 kg",
      "2.800 RPM",
      "VELOCIDADE LIVRE",
      "735 kgf.m",
      "Código do Produto: SGT-0571",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7502a",
    "name": "Ferramenta SGT-7502A Sigma Tools",
    "slug": "ferramenta-sgt-7502a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7502a-sigma-too-1fd5542a5fb5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7502a-sigma-too-7e439a03b6d5.webp"
    ],
    "altText": "Ferramenta SGT-7502A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO À BATERIA 1/2” E 3/4”",
      "VELOCIDADE LIVRE",
      "65 kgf.m",
      "0,600 kg",
      "04200 RPM",
      "1,2 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "Código do Produto: SGT-7502A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7503a",
    "name": "Ferramenta SGT-7503A Sigma Tools",
    "slug": "ferramenta-sgt-7503a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7503a-sigma-too-3eb3c821cd21.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7503a-sigma-too-f220ab3dc62e.webp"
    ],
    "altText": "Ferramenta SGT-7503A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO À BATERIA 1/2” E 3/4”",
      "VELOCIDADE LIVRE",
      "65 kgf.m",
      "0,600 kg",
      "04200 RPM",
      "1,2 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "Código do Produto: SGT-7503A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7520",
    "name": "Ferramenta SGT-7520 Sigma Tools",
    "slug": "ferramenta-sgt-7520-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7520-sigma-tool-9075f861e811.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7520-sigma-tool-7356bf0a4e2d.webp"
    ],
    "altText": "Ferramenta SGT-7520 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO À BATERIA 1/2” E 3/4”",
      "VELOCIDADE LIVRE",
      "65 kgf.m",
      "0,600 kg",
      "04200 RPM",
      "1,2 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "Código do Produto: SGT-7520",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7500a",
    "name": "Ferramenta SGT-7500A Sigma Tools",
    "slug": "ferramenta-sgt-7500a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7500a-sigma-too-44dd679c650e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7500a-sigma-too-ffaca11138a4.webp"
    ],
    "altText": "Ferramenta SGT-7500A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO PARAFUSO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO À BATERIA 1/2” E 3/4”",
      "VELOCIDADE LIVRE",
      "65 kgf.m",
      "0,600 kg",
      "04200 RPM",
      "1,2 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "Código do Produto: SGT-7500A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7510",
    "name": "Ferramenta SGT-7510 Sigma Tools",
    "slug": "ferramenta-sgt-7510-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7510-sigma-tool-41bbac4d09a3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7510-sigma-tool-dfa2a857d3d0.webp"
    ],
    "altText": "Ferramenta SGT-7510 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DO PARAFUSO",
    "specs": [
      "VELOCIDADE LIVRE",
      "150 kgf.m",
      "0,640 kg",
      "01800 RPM",
      "2,8 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-7510",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7509",
    "name": "Ferramenta SGT-7509 Sigma Tools",
    "slug": "ferramenta-sgt-7509-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7509-sigma-tool-a9447ad7eb57.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7509-sigma-tool-27429dd260d6.webp"
    ],
    "altText": "Ferramenta SGT-7509 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DO PARAFUSO",
    "specs": [
      "VELOCIDADE LIVRE",
      "150 kgf.m",
      "0,640 kg",
      "01800 RPM",
      "2,8 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-7509",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7515",
    "name": "Ferramenta SGT-7515 Sigma Tools",
    "slug": "ferramenta-sgt-7515-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7515-sigma-tool-4536279f4c29.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7515-sigma-tool-3ec3d91abd5a.webp"
    ],
    "altText": "Ferramenta SGT-7515 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DO PARAFUSO",
    "specs": [
      "VELOCIDADE LIVRE",
      "150 kgf.m",
      "0,640 kg",
      "01800 RPM",
      "2,8 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-7515",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4502",
    "name": "Ferramenta SGT-4502 Sigma Tools",
    "slug": "ferramenta-sgt-4502-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4502-sigma-tool-7211261ca5d8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4502-sigma-tool-a07e2a2810ae.webp"
    ],
    "altText": "Ferramenta SGT-4502 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DO PARAFUSO",
    "specs": [
      "VELOCIDADE LIVRE",
      "150 kgf.m",
      "0,640 kg",
      "01800 RPM",
      "2,8 kg",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-4502",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7530",
    "name": "Ferramenta SGT-7530 Sigma Tools",
    "slug": "ferramenta-sgt-7530-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7530-sigma-tool-8f3b563a42ca.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7530-sigma-tool-171ae94f2800.webp"
    ],
    "altText": "Ferramenta SGT-7530 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR PESO APROXIMADO (SEM BATERIA) COMP. APROXIMADO (C x A x L)",
    "specs": [
      "150 kgf.m",
      "11,1 kg",
      "LIION 6.0Ah | 24V",
      "SEM ESCOVAS",
      "300 kgf.m",
      "12 kg",
      "21V / 6Ah",
      "SEM ESCOVAS",
      "Código do Produto: SGT-7530",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7521",
    "name": "Ferramenta SGT-7521 Sigma Tools",
    "slug": "ferramenta-sgt-7521-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7521-sigma-tool-049be245a3c5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7521-sigma-tool-f5778942f15b.webp"
    ],
    "altText": "Ferramenta SGT-7521 Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR PESO APROXIMADO (SEM BATERIA) COMP. APROXIMADO (C x A x L)",
    "specs": [
      "150 kgf.m",
      "11,1 kg",
      "LIION 6.0Ah | 24V",
      "SEM ESCOVAS",
      "300 kgf.m",
      "12 kg",
      "21V / 6Ah",
      "SEM ESCOVAS",
      "Código do Produto: SGT-7521",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0511bk",
    "name": "Ferramenta SGT-0511BK Sigma Tools",
    "slug": "ferramenta-sgt-0511bk-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0511bk-sigma-to-ed15144a8c47.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0511bk-sigma-to-bd7d05d3c278.webp"
    ],
    "altText": "Ferramenta SGT-0511BK Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR PESO APROXIMADO (SEM BATERIA) COMP. APROXIMADO (C x A x L)",
    "specs": [
      "150 kgf.m",
      "11,1 kg",
      "LIION 6.0Ah | 24V",
      "SEM ESCOVAS",
      "300 kgf.m",
      "12 kg",
      "21V / 6Ah",
      "SEM ESCOVAS",
      "Código do Produto: SGT-0511BK",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0511b",
    "name": "Ferramenta SGT-0511B Sigma Tools",
    "slug": "ferramenta-sgt-0511b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0511b-sigma-too-f729a5a02e63.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0511b-sigma-too-57d7ae236aa9.webp"
    ],
    "altText": "Ferramenta SGT-0511B Sigma Tools Athena Soluções Automotivas",
    "description": "2 BATERIAS E 1 CARREGADOR PESO APROXIMADO (SEM BATERIA) COMP. APROXIMADO (C x A x L)",
    "specs": [
      "150 kgf.m",
      "11,1 kg",
      "LIION 6.0Ah | 24V",
      "SEM ESCOVAS",
      "300 kgf.m",
      "12 kg",
      "21V / 6Ah",
      "SEM ESCOVAS",
      "Código do Produto: SGT-0511B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0501",
    "name": "Ferramenta SGT-0501 Sigma Tools",
    "slug": "ferramenta-sgt-0501-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0501-sigma-tool-a1c19a6e1fba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0501-sigma-tool-28829cc9c929.webp"
    ],
    "altText": "Ferramenta SGT-0501 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-0501",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0510",
    "name": "Ferramenta SGT-0510 Sigma Tools",
    "slug": "ferramenta-sgt-0510-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0510-sigma-tool-4cb9b3148d08.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0510-sigma-tool-66938f086c77.webp"
    ],
    "altText": "Ferramenta SGT-0510 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-0510",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7550",
    "name": "Ferramenta SGT-7550 Sigma Tools",
    "slug": "ferramenta-sgt-7550-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7550-sigma-tool-550c7e387127.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7550-sigma-tool-8add99e6d663.webp"
    ],
    "altText": "Ferramenta SGT-7550 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-7550",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7551",
    "name": "Ferramenta SGT-7551 Sigma Tools",
    "slug": "ferramenta-sgt-7551-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7551-sigma-tool-a682d22ec342.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7551-sigma-tool-ca9dbc8dd340.webp"
    ],
    "altText": "Ferramenta SGT-7551 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-7551",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9809",
    "name": "Ferramenta SGT-9809 Sigma Tools",
    "slug": "ferramenta-sgt-9809-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9809-sigma-tool-f6f18be68425.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9809-sigma-tool-43e1ee8e7aed.webp"
    ],
    "altText": "Ferramenta SGT-9809 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-9809",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9811",
    "name": "Ferramenta SGT-9811 Sigma Tools",
    "slug": "ferramenta-sgt-9811-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9811-sigma-tool-62cf92a8231e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9811-sigma-tool-8f1311564f00.webp"
    ],
    "altText": "Ferramenta SGT-9811 Sigma Tools Athena Soluções Automotivas",
    "description": "PESO DA MÁQUINA COM BATERIA PESO DA MÁQUINA SEM BATERIA DIMENSÕES (C x L x A)",
    "specs": [
      "LEVE",
      "3,5 kgf.m",
      "2,7 PCM",
      "0,550 kg",
      "VELOCIDADE LIVRE",
      "240 RPM",
      "6,9 kgf.m",
      "11,5 PCM",
      "Código do Produto: SGT-9811",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-t-01",
    "name": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-T-01 Sigma Tools",
    "slug": "car-10-carrinho-ergonomico-para-chave-de-impacto-1-sgt-t-01-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-6d0442b048dc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-970eb5fbffd6.webp"
    ],
    "altText": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-T-01 Sigma Tools Athena Soluções Automotivas",
    "description": "TORQUÍMETROS - ESTALO ACOMPANHA SUPORTE PARA FILTRO REGULADOR E LUBRIFICADOR! REDUZ O ESFORÇO DO MECÂNICO;",
    "specs": [
      "CAR10  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "Cód.: 07 61 1000 00",
      "*CHAVE DE IMPACTO, MANGUEIRAS E  CONJUNTO LUBRIFIL NÃO INCLUSOS.",
      "SUPORTA ATÉ 25 kg;",
      "FIXAÇÃO NO PADRÃO DO MANÍPULO DAS CHAVES;",
      "28 à 210 Nm",
      "1,3 kg",
      "0,341 kg",
      "Código do Produto: SGT-T-01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-tp-01",
    "name": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-01 Sigma Tools",
    "slug": "car-10-carrinho-ergonomico-para-chave-de-impacto-1-sgt-tp-01-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-09bfe38871e9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-d152ec116335.webp"
    ],
    "altText": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-01 Sigma Tools Athena Soluções Automotivas",
    "description": "TORQUÍMETROS - ESTALO ACOMPANHA SUPORTE PARA FILTRO REGULADOR E LUBRIFICADOR! REDUZ O ESFORÇO DO MECÂNICO;",
    "specs": [
      "CAR10  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "Cód.: 07 61 1000 00",
      "*CHAVE DE IMPACTO, MANGUEIRAS E  CONJUNTO LUBRIFIL NÃO INCLUSOS.",
      "SUPORTA ATÉ 25 kg;",
      "FIXAÇÃO NO PADRÃO DO MANÍPULO DAS CHAVES;",
      "28 à 210 Nm",
      "1,3 kg",
      "0,341 kg",
      "Código do Produto: SGT-TP-01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-tp-02",
    "name": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-02 Sigma Tools",
    "slug": "car-10-carrinho-ergonomico-para-chave-de-impacto-1-sgt-tp-02-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-037211081df1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-2f9a651d611c.webp"
    ],
    "altText": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-02 Sigma Tools Athena Soluções Automotivas",
    "description": "TORQUÍMETROS - ESTALO ACOMPANHA SUPORTE PARA FILTRO REGULADOR E LUBRIFICADOR! REDUZ O ESFORÇO DO MECÂNICO;",
    "specs": [
      "CAR10  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "Cód.: 07 61 1000 00",
      "*CHAVE DE IMPACTO, MANGUEIRAS E  CONJUNTO LUBRIFIL NÃO INCLUSOS.",
      "SUPORTA ATÉ 25 kg;",
      "FIXAÇÃO NO PADRÃO DO MANÍPULO DAS CHAVES;",
      "28 à 210 Nm",
      "1,3 kg",
      "0,341 kg",
      "Código do Produto: SGT-TP-02",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-tp-03",
    "name": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-03 Sigma Tools",
    "slug": "car-10-carrinho-ergonomico-para-chave-de-impacto-1-sgt-tp-03-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-58231e03e562.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-10-carrinho-ergonomico-par-b8a38c8e0561.webp"
    ],
    "altText": "Car-10 - Carrinho Ergonômico Para Chave De Impacto 1” SGT-TP-03 Sigma Tools Athena Soluções Automotivas",
    "description": "TORQUÍMETROS - ESTALO ACOMPANHA SUPORTE PARA FILTRO REGULADOR E LUBRIFICADOR! REDUZ O ESFORÇO DO MECÂNICO;",
    "specs": [
      "CAR10  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "Cód.: 07 61 1000 00",
      "*CHAVE DE IMPACTO, MANGUEIRAS E  CONJUNTO LUBRIFIL NÃO INCLUSOS.",
      "SUPORTA ATÉ 25 kg;",
      "FIXAÇÃO NO PADRÃO DO MANÍPULO DAS CHAVES;",
      "28 à 210 Nm",
      "1,3 kg",
      "0,341 kg",
      "Código do Produto: SGT-TP-03",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_pwr-35k",
    "name": "Car-20 - Carrinho Ergonômico Para Chave De Impacto 1” PWR-35K Sigma Tools",
    "slug": "car-20-carrinho-ergonomico-para-chave-de-impacto-1-pwr-35k-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-20-carrinho-ergonomico-par-af1acac97c9c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-20-carrinho-ergonomico-par-a37ecb7ff8cd.webp"
    ],
    "altText": "Car-20 - Carrinho Ergonômico Para Chave De Impacto 1” PWR-35K Sigma Tools Athena Soluções Automotivas",
    "description": "COMPRIMENTO APROXIMADO ACESSÓRIOS DE REPOSIÇÃO ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CAR20  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "CAPACIDADE DE ELEVAÇÃO",
      "25 kg",
      "72 kg",
      "MAX.: 75cm",
      "MIN.: 19cm",
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "PESO DA MÁQ.: SEM BATERIA (APROX.:)",
      "Código do Produto: PWR-35K",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_pwr-35",
    "name": "Car-20 - Carrinho Ergonômico Para Chave De Impacto 1” PWR-35 Sigma Tools",
    "slug": "car-20-carrinho-ergonomico-para-chave-de-impacto-1-pwr-35-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-20-carrinho-ergonomico-par-a0b1d0ed10fb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/car-20-carrinho-ergonomico-par-e6afbcd3a9a1.webp"
    ],
    "altText": "Car-20 - Carrinho Ergonômico Para Chave De Impacto 1” PWR-35 Sigma Tools Athena Soluções Automotivas",
    "description": "COMPRIMENTO APROXIMADO ACESSÓRIOS DE REPOSIÇÃO ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CAR20  CARRINHO ERGONÔMICO PARA CHAVE DE IMPACTO 1”",
      "CAPACIDADE DE ELEVAÇÃO",
      "25 kg",
      "72 kg",
      "MAX.: 75cm",
      "MIN.: 19cm",
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "PESO DA MÁQ.: SEM BATERIA (APROX.:)",
      "Código do Produto: PWR-35",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4501-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-4501-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-4501-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-620a0ba0ff69.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-cb90d2d983b5.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-4501-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DA BATERIA • 4 Soquetes (17mm, 19mm",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "CHAVE DE IMPACTO ELÉTRICA",
      "PESO DA MÁQ.: SEM BATERIA (APROX.:)",
      "ENCAIXE CHAVE DE IMPACTO",
      "35 kgf.m",
      "1,0 kg",
      "PESO DA BATERIA (APROX.:)",
      "0,305 kg",
      "Código do Produto: SGT-4501-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0516-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-0516-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-0516-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-601d5c5bf661.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-135c83b4a642.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-0516-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DA BATERIA • 4 Soquetes (17mm, 19mm",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "CHAVE DE IMPACTO ELÉTRICA",
      "PESO DA MÁQ.: SEM BATERIA (APROX.:)",
      "ENCAIXE CHAVE DE IMPACTO",
      "35 kgf.m",
      "1,0 kg",
      "PESO DA BATERIA (APROX.:)",
      "0,305 kg",
      "Código do Produto: SGT-0516-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0516k-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-0516K-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-0516k-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-c5652ce06d14.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-cabf9d8355a1.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-0516K-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO CAPACIDADE DA BATERIA • 4 Soquetes (17mm, 19mm",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "CHAVE DE IMPACTO ELÉTRICA",
      "PESO DA MÁQ.: SEM BATERIA (APROX.:)",
      "ENCAIXE CHAVE DE IMPACTO",
      "35 kgf.m",
      "1,0 kg",
      "PESO DA BATERIA (APROX.:)",
      "0,305 kg",
      "Código do Produto: SGT-0516K-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7504-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7504-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-7504-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-dc0f888c81e7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-bd494f6dd738.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7504-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "0-1900 à 0-2400 / 0-3000 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "RPM / IPM",
      "60 kgf.m",
      "1,6 kg",
      "21V / 4Ah",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "ACOMPANHA:",
      "Código do Produto: SGT-7504-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7501a-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7501A-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-7501a-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-3d033fa8324c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-74aad2f990a6.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7501A-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "0-1900 à 0-2400 / 0-3000 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "RPM / IPM",
      "60 kgf.m",
      "1,6 kg",
      "21V / 4Ah",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "ACOMPANHA:",
      "Código do Produto: SGT-7501A-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7507-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7507-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-7507-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-fc54ae5be679.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-e8c020072cd0.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7507-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "0-1900 à 0-2400 / 0-3000 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "RPM / IPM",
      "60 kgf.m",
      "1,6 kg",
      "21V / 4Ah",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "ACOMPANHA:",
      "Código do Produto: SGT-7507-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7544-pro",
    "name": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7544-PRO Sigma Tools",
    "slug": "chaves-de-impacto-parafusadeira-a-bateria-1-2-sgt-7544-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-88420f3cdccf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/chaves-de-impacto-parafusadeir-714931d0f7ab.webp"
    ],
    "altText": "Chaves De Impacto/Parafusadeira À Bateria 1/2” SGT-7544-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "0-1900 à 0-2400 / 0-3000 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "CHAVES DE IMPACTO/PARAFUSADEIRA À BATERIA 1/2”",
      "RPM / IPM",
      "60 kgf.m",
      "1,6 kg",
      "21V / 4Ah",
      "SEM ESCOVAS",
      "LIION 4.0Ah | 21V",
      "ACOMPANHA:",
      "Código do Produto: SGT-7544-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0211",
    "name": "Ferramenta SGT-0211 Sigma Tools",
    "slug": "ferramenta-sgt-0211-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0211-sigma-tool-57de5b0b2735.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0211-sigma-tool-24dc84d3bb73.webp"
    ],
    "altText": "Ferramenta SGT-0211 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0211",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0210",
    "name": "Ferramenta SGT-0210 Sigma Tools",
    "slug": "ferramenta-sgt-0210-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0210-sigma-tool-362a146f7e6b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0210-sigma-tool-580f8058c3b3.webp"
    ],
    "altText": "Ferramenta SGT-0210 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0210",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0221a",
    "name": "Ferramenta SGT-0221A Sigma Tools",
    "slug": "ferramenta-sgt-0221a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0221a-sigma-too-9653553d8509.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0221a-sigma-too-e7532355158b.webp"
    ],
    "altText": "Ferramenta SGT-0221A Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0221A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0233",
    "name": "Ferramenta SGT-0233 Sigma Tools",
    "slug": "ferramenta-sgt-0233-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0233-sigma-tool-3d075a494ee2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0233-sigma-tool-1a956c0d916e.webp"
    ],
    "altText": "Ferramenta SGT-0233 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0233",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0213",
    "name": "Ferramenta SGT-0213 Sigma Tools",
    "slug": "ferramenta-sgt-0213-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0213-sigma-tool-ea0cc2f51284.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0213-sigma-tool-c7a1210dab8f.webp"
    ],
    "altText": "Ferramenta SGT-0213 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0213",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0212",
    "name": "Ferramenta SGT-0212 Sigma Tools",
    "slug": "ferramenta-sgt-0212-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0212-sigma-tool-6e3aecbe2c04.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0212-sigma-tool-19e3e2e8abcb.webp"
    ],
    "altText": "Ferramenta SGT-0212 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0212",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0232",
    "name": "Ferramenta SGT-0232 Sigma Tools",
    "slug": "ferramenta-sgt-0232-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0232-sigma-tool-a00b8a04ade2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0232-sigma-tool-197a14a9381e.webp"
    ],
    "altText": "Ferramenta SGT-0232 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0232",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0230",
    "name": "Ferramenta SGT-0230 Sigma Tools",
    "slug": "ferramenta-sgt-0230-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0230-sigma-tool-eb85d06e272b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0230-sigma-tool-30222908fa2b.webp"
    ],
    "altText": "Ferramenta SGT-0230 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL CAPACIDADE DO MANDRIL",
    "specs": [
      "REVERSÍVEL",
      "VELOCIDADE LIVRE",
      "APERTO C/ CHAVE",
      "3,7 PCM",
      "0,900 kg",
      "2.600 RPM",
      "LINHA PROFISSIONAL HEAVYDUTY",
      "REVERSÍVEL",
      "Código do Produto: SGT-0230",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7100",
    "name": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-7100 Sigma Tools",
    "slug": "furadeira-e-parafusadeira-de-impacto-a-bateria-3-8-10mm-20nm-sgt-7100-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-e5601e1e90c4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-988e454fd79a.webp"
    ],
    "altText": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-7100 Sigma Tools Athena Soluções Automotivas",
    "description": "1 BATERIA E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CARREGADOR DA BATERIA",
    "specs": [
      "FURADEIRA E PARAFUSADEIRA DE IMPACTO À BATERIA 3/8”  10mm  20Nm",
      "FURADEIRA/PARAFUSADEIRA DE IMPACTO À BATERIA  3/8”  10mm  30Nm",
      "LIION 1.5Ah | 12V",
      "SISTEMA DE REVERSÃO",
      "0350 RPM / 01.250 RPM",
      "REVERSÍVEL",
      "12V  1.5Ah",
      "20Nm",
      "Código do Produto: SGT-7100",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7120",
    "name": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-7120 Sigma Tools",
    "slug": "furadeira-e-parafusadeira-de-impacto-a-bateria-3-8-10mm-20nm-sgt-7120-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-674501127bcc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-3cd5a516923f.webp"
    ],
    "altText": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-7120 Sigma Tools Athena Soluções Automotivas",
    "description": "1 BATERIA E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CARREGADOR DA BATERIA",
    "specs": [
      "FURADEIRA E PARAFUSADEIRA DE IMPACTO À BATERIA 3/8”  10mm  20Nm",
      "FURADEIRA/PARAFUSADEIRA DE IMPACTO À BATERIA  3/8”  10mm  30Nm",
      "LIION 1.5Ah | 12V",
      "SISTEMA DE REVERSÃO",
      "0350 RPM / 01.250 RPM",
      "REVERSÍVEL",
      "12V  1.5Ah",
      "20Nm",
      "Código do Produto: SGT-7120",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0240",
    "name": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0240 Sigma Tools",
    "slug": "furadeira-e-parafusadeira-de-impacto-a-bateria-3-8-10mm-20nm-sgt-0240-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-5a6d86d9ece4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-ddd0d21496c2.webp"
    ],
    "altText": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0240 Sigma Tools Athena Soluções Automotivas",
    "description": "1 BATERIA E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CARREGADOR DA BATERIA",
    "specs": [
      "FURADEIRA E PARAFUSADEIRA DE IMPACTO À BATERIA 3/8”  10mm  20Nm",
      "FURADEIRA/PARAFUSADEIRA DE IMPACTO À BATERIA  3/8”  10mm  30Nm",
      "LIION 1.5Ah | 12V",
      "SISTEMA DE REVERSÃO",
      "0350 RPM / 01.250 RPM",
      "REVERSÍVEL",
      "12V  1.5Ah",
      "20Nm",
      "Código do Produto: SGT-0240",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0241",
    "name": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0241 Sigma Tools",
    "slug": "furadeira-e-parafusadeira-de-impacto-a-bateria-3-8-10mm-20nm-sgt-0241-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-0b70c7498432.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-0905856f609f.webp"
    ],
    "altText": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0241 Sigma Tools Athena Soluções Automotivas",
    "description": "1 BATERIA E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CARREGADOR DA BATERIA",
    "specs": [
      "FURADEIRA E PARAFUSADEIRA DE IMPACTO À BATERIA 3/8”  10mm  20Nm",
      "FURADEIRA/PARAFUSADEIRA DE IMPACTO À BATERIA  3/8”  10mm  30Nm",
      "LIION 1.5Ah | 12V",
      "SISTEMA DE REVERSÃO",
      "0350 RPM / 01.250 RPM",
      "REVERSÍVEL",
      "12V  1.5Ah",
      "20Nm",
      "Código do Produto: SGT-0241",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0251",
    "name": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0251 Sigma Tools",
    "slug": "furadeira-e-parafusadeira-de-impacto-a-bateria-3-8-10mm-20nm-sgt-0251-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-48a53566a012.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/furadeira-e-parafusadeira-de-i-9ff5e9f3cc92.webp"
    ],
    "altText": "Furadeira E Parafusadeira De Impacto À Bateria 3/8” - 10Mm - 20Nm SGT-0251 Sigma Tools Athena Soluções Automotivas",
    "description": "1 BATERIA E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO CARREGADOR DA BATERIA",
    "specs": [
      "FURADEIRA E PARAFUSADEIRA DE IMPACTO À BATERIA 3/8”  10mm  20Nm",
      "FURADEIRA/PARAFUSADEIRA DE IMPACTO À BATERIA  3/8”  10mm  30Nm",
      "LIION 1.5Ah | 12V",
      "SISTEMA DE REVERSÃO",
      "0350 RPM / 01.250 RPM",
      "REVERSÍVEL",
      "12V  1.5Ah",
      "20Nm",
      "Código do Produto: SGT-0251",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7130",
    "name": "Parafusadeira De Impacto SGT-7130 Sigma Tools",
    "slug": "parafusadeira-de-impacto-sgt-7130-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-7-64a8613a00b7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-7-3b5d463a79a4.webp"
    ],
    "altText": "Parafusadeira De Impacto SGT-7130 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRA DE IMPACTO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 4.0Ah | 18V",
      "45 NM",
      "45 NM",
      "VELOCIDADE VARIÁVEL E REVERSÍVEL",
      "0300 RPM / 01.000 RPM",
      "45Nm",
      "ENTRADA: 110V240V AC5060Hz",
      "Código do Produto: SGT-7130",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7140",
    "name": "Parafusadeira De Impacto SGT-7140 Sigma Tools",
    "slug": "parafusadeira-de-impacto-sgt-7140-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-7-3f1c5ad7926e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-7-88b7573d66f6.webp"
    ],
    "altText": "Parafusadeira De Impacto SGT-7140 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRA DE IMPACTO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 4.0Ah | 18V",
      "45 NM",
      "45 NM",
      "VELOCIDADE VARIÁVEL E REVERSÍVEL",
      "0300 RPM / 01.000 RPM",
      "45Nm",
      "ENTRADA: 110V240V AC5060Hz",
      "Código do Produto: SGT-7140",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0131",
    "name": "Parafusadeira De Impacto SGT-0131 Sigma Tools",
    "slug": "parafusadeira-de-impacto-sgt-0131-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-34c5cce5c8ad.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-39d11395aa65.webp"
    ],
    "altText": "Parafusadeira De Impacto SGT-0131 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRA DE IMPACTO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 4.0Ah | 18V",
      "45 NM",
      "45 NM",
      "VELOCIDADE VARIÁVEL E REVERSÍVEL",
      "0300 RPM / 01.000 RPM",
      "45Nm",
      "ENTRADA: 110V240V AC5060Hz",
      "Código do Produto: SGT-0131",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0135",
    "name": "Parafusadeira De Impacto SGT-0135 Sigma Tools",
    "slug": "parafusadeira-de-impacto-sgt-0135-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-40b502c467a8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-ffdde4fff2fa.webp"
    ],
    "altText": "Parafusadeira De Impacto SGT-0135 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRA DE IMPACTO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 4.0Ah | 18V",
      "45 NM",
      "45 NM",
      "VELOCIDADE VARIÁVEL E REVERSÍVEL",
      "0300 RPM / 01.000 RPM",
      "45Nm",
      "ENTRADA: 110V240V AC5060Hz",
      "Código do Produto: SGT-0135",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0132",
    "name": "Parafusadeira De Impacto SGT-0132 Sigma Tools",
    "slug": "parafusadeira-de-impacto-sgt-0132-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-a22d3e1228cc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeira-de-impacto-sgt-0-928f937c0b2c.webp"
    ],
    "altText": "Parafusadeira De Impacto SGT-0132 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRA DE IMPACTO 2 BATERIAS E 1 CARREGADOR ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 4.0Ah | 18V",
      "45 NM",
      "45 NM",
      "VELOCIDADE VARIÁVEL E REVERSÍVEL",
      "0300 RPM / 01.000 RPM",
      "45Nm",
      "ENTRADA: 110V240V AC5060Hz",
      "Código do Produto: SGT-0132",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0110",
    "name": "Parafusadeiras Deslizantes SGT-0110 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0110-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-22887183ab8d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-d8a61f920de1.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0110 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0110",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0112",
    "name": "Parafusadeiras Deslizantes SGT-0112 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0112-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-41a68cf2b8c0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-0b5e513e0398.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0112 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0112",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0141",
    "name": "Parafusadeiras Deslizantes SGT-0141 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0141-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-7b92f4a68bd5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-89e0397ec857.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0141 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0141",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0142",
    "name": "Parafusadeiras Deslizantes SGT-0142 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0142-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-079d7129713a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-812bcb4d5cbe.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0142 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0142",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0143",
    "name": "Parafusadeiras Deslizantes SGT-0143 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0143-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-eec464b0a4c2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-b3018476d877.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0143 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0143",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0154",
    "name": "Parafusadeiras Deslizantes SGT-0154 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0154-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-a1596c0c7586.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-29eeec688ac1.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0154 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0154",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0157",
    "name": "Parafusadeiras Deslizantes SGT-0157 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0157-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-8e1ccf123972.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-8a581b924604.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0157 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0157",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0159",
    "name": "Parafusadeiras Deslizantes SGT-0159 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-sgt-0159-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-edeacb087b66.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-sgt-f2531d697b19.webp"
    ],
    "altText": "Parafusadeiras Deslizantes SGT-0159 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0159",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-0111",
    "name": "Parafusadeiras Deslizantes MXT-0111 Sigma Tools",
    "slug": "parafusadeiras-deslizantes-mxt-0111-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-mxt-55feb0cde078.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-deslizantes-mxt-10f1b96902ec.webp"
    ],
    "altText": "Parafusadeiras Deslizantes MXT-0111 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS DESLIZANTES PARAFUSADEIRAS DESLIZANTES CAPACIDADE DO PARAFUSO",
    "specs": [
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "1.800 RPM",
      "3 à 8 Nm",
      "14 PCM",
      "1,1 kg",
      "REVERSÃO",
      "VELOCIDADE LIVRE",
      "Código do Produto: MXT-0111",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-e35",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-E35 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-e35-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-b34852526cd4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-e307e32854de.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-E35 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-E35",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-d25",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-D25 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-d25-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-c426369db511.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-e11297c4cda7.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-D25 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-D25",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-d35",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-D35 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-d35-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-d26be5aff587.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-8ff4d6e85771.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-D35 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-D35",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-s25",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-S25 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-s25-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-806f08efca93.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-99938a340f11.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-S25 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-S25",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-s35",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-S35 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-s35-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-9f460407e5ba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-4474ea5f72f8.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-S35 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-S35",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-t10",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-PE-T10 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-pe-t10-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-a0b93c224ebd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-72570a63a1e8.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-PE-T10 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-PE-T10",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0160",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-0160 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-0160-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-042d011db108.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-73001b400c95.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-0160 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-0160",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0150",
    "name": "Parafusadeiras Automáticas / Shut-Off SGT-0150 Sigma Tools",
    "slug": "parafusadeiras-automaticas-shut-off-sgt-0150-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-1b2ce32b1568.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-automaticas-shu-b9d1c5a0d3a2.webp"
    ],
    "altText": "Parafusadeiras Automáticas / Shut-Off SGT-0150 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS AUTOMÁTICAS / SHUT-OFF PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.5~3.5Nm (3~25 kgf.m)",
      "110V~220V / 50~80 Hz",
      "700  1.100 RPM",
      "0,450 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.3~2.5Nm (3~25 kgf.m)",
      "Código do Produto: SGT-0150",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-t10p",
    "name": "Parafusadeiras Elétricas Industriais SGT-PE-T10P Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-pe-t10p-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-4bca0e1c3862.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-f25e9ae405e5.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-PE-T10P Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-PE-T10P",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-t20",
    "name": "Parafusadeiras Elétricas Industriais SGT-PE-T20 Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-pe-t20-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-544b27ac2928.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-5c2dc0c2ab44.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-PE-T20 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-PE-T20",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-pe-t20p",
    "name": "Parafusadeiras Elétricas Industriais SGT-PE-T20P Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-pe-t20p-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-ed5a668539c3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-29abc8cdb22f.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-PE-T20P Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-PE-T20P",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0709a",
    "name": "Parafusadeiras Elétricas Industriais SGT-0709A Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-0709a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-75afd128082c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-9f059581c272.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-0709A Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-0709A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0719",
    "name": "Parafusadeiras Elétricas Industriais SGT-0719 Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-0719-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-22007dd30476.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-b575836b7a2d.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-0719 Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-0719",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0713a",
    "name": "Parafusadeiras Elétricas Industriais SGT-0713A Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-0713a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-237c9a7fb3a2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-82046f231aaa.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-0713A Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-0713A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0723a",
    "name": "Parafusadeiras Elétricas Industriais SGT-0723A Sigma Tools",
    "slug": "parafusadeiras-eletricas-industriais-sgt-0723a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-51ddbe984741.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/parafusadeiras-eletricas-indus-0f6d0c2acbf5.webp"
    ],
    "altText": "Parafusadeiras Elétricas Industriais SGT-0723A Sigma Tools Athena Soluções Automotivas",
    "description": "PARAFUSADEIRAS ELÉTRICAS INDUSTRIAIS REBITADORES DE REPUXO HIDROPNEUMÁTICOS INFORMAÇÕES TÉCNICAS SGT-PE-T10P",
    "specs": [
      "VELOCIDADE LIVRE",
      "0.2~0.98Nm (2~10 kgf.m)",
      "24V~36V / 50~80 Hz",
      "900  1.200 RPM",
      "0,500 kg",
      "VENDA MEDIANTE CONSULTA TÉCNICA!",
      "VELOCIDADE LIVRE",
      "0.49~1.96Nm (5~20 kgf.m)",
      "Código do Produto: SGT-0723A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7705",
    "name": "Ferramenta SGT-7705 Sigma Tools",
    "slug": "ferramenta-sgt-7705-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7705-sigma-tool-9b547e9f80b3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7705-sigma-tool-570957791117.webp"
    ],
    "altText": "Ferramenta SGT-7705 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-7705",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0724a",
    "name": "Ferramenta SGT-0724A Sigma Tools",
    "slug": "ferramenta-sgt-0724a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0724a-sigma-too-9e33c1227ef8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0724a-sigma-too-4c9a2de5929d.webp"
    ],
    "altText": "Ferramenta SGT-0724A Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-0724A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0714a",
    "name": "Ferramenta SGT-0714A Sigma Tools",
    "slug": "ferramenta-sgt-0714a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0714a-sigma-too-e4cb9476b479.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0714a-sigma-too-6feb4a8a0054.webp"
    ],
    "altText": "Ferramenta SGT-0714A Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-0714A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0725a",
    "name": "Ferramenta SGT-0725A Sigma Tools",
    "slug": "ferramenta-sgt-0725a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0725a-sigma-too-9aacc400b62a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0725a-sigma-too-13840a2f1a58.webp"
    ],
    "altText": "Ferramenta SGT-0725A Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-0725A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0731",
    "name": "Ferramenta SGT-0731 Sigma Tools",
    "slug": "ferramenta-sgt-0731-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0731-sigma-tool-9a56ef187802.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0731-sigma-tool-75c5be82f2fa.webp"
    ],
    "altText": "Ferramenta SGT-0731 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-0731",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0740",
    "name": "Ferramenta SGT-0740 Sigma Tools",
    "slug": "ferramenta-sgt-0740-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0740-sigma-tool-eea967de93e6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0740-sigma-tool-53351003f953.webp"
    ],
    "altText": "Ferramenta SGT-0740 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO HIDROPNEUMÁTICOS REBITADORES DE REPUXO À BATERIA",
    "specs": [
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "1,9 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "3 PCM",
      "1,6 kg",
      "COM VÁCUO",
      "Código do Produto: SGT-0740",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7710",
    "name": "Ferramenta SGT-7710 Sigma Tools",
    "slug": "ferramenta-sgt-7710-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7710-sigma-tool-4e98f9a01e0a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7710-sigma-tool-07f484933b7f.webp"
    ],
    "altText": "Ferramenta SGT-7710 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-7710",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7706",
    "name": "Ferramenta SGT-7706 Sigma Tools",
    "slug": "ferramenta-sgt-7706-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7706-sigma-tool-1d1719ecb4de.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7706-sigma-tool-f8d139c57c42.webp"
    ],
    "altText": "Ferramenta SGT-7706 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-7706",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1311",
    "name": "Ferramenta SGT-1311 Sigma Tools",
    "slug": "ferramenta-sgt-1311-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1311-sigma-tool-2e2819e0f830.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1311-sigma-tool-8d266d991ba7.webp"
    ],
    "altText": "Ferramenta SGT-1311 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-1311",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1324",
    "name": "Ferramenta SGT-1324 Sigma Tools",
    "slug": "ferramenta-sgt-1324-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1324-sigma-tool-c667c22d0547.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1324-sigma-tool-0b97d1374b9a.webp"
    ],
    "altText": "Ferramenta SGT-1324 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-1324",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1421",
    "name": "Ferramenta SGT-1421 Sigma Tools",
    "slug": "ferramenta-sgt-1421-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1421-sigma-tool-8f51066690d4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1421-sigma-tool-7900ceb4f018.webp"
    ],
    "altText": "Ferramenta SGT-1421 Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-1421",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1411a",
    "name": "Ferramenta SGT-1411A Sigma Tools",
    "slug": "ferramenta-sgt-1411a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1411a-sigma-too-bb538c083aeb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1411a-sigma-too-a3ea03f8db49.webp"
    ],
    "altText": "Ferramenta SGT-1411A Sigma Tools Athena Soluções Automotivas",
    "description": "REBITADORES DE REPUXO À BATERIA MALETA COM 2 BATERIAS E 1 CARREGADOR. ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "BIVOLT",
      "2,1 kg",
      "SEM ESCOVAS",
      "LIION 2.0Ah | 18V",
      "CAPACIDADE DE REBITE (POL)",
      "BIVOLT",
      "Código do Produto: SGT-1411A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1455",
    "name": "Ferramenta SGT-1455 Sigma Tools",
    "slug": "ferramenta-sgt-1455-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1455-sigma-tool-c01a0a23a286.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1455-sigma-tool-ca5860a16e21.webp"
    ],
    "altText": "Ferramenta SGT-1455 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MAGAZINE PREGADOR PNEUMÁTICO 550 CAPACIDADE DO MAGAZINE",
    "specs": [
      "MIN: 2,1mm  MÁX: 2,3",
      "CAB: 5,5mm  5,7mm",
      "8,3 BAR",
      "1,5 PCM",
      "2,68 kg",
      "MIN: 2,3mm  MÁX: 2,9",
      "CAB: 5,7mm  7,0mm",
      "8,3 BAR",
      "Código do Produto: SGT-1455",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1470",
    "name": "Ferramenta SGT-1470 Sigma Tools",
    "slug": "ferramenta-sgt-1470-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1470-sigma-tool-a91d69d046c0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1470-sigma-tool-4482409143c1.webp"
    ],
    "altText": "Ferramenta SGT-1470 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MAGAZINE PREGADOR PNEUMÁTICO 550 CAPACIDADE DO MAGAZINE",
    "specs": [
      "MIN: 2,1mm  MÁX: 2,3",
      "CAB: 5,5mm  5,7mm",
      "8,3 BAR",
      "1,5 PCM",
      "2,68 kg",
      "MIN: 2,3mm  MÁX: 2,9",
      "CAB: 5,7mm  7,0mm",
      "8,3 BAR",
      "Código do Produto: SGT-1470",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1480",
    "name": "Ferramenta SGT-1480 Sigma Tools",
    "slug": "ferramenta-sgt-1480-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1480-sigma-tool-a33f16ea073f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1480-sigma-tool-fce4f1e3ca0b.webp"
    ],
    "altText": "Ferramenta SGT-1480 Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MAGAZINE PREGADOR PNEUMÁTICO 550 CAPACIDADE DO MAGAZINE",
    "specs": [
      "MIN: 2,1mm  MÁX: 2,3",
      "CAB: 5,5mm  5,7mm",
      "8,3 BAR",
      "1,5 PCM",
      "2,68 kg",
      "MIN: 2,3mm  MÁX: 2,9",
      "CAB: 5,7mm  7,0mm",
      "8,3 BAR",
      "Código do Produto: SGT-1480",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7102-pro",
    "name": "Ferramenta SGT-7102-PRO Sigma Tools",
    "slug": "ferramenta-sgt-7102-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7102-pro-sigma--fd86b1c0214e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7102-pro-sigma--05fd59ccb14f.webp"
    ],
    "altText": "Ferramenta SGT-7102-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MAGAZINE PREGADOR PNEUMÁTICO 550 CAPACIDADE DO MAGAZINE",
    "specs": [
      "MIN: 2,1mm  MÁX: 2,3",
      "CAB: 5,5mm  5,7mm",
      "8,3 BAR",
      "1,5 PCM",
      "2,68 kg",
      "MIN: 2,3mm  MÁX: 2,9",
      "CAB: 5,7mm  7,0mm",
      "8,3 BAR",
      "Código do Produto: SGT-7102-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-7101-pro",
    "name": "Ferramenta SGT-7101-PRO Sigma Tools",
    "slug": "ferramenta-sgt-7101-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7101-pro-sigma--a6ff35804ce2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-7101-pro-sigma--94f49159d0a9.webp"
    ],
    "altText": "Ferramenta SGT-7101-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "CAPACIDADE DO MAGAZINE PREGADOR PNEUMÁTICO 550 CAPACIDADE DO MAGAZINE",
    "specs": [
      "MIN: 2,1mm  MÁX: 2,3",
      "CAB: 5,5mm  5,7mm",
      "8,3 BAR",
      "1,5 PCM",
      "2,68 kg",
      "MIN: 2,3mm  MÁX: 2,9",
      "CAB: 5,7mm  7,0mm",
      "8,3 BAR",
      "Código do Produto: SGT-7101-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0421",
    "name": "Esmerilhadeiras Pneumáticas SGT-0421 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0421-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-eb66ff454fef.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-1f56e2d61f86.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0421 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0421",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0422",
    "name": "Esmerilhadeiras Pneumáticas SGT-0422 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0422-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-83e018d9c1a5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-c4d878c9d2ed.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0422 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0422",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0409",
    "name": "Esmerilhadeiras Pneumáticas SGT-0409 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0409-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-c1000de1ea70.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-3b25f6de3849.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0409 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0409",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0412",
    "name": "Esmerilhadeiras Pneumáticas SGT-0412 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0412-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-13d57a77c5aa.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-cd23ed9143c5.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0412 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0412",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0411",
    "name": "Esmerilhadeiras Pneumáticas SGT-0411 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0411-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-45a9cac940e4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-f7c4672a540c.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0411 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0411",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0415",
    "name": "Esmerilhadeiras Pneumáticas SGT-0415 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0415-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-8550c53597b7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-d6b65f27c058.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0415 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0415",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0423",
    "name": "Esmerilhadeiras Pneumáticas SGT-0423 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0423-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-a6156c895bab.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-e69edfe292ea.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0423 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0423",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0425",
    "name": "Esmerilhadeiras Pneumáticas SGT-0425 Sigma Tools",
    "slug": "esmerilhadeiras-pneumaticas-sgt-0425-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-e48cdc423da2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-pneumaticas-sg-9b3bbcfb23e6.webp"
    ],
    "altText": "Esmerilhadeiras Pneumáticas SGT-0425 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS PNEUMÁTICAS",
    "specs": [
      "VELOCIDADE LIVRE",
      "7.500 RPM",
      "15 PCM",
      "3,5 kg",
      "VELOCIDADE LIVRE",
      "8.400 RPM",
      "37 PCM",
      "3,3 kg",
      "Código do Produto: SGT-0425",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4406",
    "name": "Esmerilhadeiras Elétricas SGT-4406 Sigma Tools",
    "slug": "esmerilhadeiras-eletricas-sgt-4406-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--a1946848ae12.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--b641d29d8b57.webp"
    ],
    "altText": "Esmerilhadeiras Elétricas SGT-4406 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS ELÉTRICAS",
    "specs": [
      "VELOCIDADE",
      "Versão 127V e 220V",
      "3.000 à 11.000 RPM",
      "1020W",
      "127V",
      "220V",
      "ESMERILHADEIRA ANGULAR 5\"  1020W",
      "VELOCIDADE",
      "Código do Produto: SGT-4406",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4407",
    "name": "Esmerilhadeiras Elétricas SGT-4407 Sigma Tools",
    "slug": "esmerilhadeiras-eletricas-sgt-4407-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--60b832d3ceca.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--7ed65b04ce5d.webp"
    ],
    "altText": "Esmerilhadeiras Elétricas SGT-4407 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS ELÉTRICAS",
    "specs": [
      "VELOCIDADE",
      "Versão 127V e 220V",
      "3.000 à 11.000 RPM",
      "1020W",
      "127V",
      "220V",
      "ESMERILHADEIRA ANGULAR 5\"  1020W",
      "VELOCIDADE",
      "Código do Produto: SGT-4407",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4410",
    "name": "Esmerilhadeiras Elétricas SGT-4410 Sigma Tools",
    "slug": "esmerilhadeiras-eletricas-sgt-4410-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--b2a400f35e3c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--88a6807efaf9.webp"
    ],
    "altText": "Esmerilhadeiras Elétricas SGT-4410 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS ELÉTRICAS",
    "specs": [
      "VELOCIDADE",
      "Versão 127V e 220V",
      "3.000 à 11.000 RPM",
      "1020W",
      "127V",
      "220V",
      "ESMERILHADEIRA ANGULAR 5\"  1020W",
      "VELOCIDADE",
      "Código do Produto: SGT-4410",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4408",
    "name": "Esmerilhadeiras Elétricas SGT-4408 Sigma Tools",
    "slug": "esmerilhadeiras-eletricas-sgt-4408-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--2537ef1225a2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--286d9d0f7c34.webp"
    ],
    "altText": "Esmerilhadeiras Elétricas SGT-4408 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS ELÉTRICAS",
    "specs": [
      "VELOCIDADE",
      "Versão 127V e 220V",
      "3.000 à 11.000 RPM",
      "1020W",
      "127V",
      "220V",
      "ESMERILHADEIRA ANGULAR 5\"  1020W",
      "VELOCIDADE",
      "Código do Produto: SGT-4408",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4409",
    "name": "Esmerilhadeiras Elétricas SGT-4409 Sigma Tools",
    "slug": "esmerilhadeiras-eletricas-sgt-4409-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--1aadb30abdcf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/esmerilhadeiras-eletricas-sgt--da0f9874db00.webp"
    ],
    "altText": "Esmerilhadeiras Elétricas SGT-4409 Sigma Tools Athena Soluções Automotivas",
    "description": "ESMERILHADEIRAS ELÉTRICAS",
    "specs": [
      "VELOCIDADE",
      "Versão 127V e 220V",
      "3.000 à 11.000 RPM",
      "1020W",
      "127V",
      "220V",
      "ESMERILHADEIRA ANGULAR 5\"  1020W",
      "VELOCIDADE",
      "Código do Produto: SGT-4409",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0625",
    "name": "Ferramenta SGT-0625 Sigma Tools",
    "slug": "ferramenta-sgt-0625-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0625-sigma-tool-2d70451b42f0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0625-sigma-tool-f82cbb08d1a8.webp"
    ],
    "altText": "Ferramenta SGT-0625 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0625",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0615",
    "name": "Ferramenta SGT-0615 Sigma Tools",
    "slug": "ferramenta-sgt-0615-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0615-sigma-tool-77ebfac0a72b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0615-sigma-tool-17261fef567c.webp"
    ],
    "altText": "Ferramenta SGT-0615 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0615",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0615k",
    "name": "Ferramenta SGT-0615K Sigma Tools",
    "slug": "ferramenta-sgt-0615k-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0615k-sigma-too-ff76aa507b7f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0615k-sigma-too-581e948e9a24.webp"
    ],
    "altText": "Ferramenta SGT-0615K Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0615K",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0616",
    "name": "Ferramenta SGT-0616 Sigma Tools",
    "slug": "ferramenta-sgt-0616-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0616-sigma-tool-1ef7876f5884.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0616-sigma-tool-95d64535f204.webp"
    ],
    "altText": "Ferramenta SGT-0616 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0616",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0617",
    "name": "Ferramenta SGT-0617 Sigma Tools",
    "slug": "ferramenta-sgt-0617-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0617-sigma-tool-f55b6c138b88.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0617-sigma-tool-fa9860413670.webp"
    ],
    "altText": "Ferramenta SGT-0617 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0617",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0610",
    "name": "Ferramenta SGT-0610 Sigma Tools",
    "slug": "ferramenta-sgt-0610-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0610-sigma-tool-eb9a7056518a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0610-sigma-tool-d64ce4e4fcec.webp"
    ],
    "altText": "Ferramenta SGT-0610 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0610",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0642",
    "name": "Ferramenta SGT-0642 Sigma Tools",
    "slug": "ferramenta-sgt-0642-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0642-sigma-tool-abcfedb9aa01.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0642-sigma-tool-6c38ba295c6f.webp"
    ],
    "altText": "Ferramenta SGT-0642 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0642",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0613",
    "name": "Ferramenta SGT-0613 Sigma Tools",
    "slug": "ferramenta-sgt-0613-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0613-sigma-tool-9ada86395ac7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0613-sigma-tool-c3079a491b63.webp"
    ],
    "altText": "Ferramenta SGT-0613 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0613",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0614",
    "name": "Ferramenta SGT-0614 Sigma Tools",
    "slug": "ferramenta-sgt-0614-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0614-sigma-tool-98b696f363e2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0614-sigma-tool-c89693ea1592.webp"
    ],
    "altText": "Ferramenta SGT-0614 Sigma Tools Athena Soluções Automotivas",
    "description": "COM DOIS ROLAMENTOS FRONTAIS",
    "specs": [
      "VELOCIDADE LIVRE",
      "4 PCM  115 L /min",
      "54.000 RPM",
      "6.2 bar / 90 psi",
      "0,150 kg",
      "VELOCIDADE LIVRE",
      "22.000 RPM",
      "5 PCM",
      "Código do Produto: SGT-0614",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1512r",
    "name": "Ferramenta SGT-1512R Sigma Tools",
    "slug": "ferramenta-sgt-1512r-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1512r-sigma-too-b05089e4df5f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1512r-sigma-too-74c3316cc3a4.webp"
    ],
    "altText": "Ferramenta SGT-1512R Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1512R",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1512h",
    "name": "Ferramenta SGT-1512H Sigma Tools",
    "slug": "ferramenta-sgt-1512h-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1512h-sigma-too-638cff8f609b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1512h-sigma-too-7c4eaf6bab07.webp"
    ],
    "altText": "Ferramenta SGT-1512H Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1512H",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1513r",
    "name": "Ferramenta SGT-1513R Sigma Tools",
    "slug": "ferramenta-sgt-1513r-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1513r-sigma-too-586ae9891d88.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1513r-sigma-too-6c12057a6c16.webp"
    ],
    "altText": "Ferramenta SGT-1513R Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1513R",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1513h",
    "name": "Ferramenta SGT-1513H Sigma Tools",
    "slug": "ferramenta-sgt-1513h-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1513h-sigma-too-f1ca557ad243.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1513h-sigma-too-dfe83b29f2c2.webp"
    ],
    "altText": "Ferramenta SGT-1513H Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1513H",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1514r",
    "name": "Ferramenta SGT-1514R Sigma Tools",
    "slug": "ferramenta-sgt-1514r-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1514r-sigma-too-d657f2c36666.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1514r-sigma-too-a3272eaf3d39.webp"
    ],
    "altText": "Ferramenta SGT-1514R Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1514R",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1514h",
    "name": "Ferramenta SGT-1514H Sigma Tools",
    "slug": "ferramenta-sgt-1514h-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1514h-sigma-too-60d82fa94497.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1514h-sigma-too-ccf0d02a4f10.webp"
    ],
    "altText": "Ferramenta SGT-1514H Sigma Tools Athena Soluções Automotivas",
    "description": "07 51 0610 38  Pinça 3mm Para SGT-0610 07 51 0610 39  Pinça 6mm Para SGT-0610 07 51 0613 23 Pinça 1/4” Para SGT-0613",
    "specs": [
      "07 51 0610 24  Pinça 1/4\" Para SGT0610",
      "07 51 0610 37  Pinça 1/8\" Para SGT0610",
      "DIÂMETRO: 50mm / 2”",
      "EMBALAGEM: 1 UND",
      "DIÂMETRO: 76mm / 3”",
      "EMBALAGEM: 1 UND",
      "2,3 PCM",
      "6.2 bar / 90 psi",
      "Código do Produto: SGT-1514H",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1515",
    "name": "Ferramenta SGT-1515 Sigma Tools",
    "slug": "ferramenta-sgt-1515-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1515-sigma-tool-5808feda5de7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1515-sigma-tool-2029f5aac358.webp"
    ],
    "altText": "Ferramenta SGT-1515 Sigma Tools Athena Soluções Automotivas",
    "description": "0751151517 - Mola para martelete pneumático 0751151518 - Cinzel Talhadeira Longo Redondo 0751151519 - Cinzel Ponteira Longo Redondo",
    "specs": [
      "0,400 kg",
      "3 PCM",
      "6.2 bar / 90 psi",
      "1,1 kg",
      "2 PCM",
      "6.2 bar / 90 psi",
      "0752151230  Cinzel Talhadeira Longo Sextavado",
      "0752151231  Cinzel Ponteira Longo Sextavado",
      "Código do Produto: SGT-1515",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1516",
    "name": "Ferramenta SGT-1516 Sigma Tools",
    "slug": "ferramenta-sgt-1516-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1516-sigma-tool-73877ddd87d4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1516-sigma-tool-5088552baa55.webp"
    ],
    "altText": "Ferramenta SGT-1516 Sigma Tools Athena Soluções Automotivas",
    "description": "0751151517 - Mola para martelete pneumático 0751151518 - Cinzel Talhadeira Longo Redondo 0751151519 - Cinzel Ponteira Longo Redondo",
    "specs": [
      "0,400 kg",
      "3 PCM",
      "6.2 bar / 90 psi",
      "1,1 kg",
      "2 PCM",
      "6.2 bar / 90 psi",
      "0752151230  Cinzel Talhadeira Longo Sextavado",
      "0752151231  Cinzel Ponteira Longo Sextavado",
      "Código do Produto: SGT-1516",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4400-pro",
    "name": "Ferramenta SGT-4400-PRO Sigma Tools",
    "slug": "ferramenta-sgt-4400-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4400-pro-sigma--a6080c00aae1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4400-pro-sigma--d365b1996826.webp"
    ],
    "altText": "Ferramenta SGT-4400-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "0751151517 - Mola para martelete pneumático 0751151518 - Cinzel Talhadeira Longo Redondo 0751151519 - Cinzel Ponteira Longo Redondo",
    "specs": [
      "0,400 kg",
      "3 PCM",
      "6.2 bar / 90 psi",
      "1,1 kg",
      "2 PCM",
      "6.2 bar / 90 psi",
      "0752151230  Cinzel Talhadeira Longo Sextavado",
      "0752151231  Cinzel Ponteira Longo Sextavado",
      "Código do Produto: SGT-4400-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0235",
    "name": "Ferramenta SGT-0235 Sigma Tools",
    "slug": "ferramenta-sgt-0235-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0235-sigma-tool-c05a19b236c9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0235-sigma-tool-418a41cbe99d.webp"
    ],
    "altText": "Ferramenta SGT-0235 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0235",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0236",
    "name": "Ferramenta SGT-0236 Sigma Tools",
    "slug": "ferramenta-sgt-0236-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0236-sigma-tool-072b24f57dd4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0236-sigma-tool-0dda7f0c61c4.webp"
    ],
    "altText": "Ferramenta SGT-0236 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0236",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0617s",
    "name": "Ferramenta SGT-0617S Sigma Tools",
    "slug": "ferramenta-sgt-0617s-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0617s-sigma-too-0eb1b2aafae3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0617s-sigma-too-7156a53e1084.webp"
    ],
    "altText": "Ferramenta SGT-0617S Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0617S",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0613s",
    "name": "Ferramenta SGT-0613S Sigma Tools",
    "slug": "ferramenta-sgt-0613s-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0613s-sigma-too-db4b21059dd1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0613s-sigma-too-d1015a5416c0.webp"
    ],
    "altText": "Ferramenta SGT-0613S Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0613S",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0635",
    "name": "Ferramenta SGT-0635 Sigma Tools",
    "slug": "ferramenta-sgt-0635-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0635-sigma-tool-ccf6781a6e8b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0635-sigma-tool-63893dd244de.webp"
    ],
    "altText": "Ferramenta SGT-0635 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0635",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0635s",
    "name": "Ferramenta SGT-0635S Sigma Tools",
    "slug": "ferramenta-sgt-0635s-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0635s-sigma-too-bf981d6829a3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0635s-sigma-too-7ae5314c71c3.webp"
    ],
    "altText": "Ferramenta SGT-0635S Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PARA RECAPAGEM CAPACIDADE DO MANDRIL DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "14 PCM  396 L / min",
      "600 RPM",
      "6.2 bar / 90 psi",
      "20 Nm",
      "1,2 kg",
      "VELOCIDADE LIVRE",
      "29.7 PCM  840 L / min",
      "Código do Produto: SGT-0635S",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1215",
    "name": "Ferramenta SGT-1215 Sigma Tools",
    "slug": "ferramenta-sgt-1215-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1215-sigma-tool-d8aafc40c500.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1215-sigma-tool-d077f47eeac5.webp"
    ],
    "altText": "Ferramenta SGT-1215 Sigma Tools Athena Soluções Automotivas",
    "description": "25mm (ALUM.) / 20mm (AÇO) CORTADORES DE DISCO (CUT-OFF)",
    "specs": [
      "VELOCIDADE",
      "5 PCM",
      "2,5 kg",
      "VELOCIDADE",
      "10.000 RPM",
      "5,5 PCM",
      "0,620 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-1215",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1210",
    "name": "Ferramenta SGT-1210 Sigma Tools",
    "slug": "ferramenta-sgt-1210-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1210-sigma-tool-76f1b1bd5e74.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1210-sigma-tool-58df72315b77.webp"
    ],
    "altText": "Ferramenta SGT-1210 Sigma Tools Athena Soluções Automotivas",
    "description": "25mm (ALUM.) / 20mm (AÇO) CORTADORES DE DISCO (CUT-OFF)",
    "specs": [
      "VELOCIDADE",
      "5 PCM",
      "2,5 kg",
      "VELOCIDADE",
      "10.000 RPM",
      "5,5 PCM",
      "0,620 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-1210",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0441",
    "name": "Ferramenta SGT-0441 Sigma Tools",
    "slug": "ferramenta-sgt-0441-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0441-sigma-tool-466f5149a19c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0441-sigma-tool-d1eaa508084e.webp"
    ],
    "altText": "Ferramenta SGT-0441 Sigma Tools Athena Soluções Automotivas",
    "description": "25mm (ALUM.) / 20mm (AÇO) CORTADORES DE DISCO (CUT-OFF)",
    "specs": [
      "VELOCIDADE",
      "5 PCM",
      "2,5 kg",
      "VELOCIDADE",
      "10.000 RPM",
      "5,5 PCM",
      "0,620 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0441",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0442",
    "name": "Ferramenta SGT-0442 Sigma Tools",
    "slug": "ferramenta-sgt-0442-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0442-sigma-tool-28836f20e8bf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0442-sigma-tool-98bd31927041.webp"
    ],
    "altText": "Ferramenta SGT-0442 Sigma Tools Athena Soluções Automotivas",
    "description": "25mm (ALUM.) / 20mm (AÇO) CORTADORES DE DISCO (CUT-OFF)",
    "specs": [
      "VELOCIDADE",
      "5 PCM",
      "2,5 kg",
      "VELOCIDADE",
      "10.000 RPM",
      "5,5 PCM",
      "0,620 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0442",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1212",
    "name": "Ferramenta SGT-1212 Sigma Tools",
    "slug": "ferramenta-sgt-1212-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1212-sigma-tool-31578f000db8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1212-sigma-tool-9c65005ca084.webp"
    ],
    "altText": "Ferramenta SGT-1212 Sigma Tools Athena Soluções Automotivas",
    "description": "25mm (ALUM.) / 20mm (AÇO) CORTADORES DE DISCO (CUT-OFF)",
    "specs": [
      "VELOCIDADE",
      "5 PCM",
      "2,5 kg",
      "VELOCIDADE",
      "10.000 RPM",
      "5,5 PCM",
      "0,620 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-1212",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5200-pro",
    "name": "Ferramenta SGT-5200-PRO Sigma Tools",
    "slug": "ferramenta-sgt-5200-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5200-pro-sigma--dec21efa2f59.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5200-pro-sigma--81c63a579b7f.webp"
    ],
    "altText": "Ferramenta SGT-5200-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "SERRA MÁRMORE ELÉTRICA PROF. MÁXIMA DE CORTE DIMENSÕES (C x L x A)",
    "specs": [
      "SGT5200PRO / 127V",
      "SGT5200PRO / 220V",
      "1300W",
      "VELOCIDADE LIVRE",
      "3.000  13.800 RPM",
      "2,7 kg",
      "1300W",
      "SGT5221PRO / 127V",
      "Código do Produto: SGT-5200-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5221-pro",
    "name": "Ferramenta SGT-5221-PRO Sigma Tools",
    "slug": "ferramenta-sgt-5221-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5221-pro-sigma--1c4fd5407709.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5221-pro-sigma--942627b1d24e.webp"
    ],
    "altText": "Ferramenta SGT-5221-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "SERRA MÁRMORE ELÉTRICA PROF. MÁXIMA DE CORTE DIMENSÕES (C x L x A)",
    "specs": [
      "SGT5200PRO / 127V",
      "SGT5200PRO / 220V",
      "1300W",
      "VELOCIDADE LIVRE",
      "3.000  13.800 RPM",
      "2,7 kg",
      "1300W",
      "SGT5221PRO / 127V",
      "Código do Produto: SGT-5221-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0331",
    "name": "Lixadeira Elétrica À Úmido SGT-0331 Sigma Tools",
    "slug": "lixadeira-eletrica-a-umido-sgt-0331-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-fc29f5fb9d0f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-691b30b5b2f0.webp"
    ],
    "altText": "Lixadeira Elétrica À Úmido SGT-0331 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PNEUMÁTICAS À ÚMIDO LIXADEIRA ELÉTRICA À ÚMIDO DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "NÍVEL DE RUÍDO",
      "15 PCM  424 L / min",
      "11.000 RPM",
      "6.2 bar / 90 psi",
      "VIBRAÇÃO",
      "2,0 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-0331",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1220",
    "name": "Lixadeira Elétrica À Úmido SGT-1220 Sigma Tools",
    "slug": "lixadeira-eletrica-a-umido-sgt-1220-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-96388ced6c47.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-1220f2f2cf7b.webp"
    ],
    "altText": "Lixadeira Elétrica À Úmido SGT-1220 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PNEUMÁTICAS À ÚMIDO LIXADEIRA ELÉTRICA À ÚMIDO DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "NÍVEL DE RUÍDO",
      "15 PCM  424 L / min",
      "11.000 RPM",
      "6.2 bar / 90 psi",
      "VIBRAÇÃO",
      "2,0 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-1220",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4310",
    "name": "Lixadeira Elétrica À Úmido SGT-4310 Sigma Tools",
    "slug": "lixadeira-eletrica-a-umido-sgt-4310-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-cff602da5903.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-eletrica-a-umido-sgt-1f27dc7c259d.webp"
    ],
    "altText": "Lixadeira Elétrica À Úmido SGT-4310 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS PNEUMÁTICAS À ÚMIDO LIXADEIRA ELÉTRICA À ÚMIDO DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "NÍVEL DE RUÍDO",
      "15 PCM  424 L / min",
      "11.000 RPM",
      "6.2 bar / 90 psi",
      "VIBRAÇÃO",
      "2,0 kg",
      "VELOCIDADE LIVRE",
      "Código do Produto: SGT-4310",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1615",
    "name": "Ferramenta SGT-1615 Sigma Tools",
    "slug": "ferramenta-sgt-1615-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1615-sigma-tool-20365d25f684.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1615-sigma-tool-ab23c0bef205.webp"
    ],
    "altText": "Ferramenta SGT-1615 Sigma Tools Athena Soluções Automotivas",
    "description": "0751161523 - Agulhas em aço 2mm x 180mm (caixa com 100un). 0751161505 - Agulhas em aço 3mm x 180mm (caixa com 100un). 0751161524 - Agulhas em aço 4mm x 180mm (caixa com 50un).",
    "specs": [
      "CONJUNTO VÁLVULAGATILHO",
      "CONSUMÍVEIS DISPONÍVEIS PARA  SGT1616",
      "DEMAIS PEÇAS CONSULTE VISTAS EXPLODIDAS",
      "VELOCIDADE LIVRE",
      "8 PCM",
      "3,4 kg",
      "VELOCIDADE LIVRE",
      "8 PCM",
      "Código do Produto: SGT-1615",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1616",
    "name": "Ferramenta SGT-1616 Sigma Tools",
    "slug": "ferramenta-sgt-1616-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1616-sigma-tool-a48944ad2efe.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1616-sigma-tool-2dbae7672f41.webp"
    ],
    "altText": "Ferramenta SGT-1616 Sigma Tools Athena Soluções Automotivas",
    "description": "0751161523 - Agulhas em aço 2mm x 180mm (caixa com 100un). 0751161505 - Agulhas em aço 3mm x 180mm (caixa com 100un). 0751161524 - Agulhas em aço 4mm x 180mm (caixa com 50un).",
    "specs": [
      "CONJUNTO VÁLVULAGATILHO",
      "CONSUMÍVEIS DISPONÍVEIS PARA  SGT1616",
      "DEMAIS PEÇAS CONSULTE VISTAS EXPLODIDAS",
      "VELOCIDADE LIVRE",
      "8 PCM",
      "3,4 kg",
      "VELOCIDADE LIVRE",
      "8 PCM",
      "Código do Produto: SGT-1616",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1620",
    "name": "Ferramenta SGT-1620 Sigma Tools",
    "slug": "ferramenta-sgt-1620-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1620-sigma-tool-4edefd5ddb95.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1620-sigma-tool-645d4efe312e.webp"
    ],
    "altText": "Ferramenta SGT-1620 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-1620 Sigma Tools.",
    "specs": [
      "VELOCIDADE DE GOLPE",
      "4.8 PCM",
      "2,0 kg",
      "VELOCIDADE DE GOLPE",
      "10.3 PCM",
      "3,0 kg",
      "VELOCIDADE LIVRE",
      "3.000 à 5.000 RPM",
      "Código do Produto: SGT-1620",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1622",
    "name": "Ferramenta SGT-1622 Sigma Tools",
    "slug": "ferramenta-sgt-1622-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1622-sigma-tool-1c369c5a58eb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1622-sigma-tool-2ebdf578c494.webp"
    ],
    "altText": "Ferramenta SGT-1622 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-1622 Sigma Tools.",
    "specs": [
      "VELOCIDADE DE GOLPE",
      "4.8 PCM",
      "2,0 kg",
      "VELOCIDADE DE GOLPE",
      "10.3 PCM",
      "3,0 kg",
      "VELOCIDADE LIVRE",
      "3.000 à 5.000 RPM",
      "Código do Produto: SGT-1622",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1630",
    "name": "Ferramenta SGT-1630 Sigma Tools",
    "slug": "ferramenta-sgt-1630-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1630-sigma-tool-39ede9426d5f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1630-sigma-tool-dd31a5a01551.webp"
    ],
    "altText": "Ferramenta SGT-1630 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-1630 Sigma Tools.",
    "specs": [
      "VELOCIDADE DE GOLPE",
      "4.8 PCM",
      "2,0 kg",
      "VELOCIDADE DE GOLPE",
      "10.3 PCM",
      "3,0 kg",
      "VELOCIDADE LIVRE",
      "3.000 à 5.000 RPM",
      "Código do Produto: SGT-1630",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1621",
    "name": "Ferramenta SGT-1621 Sigma Tools",
    "slug": "ferramenta-sgt-1621-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1621-sigma-tool-9bc06214b1dd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1621-sigma-tool-c9cf0204f53f.webp"
    ],
    "altText": "Ferramenta SGT-1621 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-1621 Sigma Tools.",
    "specs": [
      "VELOCIDADE DE GOLPE",
      "4.8 PCM",
      "2,0 kg",
      "VELOCIDADE DE GOLPE",
      "10.3 PCM",
      "3,0 kg",
      "VELOCIDADE LIVRE",
      "3.000 à 5.000 RPM",
      "Código do Produto: SGT-1621",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1623",
    "name": "Ferramenta SGT-1623 Sigma Tools",
    "slug": "ferramenta-sgt-1623-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1623-sigma-tool-d130f57be4b7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1623-sigma-tool-6dd1497d1e67.webp"
    ],
    "altText": "Ferramenta SGT-1623 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-1623 Sigma Tools.",
    "specs": [
      "VELOCIDADE DE GOLPE",
      "4.8 PCM",
      "2,0 kg",
      "VELOCIDADE DE GOLPE",
      "10.3 PCM",
      "3,0 kg",
      "VELOCIDADE LIVRE",
      "3.000 à 5.000 RPM",
      "Código do Produto: SGT-1623",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0318-sa",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0318-SA Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0318-sa-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-cec5f7431007.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-41edae71b2a6.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0318-SA Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0318-SA",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0319",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0319 Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0319-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-22d19e2b09e0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-01f5b59bf4b8.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0319 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0319",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0319-sa",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0319-SA Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0319-sa-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-341475dca7ca.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-c2a3e2370648.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0319-SA Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0319-SA",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0308",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0308 Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0308-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-fcb20a831f3e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-b84f9181d3d3.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0308 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0308",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0309",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0309 Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0309-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-5633a2c2edeb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-0f905bedb70a.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0309 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0309",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0314",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0314 Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0314-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-676193e9a2ec.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-e67ae17830fb.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0314 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0314",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0315",
    "name": "Lixadeiras Orbitais (Hookit) SGT-0315 Sigma Tools",
    "slug": "lixadeiras-orbitais-hookit-sgt-0315-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-b68bbb860853.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-orbitais-hookit-sgt-6a183ea03e26.webp"
    ],
    "altText": "Lixadeiras Orbitais (Hookit) SGT-0315 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT)",
    "specs": [
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "11.000 RPM",
      "0,800 kg",
      "LEVE",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "Código do Produto: SGT-0315",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0362b",
    "name": "Lixadeiras SGT-0362B Sigma Tools",
    "slug": "lixadeiras-sgt-0362b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0362b-sigma-too-b51a6b42cd94.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0362b-sigma-too-a9374b55ae96.webp"
    ],
    "altText": "Lixadeiras SGT-0362B Sigma Tools Athena Soluções Automotivas",
    "description": "75 mm / 115 mm / 125 mm",
    "specs": [
      "VERTICAL",
      "VELOCIDADE LIVRE",
      "4 PCM",
      "18.000 RPM",
      "1,0 kg",
      "VELOCIDADE LIVRE",
      "14 PCM",
      "5.000 RPM",
      "Código do Produto: SGT-0362B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0350",
    "name": "Lixadeiras SGT-0350 Sigma Tools",
    "slug": "lixadeiras-sgt-0350-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0350-sigma-tool-5dcf0950393b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0350-sigma-tool-c79332720ead.webp"
    ],
    "altText": "Lixadeiras SGT-0350 Sigma Tools Athena Soluções Automotivas",
    "description": "75 mm / 115 mm / 125 mm",
    "specs": [
      "VERTICAL",
      "VELOCIDADE LIVRE",
      "4 PCM",
      "18.000 RPM",
      "1,0 kg",
      "VELOCIDADE LIVRE",
      "14 PCM",
      "5.000 RPM",
      "Código do Produto: SGT-0350",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0325",
    "name": "Lixadeiras SGT-0325 Sigma Tools",
    "slug": "lixadeiras-sgt-0325-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0325-sigma-tool-9814e8708f3b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0325-sigma-tool-e253d63553f8.webp"
    ],
    "altText": "Lixadeiras SGT-0325 Sigma Tools Athena Soluções Automotivas",
    "description": "75 mm / 115 mm / 125 mm",
    "specs": [
      "VERTICAL",
      "VELOCIDADE LIVRE",
      "4 PCM",
      "18.000 RPM",
      "1,0 kg",
      "VELOCIDADE LIVRE",
      "14 PCM",
      "5.000 RPM",
      "Código do Produto: SGT-0325",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0320",
    "name": "Lixadeiras SGT-0320 Sigma Tools",
    "slug": "lixadeiras-sgt-0320-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0320-sigma-tool-59cd1f6b772a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-0320-sigma-tool-daa5c4e156b8.webp"
    ],
    "altText": "Lixadeiras SGT-0320 Sigma Tools Athena Soluções Automotivas",
    "description": "75 mm / 115 mm / 125 mm",
    "specs": [
      "VERTICAL",
      "VELOCIDADE LIVRE",
      "4 PCM",
      "18.000 RPM",
      "1,0 kg",
      "VELOCIDADE LIVRE",
      "14 PCM",
      "5.000 RPM",
      "Código do Produto: SGT-0320",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0391",
    "name": "Ferramenta SGT-0391 Sigma Tools",
    "slug": "ferramenta-sgt-0391-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0391-sigma-tool-a56a1746db09.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0391-sigma-tool-961d59b498b8.webp"
    ],
    "altText": "Ferramenta SGT-0391 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÃO APROX. (C x L) DIMENSÃO APROX. (C x L)",
    "specs": [
      "VELOCIDADE LIVRE",
      "0,4 x 13” pol / 10 x 330 mm",
      "7 PCM",
      "16.000 RPM",
      "1,1 kg",
      "VELOCIDADE LIVRE",
      "0,8 x 20,5” pol / 20 x 520 mm",
      "7 PCM",
      "Código do Produto: SGT-0391",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0392",
    "name": "Ferramenta SGT-0392 Sigma Tools",
    "slug": "ferramenta-sgt-0392-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0392-sigma-tool-5a251b0e9db4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0392-sigma-tool-dbbae244cbd9.webp"
    ],
    "altText": "Ferramenta SGT-0392 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÃO APROX. (C x L) DIMENSÃO APROX. (C x L)",
    "specs": [
      "VELOCIDADE LIVRE",
      "0,4 x 13” pol / 10 x 330 mm",
      "7 PCM",
      "16.000 RPM",
      "1,1 kg",
      "VELOCIDADE LIVRE",
      "0,8 x 20,5” pol / 20 x 520 mm",
      "7 PCM",
      "Código do Produto: SGT-0392",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0393",
    "name": "Ferramenta SGT-0393 Sigma Tools",
    "slug": "ferramenta-sgt-0393-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0393-sigma-tool-5755221d88c4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0393-sigma-tool-502527833cc2.webp"
    ],
    "altText": "Ferramenta SGT-0393 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÃO APROX. (C x L) DIMENSÃO APROX. (C x L)",
    "specs": [
      "VELOCIDADE LIVRE",
      "0,4 x 13” pol / 10 x 330 mm",
      "7 PCM",
      "16.000 RPM",
      "1,1 kg",
      "VELOCIDADE LIVRE",
      "0,8 x 20,5” pol / 20 x 520 mm",
      "7 PCM",
      "Código do Produto: SGT-0393",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0394",
    "name": "Ferramenta SGT-0394 Sigma Tools",
    "slug": "ferramenta-sgt-0394-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0394-sigma-tool-f2e51968386c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0394-sigma-tool-572a52c95a75.webp"
    ],
    "altText": "Ferramenta SGT-0394 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÃO APROX. (C x L) DIMENSÃO APROX. (C x L)",
    "specs": [
      "VELOCIDADE LIVRE",
      "0,4 x 13” pol / 10 x 330 mm",
      "7 PCM",
      "16.000 RPM",
      "1,1 kg",
      "VELOCIDADE LIVRE",
      "0,8 x 20,5” pol / 20 x 520 mm",
      "7 PCM",
      "Código do Produto: SGT-0394",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-0311",
    "name": "Ferramenta MXT-0311 Sigma Tools",
    "slug": "ferramenta-mxt-0311-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-0311-sigma-tool-76b2cb190f0a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-0311-sigma-tool-7229741ebd7f.webp"
    ],
    "altText": "Ferramenta MXT-0311 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT) DIMENSÕES (C x L x A) DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "1,14 kg",
      "SUPORTE VELCRADO  MXT0311",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "Código do Produto: MXT-0311",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-0311-sa",
    "name": "Ferramenta MXT-0311-SA Sigma Tools",
    "slug": "ferramenta-mxt-0311-sa-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-0311-sa-sigma-t-7a1cc8edb4e1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-0311-sa-sigma-t-279486f8590a.webp"
    ],
    "altText": "Ferramenta MXT-0311-SA Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT) DIMENSÕES (C x L x A) DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "1,14 kg",
      "SUPORTE VELCRADO  MXT0311",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "Código do Produto: MXT-0311-SA",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4321-pro",
    "name": "Ferramenta SGT-4321-PRO Sigma Tools",
    "slug": "ferramenta-sgt-4321-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4321-pro-sigma--5468061bf186.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4321-pro-sigma--4f8d8ae2b3f5.webp"
    ],
    "altText": "Ferramenta SGT-4321-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT) DIMENSÕES (C x L x A) DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "1,14 kg",
      "SUPORTE VELCRADO  MXT0311",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "Código do Produto: SGT-4321-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4322-pro",
    "name": "Ferramenta SGT-4322-PRO Sigma Tools",
    "slug": "ferramenta-sgt-4322-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4322-pro-sigma--a1ad9204318c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4322-pro-sigma--588be4402463.webp"
    ],
    "altText": "Ferramenta SGT-4322-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRAS ORBITAIS (HOOKIT) DIMENSÕES (C x L x A) DIMENSÕES (C x L x A)",
    "specs": [
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "1,14 kg",
      "SUPORTE VELCRADO  MXT0311",
      "VELOCIDADE LIVRE",
      "9 PCM",
      "10.000 RPM",
      "Código do Produto: SGT-4322-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0810",
    "name": "Ferramenta SGT-0810 Sigma Tools",
    "slug": "ferramenta-sgt-0810-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0810-sigma-tool-531cb55d8937.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0810-sigma-tool-1b15e37bf073.webp"
    ],
    "altText": "Ferramenta SGT-0810 Sigma Tools Athena Soluções Automotivas",
    "description": "FRESA PARA DESPONTEADEIRA Ø8mm FRESA PARA DESPONTEADEIRA Ø6,5mm Lâmina Reta Rebaixada",
    "specs": [
      "FACA REMOVEDORA DE PARABRISAS",
      "VELOCIDADE LIVRE",
      "2.000 RPM",
      "13 PCM",
      "1,4 kg",
      "VELOCIDADE LIVRE",
      "650 RPM",
      "6 PCM",
      "Código do Produto: SGT-0810",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0811",
    "name": "Ferramenta SGT-0811 Sigma Tools",
    "slug": "ferramenta-sgt-0811-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0811-sigma-tool-365fa5919a2f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0811-sigma-tool-13e16ae17ce3.webp"
    ],
    "altText": "Ferramenta SGT-0811 Sigma Tools Athena Soluções Automotivas",
    "description": "FRESA PARA DESPONTEADEIRA Ø8mm FRESA PARA DESPONTEADEIRA Ø6,5mm Lâmina Reta Rebaixada",
    "specs": [
      "FACA REMOVEDORA DE PARABRISAS",
      "VELOCIDADE LIVRE",
      "2.000 RPM",
      "13 PCM",
      "1,4 kg",
      "VELOCIDADE LIVRE",
      "650 RPM",
      "6 PCM",
      "Código do Produto: SGT-0811",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0910",
    "name": "Ferramenta SGT-0910 Sigma Tools",
    "slug": "ferramenta-sgt-0910-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0910-sigma-tool-876d54817dfb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0910-sigma-tool-ad6b33404c5e.webp"
    ],
    "altText": "Ferramenta SGT-0910 Sigma Tools Athena Soluções Automotivas",
    "description": "FRESA PARA DESPONTEADEIRA Ø8mm FRESA PARA DESPONTEADEIRA Ø6,5mm Lâmina Reta Rebaixada",
    "specs": [
      "FACA REMOVEDORA DE PARABRISAS",
      "VELOCIDADE LIVRE",
      "2.000 RPM",
      "13 PCM",
      "1,4 kg",
      "VELOCIDADE LIVRE",
      "650 RPM",
      "6 PCM",
      "Código do Produto: SGT-0910",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9900",
    "name": "Ferramenta SGT-9900 Sigma Tools",
    "slug": "ferramenta-sgt-9900-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9900-sigma-tool-95130f91646f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9900-sigma-tool-3f8434687c02.webp"
    ],
    "altText": "Ferramenta SGT-9900 Sigma Tools Athena Soluções Automotivas",
    "description": "FRESA PARA DESPONTEADEIRA Ø8mm FRESA PARA DESPONTEADEIRA Ø6,5mm Lâmina Reta Rebaixada",
    "specs": [
      "FACA REMOVEDORA DE PARABRISAS",
      "VELOCIDADE LIVRE",
      "2.000 RPM",
      "13 PCM",
      "1,4 kg",
      "VELOCIDADE LIVRE",
      "650 RPM",
      "6 PCM",
      "Código do Produto: SGT-9900",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0630",
    "name": "Ferramenta SGT-0630 Sigma Tools",
    "slug": "ferramenta-sgt-0630-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0630-sigma-tool-f7258d6dfeb9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-0630-sigma-tool-80db65101994.webp"
    ],
    "altText": "Ferramenta SGT-0630 Sigma Tools Athena Soluções Automotivas",
    "description": "PUXADOR MARTELINHO DE OURO FILME MASCARAMENTO ELETROESTÁTICO CONSUMO DE AR INSTANTÂNEO",
    "specs": [
      "VELOCIDADE LIVRE",
      "3.500 RPM",
      "11,5 PCM",
      "1,1 kg",
      "6,2 bar / 90 psi",
      "13,8 PCM",
      "3,36 kg",
      "CONSUMÍVEIS DISPONÍVEIS",
      "Código do Produto: SGT-0630",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9920",
    "name": "Ferramenta SGT-9920 Sigma Tools",
    "slug": "ferramenta-sgt-9920-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9920-sigma-tool-8005d595df75.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9920-sigma-tool-598534d4bbee.webp"
    ],
    "altText": "Ferramenta SGT-9920 Sigma Tools Athena Soluções Automotivas",
    "description": "PUXADOR MARTELINHO DE OURO FILME MASCARAMENTO ELETROESTÁTICO CONSUMO DE AR INSTANTÂNEO",
    "specs": [
      "VELOCIDADE LIVRE",
      "3.500 RPM",
      "11,5 PCM",
      "1,1 kg",
      "6,2 bar / 90 psi",
      "13,8 PCM",
      "3,36 kg",
      "CONSUMÍVEIS DISPONÍVEIS",
      "Código do Produto: SGT-9920",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0307",
    "name": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-0307 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-industrial-sgt-0307-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-60da98d75748.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-681a48c7e4df.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-0307 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA INDUSTRIAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA INDUSTRIAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "2 PCM",
      "0,650 kg",
      "12.000 RPM",
      "SUPORTE VELCRADO  SGT0307",
      "SUPORTE VELCRADO (30MM)  SGT0307",
      "Código do Produto: SGT-0307",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1116",
    "name": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1116 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-industrial-sgt-1116-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-dc0bf8ae992a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-240e15f1e2cd.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1116 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA INDUSTRIAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA INDUSTRIAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "2 PCM",
      "0,650 kg",
      "12.000 RPM",
      "SUPORTE VELCRADO  SGT0307",
      "SUPORTE VELCRADO (30MM)  SGT0307",
      "Código do Produto: SGT-1116",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1117",
    "name": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1117 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-industrial-sgt-1117-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-feb58ceb30f7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-f0fb5e8377a2.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1117 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA INDUSTRIAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA INDUSTRIAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "2 PCM",
      "0,650 kg",
      "12.000 RPM",
      "SUPORTE VELCRADO  SGT0307",
      "SUPORTE VELCRADO (30MM)  SGT0307",
      "Código do Produto: SGT-1117",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1120",
    "name": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1120 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-industrial-sgt-1120-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-6e18e9ceb1c8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-9e264adbd0a1.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Industrial SGT-1120 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA INDUSTRIAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA INDUSTRIAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "2 PCM",
      "0,650 kg",
      "12.000 RPM",
      "SUPORTE VELCRADO  SGT0307",
      "SUPORTE VELCRADO (30MM)  SGT0307",
      "Código do Produto: SGT-1120",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-0305",
    "name": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-0305 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-profissional-sgt-0305-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-b396ae74d7db.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-140c6923413a.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-0305 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA PROFISSIONAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA PROFISSIONAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "6 PCM",
      "0,700 kg",
      "15.000 RPM",
      "VELOCIDADE LIVRE",
      "3,5 PCM",
      "Código do Produto: SGT-0305",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1119",
    "name": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-1119 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-profissional-sgt-1119-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-44cbe3062cd7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-edefb9efe5b0.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-1119 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA PROFISSIONAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA PROFISSIONAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "6 PCM",
      "0,700 kg",
      "15.000 RPM",
      "VELOCIDADE LIVRE",
      "3,5 PCM",
      "Código do Produto: SGT-1119",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1115",
    "name": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-1115 Sigma Tools",
    "slug": "lixadeira-pneumatica-detalhamento-linha-profissional-sgt-1115-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-b44109682577.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeira-pneumatica-detalhame-4083164345af.webp"
    ],
    "altText": "Lixadeira Pneumática Detalhamento - Linha Profissional SGT-1115 Sigma Tools Athena Soluções Automotivas",
    "description": "LIXADEIRA PNEUMÁTICA DETALHAMENTO - LINHA PROFISSIONAL",
    "specs": [
      "POLITRIZES PNEUMÁTICAS DETALHAMENTO  LINHA PROFISSIONAL",
      "ÓRBITA: 3/32” (3mm)",
      "VELOCIDADE LIVRE",
      "6 PCM",
      "0,700 kg",
      "15.000 RPM",
      "VELOCIDADE LIVRE",
      "3,5 PCM",
      "Código do Produto: SGT-1115",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5126",
    "name": "Politrizes Elétricas Rotativas SGT-5126 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5126-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-a1445ed5d00a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-848e6ffe15e4.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5126 Sigma Tools Athena Soluções Automotivas",
    "description": "PARA MAIOR FLEXIBILIDADE DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A)",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "VELOCIDADE LIVRE",
      "MODELO 127V E 220V",
      "600 à 3.000 RPM",
      "1.400W",
      "3,2 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-5126",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5127",
    "name": "Politrizes Elétricas Rotativas SGT-5127 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5127-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-6400311742be.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-4b8bb14638f3.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5127 Sigma Tools Athena Soluções Automotivas",
    "description": "PARA MAIOR FLEXIBILIDADE DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A)",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "VELOCIDADE LIVRE",
      "MODELO 127V E 220V",
      "600 à 3.000 RPM",
      "1.400W",
      "3,2 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-5127",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5145",
    "name": "Politrizes Elétricas Rotativas SGT-5145 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5145-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-5d8412e4d007.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-2b825379e9f6.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5145 Sigma Tools Athena Soluções Automotivas",
    "description": "PARA MAIOR FLEXIBILIDADE DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A)",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "VELOCIDADE LIVRE",
      "MODELO 127V E 220V",
      "600 à 3.000 RPM",
      "1.400W",
      "3,2 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-5145",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5114",
    "name": "Politrizes Elétricas Rotativas SGT-5114 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5114-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-0b69b29c6eb9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-1f061a64f3d5.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5114 Sigma Tools Athena Soluções Automotivas",
    "description": "PARA MAIOR FLEXIBILIDADE DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A)",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "VELOCIDADE LIVRE",
      "MODELO 127V E 220V",
      "600 à 3.000 RPM",
      "1.400W",
      "3,2 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-5114",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5106",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5106 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5106-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-421d8d807f79.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-387ae64ba0aa.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5106 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” RED&SHINE - 12mm DIMENSÕES (C x L x A) ROTO ORBITAL RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "710W",
      "127V",
      "220V",
      "VELOCIDADE LIVRE",
      "2.200 à 6.300 RPM",
      "710W",
      "2,5 kg",
      "Código do Produto: SGT-5106",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5116p",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5116P Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5116p-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-66010c4c9e06.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-16073ea2c51c.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5116P Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” RED&SHINE - 12mm DIMENSÕES (C x L x A) ROTO ORBITAL RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "710W",
      "127V",
      "220V",
      "VELOCIDADE LIVRE",
      "2.200 à 6.300 RPM",
      "710W",
      "2,5 kg",
      "Código do Produto: SGT-5116P",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5108",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5108 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5108-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-bd475a70a4cb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-f46f0be9b700.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5108 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” RED&SHINE - 12mm DIMENSÕES (C x L x A) ROTO ORBITAL RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "710W",
      "127V",
      "220V",
      "VELOCIDADE LIVRE",
      "2.200 à 6.300 RPM",
      "710W",
      "2,5 kg",
      "Código do Produto: SGT-5108",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5109",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5109 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5109-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-a34527b28925.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-c22b4ad2f9a7.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5109 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” RED&SHINE - 12mm DIMENSÕES (C x L x A) ROTO ORBITAL RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "710W",
      "127V",
      "220V",
      "VELOCIDADE LIVRE",
      "2.200 à 6.300 RPM",
      "710W",
      "2,5 kg",
      "Código do Produto: SGT-5109",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5140",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5140 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5140-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-be903b427240.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-22783bc5b6e8.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5140 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x A) DIÂMETRO DO PRATO SUPORTE ROTO ORBITAL FORÇADA RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "Removível",
      "220V",
      "VELOCIDADE LIVRE",
      "2.500 à 5.000 RPM",
      "1200W",
      "2,6 kg",
      "RPM 5.000",
      "Código do Produto: SGT-5140",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5149",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5149 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5149-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-9b51042db503.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-dbd45905c3cf.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5149 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x A) DIÂMETRO DO PRATO SUPORTE ROTO ORBITAL FORÇADA RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "Removível",
      "220V",
      "VELOCIDADE LIVRE",
      "2.500 à 5.000 RPM",
      "1200W",
      "2,6 kg",
      "RPM 5.000",
      "Código do Produto: SGT-5149",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5116",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5116 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5116-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-ee60b6f027bb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-22b17828b9f0.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5116 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x A) DIÂMETRO DO PRATO SUPORTE ROTO ORBITAL FORÇADA RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "Removível",
      "220V",
      "VELOCIDADE LIVRE",
      "2.500 à 5.000 RPM",
      "1200W",
      "2,6 kg",
      "RPM 5.000",
      "Código do Produto: SGT-5116",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5122",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5122 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5122-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-5974cd91e767.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-f2619b71a518.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5122 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x A) DIÂMETRO DO PRATO SUPORTE ROTO ORBITAL FORÇADA RED&SHINE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "Removível",
      "220V",
      "VELOCIDADE LIVRE",
      "2.500 à 5.000 RPM",
      "1200W",
      "2,6 kg",
      "RPM 5.000",
      "Código do Produto: SGT-5122",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5150",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5150 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5150-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-945c56a02a11.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-fe081f1357e7.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5150 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIÂMETRO DO PRATO SUPORTE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS  LINHA COLORS",
      "VELOCIDADE LIVRE",
      "MODELO 110V E 220V",
      "2.000 à 5.000 RPM",
      "1,3 kg",
      "110V",
      "220V",
      "Código do Produto: SGT-5150",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5118",
    "name": "Politrizes Elétricas Roto Orbitais SGT-5118 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-sgt-5118-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-f03d9d023165.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-e0099cd2d4ed.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais SGT-5118 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIÂMETRO DO PRATO SUPORTE",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS  LINHA COLORS",
      "VELOCIDADE LIVRE",
      "MODELO 110V E 220V",
      "2.000 à 5.000 RPM",
      "1,3 kg",
      "110V",
      "220V",
      "Código do Produto: SGT-5118",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8101",
    "name": "Politrizes À Bateria SGT-8101 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8101-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8101--01a88a2948e8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8101--1d928c870c23.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8101 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "POLITRIZES À BATERIA",
      "POLITRIZ NANO HÍBRIDA À BATERIA  3mm E 12mm",
      "300W",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "1.000 à 5.000 RPM",
      "300W",
      "0,850 kg",
      "Código do Produto: SGT-8101",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8103",
    "name": "Politrizes À Bateria SGT-8103 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8103-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8103--c6a33e890ac1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8103--74d938e3e042.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8103 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "POLITRIZES À BATERIA",
      "POLITRIZ NANO HÍBRIDA À BATERIA  3mm E 12mm",
      "300W",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "1.000 à 5.000 RPM",
      "300W",
      "0,850 kg",
      "Código do Produto: SGT-8103",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8105",
    "name": "Politrizes À Bateria SGT-8105 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8105-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8105--0f5244864207.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8105--026d2634f26e.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8105 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ACESSÓRIOS DE REPOSIÇÃO",
    "specs": [
      "POLITRIZES À BATERIA",
      "POLITRIZ NANO HÍBRIDA À BATERIA  3mm E 12mm",
      "300W",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "1.000 à 5.000 RPM",
      "300W",
      "0,850 kg",
      "Código do Produto: SGT-8105",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8116",
    "name": "Politrizes À Bateria SGT-8116 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8116-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8116--3efde9a0a95f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8116--9f1dab823c03.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8116 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” - 15mm DIÂMETRO DO PRATO DO SUPORTE PESO DA MÁQUINA (APROXIMADO)",
    "specs": [
      "POLITRIZES À BATERIA",
      "600W",
      "BIVOLT",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "2.000 à 5.500 RPM",
      "21V / 5Ah",
      "1,7 kg",
      "Código do Produto: SGT-8116",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8106",
    "name": "Politrizes À Bateria SGT-8106 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8106-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8106--5277066f742c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8106--8ce8b7013cd0.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8106 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” - 15mm DIÂMETRO DO PRATO DO SUPORTE PESO DA MÁQUINA (APROXIMADO)",
    "specs": [
      "POLITRIZES À BATERIA",
      "600W",
      "BIVOLT",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "2.000 à 5.500 RPM",
      "21V / 5Ah",
      "1,7 kg",
      "Código do Produto: SGT-8106",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8110",
    "name": "Politrizes À Bateria SGT-8110 Sigma Tools",
    "slug": "politrizes-a-bateria-sgt-8110-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8110--4e5e57934957.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-a-bateria-sgt-8110--b361c1e1f47a.webp"
    ],
    "altText": "Politrizes À Bateria SGT-8110 Sigma Tools Athena Soluções Automotivas",
    "description": "ROTO ORBITAL 5” - 15mm DIÂMETRO DO PRATO DO SUPORTE PESO DA MÁQUINA (APROXIMADO)",
    "specs": [
      "POLITRIZES À BATERIA",
      "600W",
      "BIVOLT",
      "VELOCIDADE LIVRE",
      "BIVOLT",
      "2.000 à 5.500 RPM",
      "21V / 5Ah",
      "1,7 kg",
      "Código do Produto: SGT-8110",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5117",
    "name": "Politrizes Elétricas Rotativas SGT-5117 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5117-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-42aec4b910d7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-b89c4687e84b.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5117 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ROTO ORBITAL 5” - SGT-PRO - 15mm",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "ESTÉTICA AUTOMOTIVA",
      "VELOCIDADE LIVRE",
      "MODELO 110V E 220V",
      "1.100 à 3.900 RPM",
      "900W",
      "2,6 kg",
      "Código do Produto: SGT-5117",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5123",
    "name": "Politrizes Elétricas Rotativas SGT-5123 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5123-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-b0e01c80616b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-d28d7f73671d.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5123 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ROTO ORBITAL 5” - SGT-PRO - 15mm",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "ESTÉTICA AUTOMOTIVA",
      "VELOCIDADE LIVRE",
      "MODELO 110V E 220V",
      "1.100 à 3.900 RPM",
      "900W",
      "2,6 kg",
      "Código do Produto: SGT-5123",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5135",
    "name": "Politrizes Elétricas Rotativas SGT-5135 Sigma Tools",
    "slug": "politrizes-eletricas-rotativas-sgt-5135-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-bd0e0b148719.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-rotativas-be396047cc79.webp"
    ],
    "altText": "Politrizes Elétricas Rotativas SGT-5135 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A) ROTO ORBITAL 5” - SGT-PRO - 15mm",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTATIVAS",
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "ESTÉTICA AUTOMOTIVA",
      "VELOCIDADE LIVRE",
      "MODELO 110V E 220V",
      "1.100 à 3.900 RPM",
      "900W",
      "2,6 kg",
      "Código do Produto: SGT-5135",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_pwr-5120",
    "name": "Politrizes Elétricas Roto Orbitais PWR-5120 Sigma Tools",
    "slug": "politrizes-eletricas-roto-orbitais-pwr-5120-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-4d7bbd919bf4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/politrizes-eletricas-roto-orbi-fc14a2af7c92.webp"
    ],
    "altText": "Politrizes Elétricas Roto Orbitais PWR-5120 Sigma Tools Athena Soluções Automotivas",
    "description": "DIÂMETRO DO PRATO DO SUPORTE DIMENSÕES (C x L x A)",
    "specs": [
      "POLITRIZES ELÉTRICAS ROTO ORBITAIS",
      "POLITRIZ ROTO ORBITAL 5”  15mm",
      "PWR5120",
      "900W",
      "VELOCIDADE LIVRE",
      "MODELO 127V E 220V",
      "2.500 à 5.500 RPM",
      "900W",
      "Código do Produto: PWR-5120",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5112",
    "name": "Suporte 3” Politriz Forçada Sgt-5112 SGT-5112 Sigma Tools",
    "slug": "suporte-3-politriz-forcada-sgt-5112-sgt-5112-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/suporte-3-politriz-forcada-sgt-36d166cd3258.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/suporte-3-politriz-forcada-sgt-c6d6b7c83b55.webp"
    ],
    "altText": "Suporte 3” Politriz Forçada Sgt-5112 SGT-5112 Sigma Tools Athena Soluções Automotivas",
    "description": "INTERFACES, DISCOS, PRATOS E SUPORTES PRATO SUPORTE 6” PARA LIXADEIRA ROTO PRATO SUPORTE 5” P/ LIXADEIRA",
    "specs": [
      "SUPORTE 3” POLITRIZ FORÇADA SGT5112",
      "COD.: 07 52 0136 52",
      "ORBITAL ELÉTRICA  BOSCH AVE",
      "COD.: 07 52 0136 55",
      "COD.: 07 52 0136 56",
      "COD.: 07 52 0136 57",
      "SUPORTE VELCRADO ROSCA M14",
      "20.000 RPM",
      "Código do Produto: SGT-5112",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-m-01",
    "name": "Ferramenta SGT-M-01 Sigma Tools",
    "slug": "ferramenta-sgt-m-01-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-m-01-sigma-tool-bc3d1334f977.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-m-01-sigma-tool-081d10ea3dba.webp"
    ],
    "altText": "Ferramenta SGT-M-01 Sigma Tools Athena Soluções Automotivas",
    "description": "MEDIDOR DE ESPESSURA DE COATING 115 mm x 50 mm x 25 mm",
    "specs": [
      "CALIBRAÇÃO:",
      "UNIDADES:",
      "RAIO MÍNIMO DE CURVATURA CONVEXO:",
      "RAIO MÍNIMO DE CURVATURA CÔNCAVO:",
      "ÁREA DE MEDIÇÃO MÍNIMA:",
      "ENERGIA:",
      "2x1.5V  Bateria AAA",
      "AMBIENTE DE OPERAÇÃO:",
      "Código do Produto: SGT-M-01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9918",
    "name": "Snow Foam SGT-9918 Sigma Tools",
    "slug": "snow-foam-sgt-9918-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9918-sigma-tools-994d5280d646.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9918-sigma-tools-00449390a4e2.webp"
    ],
    "altText": "Snow Foam SGT-9918 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9918",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9923",
    "name": "Snow Foam SGT-9923 Sigma Tools",
    "slug": "snow-foam-sgt-9923-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9923-sigma-tools-ac46de9dbdf4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9923-sigma-tools-15faeb18cb66.webp"
    ],
    "altText": "Snow Foam SGT-9923 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9923",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9919",
    "name": "Snow Foam SGT-9919 Sigma Tools",
    "slug": "snow-foam-sgt-9919-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9919-sigma-tools-a38a3344f577.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9919-sigma-tools-fed2a58d913a.webp"
    ],
    "altText": "Snow Foam SGT-9919 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9919",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9932",
    "name": "Snow Foam SGT-9932 Sigma Tools",
    "slug": "snow-foam-sgt-9932-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9932-sigma-tools-6b012144863f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9932-sigma-tools-0fc36121c702.webp"
    ],
    "altText": "Snow Foam SGT-9932 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9932",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9934",
    "name": "Snow Foam SGT-9934 Sigma Tools",
    "slug": "snow-foam-sgt-9934-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9934-sigma-tools-4e1ac836d89f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9934-sigma-tools-29f64e986308.webp"
    ],
    "altText": "Snow Foam SGT-9934 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9934",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8610",
    "name": "Snow Foam SGT-8610 Sigma Tools",
    "slug": "snow-foam-sgt-8610-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-8610-sigma-tools-05a409086f47.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-8610-sigma-tools-b52a0111fa81.webp"
    ],
    "altText": "Snow Foam SGT-8610 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-8610",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9939",
    "name": "Snow Foam SGT-9939 Sigma Tools",
    "slug": "snow-foam-sgt-9939-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9939-sigma-tools-4f8abca1bb7c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/snow-foam-sgt-9939-sigma-tools-9c55eaadefa3.webp"
    ],
    "altText": "Snow Foam SGT-9939 Sigma Tools Athena Soluções Automotivas",
    "description": "ENGATE CONECTOR TIPO ROSCA INFORMAÇÕES TÉCNICAS SGT-9918 INFORMAÇÕES TÉCNICAS SGT-9923",
    "specs": [
      "SNOW FOAM",
      "VÁLVULA GICLÊ",
      "SNOW FOAM DIAMANTE",
      "1.400 à 3.200 PSI",
      "1.1 extra e suporte para snow foam!",
      "SNOW FOAM PLUS 1L",
      "VÁLVULA GICLÊ",
      "para snow foam!",
      "Código do Produto: SGT-9939",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9924",
    "name": "Ferramenta SGT-9924 Sigma Tools",
    "slug": "ferramenta-sgt-9924-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9924-sigma-tool-5971550f4ee9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9924-sigma-tool-e90d66397766.webp"
    ],
    "altText": "Ferramenta SGT-9924 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9924",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9942",
    "name": "Ferramenta SGT-9942 Sigma Tools",
    "slug": "ferramenta-sgt-9942-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9942-sigma-tool-c35d68d9731b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9942-sigma-tool-db3cccb06f71.webp"
    ],
    "altText": "Ferramenta SGT-9942 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9942",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9930",
    "name": "Ferramenta SGT-9930 Sigma Tools",
    "slug": "ferramenta-sgt-9930-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9930-sigma-tool-aa9e9c055920.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9930-sigma-tool-549b48da3406.webp"
    ],
    "altText": "Ferramenta SGT-9930 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9930",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9922",
    "name": "Ferramenta SGT-9922 Sigma Tools",
    "slug": "ferramenta-sgt-9922-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9922-sigma-tool-8b90e8af347d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9922-sigma-tool-52b21be707f2.webp"
    ],
    "altText": "Ferramenta SGT-9922 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9922",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9937",
    "name": "Ferramenta SGT-9937 Sigma Tools",
    "slug": "ferramenta-sgt-9937-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9937-sigma-tool-f0437c04b000.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9937-sigma-tool-57909405a9e8.webp"
    ],
    "altText": "Ferramenta SGT-9937 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9937",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9938",
    "name": "Ferramenta SGT-9938 Sigma Tools",
    "slug": "ferramenta-sgt-9938-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9938-sigma-tool-bdd7c834b511.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9938-sigma-tool-4bd199a7ddbe.webp"
    ],
    "altText": "Ferramenta SGT-9938 Sigma Tools Athena Soluções Automotivas",
    "description": "3 EM 1 - EXCEL LINE - 2L TEMPERATURA DE TRABALHO RESISTENTE À QUÍMICOS",
    "specs": [
      "SNOW PUMP 3 EM 1  2L",
      "SNOW FOAM E PULVERIZADOR",
      "SNOW FOAM",
      "LANÇA SNOW FOAM COM",
      "SNOW FOAM E PULVERIZADOR",
      "COD.: 07 01 9937 00",
      "CANHÃO SNOW FOAM  À BATERIA",
      "7.2V",
      "Código do Produto: SGT-9938",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9943",
    "name": "Ferramenta SGT-9943 Sigma Tools",
    "slug": "ferramenta-sgt-9943-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9943-sigma-tool-ff03f53189af.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9943-sigma-tool-542379a0ec09.webp"
    ],
    "altText": "Ferramenta SGT-9943 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9943",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9925",
    "name": "Ferramenta SGT-9925 Sigma Tools",
    "slug": "ferramenta-sgt-9925-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9925-sigma-tool-f8d88acd3cfc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9925-sigma-tool-dcffa1f232f8.webp"
    ],
    "altText": "Ferramenta SGT-9925 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9925",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9933",
    "name": "Ferramenta SGT-9933 Sigma Tools",
    "slug": "ferramenta-sgt-9933-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9933-sigma-tool-e7b8114537d4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9933-sigma-tool-02a7af5bb416.webp"
    ],
    "altText": "Ferramenta SGT-9933 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9933",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9936",
    "name": "Ferramenta SGT-9936 Sigma Tools",
    "slug": "ferramenta-sgt-9936-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9936-sigma-tool-5212b1d071a3.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9936-sigma-tool-dab567f37bc4.webp"
    ],
    "altText": "Ferramenta SGT-9936 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9936",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9941",
    "name": "Ferramenta SGT-9941 Sigma Tools",
    "slug": "ferramenta-sgt-9941-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9941-sigma-tool-eb4bc2ffed7b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9941-sigma-tool-d52d68f33b9f.webp"
    ],
    "altText": "Ferramenta SGT-9941 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9941",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9927",
    "name": "Ferramenta SGT-9927 Sigma Tools",
    "slug": "ferramenta-sgt-9927-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9927-sigma-tool-f65aa11160a6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9927-sigma-tool-3360d8069226.webp"
    ],
    "altText": "Ferramenta SGT-9927 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9927",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9929",
    "name": "Ferramenta SGT-9929 Sigma Tools",
    "slug": "ferramenta-sgt-9929-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9929-sigma-tool-56aacf8f8741.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9929-sigma-tool-ad1056c28d46.webp"
    ],
    "altText": "Ferramenta SGT-9929 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9929",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9928",
    "name": "Ferramenta SGT-9928 Sigma Tools",
    "slug": "ferramenta-sgt-9928-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9928-sigma-tool-5d0558e0a2ba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9928-sigma-tool-ed4b5c3b2f27.webp"
    ],
    "altText": "Ferramenta SGT-9928 Sigma Tools Athena Soluções Automotivas",
    "description": "SPRAYERS MANUAIS MULTIUSO RESISTENTE À QUÍMICOS - 800mL SPRAYER MULTIUSO RESISTENTE",
    "specs": [
      "PULVERIZADORES",
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PULVERIZADOR",
      "DE VAZÃO",
      "PULVERIZADOR",
      "PULVERIZADOR",
      "PULVERIZADOR MANUAL",
      "SPRAYER VITON GOLDEN SUPER",
      "Código do Produto: SGT-9928",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9906",
    "name": "Pistolas E Acessórios SGT-9906 Sigma Tools",
    "slug": "pistolas-e-acessorios-sgt-9906-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9906-6fc7ccbbfc0b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9906-3575b7db459d.webp"
    ],
    "altText": "Pistolas E Acessórios SGT-9906 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS E ACESSÓRIOS ENGATE RÁPIDO G-2SF M14 ACESSÓRIO DE REPOSIÇÃO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PISTOLA LAVADORA  DE",
      "ALTA PRESSÃO  ALTA VAZÃO",
      "PISTOLA LAVADORA DE",
      "ALTA PRESSÃO  MÉDIA VAZÃO",
      "LAVADOR ALTA PRESSÃO 90°",
      "CARRINHO DE LAVAGEM SPRAY",
      "LANÇA RETA PARA LAVADORAS",
      "Código do Produto: SGT-9906",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9905",
    "name": "Pistolas E Acessórios SGT-9905 Sigma Tools",
    "slug": "pistolas-e-acessorios-sgt-9905-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9905-f9a03fad1348.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9905-de5543e5ef8b.webp"
    ],
    "altText": "Pistolas E Acessórios SGT-9905 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS E ACESSÓRIOS ENGATE RÁPIDO G-2SF M14 ACESSÓRIO DE REPOSIÇÃO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PISTOLA LAVADORA  DE",
      "ALTA PRESSÃO  ALTA VAZÃO",
      "PISTOLA LAVADORA DE",
      "ALTA PRESSÃO  MÉDIA VAZÃO",
      "LAVADOR ALTA PRESSÃO 90°",
      "CARRINHO DE LAVAGEM SPRAY",
      "LANÇA RETA PARA LAVADORAS",
      "Código do Produto: SGT-9905",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9907",
    "name": "Pistolas E Acessórios SGT-9907 Sigma Tools",
    "slug": "pistolas-e-acessorios-sgt-9907-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9907-9431981f9606.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9907-6b911d85924b.webp"
    ],
    "altText": "Pistolas E Acessórios SGT-9907 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS E ACESSÓRIOS ENGATE RÁPIDO G-2SF M14 ACESSÓRIO DE REPOSIÇÃO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PISTOLA LAVADORA  DE",
      "ALTA PRESSÃO  ALTA VAZÃO",
      "PISTOLA LAVADORA DE",
      "ALTA PRESSÃO  MÉDIA VAZÃO",
      "LAVADOR ALTA PRESSÃO 90°",
      "CARRINHO DE LAVAGEM SPRAY",
      "LANÇA RETA PARA LAVADORAS",
      "Código do Produto: SGT-9907",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9921",
    "name": "Pistolas E Acessórios SGT-9921 Sigma Tools",
    "slug": "pistolas-e-acessorios-sgt-9921-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9921-e2d37ce5b949.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-e-acessorios-sgt-9921-5a4e15ba8b7f.webp"
    ],
    "altText": "Pistolas E Acessórios SGT-9921 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS E ACESSÓRIOS ENGATE RÁPIDO G-2SF M14 ACESSÓRIO DE REPOSIÇÃO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "PISTOLA LAVADORA  DE",
      "ALTA PRESSÃO  ALTA VAZÃO",
      "PISTOLA LAVADORA DE",
      "ALTA PRESSÃO  MÉDIA VAZÃO",
      "LAVADOR ALTA PRESSÃO 90°",
      "CARRINHO DE LAVAGEM SPRAY",
      "LANÇA RETA PARA LAVADORAS",
      "Código do Produto: SGT-9921",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8601",
    "name": "Pistola Lavadora De Alta Pressão À Bateria SGT-8601 Sigma Tools",
    "slug": "pistola-lavadora-de-alta-pressao-a-bateria-sgt-8601-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-4ad76303aec7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-bbffa85d0044.webp"
    ],
    "altText": "Pistola Lavadora De Alta Pressão À Bateria SGT-8601 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO Especificações Técnicas pressão com trama de aço;",
    "specs": [
      "PISTOLA LAVADORA DE ALTA PRESSÃO À BATERIA",
      "CARRETEL ENROLADOR MANGUEIRA ÁGUA  ALTA PRESSÃO  3.000psi",
      "VAZÃO",
      "BIVOLT",
      "21V / 1,5Ah",
      "2,5 kg",
      "VISOR DIGITAL",
      "Capacidade: 10 metros de mangueira;",
      "Código do Produto: SGT-8601",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9010",
    "name": "Pistola Lavadora De Alta Pressão À Bateria SGT-9010 Sigma Tools",
    "slug": "pistola-lavadora-de-alta-pressao-a-bateria-sgt-9010-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-1619d724e231.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-2985ef86f892.webp"
    ],
    "altText": "Pistola Lavadora De Alta Pressão À Bateria SGT-9010 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO Especificações Técnicas pressão com trama de aço;",
    "specs": [
      "PISTOLA LAVADORA DE ALTA PRESSÃO À BATERIA",
      "CARRETEL ENROLADOR MANGUEIRA ÁGUA  ALTA PRESSÃO  3.000psi",
      "VAZÃO",
      "BIVOLT",
      "21V / 1,5Ah",
      "2,5 kg",
      "VISOR DIGITAL",
      "Capacidade: 10 metros de mangueira;",
      "Código do Produto: SGT-9010",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9911",
    "name": "Pistola Lavadora De Alta Pressão À Bateria SGT-9911 Sigma Tools",
    "slug": "pistola-lavadora-de-alta-pressao-a-bateria-sgt-9911-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-f4c1d95152ba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-f775ea3e4646.webp"
    ],
    "altText": "Pistola Lavadora De Alta Pressão À Bateria SGT-9911 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO Especificações Técnicas pressão com trama de aço;",
    "specs": [
      "PISTOLA LAVADORA DE ALTA PRESSÃO À BATERIA",
      "CARRETEL ENROLADOR MANGUEIRA ÁGUA  ALTA PRESSÃO  3.000psi",
      "VAZÃO",
      "BIVOLT",
      "21V / 1,5Ah",
      "2,5 kg",
      "VISOR DIGITAL",
      "Capacidade: 10 metros de mangueira;",
      "Código do Produto: SGT-9911",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9904",
    "name": "Pistola Lavadora De Alta Pressão À Bateria SGT-9904 Sigma Tools",
    "slug": "pistola-lavadora-de-alta-pressao-a-bateria-sgt-9904-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-b502274f9fe6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-75f6e796eb91.webp"
    ],
    "altText": "Pistola Lavadora De Alta Pressão À Bateria SGT-9904 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO Especificações Técnicas pressão com trama de aço;",
    "specs": [
      "PISTOLA LAVADORA DE ALTA PRESSÃO À BATERIA",
      "CARRETEL ENROLADOR MANGUEIRA ÁGUA  ALTA PRESSÃO  3.000psi",
      "VAZÃO",
      "BIVOLT",
      "21V / 1,5Ah",
      "2,5 kg",
      "VISOR DIGITAL",
      "Capacidade: 10 metros de mangueira;",
      "Código do Produto: SGT-9904",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9908",
    "name": "Pistola Lavadora De Alta Pressão À Bateria SGT-9908 Sigma Tools",
    "slug": "pistola-lavadora-de-alta-pressao-a-bateria-sgt-9908-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-ce537399e0ac.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-lavadora-de-alta-press-e9b6972652c8.webp"
    ],
    "altText": "Pistola Lavadora De Alta Pressão À Bateria SGT-9908 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS DE REPOSIÇÃO Especificações Técnicas pressão com trama de aço;",
    "specs": [
      "PISTOLA LAVADORA DE ALTA PRESSÃO À BATERIA",
      "CARRETEL ENROLADOR MANGUEIRA ÁGUA  ALTA PRESSÃO  3.000psi",
      "VAZÃO",
      "BIVOLT",
      "21V / 1,5Ah",
      "2,5 kg",
      "VISOR DIGITAL",
      "Capacidade: 10 metros de mangueira;",
      "Código do Produto: SGT-9908",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9912",
    "name": "Tornadores SGT-9912 Sigma Tools",
    "slug": "tornadores-sgt-9912-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9912-sigma-tool-e8046a93cd53.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9912-sigma-tool-46ca6f041ada.webp"
    ],
    "altText": "Tornadores SGT-9912 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9912",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9914",
    "name": "Tornadores SGT-9914 Sigma Tools",
    "slug": "tornadores-sgt-9914-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9914-sigma-tool-bdd8582c0608.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9914-sigma-tool-d9d5702bdf26.webp"
    ],
    "altText": "Tornadores SGT-9914 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9914",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9916",
    "name": "Tornadores SGT-9916 Sigma Tools",
    "slug": "tornadores-sgt-9916-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9916-sigma-tool-615b71b862fd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9916-sigma-tool-50085032d2cc.webp"
    ],
    "altText": "Tornadores SGT-9916 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9916",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9915",
    "name": "Tornadores SGT-9915 Sigma Tools",
    "slug": "tornadores-sgt-9915-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9915-sigma-tool-8b33acc741bc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9915-sigma-tool-7440826051e1.webp"
    ],
    "altText": "Tornadores SGT-9915 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9915",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9917",
    "name": "Tornadores SGT-9917 Sigma Tools",
    "slug": "tornadores-sgt-9917-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9917-sigma-tool-4abd85053882.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9917-sigma-tool-f646d3462e79.webp"
    ],
    "altText": "Tornadores SGT-9917 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9917",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9913",
    "name": "Tornadores SGT-9913 Sigma Tools",
    "slug": "tornadores-sgt-9913-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9913-sigma-tool-4fcf10dc862a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9913-sigma-tool-9f875d38da94.webp"
    ],
    "altText": "Tornadores SGT-9913 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9913",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9935",
    "name": "Tornadores SGT-9935 Sigma Tools",
    "slug": "tornadores-sgt-9935-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9935-sigma-tool-df9078aa1306.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/tornadores-sgt-9935-sigma-tool-d5cc1aeedc4b.webp"
    ],
    "altText": "Tornadores SGT-9935 Sigma Tools Athena Soluções Automotivas",
    "description": "CANECO SGT-9916 / SGT-9915 / SGT-9917 ACESSÓRIOS DE REPOSIÇÃO CONSUMO MÁXIMO DE LÍQUIDO",
    "specs": [
      "HIGIENIZAÇÃO AUTOMOTIVA",
      "TORNADOR TWISTER II",
      "VELOCIDADE LIVRE",
      "NÍVEL DE RÚIDO",
      "6,36 PCM  180 L / min",
      "4.000 à 8.000 RPM",
      "3,5 à 7,5 bar / 50 à 110 psi",
      "0,680 kg",
      "Código do Produto: SGT-9935",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8501",
    "name": "Lanternas SGT-8501 Sigma Tools",
    "slug": "lanternas-sgt-8501-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8501-sigma-tools-a12923e9ece1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8501-sigma-tools-be8d061e69a4.webp"
    ],
    "altText": "Lanternas SGT-8501 Sigma Tools Athena Soluções Automotivas",
    "description": "170lm (LED TOPO) / 300lm (LED FRONTAL) TEMPO DE CARREGAMENTO LANTERNA 180° LED COB",
    "specs": [
      "DISPLAY COM NÍVEL",
      "3,7V / 2Ah",
      "0,132 kg",
      "PROVA D’ÁGUA",
      "3W (LED TOPO) / 10W (LED FRONTAL)",
      "6.500 KELVIN",
      "VERMELHO",
      "3,7V / 1.800mAh",
      "Código do Produto: SGT-8501",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8503",
    "name": "Lanternas SGT-8503 Sigma Tools",
    "slug": "lanternas-sgt-8503-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8503-sigma-tools-94ec965ebe0c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8503-sigma-tools-cd3528a81191.webp"
    ],
    "altText": "Lanternas SGT-8503 Sigma Tools Athena Soluções Automotivas",
    "description": "170lm (LED TOPO) / 300lm (LED FRONTAL) TEMPO DE CARREGAMENTO LANTERNA 180° LED COB",
    "specs": [
      "DISPLAY COM NÍVEL",
      "3,7V / 2Ah",
      "0,132 kg",
      "PROVA D’ÁGUA",
      "3W (LED TOPO) / 10W (LED FRONTAL)",
      "6.500 KELVIN",
      "VERMELHO",
      "3,7V / 1.800mAh",
      "Código do Produto: SGT-8503",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8510",
    "name": "Lanternas SGT-8510 Sigma Tools",
    "slug": "lanternas-sgt-8510-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8510-sigma-tools-1eddf25edd8e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-sgt-8510-sigma-tools-aeda24e5d544.webp"
    ],
    "altText": "Lanternas SGT-8510 Sigma Tools Athena Soluções Automotivas",
    "description": "170lm (LED TOPO) / 300lm (LED FRONTAL) TEMPO DE CARREGAMENTO LANTERNA 180° LED COB",
    "specs": [
      "DISPLAY COM NÍVEL",
      "3,7V / 2Ah",
      "0,132 kg",
      "PROVA D’ÁGUA",
      "3W (LED TOPO) / 10W (LED FRONTAL)",
      "6.500 KELVIN",
      "VERMELHO",
      "3,7V / 1.800mAh",
      "Código do Produto: SGT-8510",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8520",
    "name": "Lanternas Cri 96+ SGT-8520 Sigma Tools",
    "slug": "lanternas-cri-96-sgt-8520-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8520-sigm-bd0cb05ee594.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8520-sigm-9a0b063ca5c4.webp"
    ],
    "altText": "Lanternas Cri 96+ SGT-8520 Sigma Tools Athena Soluções Automotivas",
    "description": "2 CONJUNTOS DE BATERIAS 2.000mAh 3 IMÃS POR EMPUNHADURA FLUXO LUMINOSO POR LÂMPADA",
    "specs": [
      "LANTERNA LED PARA CAPÔ E INTERIOR AUTOMOTIVO",
      "3 MODOS: APAGADO / 50% / 100%",
      "3W  350lm",
      "LIION 1500mAh / 3.7V",
      "10W LED COB / 300 lúmens",
      "AJUSTÁVEL",
      "Código do Produto: SGT-8520",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8511",
    "name": "Lanternas Cri 96+ SGT-8511 Sigma Tools",
    "slug": "lanternas-cri-96-sgt-8511-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8511-sigm-ff3b6c6529c7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8511-sigm-cdf003db9343.webp"
    ],
    "altText": "Lanternas Cri 96+ SGT-8511 Sigma Tools Athena Soluções Automotivas",
    "description": "2 CONJUNTOS DE BATERIAS 2.000mAh 3 IMÃS POR EMPUNHADURA FLUXO LUMINOSO POR LÂMPADA",
    "specs": [
      "LANTERNA LED PARA CAPÔ E INTERIOR AUTOMOTIVO",
      "3 MODOS: APAGADO / 50% / 100%",
      "3W  350lm",
      "LIION 1500mAh / 3.7V",
      "10W LED COB / 300 lúmens",
      "AJUSTÁVEL",
      "Código do Produto: SGT-8511",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8516",
    "name": "Lanternas Cri 96+ SGT-8516 Sigma Tools",
    "slug": "lanternas-cri-96-sgt-8516-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8516-sigm-f4160c7a4c25.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8516-sigm-2b3ab79d8b8f.webp"
    ],
    "altText": "Lanternas Cri 96+ SGT-8516 Sigma Tools Athena Soluções Automotivas",
    "description": "2 CONJUNTOS DE BATERIAS 2.000mAh 3 IMÃS POR EMPUNHADURA FLUXO LUMINOSO POR LÂMPADA",
    "specs": [
      "LANTERNA LED PARA CAPÔ E INTERIOR AUTOMOTIVO",
      "3 MODOS: APAGADO / 50% / 100%",
      "3W  350lm",
      "LIION 1500mAh / 3.7V",
      "10W LED COB / 300 lúmens",
      "AJUSTÁVEL",
      "Código do Produto: SGT-8516",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8525",
    "name": "Lanternas Cri 96+ SGT-8525 Sigma Tools",
    "slug": "lanternas-cri-96-sgt-8525-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8525-sigm-be2826cc6fd5.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8525-sigm-81ba2165f801.webp"
    ],
    "altText": "Lanternas Cri 96+ SGT-8525 Sigma Tools Athena Soluções Automotivas",
    "description": "LANTERNA DE INSPEÇÃO 3 CORES TEMPO DE USO - LUZ DO TOPO TEMPO DE USO - LUZ PRINCIPAL",
    "specs": [
      "3W SMD LED 6500K",
      "3.7V  2000mAh  LIION",
      "10W COB LED (2700K / 4500K / 6500K)",
      "145 kg",
      "AJUSTÁVEL 180º",
      "3W SMD LED 6500K",
      "3.7V  2600mAh  LIION",
      "10W COB LED (2700K / 4500K / 6500K)",
      "Código do Produto: SGT-8525",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8517",
    "name": "Lanternas Cri 96+ SGT-8517 Sigma Tools",
    "slug": "lanternas-cri-96-sgt-8517-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8517-sigm-82b176075874.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-cri-96-sgt-8517-sigm-6694df20263e.webp"
    ],
    "altText": "Lanternas Cri 96+ SGT-8517 Sigma Tools Athena Soluções Automotivas",
    "description": "LANTERNA DE INSPEÇÃO 3 CORES TEMPO DE USO - LUZ DO TOPO TEMPO DE USO - LUZ PRINCIPAL",
    "specs": [
      "3W SMD LED 6500K",
      "3.7V  2000mAh  LIION",
      "10W COB LED (2700K / 4500K / 6500K)",
      "145 kg",
      "AJUSTÁVEL 180º",
      "3W SMD LED 6500K",
      "3.7V  2600mAh  LIION",
      "10W COB LED (2700K / 4500K / 6500K)",
      "Código do Produto: SGT-8517",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8518",
    "name": "Lanternas Holofotes SGT-8518 Sigma Tools",
    "slug": "lanternas-holofotes-sgt-8518-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-holofotes-sgt-8518-s-8ce6816bb6c4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-holofotes-sgt-8518-s-7eb9af9f9b82.webp"
    ],
    "altText": "Lanternas Holofotes SGT-8518 Sigma Tools Athena Soluções Automotivas",
    "description": "LANTERNA HOLOFOTE - REFLETOR DE INSPEÇÃO - 700lm TEMPO DE CARREGAMENTO LANTERNA HOLOFOTE - REFLETOR DE INSPEÇÃO - 1400lm",
    "specs": [
      "LIION 2600mAh / 3.7V",
      "10W LED COB / 700 lúmens",
      "LIION 5000mAh / 3.7V",
      "20W LED COB / 1400 lúmens",
      "Código do Produto: SGT-8518",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8519",
    "name": "Lanternas Holofotes SGT-8519 Sigma Tools",
    "slug": "lanternas-holofotes-sgt-8519-sigma-tools",
    "categoryId": "cat_scanners",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-holofotes-sgt-8519-s-9bb3ea915071.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lanternas-holofotes-sgt-8519-s-e9f817962c9e.webp"
    ],
    "altText": "Lanternas Holofotes SGT-8519 Sigma Tools Athena Soluções Automotivas",
    "description": "LANTERNA HOLOFOTE - REFLETOR DE INSPEÇÃO - 700lm TEMPO DE CARREGAMENTO LANTERNA HOLOFOTE - REFLETOR DE INSPEÇÃO - 1400lm",
    "specs": [
      "LIION 2600mAh / 3.7V",
      "10W LED COB / 700 lúmens",
      "LIION 5000mAh / 3.7V",
      "20W LED COB / 1400 lúmens",
      "Código do Produto: SGT-8519",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5601",
    "name": "Sopradores Elétricos SGT-5601 Sigma Tools",
    "slug": "sopradores-eletricos-sgt-5601-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-5601--9e733e6ac06e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-5601--ed79d1369fdc.webp"
    ],
    "altText": "Sopradores Elétricos SGT-5601 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x H) DIMENSÕES (C x L x H)",
    "specs": [
      "VELOCIDADE LIVRE",
      "VOLUME DE AR",
      "MODELOS 110V E 220V",
      "600W",
      "016.000 RPM",
      "1,0 kg",
      "110V",
      "220V",
      "Código do Produto: SGT-5601",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_pwr-5600",
    "name": "Sopradores Elétricos PWR-5600 Sigma Tools",
    "slug": "sopradores-eletricos-pwr-5600-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-pwr-5600--c3e03874b3f7.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-pwr-5600--f297830eb52a.webp"
    ],
    "altText": "Sopradores Elétricos PWR-5600 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES (C x L x H) DIMENSÕES (C x L x H)",
    "specs": [
      "VELOCIDADE LIVRE",
      "VOLUME DE AR",
      "MODELOS 110V E 220V",
      "600W",
      "016.000 RPM",
      "1,0 kg",
      "110V",
      "220V",
      "Código do Produto: PWR-5600",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3312",
    "name": "Sopradores Elétricos SGT-3312 Sigma Tools",
    "slug": "sopradores-eletricos-sgt-3312-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3312--60f557ac4ba6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3312--90b8f893f27d.webp"
    ],
    "altText": "Sopradores Elétricos SGT-3312 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS / BICOS DE AR SGT- 3311   PISTOLA DE AR CURTA - 100mm SGT-3312   PISTOLA DE AR LONGA - 300mm",
    "specs": [
      "60 psi",
      "VELOCIDADE LIVRE",
      "MODELOS 127V E 220V",
      "1350W",
      "022.000 RPM",
      "1,5 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-3312",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3316",
    "name": "Sopradores Elétricos SGT-3316 Sigma Tools",
    "slug": "sopradores-eletricos-sgt-3316-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3316--de2290ed4e3f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3316--d1a889726e2a.webp"
    ],
    "altText": "Sopradores Elétricos SGT-3316 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS / BICOS DE AR SGT- 3311   PISTOLA DE AR CURTA - 100mm SGT-3312   PISTOLA DE AR LONGA - 300mm",
    "specs": [
      "60 psi",
      "VELOCIDADE LIVRE",
      "MODELOS 127V E 220V",
      "1350W",
      "022.000 RPM",
      "1,5 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-3316",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3310",
    "name": "Sopradores Elétricos SGT-3310 Sigma Tools",
    "slug": "sopradores-eletricos-sgt-3310-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3310--bf00679c5e20.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-3310--48ed67918d9c.webp"
    ],
    "altText": "Sopradores Elétricos SGT-3310 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS / BICOS DE AR SGT- 3311   PISTOLA DE AR CURTA - 100mm SGT-3312   PISTOLA DE AR LONGA - 300mm",
    "specs": [
      "60 psi",
      "VELOCIDADE LIVRE",
      "MODELOS 127V E 220V",
      "1350W",
      "022.000 RPM",
      "1,5 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-3310",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5606",
    "name": "Sopradores Elétricos SGT-5606 Sigma Tools",
    "slug": "sopradores-eletricos-sgt-5606-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-5606--7ef13bef9127.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/sopradores-eletricos-sgt-5606--c8189f881e82.webp"
    ],
    "altText": "Sopradores Elétricos SGT-5606 Sigma Tools Athena Soluções Automotivas",
    "description": "PISTOLAS / BICOS DE AR SGT- 3311   PISTOLA DE AR CURTA - 100mm SGT-3312   PISTOLA DE AR LONGA - 300mm",
    "specs": [
      "60 psi",
      "VELOCIDADE LIVRE",
      "MODELOS 127V E 220V",
      "1350W",
      "022.000 RPM",
      "1,5 kg",
      "127V",
      "220V",
      "Código do Produto: SGT-5606",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3010a",
    "name": "Pistola De Pintura SGT-3010A Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3010a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3010a-s-e4faa9b67cd8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3010a-s-1d58b7827291.webp"
    ],
    "altText": "Pistola De Pintura SGT-3010A Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3010A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3010",
    "name": "Pistola De Pintura SGT-3010 Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3010-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3010-si-6aeb1d7b7e48.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3010-si-d3081a87f680.webp"
    ],
    "altText": "Pistola De Pintura SGT-3010 Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3010",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3011a",
    "name": "Pistola De Pintura SGT-3011A Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3011a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3011a-s-a8cffcac4070.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3011a-s-b92f488d90b6.webp"
    ],
    "altText": "Pistola De Pintura SGT-3011A Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3011A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3011b",
    "name": "Pistola De Pintura SGT-3011B Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3011b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3011b-s-e409b027f370.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3011b-s-3a85373c0ed9.webp"
    ],
    "altText": "Pistola De Pintura SGT-3011B Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3011B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3012a",
    "name": "Pistola De Pintura SGT-3012A Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3012a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3012a-s-d46394837e69.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3012a-s-024f506c25f3.webp"
    ],
    "altText": "Pistola De Pintura SGT-3012A Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3012A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3710a",
    "name": "Pistola De Pintura SGT-3710A Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3710a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3710a-s-89524d90b0cc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3710a-s-7fe17a14e4d5.webp"
    ],
    "altText": "Pistola De Pintura SGT-3710A Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3710A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3710",
    "name": "Pistola De Pintura SGT-3710 Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3710-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3710-si-941baf287eeb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3710-si-b3d2ff0a265d.webp"
    ],
    "altText": "Pistola De Pintura SGT-3710 Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3710",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3013b",
    "name": "Pistola De Pintura SGT-3013B Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3013b-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3013b-s-4f515d2ff6de.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3013b-s-66f18f87ef65.webp"
    ],
    "altText": "Pistola De Pintura SGT-3013B Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3013B",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3013",
    "name": "Pistola De Pintura SGT-3013 Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3013-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3013-si-74ff31bc4501.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3013-si-f489faab6a32.webp"
    ],
    "altText": "Pistola De Pintura SGT-3013 Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3013",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3811",
    "name": "Pistola De Pintura SGT-3811 Sigma Tools",
    "slug": "pistola-de-pintura-sgt-3811-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3811-si-3240475bedaa.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistola-de-pintura-sgt-3811-si-8b04d2cea03d.webp"
    ],
    "altText": "Pistola De Pintura SGT-3811 Sigma Tools Athena Soluções Automotivas",
    "description": "KIT BICO/CAPA/AGULHA 1.0mm CANECA PARA PISTOLA DE PINTURA 125ml - ROSCA FÊMEA",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "com Manômetro 1/4\"",
      "Cód.: 07 61 0800 05",
      "Pressão Digital 1/4\"",
      "Cód.: 07 61 0800 06",
      "29 à 50.8 psi",
      "1 à 2 PCM",
      "0,290 kg",
      "Código do Produto: SGT-3811",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3815",
    "name": "Ferramenta SGT-3815 Sigma Tools",
    "slug": "ferramenta-sgt-3815-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3815-sigma-tool-2021e677d368.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3815-sigma-tool-aaa066cf8a74.webp"
    ],
    "altText": "Ferramenta SGT-3815 Sigma Tools Athena Soluções Automotivas",
    "description": "MATERIAL DO BICO E AGULHA KIT BICO/CAPA/AGULHA 1,3mm CANECA PARA PISTOLA DE",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "22 à 32 psi",
      "9 à 12 PCM",
      "HVLP",
      "1,3mm  CÓD.: 07 51 3820 01",
      "1,4mm  CÓD.: 07 51 3820 011",
      "8 à 29 psi",
      "9 à 12 PCM",
      "Código do Produto: SGT-3815",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3820",
    "name": "Ferramenta SGT-3820 Sigma Tools",
    "slug": "ferramenta-sgt-3820-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3820-sigma-tool-fe500568d8ec.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3820-sigma-tool-4991ada4fa14.webp"
    ],
    "altText": "Ferramenta SGT-3820 Sigma Tools Athena Soluções Automotivas",
    "description": "MATERIAL DO BICO E AGULHA KIT BICO/CAPA/AGULHA 1,3mm CANECA PARA PISTOLA DE",
    "specs": [
      "LINHA DE PINTURA  GRAVIDADE",
      "22 à 32 psi",
      "9 à 12 PCM",
      "HVLP",
      "1,3mm  CÓD.: 07 51 3820 01",
      "1,4mm  CÓD.: 07 51 3820 011",
      "8 à 29 psi",
      "9 à 12 PCM",
      "Código do Produto: SGT-3820",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3290",
    "name": "Ferramenta SGT-3290 Sigma Tools",
    "slug": "ferramenta-sgt-3290-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3290-sigma-tool-75813c01d53d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3290-sigma-tool-916dd9def9a1.webp"
    ],
    "altText": "Ferramenta SGT-3290 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3290",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3201",
    "name": "Ferramenta SGT-3201 Sigma Tools",
    "slug": "ferramenta-sgt-3201-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3201-sigma-tool-c5c89fa7f5d0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3201-sigma-tool-92669a0f7597.webp"
    ],
    "altText": "Ferramenta SGT-3201 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3201",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3202",
    "name": "Ferramenta SGT-3202 Sigma Tools",
    "slug": "ferramenta-sgt-3202-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3202-sigma-tool-2139cc42701a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3202-sigma-tool-71dfa3a75960.webp"
    ],
    "altText": "Ferramenta SGT-3202 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3202",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3203",
    "name": "Ferramenta SGT-3203 Sigma Tools",
    "slug": "ferramenta-sgt-3203-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3203-sigma-tool-698a020bd795.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3203-sigma-tool-38b26beae967.webp"
    ],
    "altText": "Ferramenta SGT-3203 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3203",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3112a",
    "name": "Ferramenta SGT-3112A Sigma Tools",
    "slug": "ferramenta-sgt-3112a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3112a-sigma-too-3e3f2d41fbbf.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3112a-sigma-too-da8204ba6be3.webp"
    ],
    "altText": "Ferramenta SGT-3112A Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3112A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3113a",
    "name": "Ferramenta SGT-3113A Sigma Tools",
    "slug": "ferramenta-sgt-3113a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3113a-sigma-too-34f3ce61145b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3113a-sigma-too-aab694c16376.webp"
    ],
    "altText": "Ferramenta SGT-3113A Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3113A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3210a",
    "name": "Ferramenta SGT-3210A Sigma Tools",
    "slug": "ferramenta-sgt-3210a-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3210a-sigma-too-59914ac4d181.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3210a-sigma-too-00d757006d4e.webp"
    ],
    "altText": "Ferramenta SGT-3210A Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3210A",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3410",
    "name": "Ferramenta SGT-3410 Sigma Tools",
    "slug": "ferramenta-sgt-3410-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3410-sigma-tool-5086898975de.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3410-sigma-tool-e2331bcb7b17.webp"
    ],
    "altText": "Ferramenta SGT-3410 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO KIT BICO/CAPA/AGULHA 1.8mm KIT BICO/CAPA/AGULHA 1.8mm",
    "specs": [
      "29 à 40 psi",
      "0,9 PCM",
      "0,500 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "0,490 kg",
      "43 à 58 psi",
      "3 à 4 PCM",
      "Código do Produto: SGT-3410",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3860",
    "name": "Ferramenta SGT-3860 Sigma Tools",
    "slug": "ferramenta-sgt-3860-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3860-sigma-tool-dd866b0b92f1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3860-sigma-tool-6e77d07321cb.webp"
    ],
    "altText": "Ferramenta SGT-3860 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO TANQUE DE PINTURA COM MANGUEIRA E COM PISTOLA",
    "specs": [
      "40 ibs  pol²",
      "11,0 kg",
      "40 ibs  pol²",
      "9 kg",
      "Código do Produto: SGT-3860",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3861",
    "name": "Ferramenta SGT-3861 Sigma Tools",
    "slug": "ferramenta-sgt-3861-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3861-sigma-tool-9f3a25484c04.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3861-sigma-tool-41e2f0cd5b61.webp"
    ],
    "altText": "Ferramenta SGT-3861 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO TANQUE DE PINTURA COM MANGUEIRA E COM PISTOLA",
    "specs": [
      "40 ibs  pol²",
      "11,0 kg",
      "40 ibs  pol²",
      "9 kg",
      "Código do Produto: SGT-3861",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3601-cmp",
    "name": "Ferramenta SGT-3601-CMP Sigma Tools",
    "slug": "ferramenta-sgt-3601-cmp-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3601-cmp-sigma--54d1a1afeea4.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3601-cmp-sigma--00052967adb5.webp"
    ],
    "altText": "Ferramenta SGT-3601-CMP Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO TANQUE DE PINTURA COM MANGUEIRA E COM PISTOLA",
    "specs": [
      "40 ibs  pol²",
      "11,0 kg",
      "40 ibs  pol²",
      "9 kg",
      "Código do Produto: SGT-3601-CMP",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3204",
    "name": "Ferramenta SGT-3204 Sigma Tools",
    "slug": "ferramenta-sgt-3204-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3204-sigma-tool-98d4a6d27087.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3204-sigma-tool-96f030c3a82c.webp"
    ],
    "altText": "Ferramenta SGT-3204 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO TANQUE DE PINTURA COM MANGUEIRA E COM PISTOLA",
    "specs": [
      "40 ibs  pol²",
      "11,0 kg",
      "40 ibs  pol²",
      "9 kg",
      "Código do Produto: SGT-3204",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3601",
    "name": "Ferramenta SGT-3601 Sigma Tools",
    "slug": "ferramenta-sgt-3601-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3601-sigma-tool-3fba7999fe61.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-3601-sigma-tool-8ef2fe4872d8.webp"
    ],
    "altText": "Ferramenta SGT-3601 Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE PINTURA - SUCÇÃO TANQUE DE PINTURA COM MANGUEIRA E COM PISTOLA",
    "specs": [
      "40 ibs  pol²",
      "11,0 kg",
      "40 ibs  pol²",
      "9 kg",
      "Código do Produto: SGT-3601",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6050",
    "name": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-6050 Sigma Tools",
    "slug": "pistolas-eletricas-pulverizadoras-para-pintura-sgt-6050-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-7b28fb5a2203.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-0e95b30640a3.webp"
    ],
    "altText": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-6050 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES DA PISTOLA (C x L x A) DIMENSÕES DA PISTOLA (C x L x A)",
    "specs": [
      "PISTOLAS ELÉTRICAS PULVERIZADORAS PARA PINTURA",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "350W",
      "110V",
      "220V",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "Código do Produto: SGT-6050",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6051",
    "name": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-6051 Sigma Tools",
    "slug": "pistolas-eletricas-pulverizadoras-para-pintura-sgt-6051-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-b37cef2d20d8.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-1a1dec441659.webp"
    ],
    "altText": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-6051 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES DA PISTOLA (C x L x A) DIMENSÕES DA PISTOLA (C x L x A)",
    "specs": [
      "PISTOLAS ELÉTRICAS PULVERIZADORAS PARA PINTURA",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "350W",
      "110V",
      "220V",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "Código do Produto: SGT-6051",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3850",
    "name": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-3850 Sigma Tools",
    "slug": "pistolas-eletricas-pulverizadoras-para-pintura-sgt-3850-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-a650d19fe556.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-a9c672882db8.webp"
    ],
    "altText": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-3850 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES DA PISTOLA (C x L x A) DIMENSÕES DA PISTOLA (C x L x A)",
    "specs": [
      "PISTOLAS ELÉTRICAS PULVERIZADORAS PARA PINTURA",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "350W",
      "110V",
      "220V",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "Código do Produto: SGT-3850",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3851",
    "name": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-3851 Sigma Tools",
    "slug": "pistolas-eletricas-pulverizadoras-para-pintura-sgt-3851-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-825ae2d3c349.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/pistolas-eletricas-pulverizado-f8fc1eed34f5.webp"
    ],
    "altText": "Pistolas Elétricas Pulverizadoras Para Pintura SGT-3851 Sigma Tools Athena Soluções Automotivas",
    "description": "DIMENSÕES DA PISTOLA (C x L x A) DIMENSÕES DA PISTOLA (C x L x A)",
    "specs": [
      "PISTOLAS ELÉTRICAS PULVERIZADORAS PARA PINTURA",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "350W",
      "110V",
      "220V",
      "RESERVATÓRIO DE TINTA",
      "MÁXIMA VISCOSIDADE",
      "Código do Produto: SGT-3851",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5802",
    "name": "Ferramenta SGT-5802 Sigma Tools",
    "slug": "ferramenta-sgt-5802-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5802-sigma-tool-9e6c542a3c58.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5802-sigma-tool-2eecabe224d7.webp"
    ],
    "altText": "Ferramenta SGT-5802 Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES 1 Medidor de Profundidade 1 Medidor de Profundidade",
    "specs": [
      "VELOCIDADE",
      "620W",
      "01100 RPM",
      "2,7 kg",
      "110V",
      "220V",
      "620W",
      "CONSTRUÇÃO CIVIL",
      "Código do Produto: SGT-5802",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5803",
    "name": "Ferramenta SGT-5803 Sigma Tools",
    "slug": "ferramenta-sgt-5803-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5803-sigma-tool-a7e486f6e357.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5803-sigma-tool-d4c71e4c2331.webp"
    ],
    "altText": "Ferramenta SGT-5803 Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES 1 Medidor de Profundidade 1 Medidor de Profundidade",
    "specs": [
      "VELOCIDADE",
      "620W",
      "01100 RPM",
      "2,7 kg",
      "110V",
      "220V",
      "620W",
      "CONSTRUÇÃO CIVIL",
      "Código do Produto: SGT-5803",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5805",
    "name": "Ferramenta SGT-5805 Sigma Tools",
    "slug": "ferramenta-sgt-5805-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5805-sigma-tool-188c8c734f46.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5805-sigma-tool-37143bf8c2d2.webp"
    ],
    "altText": "Ferramenta SGT-5805 Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES 1 Medidor de Profundidade 1 Medidor de Profundidade",
    "specs": [
      "VELOCIDADE",
      "620W",
      "01100 RPM",
      "2,7 kg",
      "110V",
      "220V",
      "620W",
      "CONSTRUÇÃO CIVIL",
      "Código do Produto: SGT-5805",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5804",
    "name": "Ferramenta SGT-5804 Sigma Tools",
    "slug": "ferramenta-sgt-5804-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5804-sigma-tool-30f03a7a0a1b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5804-sigma-tool-2cae7b09ccb7.webp"
    ],
    "altText": "Ferramenta SGT-5804 Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES 1 Medidor de Profundidade 1 Medidor de Profundidade",
    "specs": [
      "VELOCIDADE",
      "620W",
      "01100 RPM",
      "2,7 kg",
      "110V",
      "220V",
      "620W",
      "CONSTRUÇÃO CIVIL",
      "Código do Produto: SGT-5804",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6001",
    "name": "Máquinas De Pintura Airless SGT-6001 Sigma Tools",
    "slug": "maquinas-de-pintura-airless-sgt-6001-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-7cd881d284bd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-ab8bcde6c1ee.webp"
    ],
    "altText": "Máquinas De Pintura Airless SGT-6001 Sigma Tools Athena Soluções Automotivas",
    "description": "MÁQUINAS DE PINTURA AIRLESS APLICABILIDADE POR TIPO DE TINTA COMPRIMENTO DA MANGUEIRA",
    "specs": [
      "VERNIZ",
      "NÃO APLICÁVEL",
      "GABARITO DE APLICABILIDADE",
      "OUTROS BICOS APLICÁVEIS",
      "220V / 5060 Hz",
      "650W / 0,87HP",
      "VAZÃO MÁXIMA",
      "3.000 psi",
      "Código do Produto: SGT-6001",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6008",
    "name": "Máquinas De Pintura Airless SGT-6008 Sigma Tools",
    "slug": "maquinas-de-pintura-airless-sgt-6008-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-52abe1e19adc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-18f6d8f3c005.webp"
    ],
    "altText": "Máquinas De Pintura Airless SGT-6008 Sigma Tools Athena Soluções Automotivas",
    "description": "MÁQUINAS DE PINTURA AIRLESS APLICABILIDADE POR TIPO DE TINTA COMPRIMENTO DA MANGUEIRA",
    "specs": [
      "VERNIZ",
      "NÃO APLICÁVEL",
      "GABARITO DE APLICABILIDADE",
      "OUTROS BICOS APLICÁVEIS",
      "220V / 5060 Hz",
      "650W / 0,87HP",
      "VAZÃO MÁXIMA",
      "3.000 psi",
      "Código do Produto: SGT-6008",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6009",
    "name": "Máquinas De Pintura Airless SGT-6009 Sigma Tools",
    "slug": "maquinas-de-pintura-airless-sgt-6009-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-7c0da27a55af.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/maquinas-de-pintura-airless-sg-6848b4395ce2.webp"
    ],
    "altText": "Máquinas De Pintura Airless SGT-6009 Sigma Tools Athena Soluções Automotivas",
    "description": "MÁQUINAS DE PINTURA AIRLESS APLICABILIDADE POR TIPO DE TINTA COMPRIMENTO DA MANGUEIRA",
    "specs": [
      "VERNIZ",
      "NÃO APLICÁVEL",
      "GABARITO DE APLICABILIDADE",
      "OUTROS BICOS APLICÁVEIS",
      "220V / 5060 Hz",
      "650W / 0,87HP",
      "VAZÃO MÁXIMA",
      "3.000 psi",
      "Código do Produto: SGT-6009",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3415",
    "name": "Acessórios Para Máquinas De Pintura Airless SGT-3415 Sigma Tools",
    "slug": "acessorios-para-maquinas-de-pintura-airless-sgt-3415-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/acessorios-para-maquinas-de-pi-80c1ff74b974.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/acessorios-para-maquinas-de-pi-eeb07b295e4a.webp"
    ],
    "altText": "Acessórios Para Máquinas De Pintura Airless SGT-3415 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS PARA MÁQUINAS DE PINTURA AIRLESS PISTOLA PROJETORA DE TEXTURA BICO AIRLESS 211 - 1,1mm - LEQUE 10-15cm",
    "specs": [
      "68,8pcm",
      "4358psi",
      "15pcm à 20pcm",
      "COD.: 07 54 6022 00",
      "COD.: 07 54 6002 58",
      "COD.: 07 52 6010 01",
      "COD.: 07 64 6001 11",
      "COD.: 07 54 6009 62",
      "Código do Produto: SGT-3415",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6002",
    "name": "Acessórios Para Máquinas De Pintura Airless SGT-6002 Sigma Tools",
    "slug": "acessorios-para-maquinas-de-pintura-airless-sgt-6002-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/acessorios-para-maquinas-de-pi-cc53cce5512c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/acessorios-para-maquinas-de-pi-46259427252c.webp"
    ],
    "altText": "Acessórios Para Máquinas De Pintura Airless SGT-6002 Sigma Tools Athena Soluções Automotivas",
    "description": "ACESSÓRIOS PARA MÁQUINAS DE PINTURA AIRLESS PISTOLA PROJETORA DE TEXTURA BICO AIRLESS 211 - 1,1mm - LEQUE 10-15cm",
    "specs": [
      "68,8pcm",
      "4358psi",
      "15pcm à 20pcm",
      "COD.: 07 54 6022 00",
      "COD.: 07 54 6002 58",
      "COD.: 07 52 6010 01",
      "COD.: 07 64 6001 11",
      "COD.: 07 54 6009 62",
      "Código do Produto: SGT-6002",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4301",
    "name": "Lixadeiras SGT-4301 Sigma Tools",
    "slug": "lixadeiras-sgt-4301-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-4301-sigma-tool-225ac2d30eed.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-4301-sigma-tool-7838c1f9a682.webp"
    ],
    "altText": "Lixadeiras SGT-4301 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA MANUAL Pode ser ajustado sem o auxílio de ferramentas. Botão Liga/Desliga com proteção contra poeira e",
    "specs": [
      "Cabo/Haste expansível para locais altos.",
      "impactos. Com auto trava.",
      "Regulagem de velocidade por botão e início suave.",
      "Design dobrável para fácil armazenamento.",
      "Construída em sistema de vácuo.",
      "Poderoso motor de 850W.",
      "Lanterna de LED para melhor visibilidade.",
      "irregular que evita arranhões graças à suspensão",
      "Código do Produto: SGT-4301",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4305",
    "name": "Lixadeiras SGT-4305 Sigma Tools",
    "slug": "lixadeiras-sgt-4305-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-4305-sigma-tool-3dce0a96717d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/lixadeiras-sgt-4305-sigma-tool-a5edd3e7ecc3.webp"
    ],
    "altText": "Lixadeiras SGT-4305 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA MANUAL Pode ser ajustado sem o auxílio de ferramentas. Botão Liga/Desliga com proteção contra poeira e",
    "specs": [
      "Cabo/Haste expansível para locais altos.",
      "impactos. Com auto trava.",
      "Regulagem de velocidade por botão e início suave.",
      "Design dobrável para fácil armazenamento.",
      "Construída em sistema de vácuo.",
      "Poderoso motor de 850W.",
      "Lanterna de LED para melhor visibilidade.",
      "irregular que evita arranhões graças à suspensão",
      "Código do Produto: SGT-4305",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5900",
    "name": "Ferramenta SGT-5900 Sigma Tools",
    "slug": "ferramenta-sgt-5900-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5900-sigma-tool-6cfc479e041a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5900-sigma-tool-70008664308e.webp"
    ],
    "altText": "Ferramenta SGT-5900 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA ELÉTRICA PROF. E LARG. MÁX. DO CORTE PROFUNDIDADE. MÁX. DO CORTE",
    "specs": [
      "VELOCIDADE MÁXIMA",
      "220V",
      "200 RPM",
      "VELOCIDADE MÁXIMA",
      "220V",
      "2000W",
      "2000 RPM",
      "25mm  CÓD.: 0754610051",
      "Código do Produto: SGT-5900",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6100",
    "name": "Ferramenta SGT-6100 Sigma Tools",
    "slug": "ferramenta-sgt-6100-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6100-sigma-tool-6086c99b631b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6100-sigma-tool-051beca27f06.webp"
    ],
    "altText": "Ferramenta SGT-6100 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA ELÉTRICA PROF. E LARG. MÁX. DO CORTE PROFUNDIDADE. MÁX. DO CORTE",
    "specs": [
      "VELOCIDADE MÁXIMA",
      "220V",
      "200 RPM",
      "VELOCIDADE MÁXIMA",
      "220V",
      "2000W",
      "2000 RPM",
      "25mm  CÓD.: 0754610051",
      "Código do Produto: SGT-6100",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6105",
    "name": "Ferramenta SGT-6105 Sigma Tools",
    "slug": "ferramenta-sgt-6105-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6105-sigma-tool-364c86c9080e.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6105-sigma-tool-b545911372c6.webp"
    ],
    "altText": "Ferramenta SGT-6105 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA ELÉTRICA PROF. E LARG. MÁX. DO CORTE PROFUNDIDADE. MÁX. DO CORTE",
    "specs": [
      "VELOCIDADE MÁXIMA",
      "220V",
      "200 RPM",
      "VELOCIDADE MÁXIMA",
      "220V",
      "2000W",
      "2000 RPM",
      "25mm  CÓD.: 0754610051",
      "Código do Produto: SGT-6105",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6110",
    "name": "Ferramenta SGT-6110 Sigma Tools",
    "slug": "ferramenta-sgt-6110-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6110-sigma-tool-510d53a48deb.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6110-sigma-tool-2489f95a2a5f.webp"
    ],
    "altText": "Ferramenta SGT-6110 Sigma Tools Athena Soluções Automotivas",
    "description": "DESEMPENADEIRA ELÉTRICA PROF. E LARG. MÁX. DO CORTE PROFUNDIDADE. MÁX. DO CORTE",
    "specs": [
      "VELOCIDADE MÁXIMA",
      "220V",
      "200 RPM",
      "VELOCIDADE MÁXIMA",
      "220V",
      "2000W",
      "2000 RPM",
      "25mm  CÓD.: 0754610051",
      "Código do Produto: SGT-6110",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8650",
    "name": "Ferramenta SGT-8650 Sigma Tools",
    "slug": "ferramenta-sgt-8650-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-8650-sigma-tool-28d5bf002460.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-8650-sigma-tool-9ae0b4ce0121.webp"
    ],
    "altText": "Ferramenta SGT-8650 Sigma Tools Athena Soluções Automotivas",
    "description": "PASSA FIOS - 30 METROS • ACIONAMENTO DA PARADA AUTOMÁTICA • ALÇA COM GANCHO PARA",
    "specs": [
      "VENTOSAS DE SUCÇÃO",
      "VELOCIDADE LIVRE",
      "VELOCIDADE",
      "02.600 RPM",
      "4,5 kg",
      "1,0 kg",
      "INTERRUPTOR DE VERIFICAÇÃO DA BATERIA",
      "Regulagem de torque em 3 níveis;",
      "Código do Produto: SGT-8650",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-6115",
    "name": "Ferramenta SGT-6115 Sigma Tools",
    "slug": "ferramenta-sgt-6115-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6115-sigma-tool-6642db2b8484.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-6115-sigma-tool-e247d1799a86.webp"
    ],
    "altText": "Ferramenta SGT-6115 Sigma Tools Athena Soluções Automotivas",
    "description": "PASSA FIOS - 30 METROS • ACIONAMENTO DA PARADA AUTOMÁTICA • ALÇA COM GANCHO PARA",
    "specs": [
      "VENTOSAS DE SUCÇÃO",
      "VELOCIDADE LIVRE",
      "VELOCIDADE",
      "02.600 RPM",
      "4,5 kg",
      "1,0 kg",
      "INTERRUPTOR DE VERIFICAÇÃO DA BATERIA",
      "Regulagem de torque em 3 níveis;",
      "Código do Produto: SGT-6115",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5800-pro",
    "name": "Ferramenta SGT-5800-PRO Sigma Tools",
    "slug": "ferramenta-sgt-5800-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5800-pro-sigma--b39f51f23408.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5800-pro-sigma--12bf1a563d4d.webp"
    ],
    "altText": "Ferramenta SGT-5800-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES MISTURADOR ELÉTRICO DE ARGAMASSA E TINTAS 1 Ponteira 280 X 17mm.",
    "specs": [
      "1010W",
      "5,6 kg",
      "220V",
      "127V",
      "1010W",
      "CONSTRUÇÃO CIVIL",
      "1 Chave da Tampa de Lubrificação .",
      "1240W",
      "Código do Produto: SGT-5800-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5801-pro",
    "name": "Ferramenta SGT-5801-PRO Sigma Tools",
    "slug": "ferramenta-sgt-5801-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5801-pro-sigma--d0aeb205896c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5801-pro-sigma--a92a5e240a65.webp"
    ],
    "altText": "Ferramenta SGT-5801-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES MISTURADOR ELÉTRICO DE ARGAMASSA E TINTAS 1 Ponteira 280 X 17mm.",
    "specs": [
      "1010W",
      "5,6 kg",
      "220V",
      "127V",
      "1010W",
      "CONSTRUÇÃO CIVIL",
      "1 Chave da Tampa de Lubrificação .",
      "1240W",
      "Código do Produto: SGT-5801-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5500-pro",
    "name": "Ferramenta SGT-5500-PRO Sigma Tools",
    "slug": "ferramenta-sgt-5500-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5500-pro-sigma--d6deb23726e1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5500-pro-sigma--6132d2f9d129.webp"
    ],
    "altText": "Ferramenta SGT-5500-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "MARTELETES ROMPEDORES, PERFURADORES E DEMOLIDORES MISTURADOR ELÉTRICO DE ARGAMASSA E TINTAS 1 Ponteira 280 X 17mm.",
    "specs": [
      "1010W",
      "5,6 kg",
      "220V",
      "127V",
      "1010W",
      "CONSTRUÇÃO CIVIL",
      "1 Chave da Tampa de Lubrificação .",
      "1240W",
      "Código do Produto: SGT-5500-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1009",
    "name": "Calafetadores Pneumáticos SGT-1009 Sigma Tools",
    "slug": "calafetadores-pneumaticos-sgt-1009-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--f6678a039687.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--cab639a78af2.webp"
    ],
    "altText": "Calafetadores Pneumáticos SGT-1009 Sigma Tools Athena Soluções Automotivas",
    "description": "CALAFETADORES PNEUMÁTICOS CALAFETADORES À BATERIA CAPACIDADE DO CARTUCHO",
    "specs": [
      "VOLUME DE AR",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "14 PCM  396L / min",
      "4.1 bar / 60 psi",
      "0,750 kg",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "Código do Produto: SGT-1009",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1013",
    "name": "Calafetadores Pneumáticos SGT-1013 Sigma Tools",
    "slug": "calafetadores-pneumaticos-sgt-1013-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--3e8a82498804.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--9bdc5a338a42.webp"
    ],
    "altText": "Calafetadores Pneumáticos SGT-1013 Sigma Tools Athena Soluções Automotivas",
    "description": "CALAFETADORES PNEUMÁTICOS CALAFETADORES À BATERIA CAPACIDADE DO CARTUCHO",
    "specs": [
      "VOLUME DE AR",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "14 PCM  396L / min",
      "4.1 bar / 60 psi",
      "0,750 kg",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "Código do Produto: SGT-1013",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8002",
    "name": "Calafetadores Pneumáticos SGT-8002 Sigma Tools",
    "slug": "calafetadores-pneumaticos-sgt-8002-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--fb679373c4fd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--4e48cd2d8809.webp"
    ],
    "altText": "Calafetadores Pneumáticos SGT-8002 Sigma Tools Athena Soluções Automotivas",
    "description": "CALAFETADORES PNEUMÁTICOS CALAFETADORES À BATERIA CAPACIDADE DO CARTUCHO",
    "specs": [
      "VOLUME DE AR",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "14 PCM  396L / min",
      "4.1 bar / 60 psi",
      "0,750 kg",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "Código do Produto: SGT-8002",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-8001",
    "name": "Calafetadores Pneumáticos SGT-8001 Sigma Tools",
    "slug": "calafetadores-pneumaticos-sgt-8001-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--6991bef67ed9.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/calafetadores-pneumaticos-sgt--96e37e3a4fcd.webp"
    ],
    "altText": "Calafetadores Pneumáticos SGT-8001 Sigma Tools Athena Soluções Automotivas",
    "description": "CALAFETADORES PNEUMÁTICOS CALAFETADORES À BATERIA CAPACIDADE DO CARTUCHO",
    "specs": [
      "VOLUME DE AR",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "14 PCM  396L / min",
      "4.1 bar / 60 psi",
      "0,750 kg",
      "NÍVEL DE RUÍDO",
      "VIBRAÇÃO",
      "Código do Produto: SGT-8001",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9820",
    "name": "Ferramenta SGT-9820 Sigma Tools",
    "slug": "ferramenta-sgt-9820-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9820-sigma-tool-22d384712c88.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9820-sigma-tool-7625745a4897.webp"
    ],
    "altText": "Ferramenta SGT-9820 Sigma Tools Athena Soluções Automotivas",
    "description": "DESCOLADOR DE PNEUS AGRÍCOLA/CAMINHÃO DESCOLADOR MANUAL PARA PNEUS",
    "specs": [
      "CHAVE DE RODA 27X32mm",
      "CHAVE DE RODA 30X33mm",
      "CHAVE DE RODA 14” (350mm) CRUZ 17cm  19cm  21cm  23cm",
      "CHAVE DE RODA 20” (500mm ) CRUZ 17cm  19cm  21cm  23cm",
      "CHAVE DE RODA L 17mm COM ESPÁTULA",
      "CHAVE DE RODA L 19mm COM ESPÁTULA",
      "CHAVE DE RODA L 21mm COM ESPÁTULA",
      "Código do Produto: SGT-9820",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9960",
    "name": "Ferramenta SGT-9960 Sigma Tools",
    "slug": "ferramenta-sgt-9960-sigma-tools",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9960-sigma-tool-fc49e6c54647.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9960-sigma-tool-b18d6c269a18.webp"
    ],
    "altText": "Ferramenta SGT-9960 Sigma Tools Athena Soluções Automotivas",
    "description": "DESTALONADOR HIDRÁULICO DE PNEUS DESTALONADOR PNEUMÁTICO PARA PNEUS COMPRIMENTO APROXIMADO",
    "specs": [
      "35,3 kg",
      "SGT CHEMICALS  VASELINA VEGETAL",
      "A VASELINA VEGETAL  PASTA PARA MONTAGEM",
      "DE PNEUS foi desenvolvida para proporcionar",
      "10,9 kg",
      "26L/S / 55 PCM",
      "6.3 bar / 90 psi",
      "ACOMPANHA:",
      "Código do Produto: SGT-9960",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-1520",
    "name": "Ferramenta SGT-1520 Sigma Tools",
    "slug": "ferramenta-sgt-1520-sigma-tools",
    "categoryId": "cat_desmontadoras",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1520-sigma-tool-310c2aa3d454.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-1520-sigma-tool-a796d015e69d.webp"
    ],
    "altText": "Ferramenta SGT-1520 Sigma Tools Athena Soluções Automotivas",
    "description": "DESTALONADOR HIDRÁULICO DE PNEUS DESTALONADOR PNEUMÁTICO PARA PNEUS COMPRIMENTO APROXIMADO",
    "specs": [
      "35,3 kg",
      "SGT CHEMICALS  VASELINA VEGETAL",
      "A VASELINA VEGETAL  PASTA PARA MONTAGEM",
      "DE PNEUS foi desenvolvida para proporcionar",
      "10,9 kg",
      "26L/S / 55 PCM",
      "6.3 bar / 90 psi",
      "ACOMPANHA:",
      "Código do Produto: SGT-1520",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-2025",
    "name": "Macacos Tipo Sanfona SGT-2025 Sigma Tools",
    "slug": "macacos-tipo-sanfona-sgt-2025-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-tipo-sanfona-sgt-2025--6c8c7907f938.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-tipo-sanfona-sgt-2025--06a9bc671761.webp"
    ],
    "altText": "Macacos Tipo Sanfona SGT-2025 Sigma Tools Athena Soluções Automotivas",
    "description": "- Não sobrecarregue o macaco além da sua capacidade nominal. - Utilize o macaco sempre em locais firmes e em supefícies planas. ESPECIFICAÇÕES TÉCNICAS",
    "specs": [
      "FAIXA DE ELEVAÇÃO",
      "12,7 kg",
      "FAIXA DE ELEVAÇÃO",
      "22,4 kg",
      "MACACO TIPO SANFONA UNIVERSAL",
      "1000kg  CARROS PASSEIO",
      "FAIXA DE ELEVAÇÃO",
      "1,2 kg",
      "Código do Produto: SGT-2025",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-2030",
    "name": "Macacos Tipo Sanfona SGT-2030 Sigma Tools",
    "slug": "macacos-tipo-sanfona-sgt-2030-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-tipo-sanfona-sgt-2030--aac26b05f596.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-tipo-sanfona-sgt-2030--ac6d7744705e.webp"
    ],
    "altText": "Macacos Tipo Sanfona SGT-2030 Sigma Tools Athena Soluções Automotivas",
    "description": "- Não sobrecarregue o macaco além da sua capacidade nominal. - Utilize o macaco sempre em locais firmes e em supefícies planas. ESPECIFICAÇÕES TÉCNICAS",
    "specs": [
      "FAIXA DE ELEVAÇÃO",
      "12,7 kg",
      "FAIXA DE ELEVAÇÃO",
      "22,4 kg",
      "MACACO TIPO SANFONA UNIVERSAL",
      "1000kg  CARROS PASSEIO",
      "FAIXA DE ELEVAÇÃO",
      "1,2 kg",
      "Código do Produto: SGT-2030",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3035",
    "name": "Macacos Pneumáticos/Hidropneumáticos SGT-3035 Sigma Tools",
    "slug": "macacos-pneumaticos-hidropneumaticos-sgt-3035-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-3afdf9003072.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-02b8434d2d27.webp"
    ],
    "altText": "Macacos Pneumáticos/Hidropneumáticos SGT-3035 Sigma Tools Athena Soluções Automotivas",
    "description": "MACACOS PNEUMÁTICOS/HIDROPNEUMÁTICOS ESPECIFICAÇÕES TÉCNICAS Rodinhas de nylon que não",
    "specs": [
      "120 psi",
      "Válvula de Segurança",
      "Livre de vazamento",
      "500kg",
      "4,3 kg",
      "ELEVAÇÃO AUTOMOTIVA",
      "Código do Produto: SGT-3035",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3050",
    "name": "Macacos Pneumáticos/Hidropneumáticos SGT-3050 Sigma Tools",
    "slug": "macacos-pneumaticos-hidropneumaticos-sgt-3050-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-ea2b53367e37.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-75d680787782.webp"
    ],
    "altText": "Macacos Pneumáticos/Hidropneumáticos SGT-3050 Sigma Tools Athena Soluções Automotivas",
    "description": "MACACOS PNEUMÁTICOS/HIDROPNEUMÁTICOS ESPECIFICAÇÕES TÉCNICAS Rodinhas de nylon que não",
    "specs": [
      "120 psi",
      "Válvula de Segurança",
      "Livre de vazamento",
      "500kg",
      "4,3 kg",
      "ELEVAÇÃO AUTOMOTIVA",
      "Código do Produto: SGT-3050",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-3040",
    "name": "Macacos Pneumáticos/Hidropneumáticos SGT-3040 Sigma Tools",
    "slug": "macacos-pneumaticos-hidropneumaticos-sgt-3040-sigma-tools",
    "categoryId": "cat_elevadores",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": true,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-79ee42130837.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/macacos-pneumaticos-hidropneum-19dd5fb66240.webp"
    ],
    "altText": "Macacos Pneumáticos/Hidropneumáticos SGT-3040 Sigma Tools Athena Soluções Automotivas",
    "description": "MACACOS PNEUMÁTICOS/HIDROPNEUMÁTICOS MACACO  E PRANCHA OFF-ROAD MACACO TIPO FARM JACK",
    "specs": [
      "DESATOLAR VEÍCULOS",
      "ALTURA DE LEVANTAMENTO APROXIMADO",
      "120 à 180 psi",
      "PEÇAS DE REPOSIÇÃO: HIDRÁULICO",
      "ELEVAÇÃO AUTOMOTIVA",
      "Código do Produto: SGT-3040",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4150",
    "name": "Desparafusadeira De Grampo Longa SGT-4150 Sigma Tools",
    "slug": "desparafusadeira-de-grampo-longa-sgt-4150-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-3c3afb668fba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-115f225fd409.webp"
    ],
    "altText": "Desparafusadeira De Grampo Longa SGT-4150 Sigma Tools Athena Soluções Automotivas",
    "description": "DESPARAFUSADEIRA DE GRAMPO LONGA DESPARAFUSADEIRA DE GRAMPO CURTA UM PROFISSIONAL ESPECIALIZADO!",
    "specs": [
      "*PODE SER ALTERADO PARA 220V POR",
      "VELOCIDADE MÁXIMA",
      "VOLTAGEM",
      "5.000 Nm / 510 kgf.m",
      "4.0 KW / 5,4 CV",
      "17 RPM",
      "220 TRIFÁSICO / 380 VOLTS",
      "86 kg",
      "Código do Produto: SGT-4150",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4151",
    "name": "Desparafusadeira De Grampo Longa SGT-4151 Sigma Tools",
    "slug": "desparafusadeira-de-grampo-longa-sgt-4151-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-e504f5970f85.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-f47d870151cc.webp"
    ],
    "altText": "Desparafusadeira De Grampo Longa SGT-4151 Sigma Tools Athena Soluções Automotivas",
    "description": "DESPARAFUSADEIRA DE GRAMPO LONGA DESPARAFUSADEIRA DE GRAMPO CURTA UM PROFISSIONAL ESPECIALIZADO!",
    "specs": [
      "*PODE SER ALTERADO PARA 220V POR",
      "VELOCIDADE MÁXIMA",
      "VOLTAGEM",
      "5.000 Nm / 510 kgf.m",
      "4.0 KW / 5,4 CV",
      "17 RPM",
      "220 TRIFÁSICO / 380 VOLTS",
      "86 kg",
      "Código do Produto: SGT-4151",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4150-01",
    "name": "Desparafusadeira De Grampo Longa SGT-4150-01 Sigma Tools",
    "slug": "desparafusadeira-de-grampo-longa-sgt-4150-01-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-da9e823ebf88.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/desparafusadeira-de-grampo-lon-10cb6b553fe5.webp"
    ],
    "altText": "Desparafusadeira De Grampo Longa SGT-4150-01 Sigma Tools Athena Soluções Automotivas",
    "description": "DESPARAFUSADEIRA DE GRAMPO LONGA DESPARAFUSADEIRA DE GRAMPO CURTA UM PROFISSIONAL ESPECIALIZADO!",
    "specs": [
      "*PODE SER ALTERADO PARA 220V POR",
      "VELOCIDADE MÁXIMA",
      "VOLTAGEM",
      "5.000 Nm / 510 kgf.m",
      "4.0 KW / 5,4 CV",
      "17 RPM",
      "220 TRIFÁSICO / 380 VOLTS",
      "86 kg",
      "Código do Produto: SGT-4150-01",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4000",
    "name": "Ferramenta SGT-4000 Sigma Tools",
    "slug": "ferramenta-sgt-4000-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4000-sigma-tool-2cdd0803cb08.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4000-sigma-tool-18b50c89533e.webp"
    ],
    "altText": "Ferramenta SGT-4000 Sigma Tools Athena Soluções Automotivas",
    "description": "GRAXEIRAS / ENGRAXADEIRAS PROPULSORA PNEUMÁTICA PARA GRAXA - 12L ESPECIFICAÇÕES TÉCNICAS",
    "specs": [
      "MANGUEIRA FLEXÍVEL",
      "ENGRAXADEIRA  PNEUMÁTICA 400kg",
      "400 kg",
      "1,4 kg",
      "30150psi",
      "EXTENSÃO FLEXÍVEL COM BICO ACOPLADOR",
      "4 kg",
      "8 kg",
      "Código do Produto: SGT-4000",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9903k",
    "name": "Ferramenta SGT-9903K Sigma Tools",
    "slug": "ferramenta-sgt-9903k-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9903k-sigma-too-69edcb86f3c2.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9903k-sigma-too-62b7ff5ac618.webp"
    ],
    "altText": "Ferramenta SGT-9903K Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS ESPECIAIS SGT-9903K - KIT DE FERRAMENTAS PARA RETORNAR ÊMBOLO DA",
    "specs": [
      "PARA REMOVER SOM",
      "AUTOMOTIVO",
      "DIREÇÃO E PIVÔS",
      "PARA REMOVER",
      "Código do Produto: SGT-9903K",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-990402k",
    "name": "Ferramenta SGT-990402K Sigma Tools",
    "slug": "ferramenta-sgt-990402k-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-990402k-sigma-t-ceddad200d70.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-990402k-sigma-t-83dbb60ba2f1.webp"
    ],
    "altText": "Ferramenta SGT-990402K Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS ESPECIAIS SGT-9903K - KIT DE FERRAMENTAS PARA RETORNAR ÊMBOLO DA",
    "specs": [
      "PARA REMOVER SOM",
      "AUTOMOTIVO",
      "DIREÇÃO E PIVÔS",
      "PARA REMOVER",
      "Código do Produto: SGT-990402K",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-990401",
    "name": "Ferramenta SGT-990401 Sigma Tools",
    "slug": "ferramenta-sgt-990401-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-990401-sigma-to-93a1684964cd.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-990401-sigma-to-407b18b15e21.webp"
    ],
    "altText": "Ferramenta SGT-990401 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS ESPECIAIS SGT-9903K - KIT DE FERRAMENTAS PARA RETORNAR ÊMBOLO DA",
    "specs": [
      "PARA REMOVER SOM",
      "AUTOMOTIVO",
      "DIREÇÃO E PIVÔS",
      "PARA REMOVER",
      "Código do Produto: SGT-990401",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9812",
    "name": "Ferramenta SGT-9812 Sigma Tools",
    "slug": "ferramenta-sgt-9812-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9812-sigma-tool-28631c100620.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9812-sigma-tool-630d1481ac5a.webp"
    ],
    "altText": "Ferramenta SGT-9812 Sigma Tools Athena Soluções Automotivas",
    "description": "FERRAMENTAS ESPECIAIS SGT-9903K - KIT DE FERRAMENTAS PARA RETORNAR ÊMBOLO DA",
    "specs": [
      "PARA REMOVER SOM",
      "AUTOMOTIVO",
      "DIREÇÃO E PIVÔS",
      "PARA REMOVER",
      "Código do Produto: SGT-9812",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-kit57",
    "name": "Ferramenta SGT-KIT57 Sigma Tools",
    "slug": "ferramenta-sgt-kit57-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit57-sigma-too-39c3db63d147.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit57-sigma-too-acde95b18ff1.webp"
    ],
    "altText": "Ferramenta SGT-KIT57 Sigma Tools Athena Soluções Automotivas",
    "description": "ESTRIADOS 8mm à 32mm - 1/2” COMPLETO 1/4” - 3/8” - 1/2” SGT-KIT178 - 178 PEÇAS",
    "specs": [
      "KITS  JOGOS DE SOQUETE SEXTAVADO E ESTRIADO",
      "CHAVES E ALICATES",
      "KIT CHAVE FIXA",
      "CHAVE FIXA",
      "SEXTAVADOS 1/4”",
      "SEXTAVADOS 1/4”  1/2”",
      "Veja a",
      "Veja a",
      "Código do Produto: SGT-KIT57",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-kit94",
    "name": "Ferramenta SGT-KIT94 Sigma Tools",
    "slug": "ferramenta-sgt-kit94-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit94-sigma-too-9bcdd745df33.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit94-sigma-too-cde132237dc2.webp"
    ],
    "altText": "Ferramenta SGT-KIT94 Sigma Tools Athena Soluções Automotivas",
    "description": "ESTRIADOS 8mm à 32mm - 1/2” COMPLETO 1/4” - 3/8” - 1/2” SGT-KIT178 - 178 PEÇAS",
    "specs": [
      "KITS  JOGOS DE SOQUETE SEXTAVADO E ESTRIADO",
      "CHAVES E ALICATES",
      "KIT CHAVE FIXA",
      "CHAVE FIXA",
      "SEXTAVADOS 1/4”",
      "SEXTAVADOS 1/4”  1/2”",
      "Veja a",
      "Veja a",
      "Código do Produto: SGT-KIT94",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-kit22",
    "name": "Ferramenta SGT-KIT22 Sigma Tools",
    "slug": "ferramenta-sgt-kit22-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit22-sigma-too-a09d1c147dab.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit22-sigma-too-056bd5776186.webp"
    ],
    "altText": "Ferramenta SGT-KIT22 Sigma Tools Athena Soluções Automotivas",
    "description": "ESTRIADOS 8mm à 32mm - 1/2” COMPLETO 1/4” - 3/8” - 1/2” SGT-KIT178 - 178 PEÇAS",
    "specs": [
      "KITS  JOGOS DE SOQUETE SEXTAVADO E ESTRIADO",
      "CHAVES E ALICATES",
      "KIT CHAVE FIXA",
      "CHAVE FIXA",
      "SEXTAVADOS 1/4”",
      "SEXTAVADOS 1/4”  1/2”",
      "Veja a",
      "Veja a",
      "Código do Produto: SGT-KIT22",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-kit178",
    "name": "Ferramenta SGT-KIT178 Sigma Tools",
    "slug": "ferramenta-sgt-kit178-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit178-sigma-to-a6c9adabeb14.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit178-sigma-to-ec8b34ae69b4.webp"
    ],
    "altText": "Ferramenta SGT-KIT178 Sigma Tools Athena Soluções Automotivas",
    "description": "ESTRIADOS 8mm à 32mm - 1/2” COMPLETO 1/4” - 3/8” - 1/2” SGT-KIT178 - 178 PEÇAS",
    "specs": [
      "KITS  JOGOS DE SOQUETE SEXTAVADO E ESTRIADO",
      "CHAVES E ALICATES",
      "KIT CHAVE FIXA",
      "CHAVE FIXA",
      "SEXTAVADOS 1/4”",
      "SEXTAVADOS 1/4”  1/2”",
      "Veja a",
      "Veja a",
      "Código do Produto: SGT-KIT178",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-kit216",
    "name": "Ferramenta SGT-KIT216 Sigma Tools",
    "slug": "ferramenta-sgt-kit216-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit216-sigma-to-c492cbdc5380.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-kit216-sigma-to-eb2cd0c06128.webp"
    ],
    "altText": "Ferramenta SGT-KIT216 Sigma Tools Athena Soluções Automotivas",
    "description": "ESTRIADOS 8mm à 32mm - 1/2” COMPLETO 1/4” - 3/8” - 1/2” SGT-KIT178 - 178 PEÇAS",
    "specs": [
      "KITS  JOGOS DE SOQUETE SEXTAVADO E ESTRIADO",
      "CHAVES E ALICATES",
      "KIT CHAVE FIXA",
      "CHAVE FIXA",
      "SEXTAVADOS 1/4”",
      "SEXTAVADOS 1/4”  1/2”",
      "Veja a",
      "Veja a",
      "Código do Produto: SGT-KIT216",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-9002",
    "name": "Ferramenta SGT-9002 Sigma Tools",
    "slug": "ferramenta-sgt-9002-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9002-sigma-tool-4b6e3c2ebc90.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-9002-sigma-tool-302595d5dc25.webp"
    ],
    "altText": "Ferramenta SGT-9002 Sigma Tools Athena Soluções Automotivas",
    "description": "CARRETEL ENROLADOR MANGUEIRA DE AR HÍBRIDA - 8mm x 12mm REDE E SISTEMAS DE AR COMPRIMENTO DA MANGUEIRA",
    "specs": [
      "MANGUEIRAS ESPIRAIS EM POLIURETANO",
      "MANGUEIRAS ESPIRAIS EM POLIETILENO",
      "142 psi",
      "142 psi",
      "156 psi",
      "156 psi",
      "156 psi",
      "142 psi",
      "Código do Produto: SGT-9002",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-flex",
    "name": "Ferramenta SGT-FLEX Sigma Tools",
    "slug": "ferramenta-sgt-flex-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-flex-sigma-tool-a398a1625272.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-flex-sigma-tool-9a315dcd7cc7.webp"
    ],
    "altText": "Ferramenta SGT-FLEX Sigma Tools Athena Soluções Automotivas",
    "description": "LINHA DE ENGATES E PINOS - MODELO EUROPEU CONECTORES DE AR / REGULADOR DE AR CONECTOR DE AR GIRATÓRIO",
    "specs": [
      "Compatibilidade:",
      "Diâmetro Nominal: 7,4mm",
      "Código do Produto: SGT-FLEX",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4405-pro",
    "name": "Ferramenta SGT-4405-PRO Sigma Tools",
    "slug": "ferramenta-sgt-4405-pro-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4405-pro-sigma--bb3b4734d365.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4405-pro-sigma--7b80bc41407d.webp"
    ],
    "altText": "Ferramenta SGT-4405-PRO Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-4405-PRO Sigma Tools.",
    "specs": [
      "5,9 kg",
      "360W",
      "BIVOLT",
      "3.450 RPM",
      "MOTO ESMERIL 6”  360W",
      "Código do Produto: SGT-4405-PRO",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-5130",
    "name": "Ferramenta MXT-5130 Sigma Tools",
    "slug": "ferramenta-mxt-5130-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5130-sigma-tool-364903a41cba.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5130-sigma-tool-e9233d736824.webp"
    ],
    "altText": "Ferramenta MXT-5130 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo MXT-5130 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: MXT-5130",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-5131",
    "name": "Ferramenta MXT-5131 Sigma Tools",
    "slug": "ferramenta-mxt-5131-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5131-sigma-tool-b67d3403782d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5131-sigma-tool-e8747faaa40a.webp"
    ],
    "altText": "Ferramenta MXT-5131 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo MXT-5131 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: MXT-5131",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-5135",
    "name": "Ferramenta MXT-5135 Sigma Tools",
    "slug": "ferramenta-mxt-5135-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5135-sigma-tool-648ce59b8837.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5135-sigma-tool-4b25dd67126d.webp"
    ],
    "altText": "Ferramenta MXT-5135 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo MXT-5135 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: MXT-5135",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-5138",
    "name": "Ferramenta MXT-5138 Sigma Tools",
    "slug": "ferramenta-mxt-5138-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5138-sigma-tool-75fece4c0a47.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5138-sigma-tool-3e80aa64c863.webp"
    ],
    "altText": "Ferramenta MXT-5138 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo MXT-5138 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: MXT-5138",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_mxt-5500",
    "name": "Ferramenta MXT-5500 Sigma Tools",
    "slug": "ferramenta-mxt-5500-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5500-sigma-tool-2044bd2c0523.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-mxt-5500-sigma-tool-2e51f482c85f.webp"
    ],
    "altText": "Ferramenta MXT-5500 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo MXT-5500 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: MXT-5500",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_pwr-4220",
    "name": "Ferramenta PWR-4220 Sigma Tools",
    "slug": "ferramenta-pwr-4220-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-pwr-4220-sigma-tool-82e2a104b635.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-pwr-4220-sigma-tool-bf1a7af1e0a8.webp"
    ],
    "altText": "Ferramenta PWR-4220 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo PWR-4220 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: PWR-4220",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5800",
    "name": "Ferramenta SGT-5800 Sigma Tools",
    "slug": "ferramenta-sgt-5800-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5800-sigma-tool-48950e810715.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5800-sigma-tool-d7852931393d.webp"
    ],
    "altText": "Ferramenta SGT-5800 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5800 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5800",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4300",
    "name": "Ferramenta SGT-4300 Sigma Tools",
    "slug": "ferramenta-sgt-4300-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4300-sigma-tool-7dfd1a4d1f29.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4300-sigma-tool-e5b65d3df8ed.webp"
    ],
    "altText": "Ferramenta SGT-4300 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-4300 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-4300",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4322",
    "name": "Ferramenta SGT-4322 Sigma Tools",
    "slug": "ferramenta-sgt-4322-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4322-sigma-tool-95712e29fd42.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4322-sigma-tool-be5fe2e15d61.webp"
    ],
    "altText": "Ferramenta SGT-4322 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-4322 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-4322",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4400",
    "name": "Ferramenta SGT-4400 Sigma Tools",
    "slug": "ferramenta-sgt-4400-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4400-sigma-tool-df4010aca18a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4400-sigma-tool-25127f338935.webp"
    ],
    "altText": "Ferramenta SGT-4400 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-4400 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-4400",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5119",
    "name": "Ferramenta SGT-5119 Sigma Tools",
    "slug": "ferramenta-sgt-5119-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5119-sigma-tool-85fd361a536b.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5119-sigma-tool-fd211d11ee78.webp"
    ],
    "altText": "Ferramenta SGT-5119 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5119 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5119",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5500",
    "name": "Ferramenta SGT-5500 Sigma Tools",
    "slug": "ferramenta-sgt-5500-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5500-sigma-tool-85fec13869a1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5500-sigma-tool-3a3d4cdcd131.webp"
    ],
    "altText": "Ferramenta SGT-5500 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5500 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5500",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5200",
    "name": "Ferramenta SGT-5200 Sigma Tools",
    "slug": "ferramenta-sgt-5200-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5200-sigma-tool-398e4012bd0f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5200-sigma-tool-db145b5ea256.webp"
    ],
    "altText": "Ferramenta SGT-5200 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5200 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5200",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-4501",
    "name": "Ferramenta SGT-4501 Sigma Tools",
    "slug": "ferramenta-sgt-4501-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4501-sigma-tool-31ea5f3b139c.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-4501-sigma-tool-d92f5212a411.webp"
    ],
    "altText": "Ferramenta SGT-4501 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-4501 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-4501",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5801",
    "name": "Ferramenta SGT-5801 Sigma Tools",
    "slug": "ferramenta-sgt-5801-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5801-sigma-tool-26ca064deb08.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5801-sigma-tool-2d555381a4a1.webp"
    ],
    "altText": "Ferramenta SGT-5801 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5801 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5801",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5125",
    "name": "Ferramenta SGT-5125 Sigma Tools",
    "slug": "ferramenta-sgt-5125-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5125-sigma-tool-2deed443cf1a.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5125-sigma-tool-f814a12e984f.webp"
    ],
    "altText": "Ferramenta SGT-5125 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5125 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5125",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5600",
    "name": "Ferramenta SGT-5600 Sigma Tools",
    "slug": "ferramenta-sgt-5600-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5600-sigma-tool-0b884f079ad6.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5600-sigma-tool-480bf981676c.webp"
    ],
    "altText": "Ferramenta SGT-5600 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5600 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5600",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5602",
    "name": "Ferramenta SGT-5602 Sigma Tools",
    "slug": "ferramenta-sgt-5602-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5602-sigma-tool-a6899bce4ab1.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5602-sigma-tool-f6bc867c50a8.webp"
    ],
    "altText": "Ferramenta SGT-5602 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5602 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5602",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5100",
    "name": "Ferramenta SGT-5100 Sigma Tools",
    "slug": "ferramenta-sgt-5100-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5100-sigma-tool-5b8fd0d8fe40.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5100-sigma-tool-32438545a744.webp"
    ],
    "altText": "Ferramenta SGT-5100 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5100 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5100",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5101",
    "name": "Ferramenta SGT-5101 Sigma Tools",
    "slug": "ferramenta-sgt-5101-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5101-sigma-tool-751a9f942dd0.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5101-sigma-tool-e238c7be026f.webp"
    ],
    "altText": "Ferramenta SGT-5101 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5101 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5101",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5105",
    "name": "Ferramenta SGT-5105 Sigma Tools",
    "slug": "ferramenta-sgt-5105-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5105-sigma-tool-c33acab1bbdc.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5105-sigma-tool-ac70ebc087f4.webp"
    ],
    "altText": "Ferramenta SGT-5105 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5105 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5105",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5104",
    "name": "Ferramenta SGT-5104 Sigma Tools",
    "slug": "ferramenta-sgt-5104-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5104-sigma-tool-9a4a7868205f.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5104-sigma-tool-99368d530a26.webp"
    ],
    "altText": "Ferramenta SGT-5104 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5104 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5104",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5110",
    "name": "Ferramenta SGT-5110 Sigma Tools",
    "slug": "ferramenta-sgt-5110-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5110-sigma-tool-146f5be6b478.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5110-sigma-tool-fa720cec146d.webp"
    ],
    "altText": "Ferramenta SGT-5110 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5110 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5110",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5111",
    "name": "Ferramenta SGT-5111 Sigma Tools",
    "slug": "ferramenta-sgt-5111-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5111-sigma-tool-5318189ed59d.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5111-sigma-tool-a51a03922910.webp"
    ],
    "altText": "Ferramenta SGT-5111 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5111 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5111",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5113",
    "name": "Ferramenta SGT-5113 Sigma Tools",
    "slug": "ferramenta-sgt-5113-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5113-sigma-tool-b363de9a12ee.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5113-sigma-tool-a44475f79fdb.webp"
    ],
    "altText": "Ferramenta SGT-5113 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5113 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5113",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5115",
    "name": "Ferramenta SGT-5115 Sigma Tools",
    "slug": "ferramenta-sgt-5115-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5115-sigma-tool-8ad2569ae003.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5115-sigma-tool-3c30bb573a10.webp"
    ],
    "altText": "Ferramenta SGT-5115 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5115 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5115",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  },
  {
    "id": "prod_sigma_sgt-5121",
    "name": "Ferramenta SGT-5121 Sigma Tools",
    "slug": "ferramenta-sgt-5121-sigma-tools",
    "categoryId": "cat_ferramentas",
    "brandId": "brand_sigmatools",
    "price": 0,
    "priceNegotiable": true,
    "badge": "Sigma Pro",
    "status": "published",
    "isFeatured": false,
    "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5121-sigma-tool-f8d5afd09829.webp",
    "images": [
      "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/ferramenta-sgt-5121-sigma-tool-c1506c9ee173.webp"
    ],
    "altText": "Ferramenta SGT-5121 Sigma Tools Athena Soluções Automotivas",
    "description": "Ferramenta profissional e equipamento industrial modelo SGT-5121 Sigma Tools.",
    "specs": [
      "LINHA PWR TOOLS",
      "PWR4220",
      "PWR5120",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "ESCOVAS DE CARVÃO",
      "LEMBRESE: Use apenas peças e acessórios originais  SIGMA TOOLS!",
      "Código do Produto: SGT-5121",
      "Garantia: 6 meses oficial de fábrica"
    ],
    "attachments": [],
    "inStock": true
  }
];
