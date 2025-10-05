import { useState } from "react";
import { motion } from "motion/react";
import { WebLogo } from "./WebLogo";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { toast } from "sonner";
import { isSupabaseAvailable } from "../services/supabaseService";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onGuestLogin: () => Promise<void>;
}

export function AuthScreen({ onLogin, onSignUp, onGoogleLogin, onGuestLogin }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'cadastro'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const isDesktop = useIsDesktop();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!loginData.email || !loginData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (!loginData.email.includes('@')) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }
    
    if (loginData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Fazendo login...');
    
    try {
      await onLogin(loginData.email, loginData.password);
      toast.dismiss(loadingToast);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (!signupData.email.includes('@')) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }
    
    if (signupData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (!signupData.agreeTerms) {
      toast.error('Você deve aceitar os termos de uso');
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Criando conta...');
    
    try {
      await onSignUp(signupData.email, signupData.password, signupData.name);
      toast.dismiss(loadingToast);
      toast.dismiss(loadingToast);
      toast.success('Conta criada com sucesso!');
      setAwaitingConfirmation(false);
    } catch (error) {
      console.error('Signup failed:', error);
      toast.dismiss(loadingToast);
      // If backend requires email confirmation, AppContext will throw a special error token
      if (error instanceof Error && error.message === 'confirma_email') {
        setAwaitingConfirmation(true);
        toast.error('Confirme seu e-mail para ativar a conta', {
          description: 'Enviamos um link para o seu e-mail. Verifique a caixa de entrada e a pasta de spam.'
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const loadingToast = toast.loading('Conectando com Google...', {
      description: 'Redirecionando para autenticação segura'
    });
    
    try {
      await onGoogleLogin();
      // Note: Page will redirect to Google, so we don't show success toast here
      // Loading toast will be dismissed by page redirect
    } catch (error) {
      console.error('❌ Google login failed:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com Google';
      
      // Show helpful message based on error type
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('sistema de autenticação não disponível') || errorLower.includes('supabase')) {
        toast.error('Sistema temporariamente indisponível', {
          description: 'Tente novamente em alguns minutos ou use login por email',
          duration: 5000
        });
      } else if (errorLower.includes('not configured') || errorLower.includes('oauth')) {
        toast.error('Login com Google não disponível', {
          description: 'Use login por email ou entre em contato com o suporte'
        });
      } else if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('conexão')) {
        toast.error('Erro de conexão', {
          description: 'Verifique sua internet e tente novamente'
        });
      } else if (errorLower.includes('redirect') || errorLower.includes('configuração')) {
        toast.error('Erro de configuração', {
          description: 'Problema na configuração do sistema. Tente novamente.'
        });
      } else {
        toast.error('Erro no login com Google', {
          description: errorMessage.length > 50 ? 'Tente novamente ou use login por email' : errorMessage
        });
      }
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    toast.loading('Entrando como convidado...', {
      description: 'Você terá acesso limitado a 5 livros'
    });
    
    try {
      await onGuestLogin();
      toast.success('Bem-vindo ao Eclipse Reads!', {
        description: 'Modo convidado: limite de 5 livros'
      });
    } catch (error) {
      console.error('Guest login failed:', error);
      toast.error('Erro ao entrar como convidado. Tente novamente.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #2D1B69 0%, #1A0B2E 50%, #0F0A1F 100%)'
      }}
    >
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="flex justify-center lg:justify-start mb-8">
            <WebLogo className="w-24 h-24 lg:w-32 lg:h-32" />
          </div>
          
          <h1 
            className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Eclipse
            <br />
            <span className="text-yellow-300">Reads</span>
          </h1>
          
          <p 
            className="text-xl lg:text-2xl text-white/90 mb-8 max-w-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Mergulhe em um universo de histórias incríveis. Sua próxima aventura literária começa aqui.
          </p>
          
          <div className="hidden lg:flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <span>Milhares de livros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <span>Leitura offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <span>Sincronização</span>
            </div>
          </div>
        </motion.div>

        {/* Right side - Auth form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl p-6 lg:p-8"
          style={{
            width: isDesktop ? '90%' : '100%',
            maxWidth: '450px'
          }}
        >
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-white text-purple-600 transform -translate-y-0.5'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'cadastro'
                  ? 'bg-white text-purple-600 transform -translate-y-0.5'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Criar Conta
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="seu@email.com"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Senha
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="••••••••"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-600 text-sm">Lembrar-me</span>
                </label>
                <a href="#" className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Esqueci a senha
                </a>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center hover:from-purple-700 hover:to-purple-800 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'cadastro' && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="Seu nome completo"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="seu@email.com"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Senha
                </label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="••••••••"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="••••••••"
                  required
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#111827'
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={signupData.agreeTerms}
                  onChange={(e) => setSignupData({...signupData, agreeTerms: e.target.checked})}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="agreeTerms" className="text-gray-600 text-sm cursor-pointer" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Eu aceito os <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">termos de uso</a> e <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">política de privacidade</a>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center hover:from-purple-700 hover:to-purple-800 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isLoading ? 'Criando...' : 'Criar Conta'}
              </button>
            </form>
          )}


                {awaitingConfirmation && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 mb-2">Aguardando confirmação de e-mail.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          // Try to login again with provided credentials
                          try {
                            setIsLoading(true);
                            await onLogin(signupData.email, signupData.password);
                            toast.success('Login realizado com sucesso!');
                            setAwaitingConfirmation(false);
                          } catch (err) {
                            toast.error('Ainda não confirmado. Verifique o link enviado por e-mail.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="px-3 py-2 bg-yellow-600 text-white rounded"
                      >
                        Já confirmei
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Allow user to resend instructions: open debug or show message
                          toast('Verifique seu e-mail para o link de confirmação.');
                        }}
                        className="px-3 py-2 bg-transparent border border-yellow-200 text-yellow-800 rounded"
                      >
                        Reenviar instruções
                      </button>
                    </div>
                  </div>
                )}
          <div className="mt-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-gray-500 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || isLoading}
              className="w-full py-2 px-3 border-2 border-purple-200 rounded-xl font-semibold text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 active:scale-95"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#7C3AED" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#8B5CF6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#A78BFA" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#6D28D9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'Conectando...' : 'Continuar com Google'}
            </button>
            
            <button
              onClick={handleGuestLogin}
              disabled={guestLoading || isLoading}
              className="w-full py-2 px-3 border-2 border-purple-300 rounded-xl font-semibold text-purple-600 bg-gradient-to-r from-purple-100 to-purple-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-200 hover:to-purple-300 hover:border-purple-400 active:scale-95 mt-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {guestLoading ? (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              )}
              {guestLoading ? 'Entrando...' : 'Entrar como Convidado'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}