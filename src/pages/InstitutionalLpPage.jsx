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
  Quote,
  GraduationCap
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaEvent, trackMetaCustom } from '../utils/metaPixel';

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
    text: "A Athena veio para trazer soluções, se o problema é treinamento técnico ela traz, se o problema é manutenção de equipamentos ela resolve. Sou cliente, sou fã e indico a todos!",
    reply: "Que satisfação receber um depoimento como esse! Muito obrigado pela confiança em nossa equipe."
  },
  {
    name: "Wellington Gonçalves de Oliveira",
    role: "Centro de Diagnóstico Automotivo",
    badge: "Cliente Verificado",
    rating: 5,
    text: "Alta tecnologia dos equipamentos, qualidade das ferramentas e expertise fora da média nos cursos ofertados. Tudo aliado a um atendimento comercial de excelência no DF.",
    reply: "Nossa prioridade é garantir suporte técnico e produtos com garantia real para você faturar mais."
  },
  {
    name: "Jeferson Muniz",
    role: "Auto Center Especializado",
    badge: "Local Guide • 6 avaliações",
    rating: 5,
    text: "Excelente atendimento, resolveu todas as minhas demandas! Pronta-entrega de equipamentos e agilidade que faz toda a diferença.",
    reply: "Agradecemos muito pela sua avaliação e por escolher a Athena Consultoria no DF!"
  },
  {
    name: "Eldinei",
    role: "Oficina Mecânica",
    badge: "Local Guide • 26 avaliações",
    rating: 5,
    text: "Empresa parceira para toda hora. Atendimento rápido, peças de procedência e suporte técnico nota 10. Recomendo de olhos fechados!",
    reply: "Muito obrigado pelo carinho e pela parceria constante com a Athena!"
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
        "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/gemini-generated-image-v4xrowv4xrowv4xr-a9d07fc0c935.webp",
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

    const msg = encodeURIComponent(`Olá! Estou na página da Athena Distribuidora no DF e gostaria de atendimento sobre equipamentos para oficina.`);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. TOP NOTICE BAR COM DESIGN LIMPO */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-300">
              Distribuidora Oficial no DF: Pronta-entrega em Brasília, assistência técnica e faturamento PJ
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span>Showroom: Arniqueira - DF</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">(61) 98348-5671</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER DA LP (LAYOUT NONE ISOLADO) */}
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

      {/* 3. HERO SECTION COM A FOTO REAL DO SHOWROOM ATHENA NO FUNDO */}
      <section className="relative bg-white border-b border-slate-200 overflow-hidden">
        
        {/* Foto Oficial do Showroom Athena no Fundo do Header com Gradiente de Legibilidade */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp" 
            alt="Showroom Athena Distribuidora DF" 
            className="w-full h-full object-cover object-right md:object-center opacity-30 md:opacity-45"
            onError={(e) => {
              e.currentTarget.src = "/athena-showroom-distribuidora-df.jpg";
            }}
          />
          {/* Gradiente suave da esquerda para direita para garantir leitura perfeita da copy */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 md:via-white/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Coluna de Texto e Proposta de Valor */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/90 py-1.5 px-3.5 rounded-full text-xs font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Distribuidora Direta de Equipamentos para Oficinas no DF</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Equipamentos de alta performance para sua oficina, com estoque e suporte em Brasília.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Elimine o frete interestadual e a espera de semanas. Fornecemos elevadores hidráulicos de 4 toneladas, alinhadores 3D, scanners multimarcas com IA e químicos da Sigma Tools com entrega rápida e visita técnica na sua oficina.
              </p>

              {/* Pilares rápidos em destaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-700 text-left">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Pronta-entrega e estoque físico no DF</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Assistência técnica presencial</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Faturamento direto no boleto para CNPJ</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Garantia oficial e cursos M3</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button 
                  onClick={() => handleWhatsappClick('Hero CTA Principal')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-base font-bold py-3.5 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Solicitar Cotação no WhatsApp</span>
                </button>
                <button 
                  onClick={() => onNavigate('catalog')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-sm font-semibold py-3.5 px-6 rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Formulário de Captura Clean */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xl relative">
                <div className="mb-5">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-200/60">
                    Atendimento de Segunda a Sexta
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Receba uma Proposta Comercial
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Preencha para receber valores, condições de faturamento e catálogo técnico em minutos.
                  </p>
                </div>

                {formSent ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-bold text-slate-900">Solicitação Enviada!</h4>
                    <p className="text-xs text-slate-600">
                      Abrindo seu atendimento no WhatsApp agora mesmo para te enviar as melhores condições...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Carlos Silva"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp com DDD *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(61) 98765-4321"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Oficina / Auto Center (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Mecânica Silva Centro Automotivo"
                        value={leadForm.workshop}
                        onChange={(e) => setLeadForm({ ...leadForm, workshop: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Linha de Interesse</label>
                      <select 
                        value={leadForm.interest}
                        onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors"
                      >
                        <option value="Elevadores Automotivos">Elevadores Hidráulicos 4T / Tesoura Mahovi</option>
                        <option value="Scanners EAATA e Thinkcar">Scanners de Diagnóstico Avançado (EAATA / Thinkcar)</option>
                        <option value="Alinhadores 3D e Balanceadoras">Alinhamento 3D, Desmontadoras & Balanceadoras</option>
                        <option value="Produtos Químicos Sigma Tools">Linha Química Sigma Tools & Veneto (Atacado)</option>
                        <option value="Ferramentas Manuais Delta">Ferramentas Delta / Stärkx / Carrinhos Wolfcar</option>
                        <option value="Montagem Completa de Oficina">Montagem / Expansão Completa de Oficina</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold py-3.5 px-5 rounded-lg shadow-sm transition-all cursor-pointer text-sm"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Receber Cotação no WhatsApp</span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Atendimento direto e sem compromisso no DF.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CARROSSEL SUAVE DE MARCAS HOMOLOGADAS */}
      <section className="py-8 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Marcas parceiras homologadas & treinamentos oficiais
          </p>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="animate-infinite-marquee flex items-center gap-12 sm:gap-16 py-1">
          {marqueeList.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              className="flex items-center justify-center h-12 sm:h-14 px-4 shrink-0 opacity-80 hover:opacity-100 transition-opacity bg-white rounded-lg border border-slate-200 shadow-xs"
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

      {/* 5. AVALIAÇÕES REAIS DO GOOGLE MEU NEGÓCIO */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold text-amber-900">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Avaliações Verificadas no Google (Nota 5.0)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              O que dizem os clientes e parceiros da Athena no DF
            </h2>
            <p className="text-sm text-slate-600">
              Depoimentos reais de donos de oficina postados diretamente no Google Meu Negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {googleReviews.map((rev, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 p-6 sm:p-7 rounded-2xl shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{rev.name}</h4>
                      <p className="text-xs text-amber-800 font-medium">{rev.role} • <span className="text-slate-500 font-normal">{rev.badge}</span></p>
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

                <div className="bg-white border-l-4 border-amber-500 p-3.5 rounded-r-lg text-xs text-slate-600 space-y-1 shadow-xs">
                  <span className="font-bold text-slate-900 block">Resposta da Athena Consultoria:</span>
                  <p>{rev.reply}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => handleWhatsappClick('Secao Avaliacoes')}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Solicitar Atendimento no WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* 6. SETORES PRINCIPAIS DE EQUIPAMENTOS */}
      <section className="py-16 sm:py-20 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Soluções para sua Oficina
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Elevadores Automotivos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Elevadores hidráulicos 4T Mahovi de 2 colunas, modelos pantográficos tesoura de embutir e sobrepor, e mesas para baterias de veículos híbridos e elétricos (EV).
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Scanners & Diagnóstico IA</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scanners multimarcas EAATA 90 e 360Pro com topologia de rede CAN, Thinkcar Thinktool Lite (Stärkx), programadoras de chave e osciloscópios com demonstração presencial.
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
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

      {/* 7. SEÇÃO DEDICADA COM A IMAGEM ILUSTRATIVA DA OFICINA MODERNA NO FUNDO */}
      <section className="relative py-20 sm:py-28 overflow-hidden text-white border-b border-slate-800">
        
        {/* Imagem Oficina Moderna no Fundo com Overlay Cinematográfico */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/gemini-generated-image-v4xrowv4xrowv4xr-a9d07fc0c935.webp" 
            alt="Centro Técnico e Oficina Moderna Athena DF" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = "/hero-banner-oficina-df.webp";
            }}
          />
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <span className="inline-block bg-amber-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-md">
                Espaço Físico & Centro Técnico no DF
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Venha conhecer o Showroom da Athena em Arniqueira
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Teste elevadores, scanners e ferramentas especiais em operação real antes de tomar sua decisão. Nosso centro técnico está à sua disposição de segunda a sexta.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-200">
                <div className="flex items-start gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>ST SHA Conjunto 6 Chácara 517, Loja 05 — Arniqueira, Brasília – DF</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>(61) 98348-5671 • Consultoria Direta</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Segunda a Sexta, das 8h às 18h</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right">
              <button 
                onClick={() => handleWhatsappClick('CTA Showroom Fundo')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold py-4 px-8 rounded-xl shadow-xl transition-all cursor-pointer text-sm"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" />
                <span>Agendar Visita no Showroom</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 8. OS 4 PILARES DA DISTRIBUIDORA LOCAL */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Por que comprar localmente
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Vantagens diretas para sua oficina em Brasília e Entorno
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-amber-400 transition-all">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Pronta-Entrega no DF</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estoque físico para envio rápido no SIA, Taguatinga, Ceilândia, Plano Piloto, Gama e cidades vizinhas.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-emerald-400 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Visita na sua Oficina</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipe técnica presencial para demonstração de scanners, instalação de elevadores e aferição de alinhadores.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-sky-400 transition-all">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Faturamento Direto PJ</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Condições no boleto para CNPJ, opções de parcelamento facilitado e desconto especial para compra à vista.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-purple-400 transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Cursos e Capacitação M3</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acesso aos treinamentos presenciais da M3 para sua equipe extrair o máximo potencial dos equipamentos adquiridos.
            </p>
          </div>

        </div>
      </section>

      {/* 9. FOOTER EXCLUSIVO DA LP */}
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