import React from 'react';

/**
 * Utilitário que envolve React.lazy com recarregamento automático da página
 * caso ocorra falha ao carregar o chunk dinâmico (comum após novo deploy em produção).
 *
 * Quando um novo build é publicado, os arquivos JS recebem novos hashes (ex: AdminPanel-xyz.js).
 * Usuários que já estavam com a página aberta tentam baixar os hashes antigos que não existem mais.
 * Esse utilitário intercepta o erro e força um recarregamento para buscar a versão mais recente.
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(async () => {
    const hasRetried = JSON.parse(
      window.sessionStorage.getItem('chunk_reload_retry') || 'false'
    );

    try {
      return await componentImport();
    } catch (error) {
      const isDynamicImportError =
        error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i.test(
          error?.message || ''
        );

      if (isDynamicImportError && !hasRetried) {
        window.sessionStorage.setItem('chunk_reload_retry', 'true');
        // Recarrega a página para carregar o bundle atualizado do servidor
        window.location.reload();
        // Retorna uma Promise pendente para não disparar o fallback de erro enquanto a página recarrega
        return new Promise(() => {});
      }

      // Se já tentou recarregar ou for outro erro, propaga para o ErrorBoundary
      throw error;
    }
  });
}
