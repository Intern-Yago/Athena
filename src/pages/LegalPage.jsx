import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  ChevronRight, 
  Lock, 
  Truck, 
  Award, 
  Info, 
  CheckCircle2, 
  Mail, 
  SlidersHorizontal,
  Search,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Scale,
  Building2,
  CreditCard,
  UserCheck,
  AlertCircle,
  RotateCcw,
  Eye,
  Database,
  ArrowRight
} from 'lucide-react';

const STORAGE_KEY = 'athena_cookie_consent_v1';

function applyClarityConsent(isGranted) {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('consent', Boolean(isGranted));
  }
}

export default function LegalPage({ initialTab = 'terms', onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Estado interativo dos cookies
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functionality: true,
    analytics: true,
  });

  // Carregar preferências salvas de cookies
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCookiePreferences(prev => ({
          ...prev,
          ...parsed,
          necessary: true
        }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyPageLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Link do documento copiado para a área de transferência!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const saveCookieSettings = (prefs) => {
    const dataToSave = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {}
    setCookiePreferences(dataToSave);
    applyClarityConsent(dataToSave.analytics);
    showToast('Preferências de cookies salvas com sucesso!');
  };

  const handleSaveCookies = () => {
    saveCookieSettings(cookiePreferences);
  };

  const handleAcceptAllCookies = () => {
    saveCookieSettings({ necessary: true, functionality: true, analytics: true });
  };

  const handleOnlyNecessaryCookies = () => {
    saveCookieSettings({ necessary: true, functionality: false, analytics: false });
  };

  const openCookieModal = () => {
    window.dispatchEvent(new CustomEvent('athena:open-cookie-preferences'));
  };

  // Helper para verificar se a busca casa com texto
  const matchesSearch = (text) => {
    if (!searchTerm.trim()) return true;
    return String(text).toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 md:py-14 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="container-custom max-w-5xl space-y-8">
        
        {/* Breadcrumb & Top Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap text-xs text-slate-400">
            <div className="flex items-center gap-2 font-semibold">
              <button 
                onClick={() => onNavigate && onNavigate('catalog')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Início
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300">Governança & Jurídico</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-bold">
                {activeTab === 'terms' && 'Termos de Uso & Fidelidade'}
                {activeTab === 'privacy' && 'Política de Privacidade (LGPD)'}
                {activeTab === 'cookies' && 'Diretrizes de Cookies'}
              </span>
            </div>

            {/* Quick Actions (Print / Copy Link) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors text-xs font-medium cursor-pointer"
                title="Imprimir ou salvar em PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir / PDF</span>
              </button>

              <button
                onClick={handleCopyPageLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors text-xs font-medium cursor-pointer"
                title="Copiar link permanente desta seção"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 hidden sm:inline">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Conformidade Legal & LGPD (Lei 13.709/2018)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  Athena Soluções Automotivas
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  • Versão Oficial 2.4 (Revisada em Outubro de 2026)
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Portal Jurídico, Privacidade & Governança
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                  Transparência total em conformidade com as diretrizes do Código de Defesa do Consumidor (Lei nº 8.078/1990) e da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Conheça as condições contratuais, regras de entrega técnica de maquinário industrial, faturamento seguro via Omie ERP e o regulamento do programa de fidelidade A-Points.
                </p>
              </div>

              {/* Badges de Destaque Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">Gateway Asaas</span>
                    <span className="text-slate-400 text-[10px]">PCI-DSS Nível 1</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">Omie ERP</span>
                    <span className="text-slate-400 text-[10px]">NFe Integrada SEFAZ</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">Logística Pesada</span>
                    <span className="text-slate-400 text-[10px]">Carga com Seguro</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">A-Points</span>
                    <span className="text-slate-400 text-[10px]">R$ 50 = 1 Ponto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector & Document Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 overflow-x-auto shrink-0 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('terms');
                if (onNavigate) onNavigate('termos-de-uso');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Termos de Uso & Fidelidade</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('privacy');
                if (onNavigate) onNavigate('politica-de-privacidade');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Política de Privacidade (LGPD)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cookies');
                if (onNavigate) onNavigate('politica-de-cookies');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'cookies'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cookie className="w-4 h-4" />
              <span>Diretrizes de Cookies</span>
            </button>
          </div>

          {/* Quick Search in Document */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar cláusulas ou termos..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
          
          {/* ========================================================= */}
          {/* TAB 1: TERMOS DE USO & FIDELIDADE                         */}
          {/* ========================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
              
              {/* Header da Seção */}
              <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-amber-400" />
                    Termos e Condições Gerais de Uso
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Regulamento de aquisição de maquinário industrial, faturamento ERP Omie, responsabilidade de descarregamento técnico e programa oficial A-Points.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-400 font-medium">
                  Documento ID: <span className="text-amber-400 font-mono font-bold">TCU-ATHENA-2026</span>
                </div>
              </div>

              {/* TL;DR Executive Summary Callout */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Em Resumo (Visão Rápida dos Termos)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">1. Faturamento & NF</span>
                    <p className="text-slate-400">100% dos pedidos são faturados via ERP Omie com emissão obrigatória de Nota Fiscal Eletrônica (NFe).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">2. Entrega de Pesados</span>
                    <p className="text-slate-400">Elevadores e alinhadores exigem empilhadeira ou munk providenciado pelo comprador no local.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">3. A-Points Fidelidade</span>
                    <p className="text-slate-400">R$ 50 quitados = 1 A-Point válido por 12 meses. Resgate no portal sem valor monetário em dinheiro.</p>
                  </div>
                </div>
              </div>

              {/* Cláusula 1 */}
              {matchesSearch('Identificação Empresa Razão Social CNPJ Arniqueira Brasília') && (
                <section className="space-y-3 pt-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                    Identificação da Empresa & Escopo de Atuação
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm">
                    <p className="text-slate-300">
                      O catálogo virtual, a plataforma comercial e todos os serviços correlatos são de titularidade da <strong className="text-slate-900">ATHENA SOLUÇÕES AUTOMOTIVAS</strong> (ATHENA TECNOLOGIA E COMÉRCIO DE EQUIPAMENTOS AUTOMOTIVOS LTDA), com sede em Brasília - DF, localizada na <span className="text-amber-400 font-medium">ST SHA Arniqueira / Colônia Agrícola Vereda da Cruz Chácara 517, Loja 05, CEP 71996-413</span>.
                    </p>
                    <p className="text-slate-400">
                      A Athena é distribuidora autorizada e especialista no fornecimento de equipamentos pesados e de precisão técnica para oficinas mecânicas, centros de estética automotiva, auto centers, concessionárias e indústrias, tais como elevadores hidráulicos de 2 e 4 colunas, elevadores pantográficos tesoura, alinhadores 3D computadorizados, scanners de diagnóstico automotivo multimarcas, desmontadoras, balanceadoras de rodas e ferramentas pneumáticas/bateria.
                    </p>
                  </div>
                </section>
              )}

              {/* Cláusula 2 */}
              {matchesSearch('Processamento Pedidos Faturamento Omie ERP Asaas SEFAZ Sob Consulta') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                    Processamento de Pedidos, Faturamento B2B/B2C & Cotações Sob Consulta
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p>
                      As aquisições podem ser efetuadas via catálogo virtual ou mediante atendimento consultivo de nossos engenheiros e consultores técnicos de vendas:
                    </p>
                    <ul className="space-y-2 pl-1">
                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Integração Omie ERP & SEFAZ:</strong>
                          <span className="text-slate-400">Todo pedido validado é sincronizado em tempo real com o Omie ERP, garantindo apuração fiscal idônea e geração da Nota Fiscal Eletrônica (NFe) autorizada pela SEFAZ.</span>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Segurança Financeira com Asaas:</strong>
                          <span className="text-slate-400">Cobranças via PIX instantâneo, Boletos Registrados e Cartão de Crédito são liquidadas no ambiente seguro do gateway homologado Asaas com certificação PCI-DSS. A Athena não armazena dados confidenciais de cartão.</span>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Itens com Preço Sob Consulta:</strong>
                          <span className="text-slate-400">Determinadas máquinas de grande porte, scanners especializados ou lotes industriais são classificados como "Sob Consulta". Nesses casos, o envio do pedido no catálogo formaliza uma solicitação de proposta personalizada, confirmada junto ao comprador antes de qualquer cobrança ou faturamento.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Cláusula 3 */}
              {matchesSearch('Logística Frete Cargas Pesadas Elevador Alinhador Empilhadeira Munk Descarregamento') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                    Logística Especializada & Descarregamento Técnico de Cargas Pesadas
                  </h3>
                  
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-200 text-xs sm:text-sm space-y-3">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <Truck className="w-5 h-5 shrink-0" />
                      <span>Condição Obrigatória para Equipamentos Pesados (Elevadores, Rampas e Alinhadores)</span>
                    </div>
                    <p className="leading-relaxed">
                      Devido às especificações industriais e ao peso bruto elevado (geralmente entre <strong>600 kg e 1.400 kg</strong>), as transportadoras rodoviárias parceiras realizam o transporte interestadual com seguro de carga até o endereço do comprador, <strong>não realizando o descarregamento manual da carroceria</strong>.
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/20 text-xs text-amber-200/90">
                      <strong>Responsabilidade do Comprador:</strong> O cliente declara plena ciência de que é de sua exclusiva responsabilidade providenciar recursos mecânicos apropriados (como empilhadeira, guincho tipo munk ou equipe técnica de apoio) no momento exato da chegada da transportadora para a retirada segura dos volumes pesados.
                    </div>
                  </div>
                </section>
              )}

              {/* Cláusula 4 */}
              {matchesSearch('A-Points Programa Fidelidade Pontos Reais Resgate Validade Comprovante') && (
                <section className="space-y-4 pt-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">4</span>
                    Regulamento Oficial do Programa de Fidelidade A-Points
                  </h3>
                  
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                        <Award className="w-4 h-4" />
                        <span>Mecânica de Acúmulo, Validade & Resgate Transparente</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        Exclusivo Athena
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Conversão Proporcional</span>
                        <p className="text-slate-400">A cada <strong>R$ 50,00 (cinquenta reais)</strong> efetivamente quitados e faturados em compras de produtos na Athena, o cliente acumula automaticamente <strong>1 (um) A-Point</strong>.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Validade Padrão</span>
                        <p className="text-slate-400">Os pontos acumulados têm prazo de validade de <strong>12 (doze) meses corridos</strong> contados da data de emissão da Nota Fiscal do faturamento correspondente.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Intransferibilidade & Sem Valor Monetário</span>
                        <p className="text-slate-400">Os A-Points são vinculados ao CPF ou CNPJ cadastrado, não podendo ser comercializados, cedidos, penhorados ou convertidos em moeda corrente em nenhuma hipótese.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Resgate & Logística de Brindes</span>
                        <p className="text-slate-400">O resgate é realizado no portal do cliente, gerando comprovante formal por e-mail. Os itens são despachados via logística ou integrados ao próximo pedido faturado.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-200 text-[11px] text-slate-400">
                      <strong>Cancelamentos & Estornos:</strong> Havendo cancelamento, devolução ou chargeback de uma compra que gerou pontuação, o montante equivalente de A-Points será debitado proporcionalmente do saldo da conta do cliente.
                    </div>
                  </div>
                </section>
              )}

              {/* Cláusula 5 */}
              {matchesSearch('Garantia Fabricação Suporte Assistência CDC 90 dias Fabricante') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">5</span>
                    Garantia Legal, Assistência Técnica & Suporte de Fábrica
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-400">
                    <p>
                      Todos os produtos contam com a garantia legal de <strong>90 (noventa) dias</strong> prevista no Art. 26 do Código de Defesa do Consumidor (CDC), somada à garantia contratual oferecida diretamente pelas montadoras e fabricantes parceiros (Launch Tech, Mahle, Sun, Ravaglioli, Fortg, Sigma Tools, EAATA Brasil, entre outros).
                    </p>
                    <p>
                      A garantia cobre estritamente vícios de fabricação em componentes mecânicos, hidráulicos ou eletroeletrônicos. Não estão contemplados sinistros provocados por:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                      <li>Instalação elétrica sem aterramento técnico adequado ou com voltagem/fase incompatível;</li>
                      <li>Sobrecarga de tonelagem acima da capacidade nominal homologada do elevador ou rampa;</li>
                      <li>Uso de óleos hidráulicos ou fluidos contaminados ou fora das normas recomendadas pelo manual;</li>
                      <li>Intervenção ou reparo realizado por terceiros não homologados pela assistência técnica autorizada.</li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Cláusula 6 */}
              {matchesSearch('Arrependimento Devoluções CDC Artigo 49 Troca') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">6</span>
                    Direito de Arrependimento & Procedimento de Devoluções (Art. 49 CDC)
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-400">
                    <p>
                      Em conformidade com o Art. 49 do CDC, nas contratações realizadas fora do estabelecimento comercial (via catálogo online ou canais digitais), o consumidor pode exercer o direito de arrependimento em até <strong>7 (sete) dias corridos</strong> após o recebimento físico da mercadoria.
                    </p>
                    <p>
                      O maquinário deve ser mantido em embalagem original, acompanhado de todos os manuais técnicos, cabos e acessórios sem avarias ou indícios de uso operacional em oficina mecânica. Após a conferência física pela equipe de inspeção técnica, o reembolso integral será processado pelo mesmo meio de pagamento contratado.
                    </p>
                  </div>
                </section>
              )}

              {/* Cláusula 7 */}
              {matchesSearch('Propriedade Intelectual Marcas Registradas Direitos Autorais') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">7</span>
                    Propriedade Intelectual & Marcas Registradas Homologadas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    A identidade visual, logotipo da Athena Soluções Automotivas, código-fonte e arquitetura do portal são protegidos pelas leis de propriedade intelectual. As marcas de parceiros citadas no catálogo (tais como LAUNCH, MAHLE, SUN, RAVAGLIOLI, FORTG, SIGMA TOOLS, EAATA) pertencem exclusivamente aos seus respectivos titulares de registro e são reproduzidas com finalidade estritamente informativa de identificação comercial dos produtos distribuídos.
                  </p>
                </section>
              )}

              {/* Cláusula 8 */}
              {matchesSearch('Foro Eleição Brasília Distrito Federal') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">8</span>
                    Foro de Eleição & Disposições Finais
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Para dirimir quaisquer controvérsias decorrentes destes Termos e Condições, as partes elegem o Foro da Circunscrição Judiciária de Brasília, Distrito Federal, com renúncia expressa a qualquer outro, por mais privilegiado que seja ou venha a ser.
                  </p>
                </section>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: POLÍTICA DE PRIVACIDADE (LGPD)                     */}
          {/* ========================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
              
              {/* Header da Seção */}
              <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <Lock className="w-6 h-6 text-amber-400" />
                    Política de Privacidade & Proteção de Dados (LGPD)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Conformidade integral com a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018).
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-400 font-medium">
                  Segurança: <span className="text-emerald-400 font-bold">Privacy by Design</span>
                </div>
              </div>

              {/* TL;DR Executive Summary Callout */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Compromisso Fundamental com a Privacidade dos Nossos Clientes</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  A Athena não vende, não comercializa e não transfere seus dados pessoais para terceiros para fins de marketing abusivo. Todos os dados coletados têm base legal transparente: emissão de Notas Fiscais no Omie ERP, processamento de pagamento homologado pelo Asaas e entrega física com transportadoras parceiras.
                </p>
              </div>

              {/* 1. Bases Legais e Quadro de Tratamento */}
              {matchesSearch('Bases Legais Quadro Tratamento Dados Cadastrais Fiscais Contato') && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                    Quadro Transparente de Tratamento de Dados & Finalidades Legais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          Dados Cadastrais & Fiscais
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Art. 7º, II e V
                        </span>
                      </div>
                      <p className="text-slate-400">
                        <strong>Coleta:</strong> Razão Social / Nome completo, CNPJ / CPF, Inscrição Estadual (IE).<br/>
                        <strong>Finalidade:</strong> Emissão de Nota Fiscal Eletrônica perante a SEFAZ, apuração tributária no Omie ERP e elaboração de contratos comerciais de distribuição.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          Dados de Contato & Rastreio
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Art. 7º, V e IX
                        </span>
                      </div>
                      <p className="text-slate-400">
                        <strong>Coleta:</strong> E-mail corporativo/pessoal, telefone celular e WhatsApp comercial.<br/>
                        <strong>Finalidade:</strong> Envio de comprovantes fiscais (DANFE/XML), código de rastreamento de transporte rodoviário, recuperação de acesso seguro e saldo de A-Points.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          Logística & Endereço de Entrega
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Art. 7º, V
                        </span>
                      </div>
                      <p className="text-slate-400">
                        <strong>Coleta:</strong> CEP, logradouro, número, complemento, bairro, cidade, UF e ponto de referência.<br/>
                        <strong>Finalidade:</strong> Cálculo de frete pesado interestadual, emissão de Conhecimento de Transporte Eletrônico (CT-e) e agendamento da entrega no auto center.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" />
                          Transações & Cobranças
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          PCI-DSS Nível 1
                        </span>
                      </div>
                      <p className="text-slate-400">
                        <strong>Operação:</strong> Dados confidenciais de cartão e liquidação são manipulados de forma isolada e tokenizada no gateway Asaas.<br/>
                        <strong>Garantia de Segurança:</strong> <em>A Athena nunca visualiza nem armazena números de cartões de crédito em seus servidores.</em>
                      </p>
                    </div>

                  </div>
                </section>
              )}

              {/* 2. Compartilhamento Seguro */}
              {matchesSearch('Compartilhamento Terceiros Omie Asaas Transportadoras Microsoft Clarity') && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                    Compartilhamento Seguro com Operadores Homologados
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-400">
                    <p>
                      O compartilhamento de dados ocorre unicamente com parceiros estritamente necessários para a prestação do serviço e cumprimento regulatório:
                    </p>
                    <ul className="space-y-2 pl-1">
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900">Omie ERP:</strong> Sistema de governança corporativa onde o pedido é faturado e a NFe é transmitida aos servidores da SEFAZ.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900">Asaas Gestão Financeira:</strong> Instituição homologada pelo Banco Central do Brasil para operação e conciliação bancária de pagamentos com criptografia SSL/TLS.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900">Transportadoras Rodoviárias Parceiras:</strong> Compartilhamento do endereço de destino e dados fiscais da carga para transporte e entrega técnica.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900">Microsoft Clarity (Telemetria & Usabilidade):</strong> Ferramenta de análise de experiência para diagnóstico de falhas de carregamento e mapas de calor de navegação. <em>Todos os campos sensíveis e dados de digitação pessoal são estritamente mascarados antes do tráfego.</em>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* 3. Direitos do Titular LGPD Art. 18 */}
              {matchesSearch('Direitos Titular Artigo 18 LGPD Acesso Correção Anonimização Eliminação') && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                    Seus Direitos Fundamentais como Titular de Dados (Art. 18 da LGPD)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Você possui total autonomia sobre as suas informações pessoais. Mediante requerimento formal à nossa equipe de privacidade, você pode exercer gratuitamente:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Confirmação da existência de tratamento</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Acesso simplificado aos seus dados cadastrados</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Correção de dados incompletos ou inexatos</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Anonimização, bloqueio ou eliminação de excessos</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Portabilidade dos dados a outro fornecedor</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Revogação a qualquer momento do consentimento</span>
                    </div>
                  </div>
                </section>
              )}

              {/* 4. Canal do DPO (Encarregado de Proteção de Dados) */}
              {matchesSearch('DPO Encarregado Proteção Dados Canal Contato E-mail WhatsApp') && (
                <section className="space-y-4 pt-2">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 text-xs sm:text-sm space-y-4 shadow-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5 font-black text-amber-400 text-sm">
                        <UserCheck className="w-5 h-5 text-amber-400" />
                        <span>Encarregado de Proteção de Dados (DPO) & Canal de Atendimento</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Prazo Legal: Até 15 dias úteis
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      Para solicitar a exclusão de dados, retificação de cadastro fiscal ou esclarecer qualquer dúvida sobre governança digital, entre em contato direto com o nosso DPO:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <a 
                        href="mailto:contato@athenaconsultoria.com.br?subject=Solicita%C3%A7%C3%A3o%20LGPD%20-%20Exerc%C3%ADcio%20de%20Direitos%20do%20Titular"
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">E-mail do DPO</span>
                          <span className="text-amber-400 font-mono text-xs font-bold group-hover:underline">
                            contato@athenaconsultoria.com.br
                          </span>
                        </div>
                        <Mail className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </a>

                      <a 
                        href="https://wa.me/5561983485671?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20o%20Encarregado%20de%20Dados%20(DPO)%20da%20Athena%20a%20respeito%20da%20LGPD."
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">WhatsApp Oficial</span>
                          <span className="text-emerald-400 font-bold text-xs group-hover:underline">
                            (61) 98348-5671
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </a>
                    </div>
                  </div>
                </section>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DIRETRIZES DE COOKIES                              */}
          {/* ========================================================= */}
          {activeTab === 'cookies' && (
            <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
              
              {/* Header da Seção */}
              <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <Cookie className="w-6 h-6 text-amber-400" />
                    Diretrizes de Cookies & Gerenciador Ativo
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Controle em tempo real os cookies utilizados para autenticação, desempenho de catálogo e telemetria anônima.
                  </p>
                </div>

                <button
                  onClick={openCookieModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                  <span>Abrir em Janela Flutuante</span>
                </button>
              </div>

              {/* WIDGET INTERATIVO DE CONTROLE DE COOKIES NA PRÓPRIA PÁGINA */}
              <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Central de Consentimento de Cookies</h3>
                      <p className="text-[11px] text-slate-600">Ajuste suas permissões diretamente abaixo e aplique instantaneamente.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOnlyNecessaryCookies}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      Apenas Essenciais
                    </button>
                    <button
                      onClick={handleAcceptAllCookies}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-md"
                    >
                      Aceitar Todos
                    </button>
                  </div>
                </div>

                {/* Switches de Categorias */}
                <div className="space-y-3.5">
                  
                  {/* Categoria 1: Essenciais */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 text-sm">1. Cookies Estritamente Necessários</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                          Obrigatório
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Essenciais para manter sua sessão conectada com segurança, salvar itens adicionados ao carrinho de ferramentas e maquinário e proteger solicitações contra ataques CSRF.
                      </p>
                    </div>

                    <div className="pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold whitespace-nowrap">
                        Sempre Ativo
                      </span>
                    </div>
                  </div>

                  {/* Categoria 2: Funcionalidades */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900 text-sm">2. Cookies de Preferências & Personalização</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          Opcional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Memorizam filtros de busca por fabricante (Launch, Mahle, Sigma Tools, etc.), ordenação do catálogo por menor preço e preferências do painel para navegação rápida.
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setCookiePreferences(prev => ({ ...prev, functionality: !prev.functionality }))}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                          cookiePreferences.functionality ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        title="Alternar cookies de preferência"
                      >
                        <span 
                          className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                            cookiePreferences.functionality ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Categoria 3: Análise & Telemetria */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-900 text-sm">3. Cookies de Desempenho & Telemetria (Microsoft Clarity)</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300 uppercase">
                          Opcional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Mapeiam cliques e páginas com lentidão para aprimorar a usabilidade da loja. <em>Não gravam nem transmitem dados bancários, documentos ou senhas (mascaramento estrito de formulário).</em>
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setCookiePreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                          cookiePreferences.analytics ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        title="Alternar cookies de análise"
                      >
                        <span 
                          className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                            cookiePreferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Botão de Salvar Alterações */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={handleSaveCookies}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Minhas Escolhas</span>
                  </button>
                </div>
              </div>

              {/* Tabela Técnica Detalhada de Cookies */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                  Inventário Técnico de Cookies Utilizados
                </h3>
                
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Nome do Cookie</th>
                        <th className="p-3.5">Provedor</th>
                        <th className="p-3.5">Categoria</th>
                        <th className="p-3.5">Validade</th>
                        <th className="p-3.5">Finalidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">athena_cookie_consent_v1</td>
                        <td className="p-3.5 text-slate-700">Athena</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Essencial</span></td>
                        <td className="p-3.5">1 ano</td>
                        <td className="p-3.5">Persistência da escolha de consentimento de cookies feita pelo usuário.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">athena_cart</td>
                        <td className="p-3.5 text-slate-700">Athena</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Essencial</span></td>
                        <td className="p-3.5">30 dias</td>
                        <td className="p-3.5">Armazenamento temporário dos equipamentos e ferramentas colocados no carrinho.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">athena_session_id</td>
                        <td className="p-3.5 text-slate-700">Athena</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Essencial</span></td>
                        <td className="p-3.5">Sessão</td>
                        <td className="p-3.5">Identificador de sessão para navegação anônima e prevenção a ataques CSRF.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-sky-700 font-bold">_clck / _clsk</td>
                        <td className="p-3.5 text-slate-700">Microsoft Clarity</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Analítico</span></td>
                        <td className="p-3.5">1 ano</td>
                        <td className="p-3.5">Persiste o ID exclusivo do navegador para compilação anônima de métricas de uso.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-sky-700 font-bold">CLID / ANONCHK</td>
                        <td className="p-3.5 text-slate-700">Microsoft Clarity</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Analítico</span></td>
                        <td className="p-3.5">Sessão</td>
                        <td className="p-3.5">Auxilia na otimização de renderização e análise de telas com cliques sem resposta.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guia para Gerenciamento no Navegador */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                  Como Desativar ou Bloquear Cookies no seu Navegador
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Caso deseje desativar cookies diretamente no seu navegador, siga o caminho de configurações correspondente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Google Chrome</span>
                    <p className="text-slate-600 text-[11px]">Configurações ➔ Privacidade e Segurança ➔ Cookies de terceiros.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Microsoft Edge</span>
                    <p className="text-slate-600 text-[11px]">Configurações ➔ Cookies e permissões de site ➔ Gerenciar cookies.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Mozilla Firefox</span>
                    <p className="text-slate-600 text-[11px]">Configurações ➔ Privacidade e Segurança ➔ Cookies e dados de sites.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Apple Safari</span>
                    <p className="text-slate-600 text-[11px]">Ajustes / Preferências ➔ Privacidade ➔ Bloquear todos os cookies.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Support Banner */}
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-sm">Dúvidas Jurídicas ou Comerciais?</span>
              <span className="text-slate-600">Nossa assessoria técnica e jurídica está à disposição de sua empresa.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('contact')}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Fale Conosco
            </button>
            <button
              onClick={() => onNavigate && onNavigate('catalog')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors cursor-pointer shadow-md"
            >
              Explorar Catálogo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
