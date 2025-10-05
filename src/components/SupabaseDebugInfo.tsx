import { useState, useEffect } from 'react';
import { checkSupabaseStatus, supabase } from '../services/supabaseService';

export function SupabaseDebugInfo() {
  const [status, setStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check status on mount
    const currentStatus = checkSupabaseStatus();
    setStatus(currentStatus);

    // Show debug info if there are issues
    if (!currentStatus.isReady || typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
      setIsVisible(true);
    }

    // Keyboard shortcut to toggle debug info
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  const handleTestConnection = async () => {
    if (!supabase) {
      alert('❌ No Supabase client available');
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        alert(`⚠️ Session test failed: ${error.message}`);
      } else {
        alert('✅ Supabase connection successful!');
      }
    } catch (error) {
      alert(`❌ Connection test failed: ${error}`);
    }
  };

  const handleTestGoogleOAuth = async () => {
    if (!supabase) {
      alert('❌ No Supabase client available');
      return;
    }

    try {
      // This won't actually sign in, just test if OAuth is configured
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'test://test',
          skipBrowserRedirect: true
        }
      });

      if (error) {
        if (error.message.includes('not configured')) {
          alert('⚠️ Google OAuth is not configured in your Supabase project');
        } else {
          alert(`⚠️ OAuth test error: ${error.message}`);
        }
      } else {
        alert('✅ Google OAuth appears to be configured correctly');
      }
    } catch (error) {
      alert(`❌ OAuth test failed: ${error}`);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-sm text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-purple-300">Supabase Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {status && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Client:</div>
            <div className={status.hasClient ? 'text-green-400' : 'text-red-400'}>
              {status.hasClient ? '✅ Available' : '❌ Missing'}
            </div>
            
            <div>URL:</div>
            <div className={status.hasUrl ? 'text-green-400' : 'text-red-400'}>
              {status.hasUrl ? '✅ Detected' : '❌ Missing'}
            </div>
            
            <div>Key:</div>
            <div className={status.hasKey ? 'text-green-400' : 'text-red-400'}>
              {status.hasKey ? '✅ Detected' : '❌ Missing'}
            </div>
            
            <div>Ready:</div>
            <div className={status.isReady ? 'text-green-400' : 'text-red-400'}>
              {status.isReady ? '✅ Yes' : '❌ No'}
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <button
              onClick={handleTestConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              Test Connection
            </button>
            <button
              onClick={handleTestGoogleOAuth}
              className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            >
              Test Google OAuth
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
            >
              Reload Page
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Ctrl+Shift+D to toggle
          </div>
        </div>
      )}
    </div>
  );
}