import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Truck, 
  Clock, 
  MapPin, 
  PhoneCall, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  ChevronRight, 
  ArrowRight,
  Gauge,
  Activity,
  Cpu,
  Sparkles,
  Zap
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaCustom, trackMetaEvent } from '../utils/metaPixel';

const WHATSAPP_TECH_NUMBER = '5561983485671';

export default function MaintenanceLpPage({ onNavigate }) {
  const [selectedMachine, setSelectedMachine] = useState('');
  const [urgency, setUrgency] = useState('emergencia');
  const [locationCity, setLocationCity] = useState('');

  useEffect(() => {
    setPageSeo({
      title: 'Assistência Técnica de Equipamentos Automotivos no DF | Mahovi e Sigma Undercar - Athena',
      description: 'Manutenção preventiva e corretiva de elevadores automotivos, desmontadoras, balanceadoras e alinhadores em Brasília e Entorno. Visita no local e plantão emergencial.',
      canonicalPath: '/assistencia-tecnica',
      type: 'service'
    });
  }, []);

  const handleWhatsAppLead = (customMsg = '') => {
    const defaultMsg = `Olá equipe técnica da Athena! Gostaria de solicitar assistência técnica / manutenção para minha oficina em ${locationCity || 'DF/Entorno'}.\n\n` +
      `• *Equipamento:* ${selectedMachine || 'Elevador / Máquina de Oficina'}\n` +
      `• *Prioridade:* ${urgency === 'emergencia' ? '🚨 Máquina Parada (Emergencial)' : '🗓️ Preventiva / Instalação'}\n` +
      `• *Serviço desejado:* Mão de obra técnica especializada com visita no local.`;

    const finalMsg = customMsg || defaultMsg;

    try {
      trackMetaCustom('LeadAssistenciaTecnica', {
        machine: selectedMachine || 'Geral',
        urgency,
        location: locationCity || 'DF/Entorno'
      });
      trackMetaEvent('Contact', {
        content_category: 'AssistenciaTecnica',
        content_name: selectedMachine || 'Geral'
      });
    } catch (_) {}

    window.open(`https://wa.me/${WHATSAPP_TECH_NUMBER}?text=${encodeURIComponent(finalMsg)}`, '_blank');
  };

  const machinesSupported = [
    {
      title: 'Elevadores Automotivos',
      desc: '2 e 4 colunas, portais e pantográficos/tesoura (Mahovi e Linha Undercar). Troca de cabos, alinhamento, nivelamento, óleo e travas.',
      icon: Layers,
      highlight: 'Emergência 24h a 48h'
    },
    {
      title: 'Rampas de Alinhamento',
      desc: 'Pneumáticas e pantográficas pesadas. Calibração de pratos, nivelamento a laser e revisão de circuitos de ar e pistões.',
      icon: Gauge,
      highlight: 'Calibração Fina'
    },
    {
      title: 'Desmontadoras & Balanceadoras',
      desc: 'Balanceadoras computadorizadas e desmontadoras pneumáticas. Troca de garras, válvulas rotativas, correias e aferição.',
      icon: Activity,
      highlight: 'Manutenção Rápida'
    },
    {
      title: 'Máquinas de Troca de Fluido (ATF)',
      desc: 'Trocadoras automáticas de transmissão. Limpeza de circuito, troca de filtros internos, calibração de balanças e sensores.',
      icon: Zap,
      highlight: 'Diagnóstico Eletrônico'
    },
    {
      title: 'Recicladoras de Ar-Condicionado',
      desc: 'Estações R134a e R1234yf. Teste de estanqueidade, troca de óleo da bomba de vácuo, calibração e limpeza de bicos.',
      icon: Cpu,
      highlight: 'Sistemas Térmicos'
    },
    {
      title: 'Máquinas de Limpeza de Bicos & Injeção',
      desc: 'Cubas ultrassônicas, provetas, bombas de pressão e painéis de controle digital para motores GDI e injeção convencional.',
      icon: Wrench,
      highlight: 'Bancada e Local'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner de Urgência */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
        <span>MÁQUINA PARADA NA SUA OFICINA? ATENDIMENTO TÉCNICO EMERGENCIAL NO DF E ENTORNO EM ATÉ 24H A 48H!</span>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-slate-950/60 to-slate-950 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold mb-6 backdrop-blur-md shadow-2xs">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Assistência Técnica Homologada • Especialistas Mahovi & Linha Undercar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Sua oficina não pode parar.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Manutenção & Conserto de Equipamentos no DF
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-8">
            Atendimento presencial no seu auto center ou oficina mecânica em todo o <strong>Distrito Federal e cidades do Entorno</strong>. 
            Mão de obra especializada para elevadores automotivos, rampas, desmontadoras, máquinas ATF e equipamentos de injeção.
          </p>

          {/* Destaques Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Resposta Rápida</p>
                <p className="text-xs sm:text-sm font-bold text-white">24h a 48h úteis</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Visita Presencial</p>
                <p className="text-xs sm:text-sm font-bold text-white">Na sua Oficina</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Garantia Técnica</p>
                <p className="text-xs sm:text-sm font-bold text-white">Serviço Certificado</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Modalidades</p>
                <p className="text-xs sm:text-sm font-bold text-white">Avulso ou Contrato</p>
              </div>
            </div>
          </div>

          {/* CTA Box / Calculador Rápido de Chamado */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-2xl">
              <h2 className="text-lg sm:text-2xl font-black text-white mb-2">
                Solicite uma Visita Técnica ou Diagnóstico
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Informe o equipamento e a sua localização para conectarmos você direto com o técnico responsável da Athena.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <select 
                  value={selectedMachine} 
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Tipo de Equipamento...</option>
                  <option value="Elevador Automotivo">Elevador Automotivo (2/4 Colunas/Tesoura)</option>
                  <option value="Rampa de Alinhamento">Rampa de Alinhamento</option>
                  <option value="Desmontadora de Pneus">Desmontadora de Pneus</option>
                  <option value="Balanceadora de Rodas">Balanceadora de Rodas</option>
                  <option value="Máquina Troca de Fluido ATF">Máquina de Fluido ATF</option>
                  <option value="Recicladora de Ar-Condicionado">Recicladora de Ar-Condicionado</option>
                  <option value="Máquina de Limpeza de Bicos">Máquina de Limpeza de Bicos</option>
                  <option value="Outro Equipamento Pesado">Outro Equipamento</option>
                </select>

                <select 
                  value={urgency} 
                  onChange={(e) => setUrgency(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="emergencia">🚨 Máquina Parada (Urgente)</option>
                  <option value="preventiva">🛠️ Manutenção Preventiva</option>
                  <option value="instalacao">🏗️ Instalação / Montagem</option>
                  <option value="contrato">📋 Contrato Periódico</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Sua Cidade / Região (ex: Taguatinga)"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleWhatsAppLead()}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chamar Técnico no WhatsApp Agora</span>
                </button>

                <span className="text-[11px] text-slate-400 text-center sm:text-left">
                  ⚡ Resposta técnica ágil • Avaliação preliminar sem compromisso
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPAMENTOS ATENDIDOS */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-400 text-xs font-black uppercase tracking-wider block mb-2">
            Especialidade Técnica
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Equipamentos que Recuperamos na Sua Oficina
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Atendemos toda a linha pesada da Mahovi e linha undercar da Sigma Tools com conhecimento prático de fábrica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {machinesSupported.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/50 p-5 sm:p-6 rounded-3xl transition-all hover:bg-slate-900 group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {m.highlight}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppLead(`Olá! Preciso de assistência técnica para meu(minha) ${m.title}. Podem me passar mais detalhes e disponibilidade?`)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Solicitar reparo deste item</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMO FUNCIONA O ATENDIMENTO */}
      <section className="bg-slate-900/50 border-y border-slate-800/80 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider block mb-2">
              Passo a Passo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Como Funciona a Assistência Técnica Athena
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative">
              <span className="text-3xl font-black text-amber-500/30 absolute top-4 right-5 font-mono">01</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black mb-4">
                1
              </div>
              <h3 className="text-base font-black text-white mb-2">Contato & Triagem no WhatsApp</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Você envia fotos, vídeos ou descreve o sintoma do equipamento. Nosso time técnico faz um pré-diagnóstico do defeito imediatamente.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative">
              <span className="text-3xl font-black text-amber-500/30 absolute top-4 right-5 font-mono">02</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black mb-4">
                2
              </div>
              <h3 className="text-base font-black text-white mb-2">Orientação das Peças Necessárias</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Informamos exatamente quais componentes precisam ser adquiridos (caso necessário) para que você forneça as peças e nós entremos com a mão de obra especializada.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative">
              <span className="text-3xl font-black text-amber-500/30 absolute top-4 right-5 font-mono">03</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black mb-4">
                3
              </div>
              <h3 className="text-base font-black text-white mb-2">Execução Técnica no Local</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Nosso técnico vai até sua oficina no DF ou Entorno, executa o reparo, troca vedações/cabos, faz o ajuste mecânico e testa o equipamento em operação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RAIO DE ATENDIMENTO */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cobertura Presencial</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Onde a Equipe Técnica da Athena Atende?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Base técnica central em <strong>Arniqueira / Brasília – DF</strong>, com deslocamento ágil para todas as regiões:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Taguatinga & Ceilândia</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> SIA, Guará & Vicente Pires</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Plano Piloto & Sobradinho</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Samambaia, Gama & Recanto</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Valparaíso, Luziânia & Ocidental</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Águas Lindas, Formosa & Região</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-amber-500/30 p-6 rounded-3xl text-center space-y-4 w-full sm:w-80 shrink-0 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-black">Plantão Técnico</p>
              <p className="text-lg font-black text-white font-mono mt-0.5">(61) 98348-5671</p>
              <p className="text-[11px] text-slate-500 mt-1">Segunda a Sexta, 8h às 18h</p>
            </div>
            <button
              type="button"
              onClick={() => handleWhatsAppLead('Olá! Gostaria de verificar a disponibilidade de um técnico para visitar minha oficina.')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Consultar Rota Técnica
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Athena Soluções Automotivas — Manutenção & Assistência Especializada no DF.</p>
          <div className="flex items-center gap-4 text-xs font-bold">
            <button 
              type="button" 
              onClick={() => onNavigate?.('catalog')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Ver Catálogo de Máquinas Novas
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => onNavigate?.('home')}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Página Inicial
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
