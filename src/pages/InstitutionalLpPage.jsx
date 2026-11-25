import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Wrench, 
  CreditCard, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  Layers,
  Cpu,
  Sparkles,
  ArrowRight,
  Star,
  Building,
  GraduationCap
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaEvent, trackMetaCustom } from '../utils/metaPixel';

// Ícone Oficial Vetorial do WhatsApp
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

// 4 Avaliações Reais do Google Meu Negócio
const googleReviews = [
  {
    name: "Fernando Junior",
    role: "Proprietário de Oficina no DF",
    badge: "Local Guide • 177 avaliações",
    rating: 5,
    text: "A Athena veio para trazer soluções, se o problema é treinamento técnico ela traz, se o problema é manutenção de equipamentos ela resolve. Sou cliente, sou fã e indico a todos!"
  },
  {
    name: "Wellington Gonçalves de Oliveira",
    role: "Centro de Diagnóstico Automotivo",
    badge: "Cliente Verificado",
    rating: 5,
    text: "Alta tecnologia dos equipamentos, qualidade das ferramentas e expertise fora da média nos cursos ofertados. Tudo aliado a um atendimento comercial de excelência no DF."
  },
  {
    name: "Jeferson Muniz",
    role: "Auto Center Especializado",
    badge: "Local Guide • 6 avaliações",
    rating: 5,
    text: "Excelente atendimento, resolveu todas as minhas demandas! Pronta-entrega de equipamentos e agilidade que faz toda a diferença."
  },
  {
    name: "Eldinei",
    role: "Oficina Mecânica",
    badge: "Local Guide • 26 avaliações",
    rating: 5,
    text: "Empresa parceira para toda hora. Atendimento rápido, peças de procedência e suporte técnico nota 10. Recomendo de olhos fechados!"
  }
];

