import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal
} from 'lucide-react';

export default function LegalPage({ initialTab = 'terms', onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('athena:open-cookie-preferences'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 md:py-16">
      <div className="container-custom max-w-5xl space-y-8">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <button 
              onClick={() => onNavigate && onNavigate('catalog')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">Portal Jurídico & Governança LGPD</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Conformidade Legal & LGPD (Lei nº 13.709/2018)
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Termos, Privacidade & Diretrizes
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Transparência completa sobre o uso de dados, faturamento de equipamentos industriais e regras do programa de fidelidade A-Points.
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 block font-medium">Última Atualização:</span>
              <span className="text-xs font-bold text-amber-400">Setembro de 2026</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('terms');
              if (onNavigate) onNavigate('termos-de-uso');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cookie className="w-4 h-4" />
            <span>Política de Cookies</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          
          {/* TAB 1: TERMOS DE USO */}
          {activeTab === 'terms' && (
            <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
              <div className="border-b border-slate-800 pb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-amber-400" />
                  Termos e Condições Gerais de Uso
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Regras de comercialização, faturamento via ERP Omie, entrega técnica de equipamentos e regulamento oficial de A-Points.
                </p>
              </div>

              {/* Seção 1 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                  Identificação da Empresa & Escopo de Atuação
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  O portal e catálogo digital são de propriedade e administração da <strong className="text-white">ATHENA SOLUÇÕES AUTOMOTIVAS</strong>, estabelecida em Brasília - DF, com sede na <span className="text-slate-300">ST SHA Arniqueira / Colônia Agrícola Vereda da Cruz Chácara 517, Loja 05, CEP 71996-413</span>.
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  A Athena é especializada no fornecimento, distribuição e assessoria técnica de equipamentos automotivos de alta performance para oficinas mecânicas, centros automotivos, concessionárias e indústrias, tais como elevadores automotivos de 2 e 4 colunas, elevadores pantográficos tesoura, alinhadores 3D computadorizados, scanners de diagnóstico automotivo multimarcas, desmontadoras e balanceadoras de rodas.
                </p>
              </section>

              {/* Seção 2 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                  Processamento de Pedidos & Faturamento B2B / B2C
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  As transações comerciais podem ocorrer diretamente pelo catálogo virtual com checkout integrado ou de forma assistida por nossa equipe comercial e vendedores técnicos:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-400 pl-2">
                  <li><strong>Faturamento ERP Omie:</strong> Todas as vendas confirmadas são integradas e registradas no sistema de gestão Omie ERP para emissão regular de Nota Fiscal Eletrônica (NFe) perante a SEFAZ.</li>
                  <li><strong>Pagamentos Eletrônicos:</strong> Cobranças geradas online (PIX, Boleto Bancário ou Cartão de Crédito) são processadas com certificado SSL e criptografia de ponta a ponta pelo gateway homologado Asaas.</li>
                  <li><strong>Disponibilidade e Prazos:</strong> Equipamentos de grande porte podem depender de fabricação sob demanda ou remessa de centro de distribuição. Os prazos estimados de faturamento e transporte são detalhados na proposta ou no fechamento do pedido.</li>
                </ul>
              </section>

              {/* Seção 3 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                  Logística, Frete Técnico e Descarregamento de Cargas Pesadas
                </h3>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Truck className="w-4 h-4 shrink-0" />
                    Atenção Especial para Equipamentos Pesados (Elevadores e Alinhadores)
                  </div>
                  <p>
                    Devido ao peso e às dimensões industriais de elevadores hidráulicos (que podem ultrapassar 600 kg a 1.200 kg) e alinhadores 3D, o cliente declara estar ciente de que o <strong>descarregamento técnico no endereço de entrega é de responsabilidade do comprador</strong>, devendo contar com empilhadeira, guincho tipo munk ou equipe compatível no momento da entrega pela transportadora.
                  </p>
                </div>
              </section>

              {/* Seção 4: PROGRAMA A-POINTS */}
              <section className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">4</span>
                  Regulamento Oficial do Programa de Fidelidade A-Points
                </h3>
                
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Award className="w-4 h-4" />
                    Regras de Acúmulo e Resgate
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Conversão de Pontos:</strong> A cada <strong>R$ 50,00 (cinquenta reais)</strong> efetivamente faturados e quitados em compras de produtos na Athena, o cliente acumula automaticamente <strong>1 (um) A-Point</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Sem Limite Artificial:</strong> Não há teto máximo de pontuação por pedido. Grandes faturamentos geram acúmulo proporcional e transparente.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Validade:</strong> Os pontos acumulados têm validade padrão de <strong>12 (doze) meses</strong> a partir da data de faturamento do pedido correspondente.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Intransferibilidade & Sem Valor Monetário:</strong> Os A-Points são de uso pessoal e intransferível vinculados ao CPF ou CNPJ cadastrado. Não podem ser vendidos, cedidos, penhorados ou convertidos em dinheiro líquido em nenhuma circunstância.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Resgate & Comprovante:</strong> O resgate de brindes, itens exclusivos ou vouchers de desconto é efetuado diretamente no portal do cliente e confirmado mediante envio de comprovante formal por e-mail, sendo finalizado via logística ou incluído no próximo pedido de maquinário.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Cancelamento e Devoluções:</strong> Em caso de devolução ou cancelamento de compra que tenha gerado pontos, os A-Points equivalentes serão automaticamente debitados do saldo do cliente.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Seção 5 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">5</span>
                  Garantia de Fabricação & Suporte Técnico
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Os equipamentos distribuídos pela Athena contam com a garantia legal de 90 dias prevista no Código de Defesa do Consumidor (CDC) somada à garantia contratual oferecida por cada fabricante parceiro (ex: Launch Tech, Mahle, Sun Diagnostic, etc.), contada a partir da emissão da Nota Fiscal Eletrônica.
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  A garantia cobre defeitos de fabricação de peças e sistemas originais. Não estão cobertos danos causados por instalação elétrica incorreta, falta de aterramento, queda física, sobrecarga de peso além da capacidade nominal do elevador ou negligência de manutenção periódica.
                </p>
              </section>

              {/* Seção 6 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">6</span>
                  Propriedade Intelectual & Marcas Registradas
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Todo o design do site, layout, logotipos da Athena Soluções Automotivas, código-fonte e compilados são protegidos pela legislação de direitos autorais. As marcas de fabricantes parceiros (LAUNCH, MAHLE, SUN, RAVAGLIOLI, FORTG, etc.) citadas no catálogo pertencem exclusivamente aos seus respectivos titulares e são exibidas estritamente a título de identificação comercial dos produtos distribuídos.
                </p>
              </section>

              {/* Seção 7 */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">7</span>
                  Foro de Eleição
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Para dirimir qualquer dúvida ou controvérsia oriunda deste contrato, as partes elegem o Foro da Circunscrição Judiciária de Brasília, Distrito Federal, com expressa renúncia a qualquer outro, por mais privilegiado que seja.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDADE (LGPD) */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
              <div className="border-b border-slate-800 pb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <Lock className="w-6 h-6 text-amber-400" />
                  Política de Privacidade & Proteção de Dados (LGPD)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Em conformidade integral com a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018).
                </p>
              </div>

              {/* 1. Compromisso */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                  Nosso Compromisso com sua Privacidade
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  A <strong className="text-white">Athena Soluções Automotivas</strong> valoriza a segurança, a confidencialidade e a integridade dos dados de seus clientes, parceiros e visitantes. Esta política detalha de forma simples e transparente como coletamos, tratamos, armazenamos e protegemos seus dados pessoais e empresariais.
                </p>
              </section>

              {/* 2. Dados Coletados */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                  Dados que Coletamos e Suas Respectivas Finalidades
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 block text-sm">Dados Cadastrais & Fiscais</span>
                    <p className="text-slate-400">
                      <strong>Coleta:</strong> Nome completo ou Razão Social, CPF ou CNPJ, Inscrição Estadual (IE).<br/>
                      <strong>Finalidade Legal:</strong> Emissão de Nota Fiscal Eletrônica (NFe) perante a SEFAZ, elaboração de contratos comerciais de compra e venda e conformidade fiscal (Art. 7º, II e V da LGPD).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 block text-sm">Dados de Contato & Comunicação</span>
                    <p className="text-slate-400">
                      <strong>Coleta:</strong> E-mail corporativo ou pessoal, telefone celular / WhatsApp comercial.<br/>
                      <strong>Finalidade Legal:</strong> Envio de comprovantes de compra, código de rastreamento de transporte, recuperação de senha segura e alertas de saldo de A-Points.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 block text-sm">Endereço de Entrega & Logística</span>
                    <p className="text-slate-400">
                      <strong>Coleta:</strong> CEP, logradouro, número, complemento, bairro, município e UF.<br/>
                      <strong>Finalidade Legal:</strong> Despacho logístico de máquinas pesadas através de transportadoras rodoviárias autorizadas e entrega técnica no auto center.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 block text-sm">Dados Financeiros & Transacionais</span>
                    <p className="text-slate-400">
                      <strong>Coleta:</strong> Histórico de pedidos, comprovantes e faturas.<br/>
                      <strong>Proteção Bancária:</strong> Dados confidenciais de cartão são transacionados diretamente nos servidores seguros do Asaas com certificação PCI-DSS. <em>A Athena não armazena números de cartões de crédito.</em>
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. Compartilhamento Seguro */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                  Compartilhamento Seguro com Operadores & Terceiros Homologados
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  A Athena não comercializa nem compartilha dados de clientes para publicidade externa invasiva. O compartilhamento estritamente necessário ocorre apenas com parceiros essenciais para a prestação do serviço:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-400 pl-2">
                  <li><strong>Omie ERP:</strong> Sistema de gestão onde as vendas são consolidadas e notas fiscais são emitidas e transmitidas ao Fisco.</li>
                  <li><strong>Asaas Gestão Financeira:</strong> Instituição de pagamento que opera as liquidações via PIX, Boletos e Cartão.</li>
                  <li><strong>Transportadoras Rodoviárias Parceiras:</strong> Para a realização do frete interestadual e entrega das máquinas.</li>
                  <li><strong>Autoridades Públicas e Tributárias:</strong> Quando exigido por lei ou ordem judicial.</li>
                </ul>
              </section>

              {/* 4. Direitos do Titular LGPD */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">4</span>
                  Seus Direitos como Titular de Dados (Art. 18 da LGPD)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Você possui total controle sobre seus dados pessoais. A qualquer momento, você pode exercer os seguintes direitos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Confirmação da existência de tratamento</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Acesso detalhado aos seus dados</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Correção de dados incompletos ou inexatos</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Anonimização ou bloqueio de dados desnecessários</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Eliminação dos dados (respeitada a retenção fiscal)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Revogação do consentimento concedido</span>
                  </div>
                </div>
              </section>

              {/* 5. DPO / Contato */}
              <section className="space-y-3 pt-2">
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Mail className="w-4 h-4" />
                    Encarregado de Proteção de Dados (DPO) & Canal de Contato
                  </div>
                  <p className="text-slate-300">
                    Para solicitações relativas à LGPD, correção cadastral ou dúvidas sobre privacidade, entre em contato diretamente com nossa equipe responsável:
                  </p>
                  <p className="text-white font-mono text-xs">
                    E-mail: <a href="mailto:contato@athenaconsultoria.com.br" className="text-amber-400 hover:underline">contato@athenaconsultoria.com.br</a><br/>
                    WhatsApp Oficial: <a href="https://wa.me/5561983485671" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">(61) 98348-5671</a>
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: POLÍTICA DE COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
              <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Cookie className="w-6 h-6 text-amber-400" />
                    Política de Cookies & Tecnologias de Navegação
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Entenda como e por que utilizamos cookies e como você pode gerenciar suas preferências a qualquer momento.
                  </p>
                </div>

                <button
                  onClick={openCookieSettings}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-colors shadow-md cursor-pointer shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Gerenciar Preferências</span>
                </button>
              </div>

              {/* 1. O que são */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                  O que são Cookies?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Cookies são pequenos arquivos de texto armazenados no seu navegador pelo site quando você o visita. Eles servem para manter sua sessão conectada com segurança, lembrar os itens que você adicionou ao carrinho de equipamentos e garantir que a página carregue com mais rapidez e fluidez.
                </p>
              </section>

              {/* 2. Categorias */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                  Categorias de Cookies Utilizados na Athena
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        1. Cookies Estritamente Necessários (Sempre Ativos)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Obrigatório
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Essenciais para que o site funcione. Permitem navegar pelas páginas, autenticar login seguro, manter produtos no carrinho enquanto você visualiza outros equipamentos e proteger as solicitações contra ataques de falsificação (CSRF).
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      Exemplos: <code>athena_session_id</code>, <code>athena_cart</code>, <code>athena_cookie_consent</code>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        2. Cookies de Preferências & Funcionalidade
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Permitem que o catálogo lembre suas escolhas personalizadas, como filtros de categoria aplicados, ordenação por preço e última visualização para tornar sua navegação mais ágil.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        3. Cookies de Desempenho & Análise Anônima
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Coletam métricas agregadas e completamente anônimas sobre quais páginas de elevadores ou scanners possuem maior engajamento, permitindo que a nossa equipe otimize a velocidade e os recursos técnicos da plataforma.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. Como gerenciar no navegador */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                  Como Alterar ou Desativar Cookies no seu Navegador
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Além do nosso banner de consentimento no rodapé, você pode limpar ou bloquear cookies diretamente nas configurações de privacidade do seu navegador:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                  <li><strong>Google Chrome:</strong> Configurações ➔ Privacidade e Segurança ➔ Cookies de terceiros.</li>
                  <li><strong>Mozilla Firefox:</strong> Configurações ➔ Privacidade e Segurança ➔ Cookies e dados de sites.</li>
                  <li><strong>Microsoft Edge:</strong> Configurações ➔ Cookies e permissões de site.</li>
                  <li><strong>Apple Safari:</strong> Preferências ➔ Privacidade ➔ Bloquear todos os cookies.</li>
                </ul>
              </section>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
