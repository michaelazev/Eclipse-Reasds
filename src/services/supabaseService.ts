import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Book, ReadingStatus } from '../models/Book';

// Supabase configuration with automatic detection
let supabaseUrl = '';
let supabaseKey = '';
let supabaseClient: SupabaseClient | null = null;

// Function to get environment variables from multiple sources
function getEnvVar(name: string): string {
  // Try import.meta.env first (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && ((import.meta as any).env)[name]) {
    return ((import.meta as any).env)[name] as string;
  }
  
  // Try process.env (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  
  // Try window.ENV (injected by platform)
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[name]) {
    return (window as any).ENV[name];
  }
  
  return '';
}

// Initialize Supabase configuration
function initializeSupabase() {
  console.log('🔧 Initializing Supabase...');
  
  // Get credentials from various sources
    // Support multiple env var conventions: VITE_APP_SUPABASE_* (used earlier)
    // and VITE_SUPABASE_* (common). Try both.
    supabaseUrl = getEnvVar('VITE_APP_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
    supabaseKey = getEnvVar('VITE_APP_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');
  
  console.log('🔍 Environment detection:');
  console.log('  - URL found:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'No');
  console.log('  - Key found:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'No');
  
  // Validate credentials
  const hasValidUrl = supabaseUrl && supabaseUrl.includes('supabase.co');
  const hasValidKey = supabaseKey && supabaseKey.length > 20;
  
  if (hasValidUrl && hasValidKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Supabase client created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      return false;
    }
  } else {
    console.warn('⚠️  Invalid Supabase credentials detected');
    console.log('  - URL valid:', hasValidUrl);
    console.log('  - Key valid:', hasValidKey);
    
    // For development or connected environments, still try to create a client
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('make.figma.com') || hostname.includes('localhost')) {
        console.log('🔗 Connected environment detected, attempting to create client anyway...');
        try {
          // Use provided credentials even if they seem invalid - they might be injected
          supabaseClient = createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseKey || 'placeholder-key'
          );
          console.log('✅ Supabase client created for connected environment');
          return true;
        } catch (error) {
          console.error('❌ Failed to create client for connected environment:', error);
        }
      }
    }
    
    return false;
  }
}

// Initialize immediately
const isInitialized = initializeSupabase();

// Re-initialize when window loads (for injected credentials)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!supabaseClient) {
      console.log('🔄 Re-initializing Supabase after window load...');
      initializeSupabase();
    }
  });
}

// Export the client and status
export const supabase = supabaseClient as unknown as SupabaseClient;
export const isSupabaseAvailable = !!supabaseClient;

// Function to check if Supabase is ready
export function checkSupabaseStatus() {
  const status = {
    hasClient: !!supabaseClient,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    isReady: !!supabaseClient
  };
  
  console.log('📊 Supabase Status Check:', status);
  return status;
}

// Call status check on load
if (typeof window !== 'undefined') {
  setTimeout(checkSupabaseStatus, 1000);
}

// Database types
export interface DbBook {
  id: string;
  title: string;
  authors: string;
  description: string | null;
  cover_url: string | null;
  language: string;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  categories: string | null;
  isbn: string | null;
  created_at: string;
}

export interface DbUserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  added_at: string;
  updated_at: string;
  progress: number;
  notes: string | null;
}

// Book service functions
export const BookService = {
  async saveBook(book: Book): Promise<{ success: boolean; book?: DbBook; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const bookData: Omit<DbBook, 'created_at'> = {
        id: book.id,
        title: book.title,
        authors: book.authors.join(', '),
        description: book.description || null,
        cover_url: book.coverUrl || null,
        language: book.language || 'pt',
        publisher: book.publisher || null,
        published_date: book.publishedDate || null,
        page_count: book.pageCount || null,
        categories: book.categories?.join(', ') || null,
        isbn: book.isbn || null,
      };

      const { data, error } = await supabase
        .from('books')
        .upsert(bookData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, book: data };
    } catch (error) {
      console.error('Error saving book:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async getBook(bookId: string): Promise<{ success: boolean; book?: DbBook; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, book: data };
    } catch (error) {
      console.error('Error getting book:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Book not found' 
      };
    }
  },
};

