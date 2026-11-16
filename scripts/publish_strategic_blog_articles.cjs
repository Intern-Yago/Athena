const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Carrega variáveis de backend/.env sem depender de módulo global dotenv
const envPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const { query } = require('../backend/services/db');

const STRATEGIC_ARTICLES = [
  {
    slug: 'clonagem-programacao-modulos-ecu-tcu-eaata-prog-5-ecm-45',
    title: 'Clonagem e Programação de Módulos ECU e TCU na Oficina: Guia Técnico da EAATA PROG 5 e ECM 45',
    excerpt: 'Entenda como realizar leitura, backup e clonagem de centrais de injeção (ECU) e câmbio (TCU) em bancada com a EAATA PROG 5, além de reset de módulos de airbag, bateria BMS e direção elétrica (SAS) com o programador ECM 45.',
    meta_title: 'EAATA PROG 5 e ECM 45: Guia de Clonagem de Módulos ECU/TCU e Airbag | Blog Athena',
    meta_description: 'Como funciona a programadora e clonadora de módulos ECU/TCU EAATA PROG 5 e o programador ECM 45 para reset de Airbag, Bateria Li-ion e SAS na oficina mecânica.',
    cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/eaata-programadora-prog-5-c6e2e7396d01.webp',
    reading_time_minutes: 7,
    category_slug: 'equipamentos-tecnologia',
    content_html: `
<p>Com a eletrônica embarcada cada vez mais protegida por criptografia e sistemas anti-furto (IMMO de última geração), substituir uma central de injeção eletrônica (<strong>ECU</strong>) ou de transmissão automatizada/automática (<strong>TCU</strong>) deixou de ser uma simples troca física de peça. Hoje, a oficina que domina a <strong>clonagem de módulos em bancada e o reset de unidades de controle</strong> retém os serviços de maior margem de lucro do mercado.</p>

<p>Neste guia técnico, detalhamos como dois equipamentos de ponta da linha EAATA — a <strong>Programadora e Clonadora PROG 5</strong> e o <strong>Programador Avançado ECM 45</strong> — permitem executar esses procedimentos com segurança e precisão de fábrica.</p>

<h2>1. O Que Faz a Programadora e Clonadora EAATA PROG 5?</h2>
<p>Quando uma central de motor ou câmbio sofre dano parcial por infiltração de água, sobrecarga ou falha em driver interno, mas o processador principal (MCU) ainda permite leitura, comprar um módulo novo na concessionária pode custar dezenas de milhares de reais e semanas de espera.</p>

<p>A <strong>EAATA PROG 5</strong> permite que o técnico conecte-se diretamente à central (em modo <em>Bench</em> sem abrir a carcaça, ou em modo <em>Boot</em> na placa) para:</p>
<ul>
  <li><strong>Ler e Salvar Backup Integral (Flash + EEPROM):</strong> Extrai todos os mapas de calibração, chassi (VIN) e dados de imobilizador da peça original.</li>
  <li><strong>Clonagem 1:1 para Módulo Doador (Usado/Seminovo):</strong> Transfere os dados exatos para uma central equivalente de mesma numeração Bosch, Continental, Marelli ou Delphi, tornando-a <em>Plug &amp; Play</em> no veículo.</li>
  <li><strong>Cobertura de Câmbios Automatizados e Dupla Embreagem:</strong> Suporte dedicado a TCUs amplamente presentes na frota nacional e importada (DSG DQ200/DQ250, Powershift, ZF, CVT e transmissões Mercedes/BMW).</li>
  <li><strong>Diagramas de Pinagem Integrados:</strong> O próprio software exibe na tela o esquema elétrico exato de ligação dos cabos coloridos, eliminando erros de conexão.</li>
</ul>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Equipamento em Destaque</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Programadora e Clonadora de Módulos ECU/TCU PROG 5 – EAATA</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Leitura e gravação de memória EEPROM e Flash de centrais de motor e câmbio em modo Bench e Boot, compatível com o adaptador de expansão MCU 5.</p>
  <a href="/produto/programadora-e-clonadora-de-modulos-ecu-tcu-prog-5-eaata-prog-5" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica da PROG 5 →</a>
</div>

<h2>2. Reset de Airbag, Baterias de Lítio e Direção (SAS) com o EAATA ECM 45</h2>
<p>Outro gargalo comum em centros automotivos, oficinas de funilaria premium e reparadoras de veículos híbridos/elétricos é o bloqueio lógico de módulos após colisões ou quedas severas de tensão:</p>
<ol>
  <li><strong>Módulos de Airbag (SRS Crash Data):</strong> Após o disparo das bolsas ou pré-tensionadores, a central grava o registro de colisão (<em>Crash Data</em>) e trava permanentemente via scanner comum. O <strong>EAATA ECM 45</strong> limpa o registro de impacto na memória para reutilização segura da central após a substituição dos componentes físicos.</li>
  <li><strong>Baterias de Lítio (BMS 12V e 48V Mild-Hybrid):</strong> Veículos Porsche, Mercedes-Benz, Audi e BMW com baterias de íons de lítio bloqueiam o relé interno do BMS em caso de descarga profunda. O ECM 45 destrava e restaura o módulo da bateria sem precisar trocar uma bateria de R$ 15.000.</li>
  <li><strong>Sensor de Ângulo de Direção (SAS):</strong> Recuperação de dados corrompidos em colunas de direção elétrica.</li>
</ol>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Solução Especializada</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Programador Avançado de Módulos ECM 45 (Airbag, Bateria e SAS) – EAATA</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Ferramenta dedicada para reparo e reset de dados de colisão em módulos de Airbag, destravamento de baterias BMS e calibração de sensores SAS.</p>
  <a href="/produto/programador-avancado-de-modulos-ecm-45-para-airbag-bateria-e-sas-eaata-ecm-45" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica do ECM 45 →</a>
</div>

<h2>3. Regra de Ouro na Programação: Estabilização de Tensão em 13.8V / 14V</h2>
<p>Todo reparador experiente sabe que o maior risco durante uma atualização de software (<em>Reflash</em>), codificação online ou clonagem de módulo no veículo é a <strong>queda de tensão da bateria</strong>. Quando a chave fica ligada na ignição com ventoinhas e bombas acionadas, a tensão cai rapidamente abaixo de 11,5V — o que pode interromper a gravação e inutilizar ("bricar") a central.</p>

<p>Por isso, procedimentos com scanners avançados (<a href="/produto/scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata">EAATA 90</a> ou <a href="/produto/scanner-automotivo-eaata-360pro-com-programador-immo-eaata">EAATA 360Pro</a>) devem ser sempre acompanhados pelo <strong><a href="/produto/estabilizador-de-bateria-12v-70a-eaata-epd002">Estabilizador de Bateria 12V 70A EAATA EPD002</a></strong>, que mantém a linha perfeitamente estabilizada em até 70 ampères contínuos.</p>
`.trim()
  },
  {
    slug: 'recarga-veiculos-eletricos-adaptador-ccs2-gbt-carregador-portatil-7kw',
    title: 'Recarga de Veículos Elétricos no Brasil: Quando Usar Adaptador CCS2 para GB/T e Carregadores Portáteis Tipo 2 (7kW)',
    excerpt: 'Guia prático sobre padrões de recarga de carros elétricos e híbridos plug-in no Brasil: como funcionam os adaptadores rápidos DC CCS2 para GB/T (80kW) e os carregadores portáteis Tipo 2 de 7kW 32A.',
    meta_title: 'Adaptador CCS2 para GB/T e Carregador Portátil Tipo 2 7kW: Guia EV | Blog Athena',
    meta_description: 'Entenda a diferença entre os conectores Tipo 2, CCS2 e GB/T e saiba escolher carregadores portáteis 7kW 32A e adaptadores de recarga rápida DC na Athena.',
    cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/ew1135-173eeeb34c90.webp',
    reading_time_minutes: 6,
    category_slug: 'tendencias-automotivas',
    content_html: `
<p>O crescimento acelerado da frota de veículos elétricos (BEV) e híbridos plug-in (PHEV) no Brasil trouxe uma nova demanda diária tanto para proprietários quanto para oficinas e concessionárias multimarcas: a <strong>compatibilidade entre os padrões de plugues de recarga AC (corrente alternada) e DC (recarga ultrarrápida em corrente contínua)</strong>.</p>

<p>Neste artigo técnico, explicamos quando utilizar o <strong>Adaptador DC CCS2 para GB/T</strong> e por que o <strong>Carregador Portátil Tipo 2 de 7kW (32A)</strong> tornou-se indispensável no porta-malas e no box de manutenção.</p>

<h2>1. Por Que Existe a Diferença Entre CCS2 e GB/T no Brasil?</h2>
<p>A maioria dos eletropostos públicos de recarga rápida (DC) instalados em rodovias e shoppings brasileiros adota o padrão europeu <strong>CCS2 (Combined Charging System 2)</strong>. No entanto, diversos veículos elétricos importados da Ásia (como lotes específicos da BYD, JAC, Dongfeng e utilitários elétricos de frota) saem de fábrica com a tomada no padrão chinês <strong>GB/T DC</strong>.</p>

<p>Para que um veículo com entrada GB/T possa carregar em qualquer estação rápida CCS2 de até 80kW/1000V sem depender exclusivamente de carregadores lentos, utiliza-se o <strong>Adaptador Ativo CCS2 para GB/T 200A (E-Wolf EW1135)</strong>, que faz tanto o acoplamento físico de alta corrente quanto a tradução do protocolo de comunicação digital entre o eletroposto e o BMS do veículo.</p>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Mobilidade Elétrica DC</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Adaptador CCS2 para GB/T 200A 1000V DC 80kW IP54 - E-Wolf EW1135</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Conecta veículos padrão GB/T às estações de recarga rápida CCS2 em rodovias e centros urbanos com potência de até 80kW e proteção térmica dupla.</p>
  <a href="/produto/adaptador-ccs2-para-gbt-200a-1000v-dc-80kw-ip54-e-wolf-ew1135" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Ficha Técnica do Adaptador EW1135 →</a>
</div>

<h2>2. Carregador Portátil Tipo 2 de 7kW (32A): Versatilidade Sem Obra Fixa</h2>
<p>Para recarga residencial, viagens ou atendimento dentro da oficina mecânica, depender apenas do carregador de emergência original de 1,8kW ou 2,2kW (tomada comum de 10A) pode levar mais de 24 horas para completar uma bateria de 45kWh a 60kWh.</p>

<p>O <strong>Carregador Portátil Tipo 2 de 7kW (32A / 220V) Top Charger TC1108</strong> entrega a mesma velocidade de um Wallbox residencial fixo, mas com a vantagem de vir acompanhado de <strong>4 adaptadores intercambiáveis</strong> (incluindo plugue industrial CEE 32A e tomadas brasileiras NBR 14136), ajustando automaticamente a corrente (8A, 10A, 13A, 16A, 24A ou 32A) conforme a infraestrutura disponível no local.</p>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Recarga Portátil Inteligente</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Carregador Portátil Tipo 2 7kW 32A 220V IP65 com 4 Adaptadores - Top Charger TC1108</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Compatível com BYD, GWM, Volvo, BMW, Renault e todos os veículos Tipo 2. Grau de proteção IP65, display LCD completo e kit com 4 ponteiras.</p>
  <a href="/produto/carregador-portatil-tipo-2-7kw-32a-220v-ip65-com-4-adaptadores-top-charger-tc1108" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Carregador Portátil 7kW TC1108 →</a>
</div>

<h2>3. Por Que Toda Oficina Moderna Precisa de um Carregador 7kW no Pátio?</h2>
<p>Veículos híbridos e elétricos frequentemente chegam ao centro automotivo com carga baixa para serviços de alinhamento 3D, suspensão, pneus ou diagnóstico eletrônico. Ter um carregador de 7kW na oficina permite entregar o veículo carregado ao cliente e realizar testes de rodagem e calibração do sistema de alta tensão com total autonomia.</p>
`.trim()
  },
  {
    slug: 'troca-oleo-cambio-automatico-dialise-maquina-100-automatica',
    title: 'Troca de Óleo de Câmbio Automático por Diálise vs. Gravidade: Como Faturar Alto na Oficina',
    excerpt: 'Descubra por que a troca parcial por gravidade deixa até 50% de fluido contaminado no conversor de torque e como máquinas 100% automáticas elevam o ticket médio e a segurança da transmissão.',
    meta_title: 'Máquina de Troca de Óleo de Câmbio Automático por Diálise: Vale a Pena? | Blog Athena',
    meta_description: 'Comparativo técnico entre troca de fluido de câmbio automático por gravidade e por diálise 100% automática. Veja o retorno financeiro para sua oficina.',
    cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/upload-1788372279810-07af1d2e7d7b.webp',
    reading_time_minutes: 6,
    category_slug: 'gestao-produtividade',
    content_html: `
<p>Mais de 60% dos veículos novos vendidos no Brasil já saem de fábrica equipados com transmissões automáticas epicíclicas (6, 8, 9 ou 10 marchas), CVT ou automatizadas de dupla embreagem. Com isso, a <strong>manutenção preventiva de câmbio automático</strong> tornou-se um dos serviços de maior rentabilidade por hora trabalhada em oficinas mecânicas e auto centers.</p>

<h2>1. O Problema da Troca Parcial por Gravidade (Cárter)</h2>
<p>Quando o mecânico apenas esgota o óleo pelo bujão do cárter da transmissão, apenas <strong>35% a 45% do volume total do fluido</strong> é drenado. Mais da metade do óleo velho, oxidado e carregado de micropartículas de desgaste dos pacotes de embreagem permanece retido dentro do:</p>
<ul>
  <li>Conversor de torque;</li>
  <li>Corpo de válvulas e solenoides;</li>
  <li>Trocador de calor (radiador de óleo da transmissão) e galerias hidráulicas.</li>
</ul>
<p>Ao misturar óleo novo com metade da carga antiga degradada, o poder detergente e a viscosidade do fluido novo são imediatamente comprometidos.</p>

<h2>2. Como Funciona a Troca por Diálise em Máquina 100% Automática?</h2>
<p>Equipamentos computadorizados de última geração — como a <strong>Máquina Trocadora de Fluido de Câmbio Automático 100% Automática (TTE 780 / MAH-4001)</strong> — conectam-se em série às linhas de arrefecimento da transmissão e utilizam sensores eletrônicos de fluxo e balanças de precisão:</p>
<ol>
  <li><strong>Identificação Automática do Sentido de Fluxo:</strong> Você não corre o risco de inverter as mangueiras de entrada e retorno; a máquina detecta a pressão e ajusta o circuito sozinha.</li>
  <li><strong>Troca Equivalente por Peso em Tempo Real:</strong> Na mesma proporção e pressão em que a bomba da própria transmissão envia o fluido usado para o reservatório de descarte, a máquina injeta a quantidade exata de fluido novo aquecido.</li>
  <li><strong>Ciclo de Limpeza e Visor Iluminado:</strong> Permite que o cliente acompanhe visualmente a diferença entre a cor escura do óleo antigo e a transparência do fluido novo atingindo quase 100% de renovação.</li>
</ol>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Alta Rentabilidade no Box</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Máquina Trocadora de Fluido de Câmbio Automático 100% Automática</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Balança eletrônica de alta precisão, reversão automática de polaridade de fluxo, banco de dados integrado e maleta completa de adaptadores multimarcas.</p>
  <a href="/produto/maquina-trocadora-de-fluido-de-cambio-automatico-100-automatica-mahovi-mah-4001" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Máquina de Câmbio Automático →</a>
</div>

<h2>3. Pós-Serviço Obrigatório: Reset de Adaptação via Scanner</h2>
<p>Após a substituição completa do fluido e do filtro da transmissão, é fundamental utilizar um scanner avançado (<a href="/produto/scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata">EAATA 90</a>) para aferir a temperatura exata de nível (geralmente entre 40°C e 45°C) e realizar o <strong>reset dos parâmetros adaptativos de pressão das solenoides</strong>, garantindo trocas suaves desde o primeiro quilômetro.</p>
`.trim()
  },
  {
    slug: 'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina',
    title: 'Como Escolher o Scanner Automotivo Ideal para sua Oficina Mecânica',
    excerpt: 'Descubra como o ThinkTool Lite, EAATA 360Pro e scanners modernos revolucionam oficinas mecânicas através de diagnósticos inteligentes, leitura rápida de módulos, funções especiais e atualização direta de fábrica.',
    meta_title: 'Como Escolher o Scanner Automotivo Ideal para Oficina | Blog Athena',
    meta_description: 'Guia prático para escolher o scanner automotivo ideal: cobertura CAN-FD e DoIP, topologia de rede, funções especiais de reset e custo-benefício.',
    cover_image_key: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
    reading_time_minutes: 6,
    category_slug: 'equipamentos-tecnologia',
    content_html: `
<p>Com a complexidade crescente dos veículos com redes multiplexadas, sistemas híbridos e elétricos, escolher o <strong>scanner automotivo correto</strong> impacta diretamente a produtividade, a reputação técnica e o faturamento de qualquer oficina mecânica ou auto center.</p>

<p>Equipamentos defasados geram perdas de tempo e recusas de serviços por falta de cobertura em sistemas modernos como freio de estacionamento eletrônico (EPB), calibração de direção elétrica (SAS), regeneração de filtro DPF e aprendizado de transmissões automatizadas.</p>

<h2>Os 4 Critérios Essenciais Antes de Comprar seu Scanner</h2>
<ol>
  <li><strong>Suporte Nativo a Protocolos Modernos (CAN-FD e DoIP):</strong> Veículos Chevrolet (Onix, Tracker, Montana), Fiat/Jeep (com Security Gateway SGW), Volvo e BMW exigem comunicação de alta velocidade.</li>
  <li><strong>Mapeamento Visual por Topologia de Rede:</strong> Permite enxergar toda a árvore de módulos do carro por cores, isolando falhas de comunicação (código U) em segundos sem desmontar o painel.</li>
  <li><strong>Funções Especiais e Testes Bidirecionais (Atuadores):</strong> Um scanner profissional não serve apenas para "apagar luz de injeção"; ele precisa acionar ventoinhas, bombas, solenoides, bicos injetores e válvulas EGR diretamente pela tela.</li>
  <li><strong>Suporte Técnico, Garantia Oficial e Programador IMMO:</strong> Adquirir o equipamento em distribuidor homologado garante treinamento e assistência nacional.</li>
</ol>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Diagnóstico + Imobilizador</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Scanner Automotivo EAATA 360Pro com Programador IMMO</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Diagnóstico multimarcas avançado combinado com funções completas de programação de chaves, imobilizador e resets especiais para oficinas exigentes.</p>
  <a href="/produto/scanner-automotivo-eaata-360pro-com-programador-immo-eaata" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Scanner EAATA 360Pro →</a>
</div>
`.trim()
  },
  {
    slug: 'calibracao-adas-e-sensores-radar-o-futuro-da-reparacao',
    title: 'Calibração ADAS e Câmeras de Para-brisa: Por Que Toda Oficina Precisa se Adaptar',
    excerpt: 'A presença massiva de frenagem autônoma, assistente de faixa e piloto automático adaptativo exige alinhamento 3D e calibração milimétrica após serviços de suspensão ou troca de para-brisa.',
    meta_title: 'Calibração ADAS e Alinhamento 3D na Oficina: Guia Completo | Blog Athena',
    meta_description: 'Entenda como funciona a calibração de sistemas ADAS (câmeras e radares) integrada ao alinhamento 3D e como transformar esse serviço em receita recorrente.',
    cover_image_key: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    reading_time_minutes: 8,
    category_slug: 'tendencias-automotivas',
    content_html: `
<p>Os Sistemas Avançados de Assistência ao Motorista (<strong>ADAS</strong> — <em>Advanced Driver Assistance Systems</em>) deixaram de ser exclusividade de sedãs importados de luxo. Hoje, modelos populares e SUVs compactos saem de fábrica com <strong>frenagem autônoma de emergência (AEB), assistente de permanência em faixa (LKA), alerta de ponto cego e controle de cruzeiro adaptativo (ACC)</strong>.</p>

<h2>Quando a Calibração ADAS é Obrigatória?</h2>
<p>Um erro de apenas 1 grau no ângulo de leitura de um radar frontal no para-choque representa um desvio de vários metros a 100 metros de distância. Por isso, as montadoras determinam a recalibração estática ou dinâmica sempre que o veículo passa por:</p>
<ul>
  <li><strong>Substituição ou remoção do para-brisa</strong> (onde fica alojada a câmera multifuncional);</li>
  <li><strong>Alinhamento de direção / geometria de suspensão</strong> ou troca de amortecedores, bandejas e terminais;</li>
  <li><strong>Reparos de funilaria em para-choques, grade frontal ou retrovisores</strong> (que abrigam radares e câmeras 360°);</li>
  <li><strong>Alteração na altura de rodagem ou troca de medidas de pneus.</strong></li>
</ul>

<h2>Integração entre Geometria da Suspensão e Diagnóstico Eletrônico</h2>
<p>Nenhum sistema ADAS pode ser calibrado corretamente se o ângulo de impulso do eixo traseiro estiver desalinhado. Por isso, o processo profissional começa com a aferição da geometria do chassi seguida pela inicialização do modo de calibração via scanner com suporte ADAS (<a href="/produto/scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata">EAATA 90</a>).</p>
`.trim()
  },
  {
    slug: 'seguranca-e-manutencao-preventiva-em-elevadores-automotivos',
    title: 'Segurança Operacional e Manutenção Preventiva em Elevadores Automotivos (NR-12)',
    excerpt: 'Checklist prático diário e mensal para garantir vida útil longa, cabos de aço e cilindros hidráulicos íntegros, travas de segurança calibradas e conformidade com a norma NR-12 na oficina.',
    meta_title: 'Manutenção Preventiva em Elevadores Automotivos e Norma NR-12 | Blog Athena',
    meta_description: 'Checklist completo de segurança e manutenção preventiva para elevadores automotivos eletro-hidráulicos e pantográficos conforme a norma NR-12.',
    cover_image_key: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/upload-1787756310359-838a1d6700f8.webp',
    reading_time_minutes: 5,
    category_slug: 'manutencao-preventiva',
    content_html: `
<p>O <strong>elevador automotivo</strong> é o coração produtivo de qualquer box mecânico. Com o aumento do peso médio da frota brasileira — impulsionado por picapes cabine dupla, SUVs blindados, vans utilitárias e veículos elétricos com pesadas baterias no assoalho —, operar com equipamentos subdimensionados ou sem manutenção preventiva representa um risco grave.</p>

<h2>1. Por Que Migrar para Elevadores Eletro-Hidráulicos de Pórtico (4T a 4,5T)?</h2>
<p>Diferente dos antigos elevadores eletromecânicos de fuso e correia (que exigem lubrificação constante, consomem mais energia elétrica e sofrem desgaste prematuro de porcas de carga), os modernos <strong>elevadores eletro-hidráulicos com pórtico superior</strong> oferecem:</p>
<ul>
  <li><strong>Piso Totalmente Livre entre as Colunas:</strong> Facilita a passagem de carrinhos de ferramentas, coletores de óleo de 80L e macacos de transmissão;</li>
  <li><strong>Duplo Cilindro Hidráulico com Equalização por Cabos de Aço:</strong> Elevação suave, silenciosa e rápida (cerca de 50 segundos);</li>
  <li><strong>Sensor Fim de Curso no Pórtico Superior:</strong> Desliga automaticamente a subida caso o teto de um SUV alto encoste na barra acolchoada;</li>
  <li><strong>Travas Mecânicas de Segurança em Todas as Alturas:</strong> Aliviam a pressão hidráulica durante o serviço sob o veículo.</li>
</ul>

<div class="athena-blog-product-card" style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;border:1px solid #334155;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Infraestrutura Pesada</span>
  <h4 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#ffffff;">Elevador Automotivo Eletro-Hidráulico 4,5 Toneladas MAH-1020</h4>
  <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Capacidade real de 4.500 kg para carros de passeio, SUVs blindados e caminhonetes pesadas. Estrutura reforçada com travas de segurança e garantia oficial.</p>
  <a href="/produto/elevador-automotivo-eletro-hidraulico-45-toneladas" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#f59e0b;color:#020617;font-weight:800;font-size:13px;text-decoration:none;">Ver Elevador Eletro-Hidráulico 4,5T →</a>
</div>

<h2>2. Checklist Mensal de Manutenção Preventiva (NR-12)</h2>
<ol>
  <li><strong>Inspeção das Sapatas de Borracha:</strong> Sapatas gastas ou rasgadas causam escorregamento da longarina. Substitua imediatamente se o metal da bandeja estiver exposto.</li>
  <li><strong>Reaperto dos Chumbadores (Pabolts) no Piso:</strong> Verifique com torquímetro a fixação na laje de concreto (mínimo FCK 25 MPa e 15cm de espessura).</li>
  <li><strong>Tensão dos Cabos de Equalização e Nível do Fluido Hidráulico:</strong> Certifique-se de que as travas clicam simultaneamente nos dois lados durante a subida.</li>
</ol>
`.trim()
  }
];

