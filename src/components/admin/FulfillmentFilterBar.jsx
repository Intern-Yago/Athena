import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { MACRO_REGIONS } from '../../utils/orderUtils';

/**
 * FulfillmentFilterBar
 *
 * Barra de filtragem operacional unificada para a Mesa de Expedição & Logística.
 * Atua de forma consistente tanto sobre o Quadro Kanban quanto sobre a Visão em Tabela.
 */
export default function FulfillmentFilterBar({
  searchQuery,
  onSearchChange,
  originFilter,
  onOriginChange,
  statusFilter,
  onStatusChange,
  itemsFilter,
  onItemsChange,
  regionFilter,
  onRegionChange,
  columns = [],
  kanbanCounts = {},
  availableStates = [],
  totalCount = 0,
  filteredCount = 0,
  hasActiveFilters = false,
  onClearFilters
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
        {/* 1. Pesquisa Textual */}
        <div className="lg:col-span-4 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente, #OMIE-124, item ou cidade..."
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-8 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Filtro de Origem (Site vs Omie ERP) */}
        <div className="lg:col-span-2">
          <select
            value={originFilter}
            onChange={(e) => onOriginChange(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Origem: Todas</option>
            <option value="site">🌐 Compras no Site</option>
            <option value="omie">🏢 Omie ERP Direto</option>
          </select>
        </div>

        {/* 3. Filtro de Etapa / Status */}
        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Status: Todos ({totalCount})</option>
            {columns.map(c => (
              <option key={c.key} value={c.key}>
                {c.shortLabel || c.label} ({kanbanCounts[c.key] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Filtro de Volume de Itens */}
        <div className="lg:col-span-2">
          <select
            value={itemsFilter}
            onChange={(e) => onItemsChange(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Itens: Todos</option>
            <option value="1">1 item (Unitário)</option>
            <option value="2-5">2 a 5 itens</option>
            <option value="6-15">6 a 15 itens</option>
            <option value="16+">16+ itens (Volumoso)</option>
          </select>
        </div>

        {/* 5. Filtro de Região / UF */}
        <div className="lg:col-span-2">
          <select
            value={regionFilter}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Região: Todas</option>
            <optgroup label="Macro-Regiões">
              {Object.keys(MACRO_REGIONS).map(macro => (
                <option key={macro} value={`macro:${macro}`}>{macro}</option>
              ))}
            </optgroup>
            {availableStates.length > 0 && (
              <optgroup label="Estados (UF)">
                {availableStates.map(uf => (
                  <option key={uf} value={uf}>Estado: {uf}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Rodapé de status dos filtros */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-amber-600" />
          <span>
            Exibindo <strong className="font-mono text-slate-900">{filteredCount}</strong> de{' '}
            <strong className="font-mono text-slate-900">{totalCount}</strong> remessas
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