export default function InstitutionalLpPage({ onNavigate }) {
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    workshop: '',
    interest: 'Elevadores Automotivos'
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Distribuidora de Equipamentos Automotivos em Brasília e DF | Athena',
      description: 'Elevadores automotivos, alinhadores 3D, scanners de diagnóstico e químicos Sigma Tools com pronta-entrega no DF, suporte presencial e faturamento PJ.',
      canonicalPath: '/distribuidora-equipamentos-automotivos-brasilia-df',
      schemaId: 'lp-distribuidora-json-ld',
      schemaData: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Athena Soluções Automotivas",
        "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp",
        "telephone": "+55-61-98348-5671",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "ST SHA Conjunto 6 Chácara 517, Loja 05",
          "addressLocality": "Arniqueira, Brasília",
          "addressRegion": "DF",
          "postalCode": "71996-413",
          "addressCountry": "BR"
        },
        "description": "Distribuidora oficial de equipamentos automotivos no Distrito Federal."
      }
    });

    trackMetaCustom('ViewInstitutionalLp', {
      secao: 'Landing Page Distribuidora DF',
      descricao: 'Visualizou a LP Institucional de Alta Conversão da Athena no DF'
    });
  }, []);

  const handleWhatsappClick = (origem) => {
    trackMetaEvent('Contact', {
      content_name: `WhatsApp Direto - ${origem}`,
      secao: 'LP Distribuidora DF',
      descricao: `Iniciou conversa via WhatsApp (${origem})`
    });

    const msg = encodeURIComponent(`Olá! Vim pela página da Athena Distribuidora no DF e gostaria de atendimento sobre equipamentos para oficina.`);
    window.open(`https://wa.me/5561983485671?text=${msg}`, '_blank');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    trackMetaEvent('Lead', {
      content_name: `Lead LP Distribuidora - ${leadForm.interest}`,
      user_name: leadForm.name,
      user_phone: leadForm.phone,
      workshop_name: leadForm.workshop,
      interest: leadForm.interest,
      secao: 'LP Distribuidora DF'
    });

    setFormSent(true);

    const msg = encodeURIComponent(
      `Olá! Meu nome é ${leadForm.name}${leadForm.workshop ? ` da oficina ${leadForm.workshop}` : ''}.\nEstou no DF e quero uma cotação para: *${leadForm.interest}*.\nMeu contato: ${leadForm.phone}.`
    );
    setTimeout(() => {
      window.open(`https://wa.me/5561983485671?text=${msg}`, '_blank');
    }, 400);
  };

  const marqueeBrands = [
    { name: 'M3 Treinamentos', logo: '/logo-m3-treinamentos-athena-brasilia.jpg' },
    { name: 'Mahovi Equipamentos', logo: 'https://mahovi.com.br/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2025/01/logomahov.png.webp' },
    { name: 'EAATA Brasil', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsEnT9pIj8TWEV8vGczLXYEBPrf2D5h_E5IkOqSdbflg&s=10' },
    { name: 'Stärkx Diagnóstico', logo: 'https://www.starkx.com.br/assets/img/logo-starkx-dark.jpg' },
    { name: 'Sigma Tools', logo: 'https://www.sigmatools.com.br/site/wp-content/uploads/2020/01/logo-sgt-home-03.png' },
    { name: 'Delta Ferramentas', logo: 'https://static.wixstatic.com/media/70ea6e_37705022df5d4db98d4e8743bca3b285~mv2.png/v1/fill/w_100,h_105,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/70ea6e_37705022df5d4db98d4e8743bca3b285~mv2.png' },
    { name: 'Wolfcar Mobiliário', logo: 'https://wolfcardiagnosticos.com.br/assets/logo.svg' },
    { name: 'Planatc Testes', logo: 'https://www.planatc.com.br/config/imagens_conteudo/padrao/logo.png' },
    { name: 'E-Wolf Mobilidade EV', logo: 'https://ewolf.com.br/cdn/shop/files/logo-site.png?v=1768334838&width=150' },
    { name: 'GT Eagle DPF', logo: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_marcas/logo-gt-eagle-faa6a3cb2624.webp' }
  ];

  const marqueeList = [...marqueeBrands, ...marqueeBrands];
  const marqueeReviews = [...googleReviews, ...googleReviews];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-300">
              Distribuidora Oficial no DF: Pronta-entrega em Brasília, visita presencial e faturamento PJ
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span>Showroom Físico: Arniqueira - DF</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">(61) 98348-5671</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER DA LP (LAYOUT TOTALMENTE INDEPENDENTE) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img 
              src="/athena-consultoria-logo-df.jpg" 
              alt="Athena Soluções Automotivas DF" 
              className="h-10 sm:h-12 w-auto rounded-xl object-contain shadow-xs border border-slate-100" 
            />
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 block leading-none">
                ATHENA
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-700 tracking-wider block mt-0.5">
                Soluções Automotivas • DF
              </span>
            </div>
          </div>

          <button 
            onClick={() => handleWhatsappClick('Header')}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs sm:text-sm py-2.5 px-4 sm:px-6 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Falar no WhatsApp</span>
          </button>

        </div>
      </header>

      {/* 3. HERO SECTION - 100% LIMPO COM FOTO REAL DO SHOWROOM NÍTIDA LADO A LADO */}
      <section className="bg-slate-50 border-b border-slate-200 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Coluna da Esquerda: Copy Direta + Selos Locais */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/90 py-1.5 px-3.5 rounded-full text-xs font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Distribuidora Autorizada no Distrito Federal & Entorno</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Equipamentos de oficina direto da fábrica, com estoque e assistência técnica em Brasília.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Sem esperar semanas por transportadora interestadual. Atendemos mecânicas, auto centers e centros de estética em todo o DF com entrega imediata, faturamento para CNPJ e visita presencial na sua oficina.
              </p>

              {/* Botão de WhatsApp Principal (Mobile & Desktop) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button 
                  onClick={() => handleWhatsappClick('Hero CTA WhatsApp')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-base font-extrabold py-4 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Falar com Consultor Técnico no DF</span>
                </button>
                <button 
                  onClick={() => onNavigate('catalog')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-sm font-semibold py-4 px-6 rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <span>Ver Catálogo Online</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Pilares Rápidos */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-slate-700 text-left">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Estoque pronta-entrega no DF</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Técnico na sua oficina</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Faturamento no boleto PJ</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Treinamento oficial M3</span>
                </div>
              </div>

            </div>

            {/* Coluna da Direita: Quadro Nítido do Showroom Real da Athena no DF */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                
                {/* Foto Real 100% Nítida (Cores Originais, Sem Filtro Escuro) */}
                <div className="relative">
                  <img 
                    src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp"
                    alt="Centro Técnico e Showroom Athena Soluções Automotivas em Arniqueira DF" 
                    className="w-full h-64 sm:h-72 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/athena-showroom-distribuidora-df.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Showroom Real • Arniqueira / DF</span>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Venha testar nossos elevadores e ferramentas
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Localizado em Arniqueira, nosso espaço técnico conta com elevadores hidráulicos 4T montados, alinhadores e scanners para demonstração prática.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      Arniqueira, Brasília - DF
                    </span>
                    <button 
                      onClick={() => handleWhatsappClick('Card Showroom Hero')}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      Agendar Visita &rarr;
                    </button>
                  </div>
                </div>

              </div>

              {/* Box de Cotação Rápida */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                {formSent ? (
                  <div className="text-center py-2 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-900">Abrindo seu WhatsApp...</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="tel"
                      required
                      placeholder="Seu WhatsApp com DDD"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Receber Cotação
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CARROSSEL SUAVE DE MARCAS HOMOLOGADAS */}
      <section className="py-8 bg-white border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Marcas parceiras homologadas & treinamentos oficiais
          </p>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-infinite-marquee flex items-center gap-12 sm:gap-16 py-1">
          {marqueeList.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              className="flex items-center justify-center h-12 sm:h-14 px-4 shrink-0 opacity-80 hover:opacity-100 transition-opacity bg-slate-50 rounded-lg border border-slate-200/80"
              title={item.name}
            >
              <img 
                src={item.logo} 
                alt={item.name}
                className="max-h-9 sm:max-h-11 w-auto max-w-[130px] object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. AVALIAÇÕES REAIS DO GOOGLE MEU NEGÓCIO (CARROSSEL COM HOVER PAUSE) */}
      <section className="py-14 sm:py-18 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold text-amber-900">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Avaliações Verificadas no Google (Nota 5.0)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              O que dizem os clientes e parceiros da Athena no DF
            </h2>
            <p className="text-sm text-slate-600">
              Depoimentos reais postados publicamente no Google Meu Negócio por donos de oficinas.
            </p>
          </div>

        </div>

        {/* Gradientes laterais suaves para fade */}
        <div className="absolute left-0 top-32 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-32 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        {/* Marquee de Cards de Depoimento */}
        <div className="animate-reviews-marquee flex items-stretch gap-6 py-4 px-4 cursor-grab">
          {marqueeReviews.map((rev, idx) => (
            <div 
              key={`${rev.name}-${idx}`}
              className="w-[300px] sm:w-[360px] shrink-0 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 select-none"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{rev.name}</h4>
                    <p className="text-xs text-amber-800 font-medium">{rev.role} • <span className="text-slate-400 font-normal">{rev.badge}</span></p>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 italic leading-relaxed pt-1">
                  "{rev.text}"
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 text-center">
          <button 
            onClick={() => handleWhatsappClick('Secao Avaliacoes')}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Falar com quem entende da sua oficina no DF</span>
          </button>
        </div>
      </section>

      {/* 6. SETORES PRINCIPAIS DE EQUIPAMENTOS */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Soluções para sua Oficina
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
                Equipamentos em Estoque no DF
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
            >
              <span>Ver catálogo com 1.800 itens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Elevadores */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Elevadores Automotivos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Elevadores hidráulicos 4T Mahovi de 2 colunas, pantográficos tesoura de embutir e sobrepor, e mesas para baterias de veículos híbridos e elétricos (EV).
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Elevadores')}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Consultar Elevadores no WhatsApp</span>
              </button>
            </div>

            {/* Card 2: Scanners */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Scanners & Diagnóstico IA</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scanners multimarcas EAATA 90 e 360Pro com topologia de rede CAN, Thinkcar Thinktool Lite (Stärkx), programadoras de chave e osciloscópios com teste presencial.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Scanners')}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Agendar Teste na sua Oficina</span>
              </button>
            </div>

            {/* Card 3: Estética e Sigma Tools */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Químicos & Sigma Tools</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Politrizes roto-orbitais, desengraxantes pesados SGT-Mol, ceras híbridas de SiO2, boinas e carrinhos modulares Wolfcar com condições para oficina mecânica.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Sigma Tools')}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Tabela Atacado Sigma Tools</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BLOCO INSTITUCIONAL: ESPAÇO FÍSICO E ATENDIMENTO NO DF */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Atendimento Presencial
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Receba nosso consultor na sua oficina ou visite nosso showroom
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Atendemos todo o Distrito Federal e cidades do entorno com visita técnica direta, suporte pós-venda e garantia homologada.
              </p>
              
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>ST SHA Conjunto 6 Chácara 517, Loja 05 — Arniqueira, Brasília – DF (CEP 71996-413)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>(61) 98348-5671 • Consultoria Técnica Direta</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Segunda a Sexta-feira, das 8h às 18h</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] mx-auto">
                <WhatsAppIcon className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Atendimento Imediato no WhatsApp</h4>
              <p className="text-xs text-slate-600">
                Fale agora com o consultor responsável pelo atendimento a oficinas mecânicas no DF.
              </p>
              <button 
                onClick={() => handleWhatsappClick('Card Localizacao Final')}
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Conversar no WhatsApp</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FOOTER EXCLUSIVO DA LP */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          © 2026 Athena Soluções Automotivas. Todos os direitos reservados. CNPJ homologado • Brasília - DF.
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Distribuidora parceira Mahovi, EAATA, Stärkx, Sigma Tools, Delta Ferramentas e M3 Treinamentos.
        </p>
      </footer>

    </div>
  );
}