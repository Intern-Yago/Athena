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
  Award,
  ArrowRight,
  Star,
  Quote,
  Check,
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
    role: "Cliente & Proprietário de Oficina",
    badge: "Local Guide • 177 avaliações",
    rating: 5,
    text: "A Athena veio para trazer soluções, se o problema é treinamento técnico ela traz, se o problema é manutenção de equipamentos ela resolve. Sou cliente, sou fã e indico a todos!",
    reply: "Que satisfação receber um depoimento como esse! Muito obrigado pela confiança em nossa equipe."
  },
  {
    name: "Wellington Gonçalves de Oliveira",
    role: "Especialista em Diagnóstico Automotivo",
    badge: "Cliente Verificado no DF",
    rating: 5,
    text: "Alta tecnologia dos equipamentos, qualidade das ferramentas e expertise fora da média nos cursos ofertados. Tudo aliado a um atendimento comercial de excelência no DF.",
    reply: "Nossa prioridade é garantir suporte técnico e produtos com garantia real para você faturar mais."
  },
  {
    name: "Jeferson Muniz",
    role: "Diretor de Centro Automotivo",
    badge: "Local Guide • 6 avaliações",
    rating: 5,
    text: "Excelente atendimento, resolveu todas as minhas demandas! Pronta-entrega de equipamentos e agilidade que faz toda a diferença.",
    reply: "Agradecemos muito pela sua avaliação e por escolher a Athena Consultoria no DF!"
  },
  {
    name: "Eldinei",
    role: "Mecânica Automotiva",
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
    interest: 'Elevadores Automotivos 4T'
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Athena Distribuidora | Equipamentos Automotivos em Brasília e DF',
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

  // Marcas oficiais parceiras - logos limpos
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-amber-500 text-slate-950 text-xs font-black py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
            <span>
              ⚡ DISTRIBUIDORA AUTORIZADA NO DF • PRONTA-ENTREGA, VISITA TÉCNICA E FATURAMENTO DIRETO PJ
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-900 font-bold">
            <span>Showroom: Arniqueira - DF</span>
            <span>•</span>
            <span>(61) 98348-5671</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER DA LP (LAYOUT EXCLUSIVO / ISOLADO) */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img 
              src="/athena-consultoria-logo-df.jpg" 
              alt="Athena Soluções Automotivas DF" 
              className="h-10 sm:h-12 w-auto rounded-xl object-contain shadow-xs border border-slate-700" 
            />
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-none">
                ATHENA
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block mt-0.5">
                Soluções Automotivas • Brasília
              </span>
            </div>
          </div>

          <button 
            onClick={() => handleWhatsappClick('Header')}
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs sm:text-sm py-2.5 px-4 sm:px-6 rounded-full shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Falar com Consultor</span>
          </button>

        </div>
      </header>

      {/* 3. HERO SECTION COM BANNER E FOTO REAL DO SHOWROOM ATHENA */}
      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden border-b border-slate-800">
        
        {/* Imagem de Fundo com Overlay Cinematográfico */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp"
            alt="Showroom Athena Distribuidora DF"
            className="w-full h-full object-cover filter blur-[2px] opacity-15 scale-105"
            onError={(e) => {
              e.currentTarget.src = "/athena-showroom-distribuidora-df.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          
          {/* Top Bar no Hero com Selo Google 5.0 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-800">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 py-1.5 px-3.5 rounded-full text-xs font-bold text-amber-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Distribuidora Oficial & Centro Técnico no Distrito Federal</span>
            </div>

            {/* Google Rating Badge */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700 px-3.5 py-1.5 rounded-full shadow-md">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-white">5.0 no Google</span>
              <span className="text-[11px] text-slate-400">• Avaliações Reais de Oficinas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Texto de Apresentação e Foto Real */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Equipamentos de oficina direto da fábrica, com estoque e suporte <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">em Brasília</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Chega de fretes abusivos ou semanas esperando envio. A Athena fornece elevadores de 4 toneladas, alinhadores 3D, scanners multimarcas com IA e químicos da Sigma Tools com <strong>pronta-entrega no DF, técnico presencial e faturamento PJ</strong>.
              </p>

              {/* Foto Real do Showroom / Centro Técnico da Athena */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl group">
                <img 
                  src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp"
                  alt="Showroom e Centro Técnico Athena Soluções Automotivas Brasília DF" 
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/athena-showroom-distribuidora-df.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-5">
                  <div className="text-white text-left">
                    <span className="inline-block bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm mb-1">
                      Showroom Real • Arniqueira / DF
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-100">
                      Venha conhecer nosso estoque e testar elevadores, ferramentas e scanners em funcionamento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
                <button 
                  onClick={() => handleWhatsappClick('Hero CTA')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-base font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Falar com Especialista Técnico</span>
                </button>
                <button 
                  onClick={() => onNavigate('catalog')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold py-4 px-6 rounded-2xl border border-slate-700 transition-all cursor-pointer"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Formulário de Captura / Cotação */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950/90 border-2 border-amber-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative">
                <div className="mb-5">
                  <span className="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    Atendimento Imediato no DF
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Solicite uma Proposta Direta da Distribuidora
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Preencha para receber valores, prazos de entrega e condições especiais de faturamento PJ.
                  </p>
                </div>

                {formSent ? (
                  <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h4 className="text-base font-black text-white">Solicitação Recebida!</h4>
                    <p className="text-xs text-slate-300">
                      Abrindo seu atendimento no WhatsApp para que o consultor técnico te envie as condições com prioridade...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Seu Nome *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Carlos Silva"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp com DDD *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(61) 98765-4321"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Oficina / Auto Center (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Mecânica Silva Centro Automotivo"
                        value={leadForm.workshop}
                        onChange={(e) => setLeadForm({ ...leadForm, workshop: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">O que sua oficina está precisando?</label>
                      <select 
                        value={leadForm.interest}
                        onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                      >
                        <option value="Elevadores Automotivos 4T">Elevadores Hidráulicos 4T / Tesoura Mahovi</option>
                        <option value="Scanners EAATA e Thinkcar">Scanners de Diagnóstico Avançado (EAATA / Thinkcar)</option>
                        <option value="Alinhadores 3D e Balanceadoras">Alinhamento 3D, Desmontadoras & Balanceadoras</option>
                        <option value="Produtos Químicos Sigma Tools">Linha Química Sigma Tools & Veneto (Atacado)</option>
                        <option value="Ferramentas Manuais Delta">Ferramentas Delta / Stärkx / Carrinhos Wolfcar</option>
                        <option value="Montagem Completa de Oficina">Montagem / Expansão Completa de Oficina</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black py-3.5 px-5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer text-sm"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Receber Cotação e Condições no WhatsApp</span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Atendimento técnico sem compromisso no DF.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CARROSSEL SUAVE DE MARCAS PARCEIRAS */}
      <section className="py-8 bg-slate-950 border-b border-slate-800 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center mb-5">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Marcas parceiras homologadas & treinamentos oficiais
          </p>
        </div>

        {/* Gradientes laterais para acabamento de cinema */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="animate-infinite-marquee flex items-center gap-12 sm:gap-16 py-1">
          {marqueeList.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              className="flex items-center justify-center h-12 sm:h-14 px-4 shrink-0 opacity-80 hover:opacity-100 transition-opacity bg-slate-900/60 rounded-xl border border-slate-800"
              title={item.name}
            >
              <img 
                src={item.logo} 
                alt={item.name}
                className="max-h-9 sm:max-h-11 w-auto max-w-[130px] object-contain filter brightness-95" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. AVALIAÇÕES REAIS DO GOOGLE (PROVA SOCIAL COM CARDS RICOS) */}
      <section className="py-16 sm:py-24 bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Avaliações Reais de Oficinas no Google</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              O que dizem os donos de oficina que trabalham com a Athena
            </h2>
            <p className="text-sm text-slate-400">
              Depoimentos públicos e verificados postados diretamente em nosso perfil oficial no Google Meu Negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {googleReviews.map((rev, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 border border-slate-800 p-6 sm:p-7 rounded-3xl shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-white">{rev.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold">{rev.role} • <span className="text-slate-400 font-normal">{rev.badge}</span></p>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 italic leading-relaxed pt-1">
                    "{rev.text}"
                  </p>
                </div>

                {/* Resposta do Proprietário Athena */}
                <div className="bg-slate-950/80 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-white block">Resposta da Athena Consultoria:</span>
                  <p>{rev.reply}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => handleWhatsappClick('Secao Avaliacoes')}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs sm:text-sm py-3.5 px-7 rounded-full shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Falar com o time que conquistou 5 estrelas no DF</span>
            </button>
          </div>

        </div>
      </section>

      {/* 6. GALERIA VISUAL DE LINHAS DE PRODUTOS COM FOTOS REAIS */}
      <section className="py-16 sm:py-24 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Fotos Reais & Linhas em Estoque
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                Equipamentos em Pronta-Entrega no DF
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explorar todo o catálogo técnico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Elevadores Mahovi com Foto */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-mahovi-mah4001-39c759f2a2a7.webp" 
                  alt="Elevadores Automotivos Mahovi Brasília DF" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  Pronta Entrega no DF
                </div>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Elevadores Hidráulicos 4T</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Modelos de 2 colunas Mahovi MAH-4001 com trava mecânica dupla, pantográficos tesoura e mesas para baterias de híbridos/elétricos.
                  </p>
                </div>
                <button 
                  onClick={() => handleWhatsappClick('Linha Elevadores')}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Consultar Valores e Entrega</span>
                </button>
              </div>
            </div>

            {/* Card 2: Scanners EAATA e Diagnóstico com Foto */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-eaata90-topologia-autentico-d13f3e1e068e.webp" 
                  alt="Scanners Automotivos EAATA e Thinkcar Brasília DF" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  Demonstração Presencial
                </div>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Scanners & Diagnóstico IA</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Scanners multimarcas EAATA 90 e 360Pro com topologia de rede CAN em tempo real, programadores de chave e linha Thinkcar Thinktool Lite.
                  </p>
                </div>
                <button 
                  onClick={() => handleWhatsappClick('Linha Scanners')}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Agendar Teste na sua Oficina</span>
                </button>
              </div>
            </div>

            {/* Card 3: Estética, Sigma Tools e Mobiliário com Foto */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/uploads/blog-cover-box-produtividade-wolfcar-sigma-ttk-c964333a4775.webp" 
                  alt="Mobiliário Wolfcar e Químicos Sigma Tools Brasília DF" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-sky-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  Preço de Distribuidora
                </div>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Químicos & Sigma Tools</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Politrizes roto-orbitais, desengraxantes concentrados SGT-Mol, ceras híbridas SiO2 e mobiliário técnico Wolfcar para organização de box.
                  </p>
                </div>
                <button 
                  onClick={() => handleWhatsappClick('Linha Sigma Tools')}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Baixar Tabela com Descontos</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. OS 4 PILARES DA ATHENA NO DISTRITO FEDERAL */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
            Diferenciais Exclusivos
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Por que mais oficinas no DF preferem comprar com a Athena?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Estrutura criada especificamente para que a sua oficina não perca um único dia de faturamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Pronta-Entrega no DF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estoque físico no Distrito Federal para entrega rápida no SIA, Taguatinga, Ceilândia, Plano Piloto e entorno.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Assistência Presencial</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipe técnica que vai até a sua oficina orientar a instalação, aferir alinhadores e tirar dúvidas da equipe.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-sky-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Faturamento Direto PJ</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Condições no boleto para CNPJ, parcelamento facilitado e descontos diferenciados para pagamento à vista.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Capacitação Oficial M3</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parceria com a M3 Treinamentos para capacitar seus colaboradores nos equipamentos e diagnósticos modernos.
            </p>
          </div>

        </div>
      </section>

      {/* 8. SEDE E LOCALIZAÇÃO NO DF COM SHOWROOM */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
              Sede e Atendimento Presencial
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Venha conhecer nosso showroom ou receba nosso consultor na sua oficina
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Atendemos todo o Distrito Federal e cidades do entorno com agilidade comercial e compromisso técnico com o seu negócio.
            </p>
            
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>ST SHA Conjunto 6 Chácara 517, Loja 05 — Arniqueira, Brasília – DF</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>(61) 98348-5671 • Atendimento Comercial Direto</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Segunda a Sexta, das 8h às 18h</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <WhatsAppIcon className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">Negocie Agora no WhatsApp</h4>
            <p className="text-xs text-slate-400">
              Fale diretamente com nossa equipe comercial no DF para receber orçamentos e prazos.
            </p>
            <button 
              onClick={() => handleWhatsappClick('Card Localizacao Final')}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-950/40 transition-all cursor-pointer text-sm"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Falar com a Athena no WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* 9. FOOTER EXCLUSIVO DA LP */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">
          © 2026 Athena Soluções Automotivas. Todos os direitos reservados. CNPJ homologado • Brasília - DF.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Distribuidora homologada Mahovi, EAATA, Stärkx, Sigma Tools, Delta Ferramentas e parceira oficial M3 Treinamentos.
        </p>
      </footer>

    </div>
  );
}