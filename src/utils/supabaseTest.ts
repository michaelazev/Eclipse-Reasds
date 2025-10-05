// Utility to test Supabase connectivity and configuration
import { supabase, isSupabaseAvailable, checkSupabaseStatus } from '../services/supabaseService';

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase Connection...');
  
  // Check basic configuration first
  const status = checkSupabaseStatus();
  console.log('📋 Configuration Status:', status);
  
  if (!supabase) {
    console.log('❌ Cannot test - no Supabase client available');
    
    // Try to provide helpful debugging info
    if (typeof window !== 'undefined') {
      console.log('🔍 Environment debugging:');
      console.log('  - Hostname:', window.location.hostname);
      console.log('  - Search params:', window.location.search);
      console.log('  - Environment vars available:', {
        hasImportMeta: typeof import.meta !== 'undefined',
        hasProcess: typeof process !== 'undefined',
        hasWindowEnv: typeof window !== 'undefined' && !!(window as any).ENV
      });
    }
    
    return { success: false, error: 'No Supabase client' };
  }
  
  try {
    console.log('🔄 Testing basic connectivity...');
    
    // Test basic connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const connectionTest = supabase.auth.getSession();
    
    const { data, error } = await Promise.race([connectionTest, timeoutPromise]) as any;
    
    if (error) {
      console.log('⚠️  Auth session error:', error.message);
      
      // Check if it's a configuration issue
      if (error.message.includes('Invalid') || error.message.includes('JWT')) {
        console.log('🚨 Possible configuration issue - check Supabase credentials');
      }
    } else {
      console.log('✅ Auth session check successful');
      console.log('  - Current session:', data.session ? 'Active' : 'None');
      console.log('  - User:', data.session?.user?.email || 'Not logged in');
    }
    
    // Test Google OAuth configuration (safely)
    console.log('🔄 Testing Google OAuth configuration...');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'test://test',
          skipBrowserRedirect: true
        }
      });
      
      if (oauthError) {
        if (oauthError.message.includes('not configured')) {
          console.log('⚠️  Google OAuth not configured in Supabase project');
          console.log('   💡 Configure Google OAuth in Supabase Dashboard > Authentication > Providers');
        } else {
          console.log('⚠️  Google OAuth test error:', oauthError.message);
        }
      } else {
        console.log('✅ Google OAuth appears to be configured correctly');
      }
    } catch (oauthTestError) {
      console.log('⚠️  Could not test Google OAuth:', oauthTestError);
    }
    
    console.log('✅ Supabase connection test completed');
    return { 
      success: true, 
      hasSession: !!data?.session,
      status: status
    };
    
  } catch (error) {
    console.log('❌ Connection test failed:', error);
    
    // Provide specific guidance based on error type
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('timeout')) {
        console.log('   💡 Connection timeout - check internet or Supabase status');
      } else if (errorMsg.includes('cors')) {
        console.log('   💡 CORS error - check Supabase project configuration');
      } else if (errorMsg.includes('fetch')) {
        console.log('   💡 Network error - check connectivity');
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: status
    };
  }
};

// Auto-run test when module loads (with better timing)
if (typeof window !== 'undefined') {
  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(testSupabaseConnection, 1500);
    });
  } else {
    setTimeout(testSupabaseConnection, 1500);
  }
}