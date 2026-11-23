import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Check, 
  ChevronRight, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Package, 
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  Tag,
  TrendingUp
} from 'lucide-react';
import BlogSidebar from '../components/BlogSidebar';
import { setPageSeo } from '../utils/seoManager';

// Fallback detalhado para artigos técnicos caso a API esteja indisponível
const FALLBACK_POST_DETAILS = {
  'topologia-de-rede-vs-varredura-tradicional-scanner-eaata-90': {
    id: 'post_topologia_eaata90',
    slug: 'topologia-de-rede-vs-varredura-tradicional-scanner-eaata-90',
    title: 'Topologia de Rede vs. Varredura Tradicional: Como o EAATA 90 Revolucionou o Diagnóstico CAN-FD e DoIP na Oficina',
    summary: 'Descubra como a visualização em topologia de rede colorida do scanner EAATA 90 identifica interrupções em barramentos CAN-FD e DoIP em segundos, evitando horas de desmontagem inútil no chicote elétrico.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-eaata90-topologia-autentico-d13f3e1e068e.webp',
    published_at: '2026-11-18T12:00:00.000Z',
    reading_time_minutes: 8,
    views_count: 215,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Redes Veiculares & Diagnóstico Avançado',
    categories: [{ id: 'cat_diag', name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia' }],
    tags: ['EAATA 90', 'Topologia de Rede', 'CAN-FD', 'DoIP', 'Scanner Automotivo'],
    content_html: `<p>Durante décadas, o diagnóstico eletrônico em oficinas mecânicas seguiu o mesmo roteiro previsível: conectar o scanner à tomada OBD-II, aguardar uma lista vertical monocromática de códigos de falha (DTCs) e começar a testar sensor por sensor com multímetro. No entanto, com a chegada em massa de veículos equipados com redes <strong>CAN-FD</strong> (5 a 8 Mbps) e protocolos Ethernet automotivos <strong>DoIP</strong> (100 Mbps), essa metodologia tradicional tornou-se lenta, imprecisa e propensa a diagnósticos equivocados.</p><h2>1. O Limite da Varredura Tradicional em Linha</h2><p>Na varredura convencional, se um módulo de porta ou o sensor de ângulo de direção (SAS) derrubar o barramento de alta velocidade, o scanner tradicional apenas exibe dezenas de códigos genéricos de <em>"Comunicação Perdida" (U0100, U0121, U0140)</em> em todos os módulos da lista. O reparador não consegue visualizar <strong>onde o sinal foi interrompido</strong> nem a relação física entre as centrais.</p><h2>2. Como Funciona a Topologia de Rede Colorida do EAATA 90</h2><p>O <strong>Scanner Automotivo EAATA 90</strong> adota uma abordagem revolucionária: a <strong>Topologia Gráfica Dinâmica</strong>. Ao escanear o veículo, a tela desenha a arquitetura elétrica real do carro em forma de mapa visual ramificado:</p><ul><li><strong style="color:#22c55e;">Verde:</strong> Módulos operando perfeitamente e sem códigos de avaria na memória.</li><li><strong style="color:#ef4444;">Vermelho:</strong> Módulos que registraram falhas ativas ou intermitentes, com atalho de 1 toque para o relatório de diagnóstico guiado por IA.</li><li><strong style="color:#94a3b8;">Cinza / Desconectado:</strong> Módulos sem resposta no barramento, permitindo identificar instantaneamente se há fusível queimado, falta de aterramento ou cabo de rede rompido antes daquele nó.</li></ul><div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);"><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Diagnóstico de Alta Performance</span><h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Scanner Automotivo Profissional EAATA 90 – Topologia de Rede & IA</h4><p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Mapeamento visual completo de barramentos CAN-FD, DoIP e mais de 35 funções especiais de calibração e codificação com suporte técnico oficial Athena.</p><a href="/produto/scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica do EAATA 90 na Athena →</a></div><h2>3. Redução de Tempo e Lucratividade no Box</h2><p>Em falhas elétricas complexas (como rede adormecida em modelos Audi, BMW, Mercedes, Volvo, Stellantis ou novas linhas elétricas BYD e GWM), a identificação visual poupa até 3 horas de desmontagem de chicote, gerando laudos profissionais com envio em PDF via QR Code diretamente para o WhatsApp do proprietário do veículo.</p>`
  },
  'estabilizador-de-tensao-oficina-eaata-epd002-reprogramacao-ecu': {
    id: 'post_estabilizador_epd002',
    slug: 'estabilizador-de-tensao-oficina-eaata-epd002-reprogramacao-ecu',
    title: 'Estabilizador de Tensão para Oficinas: Por Que o EAATA EPD002 (70A) É Obrigatório na Reprogramação e Clonagem de Módulos',
    summary: 'Quedas milimétricas de voltagem durante a reprogramação de ECU podem transformar um módulo de R$ 15.000 em sucata. Entenda por que fontes automotivas de 70A estabilizadas são essenciais.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-eaata-epd002-autentico-c9680d62eca0.webp',
    published_at: '2026-11-18T11:45:00.000Z',
    reading_time_minutes: 7,
    views_count: 180,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Eletrônica Automotiva & Fontes de Programação',
    categories: [{ id: 'cat_diag', name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia' }],
    tags: ['EAATA EPD002', 'Estabilizador 70A', 'Reprogramação ECU', 'Pass-Thru', 'Oficina Eletrônica'],
    content_html: `<p>A reprogramação eletrônica de centrais (chip tuning, atualizações de calibração via Pass-Thru J2534 e clonagens de ECU/TCU com programadoras como a <strong>EAATA PROG 5</strong>) é um dos serviços de maior rentabilidade em uma oficina moderna. Porém, ela esconde o maior risco financeiro do segmento: <strong>a oscilação ou queda de tensão da bateria durante a gravação da memória Flash</strong>.</p><h2>1. O Perigo da Queda de Tensão Durante a Gravação</h2><p>Durante o procedimento de escrita em uma ECU ou módulo mecatrônico de câmbio (como DSG ou ZF), o veículo mantém a linha de ignição ligada (Linha 15). Nesse momento, ventoinhas do radiador, faróis de condução diurna e bombas elétricas de combustível podem ser acionadas automaticamente pelo sistema, drenando instantaneamente mais de 40 a 50 Amperes da bateria.</p><p>Se a tensão cair abaixo de 12.2V durante o ciclo de gravação, o microprocessador interrompe o fluxo de dados na metade. O resultado é o temido <strong>"brick" (travamento irreversível)</strong> do módulo, exigindo a substituição da peça a um custo de milhares de reais.</p><h2>2. Por Que Carregadores Convencionais Não Servem?</h2><p>Muitas oficinas tentam usar carregadores de bateria tradicionais de oficina ou fontes automotivas de som. Isso é um erro gravíssimo:</p><ul><li>Carregadores comuns têm alta ondulação residual (<em>ripple</em> AC), que injeta ruído na linha de dados e corrompe pacotes CAN.</li><li>Fontes de som não possuem corte milimétrico contra sobretensão e podem descarregar picos de até 15.5V, queimando transistores e capacitores sensíveis da placa.</li></ul><div class="athena-blog-product-card" style="margin:32px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);"><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Proteção Elétrica Crítica</span><h4 style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#ffffff;">Estabilizador e Carregador Inteligente de Bateria EAATA EPD002 – 70A</h4><p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Tensão contínua ultraestabilizada de 13.8V sem ripple, compatível com baterias Chumbo-Ácido, AGM, EFB, GEL e Lítio (LFP) com alarme de proteção ativa.</p><a href="/produto/estabilizador-de-bateria-12v-70a-eaata-epd002" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica do EAATA EPD002 na Athena →</a></div><h2>3. Vantagens do EAATA EPD002</h2><p>O <strong>EAATA EPD002</strong> entrega 70 Amperes reais contínuos regulados a 13.8V, garantindo que mesmo com todas as cargas elétricas do carro ligadas em modo diagnóstico profundo, a central permaneça energizada com máxima pureza de sinal.</p>`
  },
  'clonagem-programacao-modulos-ecu-tcu-eaata-prog-5-ecm-45': {
    id: 'post_prog5_ecm45',
    slug: 'clonagem-programacao-modulos-ecu-tcu-eaata-prog-5-ecm-45',
    title: 'Clonagem e Programação de Módulos ECU e TCU na Oficina: Guia Técnico da EAATA PROG 5 e ECM 45',
    summary: 'Domine a leitura, backup e clonagem 1:1 de centrais de injeção (ECU) e câmbio automático (TCU) em modo Bench e Boot com a EAATA PROG 5, além do reset de módulos de Airbag, baterias de lítio BMS e direção elétrica SAS com o ECM 45.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-prog5-ecm45-32ab4cdabc5f.webp',
    published_at: '2026-11-12T20:50:00.000Z',
    reading_time_minutes: 9,
    views_count: 195,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Eletrônica Embarcada & Módulos',
    categories: [{ id: 'cat_diag', name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia' }],
    tags: ['PROG 5', 'ECM 45', 'Clonagem ECU', 'TCU', 'Airbag'],
    content_html: `<p>Com a evolução da arquitetura eletrônica embarcada e dos sistemas de proteção de componentes (<em>Component Protection</em> e imobilizadores de 4ª, 5ª e 6ª geração), substituir uma central de injeção eletrônica (<strong>ECU</strong>) ou uma unidade mecatrônica de transmissão (<strong>TCU</strong>) deixou de ser um procedimento meramente mecânico.</p><h2>1. Como Funciona a Clonagem de ECU e TCU na Prática?</h2><p>Com a <strong>EAATA PROG 5</strong>, o técnico extrai o arquivo completo (<em>Full Backup</em> de Flash e EEPROM) da peça defeituosa em modo Bench (sem abrir a central) ou Boot e o grava integralmente na peça substituta.</p><div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Clonagem de Motor e Câmbio</span><h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Programadora e Clonadora de Módulos ECU/TCU PROG 5 – EAATA</h4><p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Cobertura para centenas de centrais Bosch, Continental, Delphi, Marelli e transmissões DSG, ZF, Mercedes e GM.</p><a href="/produto/programadora-e-clonadora-de-modulos-ecu-tcu-prog-5-eaata-prog-5" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica da EAATA PROG 5 →</a></div><h2>2. Recuperação de Airbag (SRS), Baterias BMS de Lítio e Direção (SAS) com o EAATA ECM 45</h2><p>O <strong>EAATA ECM 45</strong> limpa o registro de impacto (Crash Data) em módulos de Airbag, destrava baterias de lítio BMS 12V/48V e recupera sensores de ângulo de direção SAS.</p><div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Reset de Airbag & Baterias BMS</span><h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Programador e Resetador de Centrais ECM 45 – EAATA</h4><p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Opções com cobertura Airbag, linha pesada HD e pacote completo com suporte e garantia oficial Athena.</p><a href="/produto/programador-e-resetador-de-centrais-ecm-45-eaata-ecm-45" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Opções e Cotação do EAATA ECM 45 →</a></div>`
  },
  'recarga-veiculos-eletricos-adaptador-ccs2-gbt-carregador-portatil-7kw': {
    id: 'post_ev_ccs2_tc1108',
    slug: 'recarga-veiculos-eletricos-adaptador-ccs2-gbt-carregador-portatil-7kw',
    title: 'Recarga de Veículos Elétricos no Brasil: Quando Usar Adaptador CCS2 para GB/T e Carregadores Portáteis Tipo 2 (7kW)',
    summary: 'Guia técnico definitivo sobre infraestrutura de recarga EV para oficinas e proprietários: entenda as diferenças entre Tipo 2, CCS2 e GB/T, como operar adaptadores DC de 80kW e escolher carregadores portáteis de 7kW 32A.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-recarga-ev-ccs2-ew1135-bec0db13a09a.webp',
    published_at: '2026-11-12T20:45:00.000Z',
    reading_time_minutes: 8,
    views_count: 178,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Eletromobilidade & Infraestrutura EV',
    categories: [{ id: 'cat_ev', name: 'Tendências Automotivas', slug: 'tendencias-automotivas' }],
    tags: ['CCS2 para GB/T', 'Carregador 7kW', 'Carros Elétricos', 'Top Charger'],
    content_html: `<p>A eletrificação da frota brasileira trouxe uma demanda essencial para oficinas e proprietários: a compatibilidade entre os padrões Tipo 2, CCS2 e GB/T.</p><h2>1. Adaptador CCS2 para GB/T 80kW (E-Wolf EW1135)</h2><p>Permite carregar veículos com entrada padrão GB/T em qualquer eletroposto rápido CCS2 nas rodovias brasileiras com potência de até 80kW.</p><h2>2. Carregador Portátil Tipo 2 de 7kW (32A) Top Charger TC1108</h2><p>Entrega velocidade de Wallbox (7kW em 220V) com 4 adaptadores intercambiáveis e proteção IP65.</p>`
  },
  'troca-oleo-cambio-automatico-dialise-maquina-100-automatica': {
    id: 'post_cambio_automatico',
    slug: 'troca-oleo-cambio-automatico-dialise-maquina-100-automatica',
    title: 'Troca de Óleo de Câmbio Automático por Diálise vs. Gravidade: Como Faturar Alto com a Mahovi MAH-4001',
    summary: 'Entenda tecnicamente por que a drenagem por gravidade substitui menos da metade do fluido ATF/CVT e como a Máquina 100% Automática Mahovi MAH-4001 por diálise protege o corpo de válvulas e multiplica o lucro do auto center.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-mahovi-mah4001-39c759f2a2a7.webp',
    published_at: '2026-11-12T20:40:00.000Z',
    reading_time_minutes: 8,
    views_count: 164,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Engenharia de Transmissões & Equipamentos',
    categories: [{ id: 'cat_gest', name: 'Gestão & Produtividade', slug: 'gestao-produtividade' }],
    tags: ['Mahovi MAH-4001', 'Câmbio Automático', 'Diálise', 'Oficina Lucrativa'],
    content_html: `<p>A manutenção preventiva de câmbio automático tornou-se um dos serviços de maior rentabilidade por hora trabalhada em oficinas mecânicas e auto centers.</p><h2>Por Que Usar a Máquina 100% Automática Mahovi MAH-4001 por Diálise?</h2><p>Enquanto a drenagem por gravidade substitui apenas 40% do fluido, a diálise computadorizada na Mahovi MAH-4001 renova quase 100% do óleo retido no conversor de torque, corpo de válvulas e radiador com monitoramento duplo de pressão e visores graduados.</p>`
  },
  'scanner-topologia-de-rede-ia-eaata-90-oficina': {
    id: 'd7f7f07a-126d-4d68-8db9-6fc1438ad289',
    slug: 'scanner-topologia-de-rede-ia-eaata-90-oficina',
    title: 'Scanner com Topologia de Rede e IA: Vale a Pena o EAATA 90 para a Sua Oficina?',
    summary: 'Análise técnica completa do scanner automotivo EAATA 90: como o mapeamento visual colorido de barramentos CAN-FD / DoIP e o assistente de Inteligência Artificial reduzem horas de diagnóstico elétrico para poucos minutos.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-eaata-90-topologia-c2db7cf42be8.webp',
    published_at: '2026-11-12T15:56:37.269Z',
    reading_time_minutes: 7,
    views_count: 260,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Diagnóstico Avançado & Redes Veiculares',
    categories: [{ id: 'cat_diag', name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia' }],
    tags: ['EAATA 90', 'Topologia de Rede', 'Inteligência Artificial', 'Scanner Automotivo'],
    related_product_slug: 'scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata',
    related_product_name: 'Scanner Automotivo EAATA 90 com Diagnóstico por Topologia e IA',
    content: `
## O Que é Diagnóstico por Topologia de Rede em Tempo Real?

Nos veículos modernos, dezenas de módulos eletrônicos (ECU, TCU, ABS, ESP, BCM, Airbag, Painel e Gateway Central) comunicam-se ininterruptamente através de múltiplos barramentos: redes CAN High Speed, CAN Low Speed, LIN e Ethernet automotiva.

Quando ocorre uma falha intermitente na linha de comunicação — como curto na fiação ou falha em um nó terminal —, um scanner comum apenas lista dezenas de códigos DTC sem hierarquia. O **EAATA 90**, por sua vez, desenha um diagrama topológico completo e colorido na tela em segundos. Módulos que respondem normalmente aparecem em verde; módulos com falhas em vermelho; e módulos que não responderam na linha aparecem destacados em cinza, revelando com precisão o ponto exato da interrupção.
    `
  },
  'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina': {
    id: 'a2faa5cc-757d-4b6c-89f3-76c19b2d1f16',
    slug: 'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina',
    title: 'Qual Scanner Automotivo Escolher? Diferenças Entre Thinkcar THINKTOOL LITE (Stärkx), EAATA 90 e EAATA 360Pro',
    summary: 'Conheça as diferenças e especialidades de cada scanner profissional do catálogo da Athena — Thinkcar THINKTOOL LITE (Stärkx), EAATA 90 e EAATA 360Pro — e descubra qual se encaixa melhor na operação da sua oficina.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-escolher-scanner-oficina-6ef9a5689d3f.webp',
    published_at: '2026-11-11T21:22:36.450Z',
    reading_time_minutes: 7,
    views_count: 342,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Diagnóstico Avançado Athena',
    categories: [{ id: 'cat_diag', name: 'Equipamentos & Tecnologia', slug: 'equipamentos-tecnologia' }],
    tags: ['ThinkTool Lite Stärkx', 'EAATA 90', 'EAATA 360Pro', 'Scanner Automotivo'],
    content: `
## Diferenças e Especialidades de Cada Scanner Profissional

Na Athena Soluções Automotivas, trabalhamos apenas com equipamentos de nível profissional superior: o **Thinkcar THINKTOOL LITE (distribuído pela Stärkx)**, o **EAATA 90** e o **EAATA 360Pro**. Entenda o foco de cada equipamento para a sua oficina.
    `
  },
  'calibracao-adas-e-sensores-radar-o-futuro-da-reparacao': {
    id: 'post_calibracao_adas_2026',
    slug: 'calibracao-adas-e-sensores-radar-o-futuro-da-reparacao',
    title: 'Calibração ADAS e Alinhamento 3D Mahovi: Por Que Toda Oficina e Auto Center Precisa Integrar Esses Serviços',
    summary: 'Frenagem autônoma, assistente de faixa e ACC exigem geometria perfeita do chassi antes da aferição dos sensores. Veja como integrar os Alinhadores 3D Mahovi (MAH-3D1, MAH-3D2 e MAH-3D3) ao Sistema ADAS Pro na sua oficina.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-calibracao-adas-70e7ab8b68e0.webp',
    published_at: '2026-11-08T14:30:00.000Z',
    reading_time_minutes: 8,
    views_count: 519,
    author_name: 'Consultoria Automotiva',
    author_role: 'Engenharia de Sistemas ADAS & Alinhamento',
    categories: [{ id: 'cat_adas', name: 'Tendências Automotivas', slug: 'tendencias-automotivas' }],
    tags: ['ADAS', 'Alinhamento 3D Mahovi', 'Calibração', 'Segurança Ativa'],
    content: `
## Por Que o Alinhamento 3D Mahovi é o Primeiro Passo Antes do ADAS?

Os sistemas ADAS utilizam câmeras frontais no para-brisa e radares de 77 GHz no para-choque que dependem do alinhamento perfeito do eixo traseiro aferido nos Alinhadores 3D Mahovi (MAH-3D1, MAH-3D2 e MAH-3D3).
    `
  },
  'seguranca-e-manutencao-preventiva-em-elevadores-automotivos': {
    id: 'post_manutencao_elevadores',
    slug: 'seguranca-e-manutencao-preventiva-em-elevadores-automotivos',
    title: 'Elevadores Automotivos Mahovi: Guia de Escolha (3,2T a 6T), Segurança e Manutenção NR-12',
    summary: 'Do elevador pórtico eletro-hidráulico Mahovi MAH-1020 de 4,5 toneladas aos pantográficos embutidos e modelos de 6 toneladas para utilitários: veja como dimensionar o piso e aplicar o checklist da norma NR-12.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-mahovi-mah1020-88f2a638eb15.webp',
    published_at: '2026-11-05T09:15:00.000Z',
    reading_time_minutes: 7,
    views_count: 288,
    author_name: 'Engenharia de Equipamentos',
    author_role: 'Especialista em Infraestrutura Pesada & NR-12',
    categories: [{ id: 'cat_elev', name: 'Manutenção Preventiva', slug: 'manutencao-preventiva' }],
    tags: ['Elevadores Mahovi', 'MAH-1020', 'NR-12', 'Oficina Segura'],
    content: `
## Elevador Eletro-Hidráulico de Pórtico Mahovi vs. Elevador de Fuso

Os modernos elevadores eletro-hidráulicos de 4,5 toneladas Mahovi MAH-1020 com pórtico superior entregam vão livre total no piso, duplo cilindro hidráulico, cabos de equalização e travas mecânicas multiponto em conformidade com a norma NR-12.
    `
  },
  'organizacao-produtividade-oficina-carrinhos-detailer-armarios-wolfcar-ferramentas-sigma': {
    id: 'post_organizacao_sigma_wolfcar',
    slug: 'organizacao-produtividade-oficina-carrinhos-detailer-armarios-wolfcar-ferramentas-sigma',
    title: 'Como Organizar um Box de Alta Produtividade: Carrinhos 360° Sigma Tools, Armários Modulares Wolfcar e Ferramentas Especiais',
    summary: 'Descubra como reduzir em até 30% o tempo perdido procurando ferramentas no box combinando Carrinhos Detailer-Mecânico 360° e Extratores Sigma Tools com Bancadas Modulares Wolfcar e o Carrinho TTK 333.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-box-produtividade-wolfcar-sigma-ttk-c964333a4775.webp',
    published_at: '2026-11-17T13:50:00.000Z',
    reading_time_minutes: 7,
    views_count: 142,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Consultoria de Produtividade & Layout de Oficina',
    categories: [{ id: 'cat_gest', name: 'Gestão & Produtividade', slug: 'gestao-produtividade' }],
    tags: ['Sigma Tools', 'Wolfcar', 'Carrinho Detailer 360', 'Organização de Oficina'],
    content: `
## Mobilidade e Produtividade no Box

A organização ergonômica do box com Carrinhos 360° Detailer-Mecânico Sigma Tools, Extratores de Retentor, Acopladores de Graxeiro e Bancadas Modulares Wolfcar aumenta em até 30% a capacidade diária de entregas da oficina.
    `
  }
};

// Helper para normalizar e garantir a URL correta da imagem de capa
function getPostCover(post) {
  if (!post) return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
  const img = post.cover_image_url || post.cover_image_key || post.coverImage;
  if (!img) {
    if (post.slug && post.slug.includes('eaata')) {
      return 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp';
    }
    return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
  }
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/${img.replace(/^\//, '')}`;
}

// Helper síncrono para obter o artigo imediatamente em 0ms (Preloaded SSR, Cache Local ou Fallback)
function getInitialPostForSlug(slug) {
  if (!slug) return null;
  if (typeof window !== 'undefined') {
    try {
      // 1. Verifica payload injetado pelo Edge/SSR (api/blog-og.js)
      if (window.__ATHENA_PRELOADED_POST__ && window.__ATHENA_PRELOADED_POST__.slug === slug) {
        return window.__ATHENA_PRELOADED_POST__;
      }
      // 2. Verifica cache completo do artigo no localStorage
      const fullCached = localStorage.getItem(`athena_blog_post_full_v3_${slug}`);
      if (fullCached) {
        const parsed = JSON.parse(fullCached);
        if (parsed && parsed.slug === slug) return parsed;
      }
      // 3. Verifica preview clicado na listagem + mescla com detalhes locais se existir
      const previewCached = sessionStorage.getItem(`athena_blog_post_preview_${slug}`);
      if (previewCached) {
        const parsedPreview = JSON.parse(previewCached);
        if (FALLBACK_POST_DETAILS[slug]) {
          return { ...FALLBACK_POST_DETAILS[slug], ...parsedPreview };
        }
        if (parsedPreview?.content || parsedPreview?.content_html) {
          return parsedPreview;
        }
      }
    } catch {
      // Ignora erro de storage
    }
  }
  // 4. Fallback instantâneo se for um dos artigos técnicos padrão
  if (FALLBACK_POST_DETAILS[slug]) {
    return FALLBACK_POST_DETAILS[slug];
  }
  return null;
}

export default function BlogPostPage({ slug, onNavigate }) {
  const [post, setPost] = useState(() => getInitialPostForSlug(slug));
  const [allPosts, setAllPosts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('athena_blog_posts_cache_v3');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return Object.values(FALLBACK_POST_DETAILS);
  });
  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('athena_blog_cats_cache_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => !getInitialPostForSlug(slug));
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // SEO Dinâmico (Title, Meta Description, Canonical e Schema BlogPosting) para o artigo atual
  useEffect(() => {
    const activeSlug = post?.slug || slug;
    if (!activeSlug) return;
    const pTitle = post?.meta_title || post?.title || 'Artigo Técnico | Blog Athena Soluções Automotivas';
    const pDesc = post?.meta_description || post?.summary || post?.excerpt || 'Artigo técnico sobre diagnóstico automotivo, scanners com IA e equipamentos para oficinas mecânicas.';
    const pCover = post?.cover_image_url || post?.cover_image_key || 'https://www.athenaconsultoria.com.br/logo.jpg';

    setPageSeo({
      title: pTitle.includes('Athena') ? pTitle : `${pTitle} | Blog Athena`,
      description: pDesc,
      canonicalPath: `/blog/${activeSlug}`,
      image: pCover,
      type: 'article',
      schemaId: 'blog-post-json-ld',
      schemaData: post ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title || pTitle,
        "description": pDesc,
        "image": pCover,
        "datePublished": post.published_at || new Date().toISOString(),
        "dateModified": post.updated_at || post.published_at || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": post.author_name || "Equipe Técnica Athena"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Athena Soluções Automotivas",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.athenaconsultoria.com.br/logo.jpg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.athenaconsultoria.com.br/blog/${activeSlug}`
        }
      } : null
    });
  }, [post, slug]);

  // Estados de comentários
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
    honeypot: '' // Campo oculto antispam
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState(null);
  const [commentErrorMsg, setCommentErrorMsg] = useState(null);

  // Carrega lista geral de artigos para recomendação
  useEffect(() => {
    let isMounted = true;
    async function loadRecommended() {
      try {
        const [postsRes, catRes] = await Promise.all([
          fetch('/api/blog/posts?limit=6'),
          fetch('/api/blog/categories')
        ]);
        if (postsRes.ok) {
          const data = await postsRes.json();
          if (isMounted && data?.posts) {
            setAllPosts(data.posts);
          }
        }
        if (catRes.ok) {
          const cats = await catRes.json();
          if (isMounted && Array.isArray(cats)) {
            setCategories(cats);
          }
        }
      } catch {
        // Fallback para artigos locais
        if (isMounted) {
          setAllPosts(Object.values(FALLBACK_POST_DETAILS));
        }
      }
    }
    loadRecommended();
    return () => { isMounted = false; };
  }, []);

  // Carrega dados do post por slug com exibição instantânea do cache/fallback e atualização silenciosa (SWR)
  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      const immediatePost = getInitialPostForSlug(slug);
      if (immediatePost) {
        setPost(immediatePost);
        setIsLoading(false);
      } else if (!post || post.slug !== slug) {
        setIsLoading(true);
      }
      setError(null);
      setCommentSuccessMsg(null);
      setCommentErrorMsg(null);

      try {
        const res = await fetch(`/api/blog/posts/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Tratamento de redirect 301
          if (data.redirect && data.targetSlug) {
            if (onNavigate) {
              onNavigate(`blog/${data.targetSlug}`);
            } else {
              window.location.href = `/blog/${data.targetSlug}`;
            }
            return;
          }

          if (isMounted && data) {
            const articleData = data.post || data;
            setPost(articleData);
            if (Array.isArray(data.comments)) {
              setComments(data.comments);
            }
            setIsLoading(false);

            try {
              localStorage.setItem(`athena_blog_post_full_v3_${slug}`, JSON.stringify(articleData));
            } catch {}

            // Incremento atômico de visualização silencioso
            if (articleData?.id) {
              fetch(`/api/blog/posts/${articleData.id}/view`, { method: 'POST' }).catch(() => {});
            }
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // Fallback local se não encontrado na API
      if (isMounted) {
        const fallback = immediatePost ||
          FALLBACK_POST_DETAILS[slug] || 
          FALLBACK_POST_DETAILS['scanner-topologia-de-rede-ia-eaata-90-oficina'] || 
          FALLBACK_POST_DETAILS['guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia'];
        
        if (fallback) {
          setPost(fallback);
          setIsLoading(false);
        } else {
          setError('Artigo não encontrado ou indisponível.');
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      loadPost();
    }
    return () => { isMounted = false; };
  }, [slug]);

  // Formatação de data
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Artigos recomendados (excluindo o atual)
  const recommendedArticles = useMemo(() => {
    const list = (allPosts && allPosts.length > 0) 
      ? allPosts 
      : Object.values(FALLBACK_POST_DETAILS);
    return list.filter(p => p.slug !== slug).slice(0, 3);
  }, [allPosts, slug]);

  // Compartilhamento
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://athenaconsultoria.com.br/blog/${slug}`;
  const shareTitle = post?.title || 'Artigo Técnico Athena Soluções Automotivas';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Confira este artigo técnico da Athena: "${shareTitle}" - ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  // Envio de comentário
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!post?.id || !commentForm.authorName || !commentForm.authorEmail || !commentForm.content) {
      setCommentErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Se o honeypot foi preenchido, é um bot; simula sucesso silencioso
    if (commentForm.honeypot) {
      setCommentSuccessMsg('Comentário enviado com sucesso e encaminhado para moderação.');
      setCommentForm({ authorName: '', authorEmail: '', content: '', honeypot: '' });
      return;
    }

    setIsSubmittingComment(true);
    setCommentErrorMsg(null);
    setCommentSuccessMsg(null);

    try {
      const res = await fetch(`/api/blog/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });

      const data = await res.json();
      if (res.ok) {
        setCommentSuccessMsg('Comentário enviado com sucesso! Ele será publicado após rápida moderação de segurança.');
        setCommentForm({ authorName: '', authorEmail: '', content: '', honeypot: '' });
      } else {
        setCommentErrorMsg(data.error || 'Erro ao enviar comentário.');
      }
    } catch (err) {
      setCommentErrorMsg('Falha de conexão ao enviar comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Extração de tópicos para sumário automático
  const tocItems = useMemo(() => {
    if (!post) return [];
    const items = [];

    if (typeof post.content === 'string') {
      const lines = post.content.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const text = trimmed.replace(/^##\s+/, '').trim();
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text });
        }
      });
    } else if (post.content_html && typeof post.content_html === 'string') {
      const headingMatches = post.content_html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi);
      for (const match of headingMatches) {
        const rawText = match[1].replace(/<[^>]+>/g, '').trim();
        if (rawText) {
          const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text: rawText });
        }
      }
    }
    return items;
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carregando artigo...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Artigo Indisponível</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            O artigo solicitado não foi localizado ou ainda está em fase de revisão técnica.
          </p>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
            className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Blog</span>
          </button>
        </div>
      </div>
    );
  }

  const coverUrl = getPostCover(post);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container-custom space-y-8 sm:space-y-10">
        {/* Breadcrumb de Navegação */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <button 
            type="button" 
            onClick={() => onNavigate ? onNavigate('catalog') : window.location.href = '/'}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            type="button" 
            onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            Blog Athena
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Layout Principal com Menu Lateral Aside à Direita */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Coluna Principal do Artigo (8 colunas) */}
          <main className="lg:col-span-8 min-w-0 space-y-8">
            <article className="space-y-8">
              {/* Header do Artigo */}
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {post.categories?.[0] && (
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate(`blog?categoria=${post.categories[0].slug}`) : window.location.href = `/blog?categoria=${post.categories[0].slug}`}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300 cursor-pointer transition"
                    >
                      {post.categories[0].name}
                    </button>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(post.published_at)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.reading_time_minutes || 5} min de leitura</span>
                    </span>
                    {post.views_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.views_count} visualizações</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  {post.title}
                </h1>

                {(post.summary || post.excerpt) && (
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                    {post.summary || post.excerpt}
                  </p>
                )}

                {/* Linha do Autor e Compartilhamento */}
                <div className="pt-4 pb-2 border-y border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-sm border border-amber-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {post.author_name || 'Equipe Técnica Athena'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {post.author_role || 'Consultoria Técnica em Equipamentos'}
                      </span>
                    </div>
                  </div>

                  {/* Botões de Compartilhamento */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Compartilhar:</span>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                      title="Compartilhar no WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareLinkedIn}
                      className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                      title="Compartilhar no LinkedIn"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      title="Copiar Link"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <span>Copiar Link</span>
                      )}
                    </button>
                  </div>
                </div>
              </header>

              {/* Imagem de Capa do Artigo com aspect-ratio fixo */}
              <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-200 shadow-md">
                <img
                  src={coverUrl}
                  alt={post.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                  }}
                />
              </div>

              {/* Sumário do Artigo (se houver tópicos identificados) */}
              {(tocItems || []).length > 0 && (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Neste Artigo:</span>
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {tocItems.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-amber-950">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conteúdo Formatado do Artigo */}
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
                {post.content_html ? (
                  <div
                    className="blog-article-content space-y-4 font-sans leading-relaxed text-sm sm:text-base max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: post.content_html }}
                  />
                ) : typeof post.content === 'string' ? (
                  <div className="blog-article-content space-y-6 whitespace-pre-line font-sans">
                    {post.content}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Conteúdo em processamento.</p>
                )}

                {/* Tags do Artigo */}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400 mr-1" />
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Artigos Recomendados (Cards no final da página) */}
              {recommendedArticles.length > 0 && (
                <section aria-label="Artigos Recomendados" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <span>Artigos Recomendados para Você</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendedArticles.map((rec) => {
                      const recCover = getPostCover(rec);
                      return (
                        <div
                          key={rec.id || rec.slug}
                          onClick={() => onNavigate ? onNavigate(`blog/${rec.slug}`) : window.location.href = `/blog/${rec.slug}`}
                          className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                              <img
                                src={recCover}
                                alt={rec.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                onError={(e) => {
                                  e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                                }}
                              />
                            </div>
                            <div className="p-4 space-y-2">
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {formatDate(rec.published_at)} • {rec.reading_time_minutes || 5} min
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug">
                                {rec.title}
                              </h4>
                            </div>
                          </div>

                          <div className="p-4 pt-0 text-[11px] font-bold text-amber-600 flex items-center gap-1">
                            <span>Ler artigo</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Seção de Comentários */}
              <section aria-label="Comentários" className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <span>Comentários Técnicos ({(comments || []).length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Moderação ativa</span>
                </div>

                {/* Lista de Comentários Aprovados */}
                {(comments || []).length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{c.author_name}</span>
                          <span className="text-[11px] text-slate-400">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {c.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum comentário publicado ainda. Seja o primeiro a compartilhar sua experiência ou dúvida técnica!
                  </p>
                )}

                {/* Formulário de Envio de Comentário */}
                <form onSubmit={handleSubmitComment} className="pt-4 border-t border-slate-100 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block">Deixe sua dúvida ou consideração técnica:</span>

                  {commentSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{commentSuccessMsg}</span>
                    </div>
                  )}

                  {commentErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                      {commentErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Seu Nome / Oficina *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Mecânica e Auto Center"
                        value={commentForm.authorName}
                        onChange={(e) => setCommentForm(p => ({ ...p, authorName: e.target.value }))}
                        className="form-input text-xs w-full rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Seu E-mail Corporativo *</label>
                      <input
                        type="email"
                        required
                        placeholder="carlos@oficina.com.br (não divulgado)"
                        value={commentForm.authorEmail}
                        onChange={(e) => setCommentForm(p => ({ ...p, authorEmail: e.target.value }))}
                        className="form-input text-xs w-full rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Honeypot Invisível para Bloqueio de Robôs Spammers */}
                  <input
                    type="text"
                    name="empresa_fantasma_hp"
                    value={commentForm.honeypot}
                    onChange={(e) => setCommentForm(p => ({ ...p, honeypot: e.target.value }))}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Comentário / Pergunta *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Escreva aqui seu comentário ou dúvida para nossos especialistas..."
                      value={commentForm.content}
                      onChange={(e) => setCommentForm(p => ({ ...p, content: e.target.value }))}
                      className="form-textarea text-xs w-full rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingComment ? 'Enviando...' : 'Enviar Comentário para Moderação'}</span>
                  </button>
                </form>
              </section>

              {/* Botão de Retorno */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-2 cursor-pointer transition shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Voltar para Todos os Artigos do Blog</span>
                </button>
              </div>
            </article>
          </main>

          {/* Menu Lateral Direito Aside (4 colunas) Fixo na Rolagem */}
          <div className="lg:col-span-4 min-w-0 mt-8 lg:mt-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1 [overscroll-behavior:contain]">
            <BlogSidebar
              categories={categories}
              selectedCategory={post?.categories?.[0]?.slug || 'all'}
              onSelectCategory={(catSlug) => {
                if (catSlug === 'all') {
                  if (onNavigate) onNavigate('blog');
                  else window.location.href = '/blog';
                } else {
                  if (onNavigate) onNavigate(`blog?categoria=${catSlug}`);
                  else window.location.href = `/blog?categoria=${catSlug}`;
                }
              }}
              recommendedPosts={allPosts}
              currentPostSlug={slug}
              onNavigatePost={(targetSlug) => {
                if (onNavigate) onNavigate(`blog/${targetSlug}`);
                else window.location.href = `/blog/${targetSlug}`;
              }}
              onSearchSubmit={(q) => {
                if (onNavigate) onNavigate(`blog?busca=${encodeURIComponent(q)}`);
                else window.location.href = `/blog?busca=${encodeURIComponent(q)}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