// User books service functions
export const UserBookService = {
  async addBookToLibrary(
    userId: string, 
    bookId: string, 
    status: ReadingStatus,
    book?: Book
  ): Promise<{ success: boolean; userBook?: DbUserBook; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      if (book) {
        const bookResult = await BookService.saveBook(book);
        if (!bookResult.success) {
          return { success: false, error: bookResult.error };
        }
      }

      const { data: existingUserBook } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (existingUserBook) {
        const { data, error } = await supabase
          .from('user_books')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { success: true, userBook: data };
      } else {
        const userBookData = {
          user_id: userId,
          book_id: bookId,
          status,
          progress: 0,
          notes: null,
        };

        const { data, error } = await supabase
          .from('user_books')
          .insert(userBookData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { success: true, userBook: data };
      }
    } catch (error) {
      console.error('Error adding book to library:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async removeBookFromLibrary(
    userId: string, 
    bookId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing book from library:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async getUserLibrary(userId: string): Promise<{ success: boolean; books?: Book[]; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          *,
          books (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      const books: Book[] = data?.map((userBook: any) => ({
        id: userBook.books.id,
        title: userBook.books.title,
        author: userBook.books.authors?.split(', ')[0] || 'Autor desconhecido',
        authors: userBook.books.authors?.split(', ') || [],
        description: userBook.books.description || '',
        coverUrl: userBook.books.cover_url,
        language: userBook.books.language || 'pt',
        publisher: userBook.books.publisher,
        publishedDate: userBook.books.published_date,
        pages: userBook.books.page_count || 0,
        pageCount: userBook.books.page_count || 0,
        categories: userBook.books.categories?.split(', ').map((name: string, index: number) => ({
          id: `cat_${index}`,
          name: name.trim(),
          icon: '📚'
        })) || [],
        isbn: userBook.books.isbn || '',
        rating: 4.0,
        status: userBook.status,
        progress: userBook.progress,
        notes: userBook.notes,
        addedAt: userBook.added_at,
        updatedAt: userBook.updated_at,
      })) || [];

      return { success: true, books };
    } catch (error) {
      console.error('Error getting user library:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async updateProgress(
    userId: string, 
    bookId: string, 
    progress: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { error } = await supabase
        .from('user_books')
        .update({ 
          progress, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async updateNotes(
    userId: string, 
    bookId: string, 
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { error } = await supabase
        .from('user_books')
        .update({ 
          notes, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating notes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};

// Function to ensure Supabase client is available
function ensureSupabaseClient() {
  if (!supabaseClient) {
    console.log('🔄 Attempting to reinitialize Supabase client...');
    initializeSupabase();
  }
  return supabaseClient;
}

// Authentication helper
export const AuthService = {
  async getCurrentUser() {
    const client = ensureSupabaseClient();
    if (!client) {
      console.error('❌ Supabase client not available after initialization attempt');
      return { 
        success: false, 
        error: 'Supabase não está configurado. Verifique a conexão com o banco de dados.' 
      };
    }

    try {
      const { data: { user }, error } = await client.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async signInWithGoogle() {
    console.log('🔐 Iniciando login com Google...');
    
    const client = ensureSupabaseClient();
    if (!client) {
      console.error('❌ Supabase client not available');
      
      // Try one more time with a delay for injected credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      const clientRetry = ensureSupabaseClient();
      
      if (!clientRetry) {
        return { 
          success: false, 
          error: 'Sistema de autenticação não disponível. O Supabase não está configurado corretamente.' 
        };
      }
    }

    const finalClient = client || ensureSupabaseClient();

    if (!finalClient) {
      return { 
        success: false, 
        error: 'Sistema de autenticação não disponível. O Supabase não está configurado corretamente.' 
      };
    }

    try {
      console.log('📡 Iniciando OAuth com Google...');
      
      // Test if the client can make basic calls
      try {
        await finalClient.auth.getSession();
        console.log('✅ Supabase client is responsive');
      } catch (testError) {
        console.warn('⚠️ Supabase client test failed:', testError);
        // Continue anyway - might work for OAuth
      }
      
      const { data, error } = await finalClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ OAuth error:', error);
        throw error;
      }

      console.log('✅ OAuth iniciado com sucesso - redirecionando...');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Erro ao conectar com Google';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('not configured') || errorMsg.includes('oauth')) {
          errorMessage = 'Login com Google não está configurado. Entre em contato com o suporte.';
        } else if (errorMsg.includes('redirect') || errorMsg.includes('url')) {
          errorMessage = 'Erro de configuração de redirecionamento. Tente novamente.';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (errorMsg.includes('cors')) {
          errorMessage = 'Erro de configuração de segurança. Contate o suporte.';
        } else {
          errorMessage = `Erro de autenticação: ${error.message}`;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  async signInWithEmail(email: string, password: string) {
    const client = ensureSupabaseClient();
    if (!client) {
      return { 
        success: false, 
        error: 'Sistema de autenticação não disponível. Verifique a configuração.' 
      };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email ou senha inválidos' 
      };
    }
  },

  async signUpWithEmail(email: string, password: string, name: string) {
    const client = ensureSupabaseClient();
    if (!client) {
      return { 
        success: false, 
        error: 'Sistema de autenticação não disponível. Verifique a configuração.' 
      };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        throw error;
      }

  // Supabase may require email confirmation; when that happens there is no session.
  // Consider that signup requires confirmation when there's no session returned.
  const requiresConfirmation = !((data as any).session);
      return { success: true, user: data.user, requiresConfirmation };
    } catch (error) {
      console.error('Error signing up with email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar conta' 
      };
    }
  },

  async signOut() {
    const client = ensureSupabaseClient();
    if (!client) {
      // Permite logout mesmo sem client para limpar estado local
      console.warn('Supabase client not available, performing local logout only');
      return { success: true };
    }

    try {
      const { error } = await client.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      // Mesmo com erro, considera logout bem-sucedido para limpar estado local
      return { success: true };
    }
  },

  // Listener para mudanças no estado de autenticação
  onAuthStateChange(callback: (user: any) => void) {
    const client = ensureSupabaseClient();
    if (!client) {
      console.warn('Supabase client not available for auth state changes');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    try {
      return client.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
        callback(session?.user || null);
      });
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Profile Service
export const ProfileService = {
  async getProfile(userId: string) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar perfil' 
      };
    }
  },

  async updateProfile(userId: string, updates: {
    name?: string;
    nickname?: string;
    avatar?: string;
    banner?: string;
    account_type?: string;
    plan_type?: string;
  }) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil' 
      };
    }
  }
};

// Preferences Service
export const PreferencesService = {
  async getPreferences(userId: string) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, preferences: data };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar preferências' 
      };
    }
  },

  async updatePreferences(userId: string, updates: {
    theme?: string;
    language?: string;
    daily_reminder?: boolean;
    weekly_progress?: boolean;
    new_recommendations?: boolean;
    books_per_year?: number;
    minutes_per_day?: number;
  }) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, preferences: data };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar preferências' 
      };
    }
  }
};

// Statistics Service
export const StatisticsService = {
  async getStatistics(userId: string) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, statistics: data };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas' 
      };
    }
  },

  async recordReadingSession(
    userId: string,
    bookId: string,
    options: {
      pagesRead?: number;
      chaptersRead?: number;
      durationMinutes?: number;
      startPage?: number;
      endPage?: number;
    }
  ) {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please set up your Supabase credentials.' 
      };
    }

    try {
      const { data, error } = await supabase.rpc('record_reading_session', {
        p_user_id: userId,
        p_book_id: bookId,
        p_pages_read: options.pagesRead || 0,
        p_chapters_read: options.chaptersRead || 0,
        p_duration_minutes: options.durationMinutes || 0,
        p_start_page: options.startPage || null,
        p_end_page: options.endPage || null
      });

      if (error) {
        throw error;
      }

      return { success: true, sessionId: data };
    } catch (error) {
      console.error('Error recording reading session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao registrar sessão de leitura' 
      };
    }
  }
};
console.log(supabase)