import React from "react";
import {
  Mail,
  ToggleRight,
  ToggleLeft,
  Zap,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
  Check,
  Send,
  Coins,
  Gift,
  Sparkles,
  ShieldCheck,
  Key,
  Lock,
  EyeOff,
  Eye,
  Settings,
  Shield
} from "lucide-react";

export default function SettingsSecurityTab({
  notificationSettings,
  setNotificationSettings,
  handleSaveNotificationSettings,
  savingNotifications,
  showApiSettings,
  setShowApiSettings,
  showAdvancedEmailSettings,
  setShowAdvancedEmailSettings,
  testEmailAddress,
  setTestEmailAddress,
  handleSendTestEmail,
  testingEmail,
  showNotification,
  telegramStatus,
  handleTestTelegram,
  testingTelegram,
  handleChangePassword,
  showAdminCurrentPass,
  setShowAdminCurrentPass,
  passwordForm,
  setPasswordForm,
  showAdminNewPass,
  setShowAdminNewPass,
  showAdminConfirmPass,
  setShowAdminConfirmPass,
  isChangingPassword,
  handleUpdateProfile,
  profileForm,
  setProfileForm
}) {
  return (
          <div className="space-y-6">
            
            {/* E-MAILS DE COMPROVANTES & NOTIFICAÇÕES (CARD PRINCIPAL) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      E-mails para Comprovantes & Alertas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Receba o comprovante de cada faturamento no Omie ERP e de cada resgate de pontos no site.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notificationSettings.activeProvider === 'resend' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Resend API Ativo (Porta 443)
                    </span>
                  ) : notificationSettings.activeProvider === 'brevo' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Brevo API Ativo (Porta 443)
                    </span>
                  ) : notificationSettings.smtpConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Google SMTP (Porta 587)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Modo Registro / Log
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveNotificationSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Receipt Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>E-mail Principal para Recebimento de Comprovantes *</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        Vendas Omie & Resgates A-Points
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ex: administracao@athenaconsultoria.com.br, financeiro@athenaconsultoria.com.br"
                        value={notificationSettings.receiptNotificationEmail}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, receiptNotificationEmail: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Para múltiplos e-mails, separe os endereços com vírgula. Todos receberão uma cópia de cada comprovante.
                    </p>
                  </div>

                  {/* Toggle: Envio automático */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Disparo Automático de Alertas
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Enviar e-mails em tempo real a cada compra ou resgate
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({ ...notificationSettings, emailNotificationsEnabled: !notificationSettings.emailNotificationsEnabled })}
                      className="cursor-pointer text-amber-600 focus:outline-none"
                    >
                      {notificationSettings.emailNotificationsEnabled ? (
                        <ToggleRight className="w-8 h-8 text-amber-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Toggle: Cópia para o cliente */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Comprovante para o Cliente
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Enviar cópia do comprovante ao e-mail cadastrado do cliente
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({ ...notificationSettings, sendCustomerCopy: !notificationSettings.sendCustomerCopy })}
                      className="cursor-pointer text-amber-600 focus:outline-none"
                    >
                      {notificationSettings.sendCustomerCopy ? (
                        <ToggleRight className="w-8 h-8 text-amber-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* HTTP Cloud Providers Section (Solução para Render.com / Nuvem) */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Provedores de E-mail via API HTTP (Resend / Brevo)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Envio direto via HTTPS (Porta 443) com alta velocidade de entrega.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowApiSettings(!showApiSettings)}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors shrink-0"
                    >
                      <span>{showApiSettings ? 'Ocultar Chaves' : 'Configurar Resend / Brevo'}</span>
                      {showApiSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {showApiSettings && (
                    <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-200">
                      {/* Resend API Block */}
                      <div className="space-y-3 pb-4 border-b border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Opção 1: Resend API (Recomendado)</span>
                          </label>
                          <a 
                            href="https://resend.com/signup" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                          >
                            <span>Obter chave gratuita no Resend (100 e-mails/dia)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 block">
                              Chave de API (RESEND_API_KEY)
                            </label>
                            <input
                              type="text"
                              placeholder={notificationSettings.hasResendApiKey ? 'Chave salva (digite para alterar)' : 're_123456789...'}
                              value={notificationSettings.resendApiKey || ''}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, resendApiKey: e.target.value })}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 block">
                              Remetente Resend (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Athena <onboarding@resend.dev> ou seu domínio"
                              value={notificationSettings.resendFromEmail || ''}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, resendFromEmail: e.target.value })}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Para testes imediatos para seu próprio e-mail, pode deixar vazio (usará <code>onboarding@resend.dev</code>). Para enviar para clientes, adicione seu domínio próprio no painel do Resend.
                        </p>
                      </div>

                      {/* Brevo API Block */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                            <span>Opção 2: Brevo / Sendinblue API</span>
                          </label>
                          <a 
                            href="https://www.brevo.com/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                          >
                            <span>Criar conta gratuita no Brevo (300 e-mails/dia)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 block">
                              Chave de API (BREVO_API_KEY)
                            </label>
                            <input
                              type="text"
                              placeholder={notificationSettings.hasBrevoApiKey ? 'Chave salva (digite para alterar)' : 'xkeysib-...'}
                              value={notificationSettings.brevoApiKey || ''}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, brevoApiKey: e.target.value })}
                              className="w-full bg-white border border-slate-300 focus:border-sky-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 block">
                              E-mail Remetente no Brevo
                            </label>
                            <input
                              type="text"
                              placeholder="athena.consultoria.automotiva@gmail.com"
                              value={notificationSettings.brevoSenderEmail || ''}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, brevoSenderEmail: e.target.value })}
                              className="w-full bg-white border border-slate-300 focus:border-sky-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          300 e-mails/dia grátis. Permite enviar utilizando seu Gmail verificado como remetente pela API REST do Brevo sem restrições de porta.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Options Accordion */}
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedEmailSettings(!showAdvancedEmailSettings)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{showAdvancedEmailSettings ? 'Ocultar' : 'Exibir'} direcionamento específico por setor (Opcional)</span>
                    {showAdvancedEmailSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvancedEmailSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          E-mail exclusivo para Resgates de Pontos
                        </label>
                        <input
                          type="text"
                          placeholder="Deixe em branco para usar o e-mail principal"
                          value={notificationSettings.loyaltyNotificationEmail}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, loyaltyNotificationEmail: e.target.value })}
                          className="w-full bg-white border border-slate-300 focus:border-amber-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                        />
                        <p className="text-[10px] text-slate-400">Direciona solicitações de brindes/recompensas</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          E-mail exclusivo para Compras / Faturamento
                        </label>
                        <input
                          type="text"
                          placeholder="Deixe em branco para usar o e-mail principal"
                          value={notificationSettings.purchaseNotificationEmail}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, purchaseNotificationEmail: e.target.value })}
                          className="w-full bg-white border border-slate-300 focus:border-amber-500 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                        />
                        <p className="text-[10px] text-slate-400">Direciona avisos de vendas faturadas no ERP</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={savingNotifications}
                    className="btn-gold text-xs font-bold py-3 px-6 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando Configurações...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar Configurações de E-mail</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Test Email Section */}
              <div className="border-t border-slate-100 pt-6 mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Testar Envio de Comprovante em Tempo Real
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Envie uma simulação de comprovante para a sua caixa de entrada e confirme a formatação visual e a entrega:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="E-mail de destino para o teste"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSendTestEmail('general')}
                      disabled={testingEmail}
                      className="btn-secondary text-xs py-2.5 px-3 font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Testa envio básico de SMTP"
                    >
                      {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Teste de Conexão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendTestEmail('purchase')}
                      disabled={testingEmail}
                      className="btn-secondary text-xs py-2.5 px-3 font-bold flex items-center gap-1.5 cursor-pointer hover:border-emerald-300 hover:text-emerald-700"
                      title="Simula comprovante de faturamento de compra"
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Testar Compra</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendTestEmail('redemption')}
                      disabled={testingEmail}
                      className="btn-secondary text-xs py-2.5 px-3 font-bold flex items-center gap-1.5 cursor-pointer hover:border-amber-300 hover:text-amber-700"
                      title="Simula comprovante de resgate de benefício"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>Testar Resgate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hermes Agent Integration Info */}
              <div className="border-t border-slate-100 pt-6 mt-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Integração com o Hermes Agent (WhatsApp & CRM)
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                    API Bridge 2.0 Pronta
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  O Hermes pode consultar clientes, saldo de pontos, recompensas e produtos diretamente pela API da Athena:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">URL Base da API do Hermes:</span>
                    <code className="block bg-white p-2 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 select-all">
                      https://athena-backend-hu1m.onrender.com/api/hermes
                    </code>
                    <span className="text-[10px] text-slate-400 block mt-0.5">ou via domínio: https://athenaconsultoria.com.br/api/hermes</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Chave de Autenticação (x-hermes-key):</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-2 rounded-xl border border-slate-200 font-mono text-[11px] text-purple-800 font-bold select-all">
                        {notificationSettings.hermesSecretKey || '••••••••••••••••'}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          if (notificationSettings.hermesSecretKey) {
                            navigator.clipboard.writeText(notificationSettings.hermesSecretKey);
                            showNotification('Chave do Hermes copiada!', 'success');
                          } else {
                            showNotification('Chave ainda não carregada ou não configurada.', 'warning');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                  <span>Endpoints disponíveis para o Hermes:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">/customers/:id</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">/rewards</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">/products</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">/loyalty/insights</span>
                </div>
              </div>

            </div>

            {/* CENTRAL DE MONITORAMENTO & ALERTAS NO TELEGRAM */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Canal de Alertas & Segurança no Telegram
                      </h3>
                      {telegramStatus.configured ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Bot Conectado ao Render (Monitoramento Ativo)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Configuração em Andamento no Render
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Classificação em 3 níveis: sirene ativa para falhas críticas (P0), silencioso para avisos (P1) e descarte automático de ruído (P2).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="btn-gold text-xs font-extrabold py-2.5 px-4 shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                  title="Disparar mensagem de teste ao bot do Telegram agora"
                >
                  {testingTelegram ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando Bot...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Disparar Teste no Telegram</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informações dos Níveis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                  <span className="text-[11px] font-black uppercase text-rose-800 flex items-center gap-1.5">
                    <span>🚨</span> Nível 1: Falha Crítica
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Banco PostgreSQL inacessível, crash da API ou tentativa de forja de Webhook. <strong>Som alto imediato</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1.5">
                    <span>⚠️</span> Nível 2: Degradação & Alto Valor
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    APIs de frete oscilando, força bruta de login ou pedidos acima de R$ 10.000. <strong>Silencioso c/ Cooldown 15m</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <span>🛡️</span> Nível 3: Anti-Spam / Ruído
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Bots em 404, erro de digitação de CEP de cliente e cupons expirados. <strong>Zero Telegram</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* FILTRO DE TRÁFEGO INTERNO & EXCLUSÃO DE IPs NAS ANÁLISES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Bloqueio de IPs nas Análises (Filtro de Tráfego Interno)
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Proteção Ativa (GA4, Meta CAPI, TikTok, Clarity & Blog)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Endereços IP listados abaixo (como <code className="font-mono font-bold text-slate-700">189.6.7.14</code>) navegam normalmente na loja, mas nunca são contabilizados nas métricas de tráfego, buscas ou visualizações.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Endereços IP Ignorados nas Análises (Separados por vírgula)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const myIp = window.localStorage?.getItem('athena_client_ip');
                        if (!myIp) {
                          showNotification('Não foi possível detectar o IP atual automaticamente.', 'warning');
                          return;
                        }
                        const current = notificationSettings.analyticsIgnoredIps || '189.6.7.14';
                        if (current.includes(myIp)) {
                          showNotification(`Seu IP atual (${myIp}) já está na lista de ignorados!`, 'info');
                          return;
                        }
                        setNotificationSettings({
                          ...notificationSettings,
                          analyticsIgnoredIps: current ? `${current}, ${myIp}` : myIp
                        });
                      }}
                      className="text-[11px] font-extrabold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      + Adicionar Meu IP Atual
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 189.6.7.14, 200.150.10.25"
                    value={notificationSettings.analyticsIgnoredIps ?? '189.6.7.14'}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, analyticsIgnoredIps: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none font-mono transition-colors"
                  />
                  <p className="text-[11px] text-slate-500">
                    O IP principal <strong className="text-slate-800 font-mono">189.6.7.14</strong> já é bloqueado nativamente no navegador (Google Analytics 4, GTM, Meta Pixel, TikTok Pixel e Microsoft Clarity) e no servidor (Meta CAPI, buscas do catálogo e contador de visualizações do blog).
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNotifications}
                    className="btn-gold text-xs font-bold py-2.5 px-5 shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando IPs...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar Lista de IPs Ignorados</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Lower Grid: Password and Profile Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Change Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Alterar Senha de Acesso
                    </h3>
                    <p className="text-xs text-slate-500">
                      Defina uma nova senha segura para o seu login.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Senha Atual *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminCurrentPass ? 'text' : 'password'}
                        placeholder="Digite sua senha atual"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-10 py-3 outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowAdminCurrentPass(!showAdminCurrentPass)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer z-10"
                        title={showAdminCurrentPass ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showAdminCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminNewPass ? 'text' : 'password'}
                        placeholder="Digite a nova senha (mínimo 4 caracteres)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={4}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-10 py-3 outline-none"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer z-10"
                        title={showAdminNewPass ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showAdminNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Confirmar Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminConfirmPass ? 'text' : 'password'}
                        placeholder="Repita a nova senha"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        minLength={4}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-10 py-3 outline-none"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer z-10"
                        title={showAdminConfirmPass ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showAdminConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full btn-gold text-xs font-bold py-3.5 shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isChangingPassword ? 'Salvando...' : 'Atualizar Minha Senha'}</span>
                  </button>
                </form>
              </div>

              {/* Profile Info Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Dados do Administrador
                    </h3>
                    <p className="text-xs text-slate-500">
                      Informações da conta de gerenciamento.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white text-slate-900 text-xs rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      E-mail de Login
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white text-slate-900 text-xs rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                    <span className="font-bold text-slate-900 block">Nível de Permissão:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                      <Shield className="w-3.5 h-3.5" /> Administrador Geral (Acesso Total)
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-secondary text-xs font-bold py-3.5 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Salvar Dados de Perfil</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
  );
}
