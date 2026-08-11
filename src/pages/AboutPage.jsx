import React from 'react';
import { Shield, Wrench, Award, Truck, CheckCircle2, PhoneCall, Mail, MapPin, Instagram, Sparkles, Building2, Users, Star, ArrowRight, Check } from 'lucide-react';

export default function AboutPage() {
  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+conhecer+mais+sobre+a+empresa.";
  const instagramUrl = "https://www.instagram.com/athena.solucoes.automotivas/";

  return (
    <div className="py-12 space-y-20">
      
      {/* 1. Hero Landing Section */}
      <section className="container-custom">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> ATHENA SOLUÇÕES AUTOMOTIVAS
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Excelência Tecnológica em <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Equipamentos de Oficina</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
              Somos parceiros estratégicos de centros automotivos e concessionárias. Fornecemos elevadores hidráulicos, scanners de diagnóstico com Inteligência Artificial, alinhadores 3D e ferramentas de ponta com suporte técnico qualificado.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs sm:text-sm py-3.5 px-7 shadow-xl font-extrabold"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Falar com Nossos Especialistas</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700 text-xs sm:text-sm py-3.5 px-6 font-bold"
              >
                <Instagram className="w-4 h-4 text-amber-400" />
                <span>@athena.solucoes.automotivas</span>
              </a>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 hidden lg:block pointer-events-none">
            <Shield className="w-96 h-96 text-amber-400" />
          </div>
        </div>
      </section>

      {/* 2. Key Metrics & Authority Counters */}
      <section className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-display block">+1.500</span>
            <span className="text-xs font-bold text-slate-900 block">Oficinas Atendidas</span>
            <span className="text-[11px] text-slate-500">Em todo o território nacional</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-display block">100%</span>
            <span className="text-xs font-bold text-slate-900 block">Produtos Homologados</span>
            <span className="text-[11px] text-slate-500">Com garantia oficial de fábrica</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-display block">24h</span>
            <span className="text-xs font-bold text-slate-900 block">Atendimento Rápido</span>
            <span className="text-[11px] text-slate-500">Suporte comercial no WhatsApp</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 font-display block">5 Estrelas</span>
            <span className="text-xs font-bold text-slate-900 block">Avaliação dos Clientes</span>
            <span className="text-[11px] text-slate-500">Confiança e satisfação técnica</span>
          </div>

        </div>
      </section>

      {/* 3. Company Timeline & Philosophy */}
      <section className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <Building2 className="w-4 h-4 text-amber-600" /> NOSSA FILOSOFIA
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Mais do que Equipamentos, Oferecemos Segurança e Alta Produtividade
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Na **Athena Soluções Automotivas**, entendemos que um elevador parado ou um scanner de diagnóstico defasado significa prejuízo e tempo perdido no box da sua oficina.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Por isso, selecionamos a dedo equipamentos das marcas de maior prestígio do mercado (como **Engecass, Launch, Raven, Napro e Sun**), garantindo confiabilidade técnica, facilidade de operação e excelente valor de revenda.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Consultoria Técnica Antes da Compra</h4>
                  <p className="text-[11px] text-slate-500">Ajudamos você a escolher o equipamento ideal para a capacidade física da sua oficina.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Treinamento & Suporte Pós-Venda</h4>
                  <p className="text-[11px] text-slate-500">Orientações diretas para sua equipe extrair o máximo potencial dos leitores e alinhadores.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="bg-gradient-to-tr from-slate-950 to-slate-800 p-8 rounded-3xl border border-slate-800 text-white shadow-2xl relative">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center p-2">
                  <img src="/logo.jpg" alt="Athena Logo" className="max-h-full object-contain rounded-lg" />
                </div>

                <blockquote className="text-sm sm:text-base font-medium text-slate-200 italic leading-relaxed">
                  "Nosso compromisso diário é garantir que cada mecânico e gestor de auto center tenha acesso à melhor tecnologia com atendimento humano, rápido e transparente."
                </blockquote>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider">Athena Soluções Automotivas</span>
                  <span className="text-slate-400">Brasília - DF | Atendimento Brasil</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Final CTA Section */}
      <section className="container-custom">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              Pronto para Equipar Sua Oficina com Alta Performance?
            </h2>
            <p className="text-xs sm:text-sm text-amber-100">
              Solicite uma cotação personalizada sem compromisso pelo WhatsApp e confira nossos prazos especiais de entrega.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950 text-white hover:bg-slate-900 text-xs sm:text-sm font-extrabold py-3.5 px-8 rounded-2xl shadow-2xl transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Solicitar Orçamento no WhatsApp ({formattedPhone})</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
