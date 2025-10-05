import React, { useEffect, useState, useRef } from 'react';
import { checkSupabaseStatus } from '../services/supabaseService';

export default function SupabaseStatusBanner() {
  const [status, setStatus] = useState<{ hasClient: boolean; hasUrl: boolean; hasKey: boolean; isReady: boolean } | null>(null);
  const [visible, setVisible] = useState(true);
  const hideTimeout = useRef<number | null>(null);
  const shownReadyOnce = useRef<boolean>(false);

  useEffect(() => {
    const update = () => setStatus(checkSupabaseStatus());
    update();

    const interval = window.setInterval(update, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for external show requests
  useEffect(() => {
    const handleShow = () => {
      setVisible(true);
      if (hideTimeout.current) {
        window.clearTimeout(hideTimeout.current);
      }
      hideTimeout.current = window.setTimeout(() => {
        setVisible(false);
        hideTimeout.current = null;
      }, 4000);
    };

    window.addEventListener('supabase:show', handleShow as EventListener);
    return () => window.removeEventListener('supabase:show', handleShow as EventListener);
  }, []);

  // Auto-hide when Supabase becomes ready
  useEffect(() => {
    if (!status) return;

    // If service is ready, show briefly then hide
    if (status.isReady) {
      if (!shownReadyOnce.current) {
        setVisible(true);
        if (hideTimeout.current) {
          window.clearTimeout(hideTimeout.current);
        }
        hideTimeout.current = window.setTimeout(() => {
          setVisible(false);
          hideTimeout.current = null;
        }, 3500);
        shownReadyOnce.current = true;
      } else {
        // Already shown once: keep hidden
        setVisible(false);
        if (hideTimeout.current) {
          window.clearTimeout(hideTimeout.current);
          hideTimeout.current = null;
        }
      }
    } else {
      // Not ready -> ensure visible
      setVisible(true);
      if (hideTimeout.current) {
        window.clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    }

    return () => {
      if (hideTimeout.current) {
        window.clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        window.clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    };
  }, []);

  if (!status || !visible) return null;

  return (
    <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-lg text-sm font-medium ${status.isReady ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
      {status.isReady ? (
        <span>✅ Supabase pronto (cliente inicializado)</span>
      ) : (
        <span>⚠️ Supabase não inicializado — URL: {status.hasUrl ? 'sim' : 'não'} | Key: {status.hasKey ? 'sim' : 'não'}</span>
      )}
    </div>
  );
}

// Floating button to re-show the banner when it was auto-hidden
export function SupabaseStatusReopenButton({ onShow }: { onShow: () => void }) {
  return (
    <button
      onClick={onShow}
      title="Mostrar status do Supabase"
      className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
    >
        i
    </button>
  );
}
