import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ApiStatusBannerProps {
  onRefresh?: () => void;
}

export function ApiStatusBanner({ onRefresh }: ApiStatusBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Verifica se há erros de API recentes
    const checkApiErrors = () => {
      const recentErrors = performance.getEntriesByType('navigation').length > 0;
      // Verifica localStorage para erros persistentes
      const apiErrors = localStorage.getItem('eclipse_api_errors');
      if (apiErrors) {
        const errors = JSON.parse(apiErrors);
        const recentErrorCount = errors.filter((error: any) => 
          Date.now() - error.timestamp < 5 * 60 * 1000
        ).length;
        
        if (recentErrorCount >= 3) {
          setShowBanner(true);
        }
      }
    };

    // Escuta por eventos de erro da API
    const handleApiError = (event: CustomEvent) => {
      console.log('🚨 API Error detected:', event.detail);
      setShowBanner(true);
      
      // Armazena erro no localStorage
      const errors = JSON.parse(localStorage.getItem('eclipse_api_errors') || '[]');
      errors.push({
        timestamp: Date.now(),
        error: event.detail.error,
        type: event.detail.type
      });
      
      // Mantém apenas erros das últimas 24h
      const filtered = errors.filter((error: any) => 
        Date.now() - error.timestamp < 24 * 60 * 60 * 1000
      );
      
      localStorage.setItem('eclipse_api_errors', JSON.stringify(filtered));
    };

    checkApiErrors();
    window.addEventListener('apiError', handleApiError as EventListener);

    return () => {
      window.removeEventListener('apiError', handleApiError as EventListener);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Limpa caches
      localStorage.removeItem('eclipse_books_cache');
      localStorage.removeItem('eclipse_api_errors');
      
      // Chama função de refresh se fornecida
      if (onRefresh) {
        await onRefresh();
      }
      
      // Simula teste de conectividade
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowBanner(false);
    } catch (error) {
      console.error('Erro ao tentar refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remove o banner por 10 minutos
    localStorage.setItem('eclipse_banner_dismissed', (Date.now() + 10 * 60 * 1000).toString());
  };

  useEffect(() => {
    // Verifica se o banner foi dispensado recentemente
    const dismissed = localStorage.getItem('eclipse_banner_dismissed');
    if (dismissed && Date.now() < parseInt(dismissed)) {
      setShowBanner(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  🔄 Instabilidade na API do Google Books
                </p>
                <p className="text-xs text-yellow-100 mt-1">
                  Alguns livros podem mostrar dados temporários. Tentando reconectar...
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Testando...
                  </>
                ) : (
                  <>
                    🔄 Tentar Novamente
                  </>
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dispensar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}