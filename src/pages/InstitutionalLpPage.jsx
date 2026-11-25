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
  Building2,
  FileText
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaEvent, trackMetaCustom } from '../utils/metaPixel';

// Ícone Oficial SVG do WhatsApp
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.507 14.307l-.009.075c-.338-.169-2.001-.988-2.313-1.101-.311-.113-.538-.169-.764.17-.226.339-.878 1.102-1.077 1.328-.198.226-.396.254-.734.085-.339-.17-1.428-.527-2.721-1.68-1.006-.897-1.686-2.005-1.884-2.344-.198-.339-.021-.522.149-.691.153-.152.339-.395.508-.593.17-.198.226-.339.339-.565.113-.226.056-.424-.028-.593-.085-.17-.763-1.837-1.046-2.516-.275-.66-.554-.57-.763-.58l-.65-.011c-.226 0-.593.085-.904.424-.311.339-1.186 1.159-1.186 2.827s1.215 3.279 1.384 3.505c.17.226 2.391 3.652 5.793 5.122.809.35 1.441.559 1.934.716.814.258 1.554.222 2.139.135.652-.097 2.001-.818 2.284-1.609.283-.79.283-1.468.198-1.609-.085-.141-.311-.226-.65-.395zM12.012 21.84c-1.782 0-3.528-.48-5.062-1.389l-.363-.215-3.763.987 1.005-3.668-.236-.375a9.852 9.852 0 01-1.512-5.26c0-5.467 4.449-9.916 9.923-9.916 2.648 0 5.138 1.031 7.009 2.904a9.866 9.866 0 012.898 7.014c0 5.468-4.448 9.918-9.898 9.918zm0-19.84c-6.561 0-11.902 5.34-11.902 11.902 0 2.093.546 4.14 1.583 5.938l-1.681 6.139 6.284-1.648a11.874 11.874 0 005.716 1.469c6.562 0 11.902-5.34 11.902-11.9c0-3.18-1.238-6.168-3.487-8.417A11.82 11.82 0 0012.012 2z"/>
    </svg>
  );
}

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
        "image": "https://www.athenaconsultoria.com.br/athena-consultoria-logo-df.jpg",
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

    const msg = encodeURIComponent(`Olá! Estou na página da Athena Distribuidora no DF e gostaria de atendimento sobre equipamentos automotivos.`);
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
      `Olá! Meu nome é ${leadForm.name}${leadForm.workshop ? ` da oficina ${leadForm.workshop}` : ''}.\nEstou no DF e quero saber mais sobre: *${leadForm.interest}*.\nMeu WhatsApp: ${leadForm.phone}.`
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. TOP BAR MINIMALISTA */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span className="font-semibold text-slate-200">
              Distribuidora Oficial no DF: Pronta-entrega em Brasília, suporte presencial e faturamento PJ
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span>Brasília • SIA • Taguatinga • Ceilândia</span>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-amber-400">(61) 98348-5671</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER "LAYOUT NONE" (ISOLADO E LIMPO) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo Athena */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('catalog')}>
            <img 
              src="/athena-consultoria-logo-df.jpg" 
              alt="Athena Soluções Automotivas DF" 
              className="h-10 sm:h-12 w-auto rounded-xl object-contain shadow-xs border border-slate-100" 
            />
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
                ATHENA
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest block mt-0.5">
                Soluções Automotivas • DF
              </span>
            </div>
          </div>

          {/* Botão Oficial WhatsApp Header */}
          <button 
            onClick={() => handleWhatsappClick('Header')}
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 sm:px-6 rounded-full shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span>Falar no WhatsApp</span>
          </button>

        </div>
      </header>

      {/* 3. HERO SECTION - CLARA, DIRETA E COM FORMULÁRIO DE CAPTURA RÁPIDA */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 overflow-hidden">
        
        {/* Detalhe de fundo suave */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Texto de Apresentação */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 py-1 px-3.5 rounded-full text-xs font-bold text-amber-800">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Distribuidora Direta de Equipamentos para Oficinas no DF
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Equipamentos de oficina direto da fábrica, com estoque e suporte <span className="text-amber-600 underline decoration-amber-300 decoration-wavy underline-offset-4">aqui em Brasília</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Sem dor de cabeça com fretes caros ou semanas de espera. Atendemos mecânicas, auto centers e centros de estética em todo o DF com entrega imediata, faturamento para CNPJ e visita técnica presencial.
            </p>

            {/* Diferenciais em Pílulas Limpas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-700 text-left">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Estoque pronta-entrega no DF</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Técnico presencial na sua oficina</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Faturamento direto no boleto PJ</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Garantia com suporte local homologado</span>
              </div>
            </div>

            {/* Botão de Ação Direta */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button 
                onClick={() => handleWhatsappClick('Hero CTA')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-base font-extrabold py-3.5 px-7 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                <span>Solicitar Cotação no WhatsApp</span>
              </button>

              <button 
                onClick={() => onNavigate('catalog')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-bold py-3.5 px-6 rounded-2xl border border-slate-300 transition-all cursor-pointer shadow-xs"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Card / Formulário de Conversão Rápida */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl relative">
              <div className="mb-5">
                <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-200/60">
                  Resposta rápida de Segunda a Sexta
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Receba uma proposta para a sua oficina
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Preencha em 20 segundos para receber valores, prazos e condições comerciais de distribuidora.
                </p>
              </div>

              {formSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-extrabold text-slate-900">Solicitação Enviada!</h4>
                  <p className="text-xs text-slate-600">
                    Abrindo a conversa no WhatsApp para que o consultor técnico te envie as condições com prioridade...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Carlos Silva"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp com DDD *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="(61) 98765-4321"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Oficina / Auto Center (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Auto Mecânica Planalto"
                      value={leadForm.workshop}
                      onChange={(e) => setLeadForm({ ...leadForm, workshop: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">O que sua oficina está precisando?</label>
                    <select 
                      value={leadForm.interest}
                      onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors"
                    >
                      <option value="Elevadores Automotivos">Elevadores Automotivos 4T / Tesoura</option>
                      <option value="Alinhamento 3D e Balanceadoras">Alinhador 3D, Desmontadoras & Balanceadoras</option>
                      <option value="Scanners EAATA e Thinkcar">Scanners de Diagnóstico Avançado</option>
                      <option value="Produtos Químicos Sigma Tools">Linha Química Sigma Tools & Estética</option>
                      <option value="Ferramentas Manuais e Especiais">Ferramentas Delta / Stärkx / Carrinhos</option>
                      <option value="Equipar Oficina Completa">Montagem ou Reforma Completa de Oficina</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Receber Cotação pelo WhatsApp</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Contato 100% seguro. Não enviamos spam.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 4. CARROSSEL INFINITO DE MARCAS: LIMPO, LENTO E ELEGANTE (SEM TEXTOS INÚTEIS) */}
      <section className="py-10 bg-white border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Marcas parceiras homologadas & treinamentos oficiais
          </p>
        </div>

        {/* Gradientes laterais suaves para fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-infinite-marquee flex items-center gap-12 sm:gap-16 py-1">
          {marqueeList.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              className="flex items-center justify-center h-14 sm:h-16 px-4 shrink-0 transition-opacity opacity-85 hover:opacity-100"
              title={item.name}
            >
              <img 
                src={item.logo} 
                alt={item.name}
                className="max-h-10 sm:max-h-12 w-auto max-w-[140px] object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. OS 4 PILARES DA ATHENA NO DISTRITO FEDERAL */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            Vantagens de comprar localmente
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Por que oficinas do DF preferem comprar com a Athena?
          </h2>
          <p className="text-sm text-slate-600">
            Oficina não pode ficar com rampa vazia ou carro travado por falta de equipamento ou peça de reposição.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-3 hover:border-amber-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Entrega Rápida no DF</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipamentos com estoque local para entrega ágil no SIA, Taguatinga, Ceilândia, Plano Piloto e cidades vizinhas.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-3 hover:border-emerald-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Técnico na sua Oficina</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instalação, aferição de alinhadores e demonstração técnica do scanner feitas presencialmente na sua equipe.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-3 hover:border-sky-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Faturamento Direto PJ</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Condições para CNPJ com nota fiscal, opções de parcelamento facilitado e desconto especial para compra à vista via PIX.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-3 hover:border-purple-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Garantia e Peças Oficiais</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Distribuição autorizada com garantia de fábrica e acesso fácil a peças de reposição e treinamentos técnicos.
            </p>
          </div>

        </div>
      </section>

      {/* 6. SETORES PRINCIPAIS DE EQUIPAMENTOS */}
      <section className="py-14 sm:py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
                Linhas em Estoque
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
                Principais Soluções para sua Oficina
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Ver todos os 1.800 produtos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Elevadores e Pesados */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Elevadores Automotivos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Elevadores hidráulicos 4T Mahovi de 2 colunas, modelos pantográficos tesoura de sobrepor e embutir, além de mesas para baterias de veículos elétricos e híbridos.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Card Elevadores')}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Consultar Modelos no WhatsApp</span>
              </button>
            </div>

            {/* Card 2: Scanners e Diagnóstico */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Scanners & Diagnóstico IA</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scanners multimarcas EAATA 90 e 360Pro com topologia de rede CAN, Thinkcar Thinktool Lite (Stärkx), osciloscópios e programadores de ECU e chaves.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Card Scanners')}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Agendar Demonstração</span>
              </button>
            </div>

            {/* Card 3: Estética e Sigma Tools */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Químicos & Sigma Tools</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Linha oficial Sigma Tools e Veneto: politrizes roto-orbitais, desengraxantes concentrados, ceras híbridas de SiO2, tornadores e boinas profissionais com preço de atacado.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Card Sigma Tools')}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Tabela de Químicos no WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. LOCALIZAÇÃO E CONTATO DIRETO EM BRASÍLIA */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              Sede e Atendimento Presencial
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Visite nosso espaço ou receba um consultor na sua oficina
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Atendemos todo o Distrito Federal e entorno com suporte consultivo e foco em produtividade real para o seu negócio.
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
              <WhatsAppIcon className="w-7 h-7 fill-[#25D366]" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Prefere tirar dúvidas agora?</h4>
            <p className="text-xs text-slate-600">
              Converse diretamente com o consultor responsável pelo atendimento a oficinas no DF.
            </p>
            <button 
              onClick={() => handleWhatsappClick('Card Localizacao')}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              <span>Conversar com a Athena no WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* 8. FOOTER LIMPO */}
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