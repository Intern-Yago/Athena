import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Calculates sliding window pagination items with ellipses.
 * Example for 30 pages at page 1: [1, 2, 3, 4, 5, 'RIGHT_DOTS', 30]
 * Example for 30 pages at page 15: [1, 'LEFT_DOTS', 14, 15, 16, 'RIGHT_DOTS', 30]
 * Example for 30 pages at page 28: [1, 'LEFT_DOTS', 26, 27, 28, 29, 30]
 */
function getPaginationRange(currentPage, totalPages, siblingCount = 1) {
  // If total pages is small (<= 7), display all numbers
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 1: Near beginning - show dots only on the right
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount; // e.g. 5 items
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'RIGHT_DOTS', lastPageIndex];
  }

  // Case 2: Near end - show dots only on the left
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount; // e.g. 5 items
    const start = totalPages - rightItemCount + 1;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => start + i);
    return [firstPageIndex, 'LEFT_DOTS', ...rightRange];
  }

  // Case 3: In the middle - show dots on both sides
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = [];
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      middleRange.push(i);
    }
    return [firstPageIndex, 'LEFT_DOTS', ...middleRange, 'RIGHT_DOTS', lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
  siblingCount = 1
}) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  const paginationRange = getPaginationRange(currentPage, totalPages, siblingCount);

  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-center text-xs shadow-xs transition-all">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 w-full">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Primeira Página"
          className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Página Anterior"
          className="btn-secondary py-1.5 px-2.5 sm:px-3 text-xs gap-1 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Anterior</span>
        </button>

        {/* Dynamic Page Range with Ellipses */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {paginationRange.map((pageItem, index) => {
            if (pageItem === 'LEFT_DOTS') {
              const jumpTarget = Math.max(1, currentPage - 5);
              return (
                <button
                  key={`left-dots-${index}`}
                  onClick={() => onPageChange(jumpTarget)}
                  title={`Voltar 5 páginas (Pág. ${jumpTarget})`}
                  className="group w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                >
                  <span className="group-hover:hidden tracking-tighter font-extrabold text-sm">...</span>
                  <ChevronsLeft className="w-4 h-4 hidden group-hover:block text-amber-600" />
                </button>
              );
            }

            if (pageItem === 'RIGHT_DOTS') {
              const jumpTarget = Math.min(totalPages, currentPage + 5);
              return (
                <button
                  key={`right-dots-${index}`}
                  onClick={() => onPageChange(jumpTarget)}
                  title={`Avançar 5 páginas (Pág. ${jumpTarget})`}
                  className="group w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                >
                  <span className="group-hover:hidden tracking-tighter font-extrabold text-sm">...</span>
                  <ChevronsRight className="w-4 h-4 hidden group-hover:block text-amber-600" />
                </button>
              );
            }

            const pageNumber = pageItem;
            const isActive = currentPage === pageNumber;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs ring-2 ring-amber-500/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Próxima Página"
          className="btn-secondary py-1.5 px-2.5 sm:px-3 text-xs gap-1 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
        >
          <span className="hidden xs:inline sm:inline">Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Última Página"
          className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
