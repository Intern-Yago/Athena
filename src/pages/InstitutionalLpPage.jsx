import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Wrench, 
  CreditCard, 
  CheckCircle2, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  Cpu,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaEvent, trackMetaCustom } from '../utils/metaPixel';

export default function InstitutionalLpPage({ onNavigate, brands = [] }) {
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    workshop: '',
    interest: 'Elevadores & Maquinário Pesado'
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Athena Distribuidora de Equipamentos Automotivos em Brasília e DF',
      description: 'Distribuidora oficial de elevadores automotivos, scanners de diagnóstico IA, ferramentas especiais e químicos no DF. Pronta-entrega e assistência presencial.',
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
        "description": "Distribuidora oficial de equipamentos automotivos no Distrito Federal: Mahovi, EAATA, Stärkx, Sigma Tools, Delta e M3 Treinamentos."
      }
    });

    trackMetaCustom('ViewInstitutionalLp', {
      secao: 'Landing Page Oficial Distribuidora DF',
      descricao: 'Visualizou a Landing Page Institucional de Alta Conversão no DF'
    });
  }, []);

  const handleWhatsappClick = (origem) => {
    trackMetaEvent('Contact', {
      content_name: `WhatsApp Direto - ${origem}`,
      secao: 'LP Distribuidora DF',
      descricao: `Clicou para iniciar atendimento no WhatsApp (${origem})`
    });

    const msg = encodeURIComponent(`Olá! Vim pela página da Athena Distribuidora no DF e gostaria de falar com um consultor técnico sobre equipamentos para minha oficina.`);
    window.open(`https://wa.me/5561983485671?text=${msg}`, '_blank');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    trackMetaEvent('Lead', {
      content_name: `Formulário LP Distribuidora - ${leadForm.interest}`,
      user_name: leadForm.name,
      user_phone: leadForm.phone,
      workshop_name: leadForm.workshop,
      interest: leadForm.interest,
      secao: 'LP Distribuidora DF'
    });

    setFormSent(true);

    const msg = encodeURIComponent(
      `Olá! Me chamo ${leadForm.name} ${leadForm.workshop ? `da oficina ${leadForm.workshop}` : ''}.\nTenho interesse em: *${leadForm.interest}*.\nMeu contato: ${leadForm.phone}.\nGostaria de receber uma cotação e proposta!`
    );
    setTimeout(() => {
      window.open(`https://wa.me/5561983485671?text=${msg}`, '_blank');
    }, 400);
  };

  // Marcas oficiais para o Carrossel Infinito (Marquee)
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

  // Duplicamos a lista para gerar o loop infinito suave sem cortes
  const marqueeList = [...marqueeBrands, ...marqueeBrands];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-2 px-4 text-center text-xs sm:text-sm font-black tracking-wide shadow-md">
        ⚡ DISTRIBUIDORA AUTORIZADA NO DISTRITO FEDERAL & ENTORNO • PRONTA-ENTREGA & VISITA TÉCNICA PRESENCIAL
      </div>

      {/* 2. MINIMALIST HIGH-TRUST HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('catalog')}>
            <img 
              src="/athena-consultoria-logo-df.jpg" 
              alt="Athena Distribuidora de Equipamentos Automotivos Brasília DF" 
              className="h-10 sm:h-12 w-auto rounded-xl object-contain shadow-xs border border-slate-700/50" 
            />
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-none">
                ATHENA
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block mt-0.5">
                Soluções Automotivas DF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleWhatsappClick('Header')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black py-2.5 px-4 sm:px-5 rounded-2xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp do Consultor</span>
              <span className="sm:hidden">Consultor</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION COM PROPOSTA DE VALOR CLARA & FORMULÁRIO RÁPIDO */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
        {/* Glow Effects de fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Coluna da Esquerda: Copy Persuasiva */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 py-1.5 px-3.5 rounded-full text-xs font-bold text-amber-400 shadow-inner">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Distribuidora Nº 1 em Tecnologia Automotiva no DF
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Tudo o que sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Oficina Mecânica</span> precisa, direto da Distribuidora em Brasília.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Chega de pagar fretes abusivos, esperar semanas pelo envio e ficar sem suporte técnico. A <strong>Athena</strong> fornece elevadores de 4 toneladas, scanners com Inteligência Artificial, ferramentas especiais e químicos da Sigma Tools com <strong>pronta-entrega no DF e visita presencial</strong>.
            </p>

            {/* Checklist de Benefícios Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-200 text-left">
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pronta entrega e estoque no DF</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Assistência técnica presencial</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Faturamento direto para CNPJ</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Treinamento e capacitação profissional</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
              <button 
                onClick={() => handleWhatsappClick('Hero CTA')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-base font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all cursor-pointer animate-pulse"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Falar com Especialista Técnico
              </button>
              <button 
                onClick={() => onNavigate('catalog')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold py-4 px-6 rounded-2xl border border-slate-800 transition-all cursor-pointer"
              >
                Ver Catálogo de 1.800 Itens
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Coluna da Direita: Card / Formulário de Conversão Direta */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border-2 border-amber-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative">
              <div className="absolute -top-3.5 right-6 bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                Atendimento Imediato
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-1">
                Solicite uma Proposta no DF
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Receba cotação com condições de faturamento, prazos de entrega e catálogo técnico em minutos.
              </p>

              {formSent ? (
                <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-black text-white">Solicitação Recebida!</h4>
                  <p className="text-xs text-slate-300">
                    Estamos abrindo seu atendimento no WhatsApp agora mesmo para te enviar as melhores condições...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Seu Nome / Responsável *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Carlos Silva"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
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
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Oficina / Auto Center (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Mecânica Silva Centro Automotivo"
                      value={leadForm.workshop}
                      onChange={(e) => setLeadForm({ ...leadForm, workshop: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Linha de Interesse Principal</label>
                    <select 
                      value={leadForm.interest}
                      onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                    >
                      <option value="Elevadores & Maquinário Pesado">Elevadores Automotivos 4T / Pantográficos</option>
                      <option value="Scanners & Diagnóstico EAATA">Scanners de Diagnóstico Avançado (EAATA / Thinkcar)</option>
                      <option value="Alinhadores 3D e Balanceadoras">Alinhamento 3D, Desmontadoras & Balanceadoras</option>
                      <option value="Linha Química Sigma Tools">Produtos Químicos Sigma Tools & Estética</option>
                      <option value="Ferramentas Especiais Delta">Ferramentas Especiais & Manuais (Delta / Stärkx)</option>
                      <option value="Equipamento Completo para Oficina">Montagem / Renovação Completa de Oficina</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer text-sm"
                  >
                    Receber Cotação e Condições no WhatsApp
                  </button>

                  <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Seus dados estão protegidos. Resposta ágil de Segunda a Sexta.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 4. INFINITE MARQUEE: AS MAIORES MARCAS MUNDIAIS APOIAM A ATHENA */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800/80 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center mb-8">
          <p className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest">
            Marcas Parceiras Homologadas & Treinamentos Oficiais
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Garantia de Fábrica, Tecnologia de Ponta e Suporte Homologado
          </h3>
        </div>

        {/* Efeito de Fade nas bordas laterais para acabamento de cinema */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="animate-infinite-marquee flex items-center gap-8 sm:gap-12 py-2">
          {marqueeList.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              className="flex items-center gap-3.5 bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 py-3 px-6 rounded-2xl shrink-0 transition-all hover:scale-105 shadow-md"
            >
              <img 
                src={item.logo} 
                alt={`${item.name} Athena Consultoria Automotiva Brasília`}
                className="h-9 sm:h-11 w-auto max-w-[120px] object-contain filter brightness-95" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xs sm:text-sm font-extrabold text-slate-200 whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OS 4 PILARES DA DISTRIBUIDORA ATHENA NO DF */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
            Diferenciais Exclusivos Athena
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Por que mais de 1.800 oficinas no DF compram com a Athena?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Nós entendemos que equipamento parado é prejuízo na certa. Estruturamos nossa operação para atender você com agilidade local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Pronta-Entrega no DF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estoque físico no Distrito Federal para entrega rápida no SIA, Taguatinga, Ceilândia, Asa Norte/Sul e entorno. Sem semanas de espera.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Assistência Presencial</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipe técnica própria para orientar na instalação, calibragem de alinhadores 3D e suporte de diagnóstico direto na sua oficina.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Faturamento & Financiamento</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Condições comerciais direto de distribuidora: faturamento PJ, parcelamento facilitado e descontos expressivos para pagamento à vista via PIX.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Homologação Oficial</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Todos os equipamentos acompanham nota fiscal oficial, garantia de fábrica de 6 a 12 meses e acesso direto a peças de reposição genuínas.
            </p>
          </div>
        </div>
      </section>

      {/* 6. VITRINE DE LINHAS DE PRODUTOS PRINCIPAIS */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                Soluções Completas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Conheça os Principais Setores Atendidos
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Explorar Catálogo com Preços
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Elevadores */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Elevadores Automotivos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Elevadores hidráulicos de 2 colunas 4T Mahovi, pantográficos tesoura de embutir e sobrepor, e mesas para baterias de carros híbridos e elétricos (EV).
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Elevadores')}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                Cotação de Elevadores no WhatsApp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Scanners */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Scanners & Diagnóstico IA</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scanners multimarcas EAATA 90 e 360Pro com topologia de rede CAN, Thinkcar Thinktool Lite (Stärkx), programadoras de chave e osciloscópios.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Scanners')}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                Cotação de Scanners no WhatsApp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Estética e Sigma */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Estética & Sigma Tools</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Politrizes roto orbitais, compostos ÚNICO Veneto, ceras híbridas SiO2, desengraxantes pesados SGT-Mol, tornadores e boinas profissionais.
                </p>
              </div>
              <button 
                onClick={() => handleWhatsappClick('Linha Estetica')}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                Tabela Sigma Tools no WhatsApp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. LOCALIZAÇÃO E CONTATO LOCAL DF */}
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
              Atendemos todo o Distrito Federal e entorno com agilidade comercial e compromisso técnico com o seu negócio.
            </p>
            
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>ST SHA Conjunto 6 Chácara 517, Loja 05 — Arniqueira, Brasília – DF</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>(61) 98348-5671 • Atendimento Comercial Direto</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Segunda a Sexta, das 8h às 18h</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/80 p-8 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <MessageCircle className="w-8 h-8 fill-emerald-400" />
            </div>
            <h4 className="text-lg font-black text-white">Negocie Agora no WhatsApp</h4>
            <p className="text-xs text-slate-400">
              Clique abaixo para iniciar seu atendimento prioritário direto com nossa equipe no DF.
            </p>
            <button 
              onClick={() => handleWhatsappClick('Card Localizacao')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-950/40 transition-all cursor-pointer text-sm"
            >
              Falar com a Athena no WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER LIMPO E RÁPIDO */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Athena Soluções Automotivas. Todos os direitos reservados. CNPJ homologado • Brasília - DF.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Distribuidora autorizada Mahovi, EAATA, Stärkx, Sigma Tools, Delta Ferramentas e parceira M3 Treinamentos.
        </p>
      </footer>

    </div>
  );
}