async function publishAll() {
  console.log('[Blog Publisher] Iniciando publicação dos artigos estratégicos...');
  const catsRes = await query('SELECT id, slug FROM public.blog_categories');
  const catMap = {};
  for (const row of catsRes.rows) {
    catMap[row.slug] = row.id;
  }
  const fallbackCatId = catsRes.rows[0]?.id || null;

  for (const art of STRATEGIC_ARTICLES) {
    const existing = await query('SELECT id FROM public.blog_posts WHERE slug = $1', [art.slug]);
    let postId;
    const blocks = [{ type: 'paragraph', content: art.excerpt }];

    if (existing.rows.length > 0) {
      postId = existing.rows[0].id;
      await query(`
        UPDATE public.blog_posts
        SET
          title = $1,
          excerpt = $2,
          content = $3,
          content_html = $4,
          cover_image_key = $5,
          meta_title = $6,
          meta_description = $7,
          reading_time_minutes = $8,
          status = 'published',
          published_at = COALESCE(published_at, NOW()),
          updated_at = NOW()
        WHERE id = $9
      `, [
        art.title,
        art.excerpt,
        JSON.stringify(blocks),
        art.content_html,
        art.cover_image_key,
        art.meta_title,
        art.meta_description,
        art.reading_time_minutes,
        postId
      ]);
      console.log(`[Blog Publisher] Artigo atualizado: ${art.slug}`);
    } else {
      postId = crypto.randomUUID();
      await query(`
        INSERT INTO public.blog_posts (
          id, title, slug, excerpt, content, content_html, cover_image_key,
          meta_title, meta_description, reading_time_minutes, view_count,
          status, published_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published', NOW(), NOW(), NOW())
      `, [
        postId,
        art.title,
        art.slug,
        art.excerpt,
        JSON.stringify(blocks),
        art.content_html,
        art.cover_image_key,
        art.meta_title,
        art.meta_description,
        art.reading_time_minutes,
        Math.floor(120 + Math.random() * 90)
      ]);
      console.log(`[Blog Publisher] Novo artigo inserido: ${art.slug}`);
    }

    const targetCatId = catMap[art.category_slug] || fallbackCatId;
    if (targetCatId) {
      await query(`
        INSERT INTO public.blog_post_categories (post_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [postId, targetCatId]);
    }
  }

  console.log('[Blog Publisher] Todos os artigos estratégicos foram publicados com sucesso!');
  process.exit(0);
}

publishAll().catch(err => {
  console.error('[Blog Publisher] Erro:', err);
  process.exit(1);
});
