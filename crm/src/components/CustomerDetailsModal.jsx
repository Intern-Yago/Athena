import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import { 
  X, 
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
  FileText
} from 'lucide-react';

export default function CustomerDetailsModal({ customer, onClose, onCustomerUpdated }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('ficha'); // 'ficha' ou 'historico'
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form State da Ficha
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
    notes: customer.notes || ''
  });

  // Filiais
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
    setTimeout(() => setToast(''), 3000);
  };

  // Salvar Ficha Principal
  const handleSaveFicha = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await crmApiFetch(`/crm/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Ficha do cliente atualizada com sucesso no Supabase!');
        if (onCustomerUpdated) onCustomerUpdated(data.data);
      } else {
        showToast('Erro ao atualizar dados.');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.');
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBranch)
      });
      if (res.ok) {
        const data = await res.json();
        setBranches([...branches, data.data]);
        setShowAddBranch(false);
        setNewBranch({ label: '', address: '', neighborhood: '', city: 'Brasília', state: 'DF', cep: '', phone: '' });
        showToast('Nova filial/endereço adicionado!');
      }
    } catch (err) {
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
        showToast('Endereço de filial removido.');
      }
    } catch (err) {
      showToast('Falha ao remover filial.');
    }
  };

  const isCasado = formData.marital_status === 'Casado(a)' || formData.marital_status === 'União Estável';

  const cleanPhone = (formData.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* ============================================================ */}
        {/* CABEÇALHO DO CLIENTE (NOME, FANTASIA, DOCS, TEL, ANIVERSÁRIO) */}
        {/* ============================================================ */}
        <div className={`p-5 border-b shrink-0 ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Nome do Cliente */}
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg sm:text-xl truncate">
                  {formData.name || 'Cliente Sem Nome'}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {formData.category}
                </span>
              </div>

              {/* Nome Fantasia (logo abaixo do nome) */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mt-0.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{formData.fantasy_name || 'Sem Nome Fantasia informado'}</span>
              </div>

              {/* Informações Cadastrais Básicas (CPF, CNPJ, Telefone, Email, Aniversário) */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                {formData.cpf && (
                  <span>CPF: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formData.cpf}</strong></span>
                )}
                {formData.cnpj && (
                  <span>CNPJ: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formData.cnpj}</strong></span>
                )}
                {formData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formData.phone}</strong>
                    {whatsappUrl && (
                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 ml-1 inline-flex items-center"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </span>
                )}
                {formData.phone2 && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{formData.phone2} <span className="text-[10px] text-amber-500 font-normal">(Tel 2)</span></strong>
                    {formData.phone2.replace(/\D/g, '') && (
                      <a 
                        href={`https://wa.me/55${formData.phone2.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 ml-1 inline-flex items-center"
                        title="Conversar no WhatsApp (Tel 2)"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </span>
                )}
                {formData.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-400" />
                    <span className="truncate max-w-[200px]">{formData.email}</span>
                  </span>
                )}
                {formData.birthday && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    <span>Niver: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formData.birthday}</strong></span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LINHA DIVISÓRIA & SELETOR DE ABAS: FICHA / HISTÓRICO           */}
        {/* ============================================================ */}
        <div className={`px-5 border-b flex items-center gap-2 shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('ficha')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'ficha'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ficha do Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'historico'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico na Athena</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {history.length}
            </span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CORPO DO MODAL (COM SCROLL INTERNO)                           */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
          {/* ---------------------------------------------------------- */}
          {/* ABA 1: FICHA                                                */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'ficha' && (
            <form onSubmit={handleSaveFicha} className="space-y-5">
              {/* ENDEREÇO PRINCIPAL E FILIAIS */}
              <div className={`p-4 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Endereço Principal & Filiais
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddBranch(v => !v)}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Endereço / Filial</span>
                  </button>
                </div>

                {/* Endereço Matriz */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-400">
                        Endereço da Matriz / Oficina Principal
                      </label>
                      {formData.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.address}, ${formData.city || 'DF'}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>Abrir no Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Rua 03 Chácara 84 Lotes 21/22"
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Cidade / Região
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ex: Vicente Pires"
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Formulário para Nova Filial */}
                {showAddBranch && (
                  <div className={`p-3 rounded-xl border space-y-3 animate-in fade-in ${
                    isDark ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-300'
                  }`}>
                    <span className="text-xs font-bold text-amber-500 block">Cadastrar Nova Filial / Ponto de Atendimento</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Identificação (Ex: Filial Águas Claras)"
                        value={newBranch.label}
                        onChange={(e) => setNewBranch({ ...newBranch, label: e.target.value })}
                        className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Endereço Completo"
                        value={newBranch.address}
                        onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                        className={`sm:col-span-2 px-3 py-1.5 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Bairro / RA"
                        value={newBranch.neighborhood}
                        onChange={(e) => setNewBranch({ ...newBranch, neighborhood: e.target.value })}
                        className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Telefone da Filial"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                        className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddBranch}
                          className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition"
                        >
                          Salvar Filial
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddBranch(false)}
                          className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Filiais Cadastradas */}
                {branches.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block">Filiais Registradas ({branches.length}):</span>
                    {branches.map((b) => (
                      <div 
                        key={b.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <strong className="text-amber-400 block">{b.label}</strong>
                          <span className="text-slate-400">{b.address} {b.neighborhood ? `• ${b.neighborhood}` : ''} {b.phone ? `• Tel: ${b.phone}` : ''}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                          title="Remover filial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ESTADO CIVIL, CÔNJUGE & ANIVERSÁRIO DO CÔNJUGE (Regra Condicional) */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Perfil Pessoal & Família
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
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
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Data de Aniversário do Cliente
                    </label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Se Casado: Checkbox "Cônjuge trabalha na oficina?" */}
                {isCasado && (
                  <div className={`p-3 rounded-xl border space-y-2.5 transition animate-in fade-in ${
                    isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-white border-slate-200'
                  }`}>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={formData.spouse_works_in_shop}
                        onChange={(e) => setFormData({ ...formData, spouse_works_in_shop: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Cônjuge trabalha na oficina?</span>
                    </label>

                    {/* Se marcado: Input "Data de aniversário do cônjuge" */}
                    {formData.spouse_works_in_shop && (
                      <div className="pt-2 border-t border-slate-800/60 animate-in fade-in">
                        <label className="text-[11px] font-bold text-amber-400 block mb-1">
                          Data de Aniversário do Cônjuge
                        </label>
                        <input
                          type="date"
                          value={formData.spouse_birthday}
                          onChange={(e) => setFormData({ ...formData, spouse_birthday: e.target.value })}
                          className={`w-full max-w-xs px-3 py-1.5 rounded-xl border text-xs outline-none ${
                            isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Excelente para ações comerciais de relacionamento e envio de brindes da Athena!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TIME DE FUTEBOL E LAZER */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Interesses & Relacionamento Comercial
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Time de Futebol
                    </label>
                    <input
                      type="text"
                      value={formData.football_team}
                      onChange={(e) => setFormData({ ...formData, football_team: e.target.value })}
                      placeholder="Ex: Flamengo, São Paulo, Corinthians..."
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Lazer / Hobbies
                    </label>
                    <input
                      type="text"
                      value={formData.hobbies}
                      onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                      placeholder="Ex: Pesca, churrasco, kart, carros antigos..."
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Observações Internas da Athena
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Histórico comportamental, preferências de negociação, marcas de preferência..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Botão de Salvar Ficha */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar Ficha do Cliente'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ---------------------------------------------------------- */}
          {/* ABA 2: HISTÓRICO                                            */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                  Linha do Tempo de Interações na Athena
                </h4>
                <span className="text-xs text-slate-500">
                  Visitas • Compras • Agendamentos • A-Points
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhum registro de movimentação no histórico deste cliente.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-2">
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
                        {/* Marcador na linha */}
                        <div className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${badgeColor}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>

                        {/* Card do Evento */}
                        <div className={`p-3.5 rounded-xl border transition ${
                          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs">
                              {h.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {h.occurred_at ? new Date(h.occurred_at).toLocaleDateString('pt-BR') : ''}
                            </span>
                          </div>

                          {/* Detalhes específicos */}
                          {h.details && typeof h.details === 'object' && Object.keys(h.details).length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-400 space-y-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                              {Object.entries(h.details).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between">
                                  <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                                  <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
