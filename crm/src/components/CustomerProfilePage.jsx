import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Heart, 
  Trophy, 
  Compass, 
  Save, 
  History, 
  CheckCircle2, 
  ShoppingBag, 
  Award, 
  Clock, 
  ExternalLink,
  MessageCircle,
  FileText,
  Wrench,
  ShieldCheck,
  Tag,
  Copy,
  Check
} from 'lucide-react';

export default function CustomerProfilePage({ customer, onBack, onCustomerUpdated }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('ficha'); // 'ficha', 'filiais', 'equipamentos', 'familia', 'historico'
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Form State da Ficha Principal
  const [formData, setFormData] = useState({
    name: customer.name || '',
    fantasy_name: customer.fantasy_name || '',
    cpf: customer.cpf || '',
    cnpj: customer.cnpj || '',
    phone: customer.phone || '',
    phone2: customer.phone2 || '',
    email: customer.email || '',
    birthday: customer.birthday ? customer.birthday.slice(0, 10) : '',
    address: customer.address || '',
    city: customer.city || 'Brasília',
    state: customer.state || 'DF',
    cep: customer.cep || '',
    marital_status: customer.marital_status || 'Solteiro(a)',
    spouse_works_in_shop: Boolean(customer.spouse_works_in_shop),
    spouse_birthday: customer.spouse_birthday ? customer.spouse_birthday.slice(0, 10) : '',
    football_team: customer.football_team || '',
    hobbies: customer.hobbies || '',
    category: customer.category || 'Mecânica Geral',
    pipeline_stage: customer.pipeline_stage || 'cliente_ativo',
    notes: customer.notes || ''
  });

  // Equipamentos instalados
  const [equipments, setEquipments] = useState(Array.isArray(customer.equipments) ? customer.equipments : []);
  const [newEquipmentName, setNewEquipmentName] = useState('');

  // Filiais / Pontos de Atendimento
  const [branches, setBranches] = useState(customer.branches || []);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    label: '',
    address: '',
    neighborhood: '',
    city: 'Brasília',
    state: 'DF',
    cep: '',
    phone: ''
  });

  // Histórico
  const [history, setHistory] = useState(customer.history || []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Salvar Ficha Completa
  const handleSaveCustomer = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        equipments
      };

      const res = await crmApiFetch(`/crm/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Ficha do cliente salva com sucesso no PostgreSQL!');
        if (onCustomerUpdated) onCustomerUpdated(data.data);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Erro ao atualizar: ${errData.error || 'Falha no servidor'}`);
      }
    } catch (err) {
      showToast('Falha na conexão com o banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  // Adicionar Filial
  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.address.trim()) {
      showToast('Endereço da filial é obrigatório.');
      return;
    }

    try {
      const res = await crmApiFetch(`/crm/customers/${customer.id}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch)
      });
      if (res.ok) {
        const data = await res.json();
        setBranches([...branches, data.data]);
        setShowAddBranch(false);
        setNewBranch({ label: '', address: '', neighborhood: '', city: 'Brasília', state: 'DF', cep: '', phone: '' });
        showToast('Nova filial adicionada ao cadastro!');
      }
    } catch (_) {
      showToast('Falha ao adicionar filial.');
    }
  };

  // Remover Filial
  const handleDeleteBranch = async (branchId) => {
    try {
      const res = await crmApiFetch(`/crm/customers/branches/${branchId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBranches(branches.filter(b => b.id !== branchId));
        showToast('Filial removida com sucesso.');
      }
    } catch (_) {
      showToast('Falha ao remover filial.');
    }
  };

  // Adicionar Equipamento
  const handleAddEquipment = () => {
    if (!newEquipmentName.trim()) return;
    const updated = [...equipments, newEquipmentName.trim()];
    setEquipments(updated);
    setNewEquipmentName('');
  };

  const handleRemoveEquipment = (index) => {
    const updated = equipments.filter((_, idx) => idx !== index);
    setEquipments(updated);
  };

  const isCasado = formData.marital_status === 'Casado(a)' || formData.marital_status === 'União Estável';
  const cleanPhone = (formData.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
  const docValue = (formData.cnpj || formData.cpf || '').trim();

  const handleCopyDoc = () => {
    if (!docValue) return;
    navigator.clipboard.writeText(docValue);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* ============================================================ */}
      {/* TOPO DA PÁGINA: NAVEGAÇÃO E IDENTIFICAÇÃO DO CLIENTE          */}
      {/* ============================================================ */}
      <div className={`px-6 py-5 border-b shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 mt-0.5 ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Voltar para a Base Central de Clientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-black text-xl sm:text-2xl tracking-tight">
                  {formData.name || 'Cliente Sem Nome'}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                  isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {formData.category}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  (formData.pipeline_stage === 'cliente_ativo' || formData.pipeline_stage === 'ganho')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {formData.pipeline_stage === 'cliente_ativo' ? 'Cliente Ativo' : formData.pipeline_stage === 'ganho' ? 'Parceria Fechada' : 'Lead'}
                </span>
              </div>

              {formData.fantasy_name && formData.fantasy_name !== formData.name && (
                <div className="flex items-center gap-2 text-sm font-bold text-amber-500 mt-1">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{formData.fantasy_name}</span>
                </div>
              )}

              {/* Linha de dados rápidos */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                {docValue && (
                  <span className="flex items-center gap-1.5 font-mono cursor-pointer" onClick={handleCopyDoc} title="Clique para copiar">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{docValue}</span>
                    {copiedDoc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </span>
                )}
                {formData.phone && (
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formData.phone}</span>
                  </span>
                )}
                {formData.phone2 && (
                  <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formData.phone2} <span className="text-[10px] text-amber-500 font-normal">(Tel 2)</span></span>
                  </span>
                )}
                {formData.email && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formData.email}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formData.city} • {formData.state}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação Principais no Topo */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleSaveCustomer}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Gravando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BARRA DE NAVEGAÇÃO DE ABAS DA PÁGINA INTEIRA                  */}
      {/* ============================================================ */}
      <div className={`px-6 border-b flex items-center gap-2 overflow-x-auto shrink-0 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {[
          { id: 'ficha', label: 'Ficha Cadastral', icon: FileText },
          { id: 'filiais', label: `Filiais & Unidades (${branches.length})`, icon: MapPin },
          { id: 'equipamentos', label: `Equipamentos (${equipments.length})`, icon: Wrench },
          { id: 'familia', label: 'Perfil Pessoal & Família', icon: Heart },
          { id: 'historico', label: `Histórico & Timeline (${history.length})`, icon: History }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-500 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* CONTEÚDO PRINCIPAL DA PÁGINA (SCROLL TOTAL E ESPAÇO AMPLO)   */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 min-h-0">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* -------------------------------------------------------- */}
          {/* ABA 1: FICHA CADASTRAL COMPLETA                          */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'ficha' && (
            <form onSubmit={handleSaveCustomer} className="space-y-6">
              {/* Card de Identificação */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Identificação da Empresa & Responsável
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Nome do Responsável / Titular *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Nome Fantasia da Oficina</label>
                    <input
                      type="text"
                      value={formData.fantasy_name}
                      onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">CNPJ</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Telefone Principal (WhatsApp)</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(61) 90000-0000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Telefone 2 / Recado</label>
                    <input
                      type="text"
                      value={formData.phone2}
                      onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                      placeholder="(61) 98888-8888"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Email de Contato</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@oficina.com.br"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Card de Localização Matriz */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-wider text-amber-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço da Matriz / Oficina Principal
                  </h3>
                  {formData.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.address}, ${formData.city}, ${formData.state}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                    >
                      <span>Abrir no Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Logradouro, Número e Complemento</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Rua 03 Chácara 84 Lotes 21/22"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">CEP</label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="70000-000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Brasília"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Estado</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="DF"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Tipo / Segmento da Oficina</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Mecânica Geral">Mecânica Geral</option>
                      <option value="Borracharia / Pneus">Borracharia / Pneus</option>
                      <option value="Lanternagem e Pintura">Lanternagem e Pintura</option>
                      <option value="Detail / Estética Automotiva">Detail / Estética</option>
                      <option value="Auto Elétrica">Auto Elétrica</option>
                      <option value="Concessionária / Outros">Concessionária / Outros</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Observações Internas */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-500">
                  Notas Comerciais & Observações Estratégicas
                </h3>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações internas sobre preferências do cliente, prazos de negociação, marcas de ferramentas preferidas, etc."
                  className={`w-full p-4 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Gravando Dados...' : 'Salvar Ficha do Cliente'}</span>
                </button>
              </div>
            </form>
          )}

          {/* -------------------------------------------------------- */}
          {/* ABA 2: FILIAIS & UNIDADES                                */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'filiais' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base tracking-tight">Unidades & Filiais Cadastradas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Gerenciamento de outros endereços e lojas do mesmo grupo automotivo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBranch(!showAddBranch)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddBranch ? 'Fechar Formulário' : 'Nova Filial'}</span>
                </button>
              </div>

              {/* Formulário de Nova Filial */}
              {showAddBranch && (
                <form onSubmit={handleAddBranch} className={`p-6 rounded-2xl border space-y-4 animate-in fade-in ${
                  isDark ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-300 shadow-md'
                }`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500">Dados da Nova Unidade</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Identificação / Nome da Unidade *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Filial Águas Claras"
                        value={newBranch.label}
                        onChange={(e) => setNewBranch({ ...newBranch, label: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 block mb-1">Endereço Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Rua, Número, Quadra, Lote"
                        value={newBranch.address}
                        onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Bairro / RA</label>
                      <input
                        type="text"
                        placeholder="Ex: Taguatinga Sul"
                        value={newBranch.neighborhood}
                        onChange={(e) => setNewBranch({ ...newBranch, neighborhood: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Telefone da Unidade</label>
                      <input
                        type="text"
                        placeholder="(61) 90000-0000"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Cidade</label>
                      <input
                        type="text"
                        value={newBranch.city}
                        onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBranch(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition"
                    >
                      Salvar Filial
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Filiais */}
              {branches.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                  <MapPin className="w-10 h-10 opacity-30 mx-auto mb-2 text-amber-500" />
                  <p className="font-bold text-sm">Nenhuma filial adicional cadastrada</p>
                  <p className="text-xs text-slate-500 mt-1">Este cliente opera atualmente apenas com o endereço matriz principal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="font-black text-sm text-amber-400">{b.label}</h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(b.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remover unidade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300">{b.address}</p>
                        {b.neighborhood && <p className="text-xs text-slate-400 mt-0.5">{b.neighborhood} • {b.city || 'DF'}</p>}
                        {b.phone && <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {b.phone}</p>}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-end">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address}, ${b.city || 'DF'}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>Ver no Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* ABA 3: EQUIPAMENTOS INSTALADOS                           */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'equipamentos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base tracking-tight">Equipamentos & Máquinas da Oficina</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Mapeamento do parque de máquinas instalado (elevadores, alinhadores, scanners, compressores)</p>
                </div>
              </div>

              {/* Inserir Equipamento */}
              <div className={`p-5 rounded-2xl border flex items-center gap-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={newEquipmentName}
                  onChange={(e) => setNewEquipmentName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEquipment(); } }}
                  placeholder="Nome do equipamento (Ex: Elevador Hidráulico 4.0T Mahovi, Scanner Raven 3...)"
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddEquipment}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer shrink-0"
                >
                  Adicionar Máquina
                </button>
              </div>

              {equipments.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                  <Wrench className="w-10 h-10 opacity-30 mx-auto mb-2 text-amber-500" />
                  <p className="font-bold text-sm">Nenhum equipamento registrado ainda</p>
                  <p className="text-xs text-slate-500 mt-1">Cadastre os equipamentos para acompanhar manutenções, peças de reposição e vendas de upgrades.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {equipments.map((eq, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs truncate">{eq}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* ABA 4: PERFIL PESSOAL & FAMÍLIA                          */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'familia' && (
            <form onSubmit={handleSaveCustomer} className="space-y-6">
              <div className={`p-6 rounded-2xl border space-y-5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Dados Familiares & Aniversários (Ações de Relacionamento)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Estado Civil</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="União Estável">União Estável</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Data de Aniversário do Cliente</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Se Casado: Cônjuge */}
                {isCasado && (
                  <div className={`p-5 rounded-xl border space-y-4 animate-in fade-in ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={formData.spouse_works_in_shop}
                        onChange={(e) => setFormData({ ...formData, spouse_works_in_shop: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Cônjuge trabalha na oficina / auto center?</span>
                    </label>

                    {formData.spouse_works_in_shop && (
                      <div className="pt-3 border-t border-slate-800 animate-in fade-in max-w-sm">
                        <label className="text-xs font-bold text-amber-400 block mb-1.5">
                          Data de Aniversário do Cônjuge
                        </label>
                        <input
                          type="date"
                          value={formData.spouse_birthday}
                          onChange={(e) => setFormData({ ...formData, spouse_birthday: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <span className="text-[11px] text-slate-400 mt-1.5 block">
                          Ideal para ações de relacionamento, envio de brindes especiais e parabenizações personalizadas da Athena!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gostos & Hobbies */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Interesses & Relacionamento Comercial
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Time de Futebol do Coração</label>
                    <input
                      type="text"
                      value={formData.football_team}
                      onChange={(e) => setFormData({ ...formData, football_team: e.target.value })}
                      placeholder="Ex: Flamengo, São Paulo, Corinthians..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Hobbies / Lazer</label>
                    <input
                      type="text"
                      value={formData.hobbies}
                      onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                      placeholder="Ex: Pesca, churrasco, kart, carros antigos..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Gravando Dados...' : 'Salvar Ficha do Cliente'}</span>
                </button>
              </div>
            </form>
          )}

          {/* -------------------------------------------------------- */}
          {/* ABA 5: HISTÓRICO & LINHA DO TEMPO                        */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'historico' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base tracking-tight">Linha do Tempo de Atendimentos</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visitas presenciais, compras efetuadas, contatos e pontos fidelidade</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                  <History className="w-10 h-10 opacity-30 mx-auto mb-2 text-amber-500" />
                  <p className="font-bold text-sm">Nenhum evento registrado no histórico</p>
                  <p className="text-xs text-slate-500 mt-1">Conforme novas visitas e compras forem realizadas, elas aparecerão ordenadas aqui.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-slate-800 ml-4">
                  {history.map((h, idx) => {
                    let badgeColor = 'bg-blue-500 text-white';
                    let IconComponent = Clock;

                    if (h.type === 'visita') {
                      badgeColor = 'bg-amber-500 text-slate-950';
                      IconComponent = MapPin;
                    } else if (h.type === 'compra') {
                      badgeColor = 'bg-emerald-500 text-slate-950';
                      IconComponent = ShoppingBag;
                    } else if (h.type === 'apoints') {
                      badgeColor = 'bg-purple-500 text-white';
                      IconComponent = Award;
                    } else if (h.type === 'agendamento') {
                      badgeColor = 'bg-sky-500 text-white';
                      IconComponent = Calendar;
                    }

                    return (
                      <div key={h.id || idx} className="relative group">
                        <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${badgeColor}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className={`p-5 rounded-2xl border transition ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <h4 className="font-black text-sm">{h.title}</h4>
                            <span className="text-xs text-slate-400 font-mono">
                              {h.occurred_at ? new Date(h.occurred_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>

                          {h.details && typeof h.details === 'object' && Object.keys(h.details).length > 0 && (
                            <div className="mt-3 text-xs text-slate-400 space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                              {Object.entries(h.details).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between">
                                  <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                                    {typeof v === 'number' ? `R$ ${v.toFixed(2)}` : String(v)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notificador Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
