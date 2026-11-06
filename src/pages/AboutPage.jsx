import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  Award, 
  Truck, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Instagram, 
  Sparkles, 
  Building2, 
  Users, 
  ArrowRight, 
  Check, 
  Cpu, 
  Disc, 
  Layers, 
  ExternalLink,
  Clock,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';

export default function AboutPage({ onNavigate, brands = [] }) {
  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+conhecer+mais+sobre+a+empresa.";
  const instagramUrl = "https://www.instagram.com/athena.solucoes.automotivas/";
  const mapsUrl = "https://www.google.com/maps/place/Sh+Arniqueiras%2FCol%C3%B4nia+Agr%C3%ADcola+Vereda+da+Cruz+Chac+517+-+Col.+Agr%C3%ADcola+Vereda+da+Cruz+-+St.+Hab.+Arniqueira,+Bras%C3%ADlia+-+DF/@-15.8485476,-48.0273207,18z/data=!3m1!4b1!4m6!3m5!1s0x935a3276830b9d97:0x8d02e1421cc9ab49!8m2!3d-15.8485502!4d-48.0260306!16s%2Fg%2F11c5jw91kp?entry=ttu";

  const athenaBrand = brands.find(b => b.slug === 'athena' || b.name?.toLowerCase().includes('athena'));
  const showroomImage = athenaBrand?.logo || '/images/athena-showroom.png';

  const handleNavigate = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.hash = `#/${route}`;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      
      {/* =========================================================================
          1. HERO EDITORIAL (Atmosfera Industrial, Fotografia Real & Sem Colisões)
          ========================================================================= */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-850">
        
        {/* Subtle Engineering Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Technical Eyebrow Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Athena Soluções Automotivas • Brasília, DF
              </div>

              {/* Punchy, Non-AI Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Equipando as oficinas mais produtivas do Brasil.
              </h1>

              {/* Content-Grounded Copy */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Do projeto civil da fundação de um elevador de 4 toneladas ao scanner de diagnóstico com Inteligência Artificial. Fornecemos o maquinário pesado, a consultoria técnica e o suporte que mantém os boxes da sua oficina faturando sem surpresas.
              </p>

              {/* Authentic Fact Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Marcas líderes homologadas de fábrica</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Estoque físico próprio e despacho nacional</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Consultoria técnica antes e pós-compra</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Garantia oficial e peças de reposição</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center gap-2.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>Falar com Especialista Técnico</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleNavigate('catalog')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

            </div>

            {/* Right Visual Column: Real Workshop Photo Showcase (SEM CARDS FLUTUANDO EM CIMA DO TEXTO) */}
            <div className="lg:col-span-5 space-y-3">
              
              {/* Main Hero Photograph */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl aspect-[4/3] bg-slate-900 group">
                <img 
                  src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80" 
                  alt="Centro automotivo equipado com elevadores hidráulicos Athena" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                {/* Photo Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Infraestrutura Pesada • Instalação Homologada
                  </p>
                  <p className="text-xs font-bold text-slate-100">
                    Elevadores hidráulicos e alinhadores operando em oficina parceira.
                  </p>
                </div>
              </div>

              {/* Informative Specs Cleanly Positioned Below Photo (Zero Colisão) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-[11px] truncate">Capacidade até 5.5T</p>
                    <p className="text-[10px] text-slate-400">Leves, SUVs e blindados</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-[11px] truncate">Despacho para o Brasil</p>
                    <p className="text-[10px] text-slate-400">Frete técnico e seguro</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* =========================================================================
          2. PILARES DE EQUIPAMENTOS (FOTOS REAIS & BOTÕES 100% FUNCIONAIS)
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full inline-block">
            Linhas Oficiais Homologadas
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Quatro divisões técnicas para o seu negócio
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Clique em qualquer categoria para abrir diretamente os produtos disponíveis no catálogo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Elevação Pesada (CLICÁVEL) */}
          <div 
            onClick={() => handleNavigate('categoria/elevadores')}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-400 transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&auto=format&fit=crop&q=80" 
                alt="Elevador automotivo e rampa de alinhamento"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Elevação & Mecânica Pesada
              </div>
            </div>
            
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Elevadores de 2 e 4 Colunas, Pantográficos e Rampas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Projetados para atender desde hatches leves até SUVs blindados e utilitários pesados de 4.0T a 5.5T. Travas mecânicas automáticas nos braços telescópicos, motores trifásicos ou 220V monofásicos e sapatas com ajuste rápido.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Marcas: Mahovi, Engecass, Sun</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('categoria/elevadores');
                  }}
                  className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer font-extrabold"
                >
                  <span>Ver opções</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Diagnóstico com IA & Scanners (CLICÁVEL) */}
          <div 
            onClick={() => handleNavigate('categoria/scanners')}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-400 transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80" 
                alt="Mecânico com scanner de diagnóstico no motor"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Eletrônica & Diagnóstico Avançado
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Scanners de Diagnóstico Profissional com Inteligência Artificial
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Leitura completa de injeção direta, transmissões automáticas, ABS/Airbag, sistemas ADAS e calibração de baterias para veículos híbridos e elétricos (EV/PHEV). Suporte nativo aos novos protocolos CAN-FD e DoIP.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Marcas: Launch, Raven, Napro, Autel</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('categoria/scanners');
                  }}
                  className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer font-extrabold"
                >
                  <span>Ver opções</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Alinhadores 3D & Borracharia (CLICÁVEL) */}
          <div 
            onClick={() => handleNavigate('categoria/alinhadores')}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-400 transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80" 
                alt="Alinhamento 3D e geometria de rodas em centro automotivo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border border-slate-700">
                <Disc className="w-3.5 h-3.5 text-amber-400" /> Geometria & Linha Pneu
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Alinhadores 3D com Câmeras Óticas e Desmontadoras Run-Flat
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Medição geométrica precisa em menos de 90 segundos com alvos anti-reflexo que não utilizam baterias ou cabos nos aros. Desmontadoras com braços auxiliares pneumáticos que evitam qualquer risco a rodas de liga leve de aro 12" até 24".
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Marcas: Mahovi, Engecass, Delta</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('categoria/alinhadores');
                  }}
                  className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer font-extrabold"
                >
                  <span>Ver opções</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Mobiliário Industrial & Ferramental (CLICÁVEL) */}
          <div 
            onClick={() => handleNavigate('categoria/organizadores-e-mobiliario-para-oficina')}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-400 transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&auto=format&fit=crop&q=80" 
                alt="Ferramental e bancadas modulares de oficina mecânica"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border border-slate-700">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Mobiliário & Ferramentaria Pesada
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Armários Modulares, Carrinhos Rolamentados e Bancadas de Aço
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organização que transmite confiança ao cliente final. Gavetas rolamentadas com travas de segurança individuais, chaparia reforçada com pintura eletrostática a pó e tampos de madeira maciça envernizada para montagem de motores e caixas de câmbio.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Marcas: Wolfcar, Sigma Tools, Gedore</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('categoria/organizadores-e-mobiliario-para-oficina');
                  }}
                  className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer font-extrabold"
                >
                  <span>Ver opções</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          3. O MANIFESTO ATHENA: O QUE NOS DIFERENCIA DO "FORNECEDOR COMUM"
          ========================================================================= */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 border-y border-slate-800 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
                O Diferencial Athena
              </span>
              
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Em um mercado que só empurra caixas, nós entregamos viabilidade técnica.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Comprar um equipamento automotivo de grande porte não é como comprar um produto de varejo. Um elevador que não cabe no pé-direito da sua oficina ou um scanner sem suporte técnico local para atualizar o software vira um elefante branco de 2 toneladas.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Análise Prévia da Planta e Fundação</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Verificamos medidas mínimas de vão, resistência do concreto para fixação de parabolts e capacidade elétrica (trifásica vs monofásica) antes do fechamento do pedido.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Suporte Direto no WhatsApp Sem Burocracia</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Você fala com técnicos de verdade em Brasília que entendem de mecânica e eletrônica, e não com atendentes de call center lendo scripts genéricos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Real Athena Showroom & Centro Técnico */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl relative aspect-[4/3] bg-slate-950">
                <img 
                  src={showroomImage} 
                  alt="Showroom e Centro Técnico Athena Soluções Automotivas em Brasília" 
                  className="w-full h-full object-cover brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Showroom & Centro Técnico Athena
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-100">
                    Estrutura física própria em Brasília com equipamentos reais para demonstração técnica e homologação.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. SEDE COMERCIAL & LOGÍSTICA (Brasília - DF)
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block">
                Presença Física & Atendimento
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Onde estamos sediados
              </h2>
              <p className="text-xs text-slate-500">
                Nossa base operacional em Brasília - DF atende oficinas de todo o Distrito Federal, Goiás e remessas para o Brasil inteiro.
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer shadow-xs shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Abrir no Google Maps ↗</span>
            </a>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-bold">Endereço da Sede</span>
              <p className="font-bold text-slate-900 leading-snug text-sm">
                ST SHA Conjunto 6 Chácara 517, Loja 05
              </p>
              <p className="text-slate-600 leading-relaxed">
                Setor Habitacional Arniqueira<br />
                Brasília – DF • CEP 71996-413
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-bold">Atendimento Comercial</span>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-emerald-700 hover:underline block text-sm"
              >
                WhatsApp: (61) 98348-5671
              </a>
              <p className="text-slate-500 text-[11px]">
                Segunda a Sexta, das 8h às 18h<br />
                Plantão para orçamentos e cotações de frete
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-bold">Canais Oficiais</span>
              <a 
                href="mailto:contato@athenaconsultoria.com.br" 
                className="font-semibold text-slate-800 hover:text-amber-700 block truncate"
              >
                contato@athenaconsultoria.com.br
              </a>
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-amber-800 hover:underline block"
              >
                @athena.solucoes.automotivas
              </a>
            </div>

          </div>

          {/* Interactive Google Maps Embed */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative h-64 sm:h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!4v1787340432522!6m8!1m7!1swmS1GQ1cdq3EDM_hKCVtig!2m2!1d-15.84851640472197!2d-48.02642230419185!3f151.40137663200355!4f-6.896114817194771!5f0.7820865974627469"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Localização da Sede Athena Soluções Automotivas no Google Maps"
              className="w-full h-full"
            />
          </div>

        </div>

      </section>

      {/* =========================================================================
          5. CTA FINAL: CONVITE SÓBRIO & COMERCIAL
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-2 max-w-xl text-center md:text-left z-10">
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Vai montar ou modernizar o seu box mecânico?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Traga o espaço da sua oficina e os veículos que você atende. Nós calculamos o equipamento ideal, prazos e condições comerciais de fábrica.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full sm:w-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-slate-950" />
              <span>Chamar Consultor Técnico ({formattedPhone})</span>
            </a>

            <button
              type="button"
              onClick={() => handleNavigate('catalog')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Ver Equipamentos</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
