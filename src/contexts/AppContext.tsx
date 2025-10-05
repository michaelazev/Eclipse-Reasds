import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { User, UserStatistics } from '../models/User';
import { UserBook, ReadingStatus, Book } from '../models/Book';
import { MockUserRepository, UserRepository } from '../repositories/UserRepository';
import { MockBookRepository, BookRepository } from '../repositories/BookRepository';
import { UserBookService, AuthService, ProfileService, supabase } from '../services/supabaseService';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userBooks: UserBook[];
  currentlyReading: UserBook[];
  theme: 'light' | 'night';
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER_BOOKS'; payload: UserBook[] }
  | { type: 'SET_CURRENTLY_READING'; payload: UserBook[] }
  | { type: 'SET_THEME'; payload: 'light' | 'night' }
  | { type: 'ADD_USER_BOOK'; payload: UserBook }
  | { type: 'UPDATE_USER_BOOK'; payload: UserBook }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User> }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userBooks: [],
  currentlyReading: [],
  theme: 'light'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER_BOOKS':
      return { ...state, userBooks: action.payload };
    case 'SET_CURRENTLY_READING':
      return { ...state, currentlyReading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_USER_BOOK':
      // Check if book already exists to avoid duplicates
      const bookExists = state.userBooks.some(ub => ub.book.id === action.payload.book.id);
      if (bookExists) {
        // Instead of logging warning, let's update the existing book
        console.log('Book already exists, updating status:', action.payload.book.title);
        const updatedUserBooks = state.userBooks.map(ub => 
          ub.book.id === action.payload.book.id 
            ? { ...ub, ...action.payload, id: ub.id } // Keep original user book ID but update other fields
            : ub
        );
        
        const updatedCurrentlyReading = updatedUserBooks.filter(ub => 
          ub.status === ReadingStatus.CURRENTLY_READING
        );
        
        return { 
          ...state, 
          userBooks: updatedUserBooks,
          currentlyReading: updatedCurrentlyReading
        };
      }
      
      const newUserBooks = [...state.userBooks, action.payload];
      // Recalculate currently reading from the new user books list
      const newCurrentlyReading = newUserBooks.filter(ub => 
        ub.status === ReadingStatus.CURRENTLY_READING
      );
      
      return { 
        ...state, 
        userBooks: newUserBooks,
        currentlyReading: newCurrentlyReading
      };
    case 'UPDATE_USER_BOOK':
      const updatedUserBooks = state.userBooks.map(ub => ub.id === action.payload.id ? action.payload : ub);
      // Recalculate currently reading from the updated user books
      const updatedCurrentlyReading = updatedUserBooks.filter(ub => 
        ub.status === ReadingStatus.CURRENTLY_READING
      );
      
      return {
        ...state,
        userBooks: updatedUserBooks,
        currentlyReading: updatedCurrentlyReading
      };
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'TOGGLE_FAVORITE':
      const toggledBooks = state.userBooks.map(ub => 
        ub.book.id === action.payload 
          ? { ...ub, isFavorite: !ub.isFavorite }
          : ub
      );
      // Recalculate currently reading in case status changed
      const toggledCurrentlyReading = toggledBooks.filter(ub => 
        ub.status === ReadingStatus.CURRENTLY_READING
      );
      return {
        ...state,
        userBooks: toggledBooks,
        currentlyReading: toggledCurrentlyReading
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  actions: {
    upgradeToPremium(): unknown;
    repositories: {
      userRepository: UserRepository;
      bookRepository: BookRepository;
    };
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginAsGuest: () => Promise<void>;
    logout: () => void;
    loadUserData: (userId?: string) => Promise<void>;
    addBookToLibrary: (bookId: string, status: ReadingStatus) => Promise<{ success: boolean; message?: string; userBook?: UserBook }>;
    removeBookFromLibrary: (bookId: string) => Promise<{ success: boolean; message?: string }>;
    updateReadingProgress: (userBookId: string, currentPage: number) => Promise<void>;
    updateProfile: (profileData: { name?: string; nickname?: string; avatar?: string; banner?: string }) => Promise<void>;
    setTheme: (theme: 'light' | 'night') => void;
    canAddMoreBooks: () => boolean;
    calculateUserStatistics: () => UserStatistics;
    toggleFavorite: (bookId: string) => Promise<{ success: boolean; message?: string }>;
  };
  repositories: {
    userRepository: UserRepository;
    bookRepository: BookRepository;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const repositories = {
    userRepository: new MockUserRepository(),
    bookRepository: new MockBookRepository()
  };

  // Check Supabase authentication on mount
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      if (!supabase) {
        console.log('Supabase não configurado, usando modo local');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const result = await AuthService.getCurrentUser();
        if (result.success && result.user) {
          console.log('Usuário Supabase encontrado:', result.user.email);
          
          // Load profile from Supabase
          const profileResult = await ProfileService.getProfile(result.user.id);
          
          if (profileResult.success && profileResult.profile) {
            const supabaseUser: User = {
              id: result.user.id,
              name: profileResult.profile.name || result.user.email?.split('@')[0] || 'Usuário',
              nickname: profileResult.profile.nickname,
              email: result.user.email || '',
              avatar: profileResult.profile.avatar,
              banner: profileResult.profile.banner,
              createdAt: new Date(result.user.created_at || Date.now()),
              accountType: profileResult.profile.account_type as 'guest' | 'registered' | 'premium',
              planType: profileResult.profile.plan_type as 'basico' | 'premium' | 'familia' | undefined,
              preferences: {
                theme: 'light',
                language: 'pt-BR',
                notifications: {
                  dailyReminder: true,
                  weeklyProgress: true,
                  newRecommendations: true
                },
                readingGoals: {
                  booksPerYear: 12,
                  minutesPerDay: 30
                }
              },
              statistics: {
                booksRead: 0,
                currentlyReading: 0,
                favorites: 0,
                toReadCount: 0,
                droppedCount: 0,
                booksLiked: 0,
                chaptersRead: 0,
                totalReadingTime: 0,
                streak: 0,
                favoriteGenre: 'Ficção'
              }
            };

            dispatch({ type: 'SET_USER', payload: supabaseUser });
            dispatch({ type: 'SET_AUTHENTICATED', payload: true });
            
            // Load user books from Supabase
            await loadUserDataWithUserId(result.user.id);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação Supabase:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkSupabaseAuth();

    // Listen for auth changes
    if (supabase) {
      const { data } = AuthService.onAuthStateChange(async (user) => {
        if (user) {
          console.log('Auth state changed: user logged in');
          // Reload user data when auth state changes
          const profileResult = await ProfileService.getProfile(user.id);
          if (profileResult.success && profileResult.profile) {
            const supabaseUser: User = {
              id: user.id,
              name: profileResult.profile.name || user.email?.split('@')[0] || 'Usuário',
              nickname: profileResult.profile.nickname,
              email: user.email || '',
              avatar: profileResult.profile.avatar,
              banner: profileResult.profile.banner,
              createdAt: new Date(user.created_at || Date.now()),
              accountType: profileResult.profile.account_type as 'guest' | 'registered' | 'premium',
              planType: profileResult.profile.plan_type as 'basico' | 'premium' | 'familia' | undefined,
              preferences: {
                theme: 'light',
                language: 'pt-BR',
                notifications: {
                  dailyReminder: true,
                  weeklyProgress: true,
                  newRecommendations: true
                },
                readingGoals: {
                  booksPerYear: 12,
                  minutesPerDay: 30
                }
              },
              statistics: {
                booksRead: 0,
                currentlyReading: 0,
                favorites: 0,
                toReadCount: 0,
                droppedCount: 0,
                booksLiked: 0,
                chaptersRead: 0,
                totalReadingTime: 0,
                streak: 0,
                favoriteGenre: 'Ficção'
              }
            };

            dispatch({ type: 'SET_USER', payload: supabaseUser });
            dispatch({ type: 'SET_AUTHENTICATED', payload: true });
            await loadUserDataWithUserId(user.id);
          }
        } else {
          console.log('Auth state changed: user logged out');
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          dispatch({ type: 'SET_USER_BOOKS', payload: [] });
          dispatch({ type: 'SET_CURRENTLY_READING', payload: [] });
        }
      });

      return () => {
        data.subscription.unsubscribe();
      };
    }
  }, []);

  // Helper function to load user data with specific userId (avoids closure issues)
  const loadUserDataWithUserId = async (userId: string) => {
    try {
      console.log('Loading user data for userId:', userId);
      const userBooks = await repositories.bookRepository.getUserBooks(userId);
      const currentlyReading = await repositories.bookRepository.getUserBooksByStatus(
        userId, 
        ReadingStatus.CURRENTLY_READING
      );
      
      console.log('Loaded userBooks:', userBooks.length);
      console.log('Loaded currentlyReading:', currentlyReading.length);
      
      // Remove duplicates based on book ID and ensure data consistency
      const uniqueUserBooks = userBooks.filter((userBook, index, self) => 
        index === self.findIndex(ub => ub.book.id === userBook.book.id)
      );
      
      const uniqueCurrentlyReading = uniqueUserBooks.filter(ub => 
        ub.status === ReadingStatus.CURRENTLY_READING
      );
      
      dispatch({ type: 'SET_USER_BOOKS', payload: uniqueUserBooks });
      dispatch({ type: 'SET_CURRENTLY_READING', payload: uniqueCurrentlyReading });
      
      console.log('Successfully loaded user data. UserBooks in state:', uniqueUserBooks.length);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const actions = useMemo(() => ({
    upgradeToPremium: async () => {
      if (!state.user) {
        throw new Error('Usuário não encontrado para fazer upgrade.');
      }
      console.log(`Upgrading user ${state.user.id} to premium...`);
      // Placeholder: In a real app, this would call a payment service and then an API
      const updatedUser = await repositories.userRepository.updateUser({
        accountType: 'premium',
        planType: 'premium'
      });
      dispatch({ type: 'SET_USER', payload: updatedUser });
      console.log('User upgraded to premium.');
    },
    repositories,
    
    login: async (email: string, password: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Validate input parameters
        if (!email || typeof email !== 'string') {
          throw new Error('Email inv\u00e1lido');
        }
        if (!password || typeof password !== 'string') {
          throw new Error('Senha inv\u00e1lida');
        }

        // Try AuthService (Supabase) first regardless of static `supabase` value.
        // The AuthService internally ensures the client is initialized and will
        // return a helpful error if not.
        try {
          const result = await AuthService.signInWithEmail(email, password);
          if (result.success && (result as any).user) {
            // Auth state listener will load user data and update state.
            console.log('AuthService signInWithEmail succeeded for', email);
            return;
          }

          // If AuthService returned a failure, surface that and fall back.
          console.warn('AuthService signInWithEmail did not return a user:', result.error);
        } catch (authError) {
          console.warn('AuthService signInWithEmail threw error, falling back to mock:', authError);
        }

        // Fallback to mock repository if AuthService didn't authenticate
        const user = await (repositories.userRepository as MockUserRepository).loginUser(email, password);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Pass userId to ensure loadUserData works even if state.user isn't updated yet
        await loadUserDataWithUserId(user.id);
      } catch (error) {
        console.error('Login failed:', error);
        throw error; // Re-throw to handle in UI
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    signUp: async (email: string, password: string, name: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (!email || typeof email !== 'string') {
          throw new Error('Email inv\u00e1lido');
        }
        if (!password || typeof password !== 'string') {
          throw new Error('Senha inv\u00e1lida');
        }
        if (!name || typeof name !== 'string') {
          throw new Error('Nome inv\u00e1lido');
        }

        // Try AuthService (Supabase) first regardless of static `supabase` value.
        try {
          const result: any = await AuthService.signUpWithEmail(email, password, name);
          if (result.success) {
            // If Supabase created the user and returned the user object AND a session is present,
            // the user should already be authenticated via the SDK and auth state listener will run.
            if (result.user && !result.requiresConfirmation) {
              console.log('AuthService signUpWithEmail succeeded and user is confirmed for', email);
              return;
            }

            // If Supabase created the user but requires email confirmation, notify UI.
            if (result.requiresConfirmation) {
              console.warn('Sign up requires email confirmation for', email);
              throw new Error('confirma_email'); // special token handled by UI
            }

            // If user object exists but no session (edge case), try to sign in automatically.
            if (result.user && !result.requiresConfirmation) {
              try {
                const signInResult: any = await AuthService.signInWithEmail(email, password);
                if (signInResult.success && signInResult.user) {
                  console.log('Automatic sign-in after signup succeeded for', email);
                  return;
                }
              } catch (siErr) {
                console.warn('Automatic sign-in after signup failed, will fallback to mock:', siErr);
              }
            }
          } else {
            console.warn('AuthService signUpWithEmail returned failure:', result.error);
          }
        } catch (authError) {
          // If the error is the special token, rethrow so UI can show a friendly message.
          if (authError instanceof Error && authError.message === 'confirma_email') {
            throw authError;
          }

          console.warn('AuthService signUpWithEmail threw error or did not finish, falling back to mock:', authError);
        }

        // Fallback to mock repository when AuthService fails or is not available
        const user = await repositories.userRepository.createUser(email, name);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        await loadUserDataWithUserId(user.id);
      } catch (error) {
        console.error('Sign up failed:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loginWithGoogle: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        console.log('🔐 Starting Google login process...');
        
        const result = await AuthService.signInWithGoogle();
        if (!result.success) {
          console.error('❌ Google login failed:', result.error);
          throw new Error(result.error || 'Falha no login com Google');
        }
        
        console.log('✅ Google login initiated successfully - redirecting...');
        // User will be loaded by the auth state change listener after redirect
        // Don't set loading to false here since page will redirect
      } catch (error) {
        console.error('❌ Google login error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    },

    loginAsGuest: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const user = await repositories.userRepository.createGuestUser();
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Pass userId to ensure loadUserData works even if state.user isn't updated yet
        await loadUserDataWithUserId(user.id);
      } catch (error) {
        console.error('Guest login failed:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    logout: async () => {
      // Try Supabase logout first if available
      if (supabase) {
        await AuthService.signOut();
      }
      
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_USER_BOOKS', payload: [] });
      dispatch({ type: 'SET_CURRENTLY_READING', payload: [] });
    },

    loadUserData: async (userId?: string) => {
      // Always get the latest state from the repository
      const currentUserId = userId || state.user?.id;
      
      if (!currentUserId) {
        console.warn('loadUserData called but no user ID available');
        return;
      }
      
      try {
        console.log('Loading user data for userId:', currentUserId);
        const userBooks = await repositories.bookRepository.getUserBooks(currentUserId);
        const currentlyReading = await repositories.bookRepository.getUserBooksByStatus(
          currentUserId, 
          ReadingStatus.CURRENTLY_READING
        );
        
        // Remove duplicates based on book ID and ensure data consistency
        const uniqueUserBooks = userBooks.filter((userBook, index, self) => 
          index === self.findIndex(ub => ub.book.id === userBook.book.id)
        );
        
        const uniqueCurrentlyReading = uniqueUserBooks.filter(ub => 
          ub.status === ReadingStatus.CURRENTLY_READING
        );
        
        dispatch({ type: 'SET_USER_BOOKS', payload: uniqueUserBooks });
        dispatch({ type: 'SET_CURRENTLY_READING', payload: uniqueCurrentlyReading });
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    },

    canAddMoreBooks: () => {
      if (!state.user) return false;
      // All logged users (registered and guest) can now add unlimited books
      if (state.user.accountType === 'registered') return true;
      if (state.user.accountType === 'guest') return true;
      
      // This should never be reached, but keeping as fallback
      const currentCount = state.userBooks.length;
      const maxBooks = state.user.limitations?.maxBooks || 5;
      return currentCount < maxBooks;
    },

    addBookToLibrary: async (bookId: string, status: ReadingStatus, book?: Book): Promise<{ success: boolean; message?: string; userBook?: UserBook }> => {
      // Get current user ID to avoid closure issues
      const currentUserId = state.user?.id;
      console.log('DEBUG addBookToLibrary called with', { bookId, status, currentUserId });
      if (!currentUserId) return { success: false, message: 'Usuário não encontrado' };
      
      try {
        // Use Supabase for registered users, fallback to local repository for guests
        if (state.user?.accountType === 'registered') {
          const result = await UserBookService.addBookToLibrary(currentUserId, bookId, status, book);
          console.log('DEBUG addBookToLibrary - UserBookService result:', result);
          
          if (result.success) {
            // Reload user data from Supabase
            const libraryResult = await UserBookService.getUserLibrary(currentUserId);
            if (libraryResult.success && libraryResult.books) {
              // Convert to UserBook format
              const userBooks: UserBook[] = libraryResult.books.map(book => ({
                id: `${currentUserId}_${book.id}`,
                userId: currentUserId,
                book: book,
                status: book.status!,
                addedAt: book.addedAt || new Date().toISOString(),
                currentPage: book.progress || 0,
              }));
              
              dispatch({ type: 'SET_USER_BOOKS', payload: userBooks });
              
              const currentlyReading = userBooks.filter(ub => ub.status === ReadingStatus.CURRENTLY_READING);
              dispatch({ type: 'SET_CURRENTLY_READING', payload: currentlyReading });
            }
            
            return { 
              success: true, 
              message: 'Livro adicionado à biblioteca!',
            };
          } else {
            return { success: false, message: result.error || 'Erro ao adicionar livro' };
          }
        } else {
          // Fallback to local repository for guest users
          // Always check fresh data from repository to avoid race conditions
          const currentUserBooks = await repositories.bookRepository.getUserBooks(currentUserId);
          const existingBook = currentUserBooks.find(userBook => userBook.book.id === bookId);
          
          if (existingBook) {
            // If book exists but with different status, update it
            if (existingBook.status !== status) {
              console.log(`Updating existing book "${existingBook.book.title}" from ${existingBook.status} to ${status}`);
              
              const updatedUserBook = await repositories.bookRepository.updateUserBookStatus(
                existingBook.id,
                status
              );
              console.log('DEBUG addBookToLibrary - updatedUserBook (mock):', updatedUserBook);
              
              dispatch({ type: 'UPDATE_USER_BOOK', payload: updatedUserBook });
              
              // Force reload to ensure complete synchronization
              await loadUserDataWithUserId(currentUserId);
              
              return { 
                success: true, 
                message: 'Status do livro atualizado!',
                userBook: updatedUserBook
              };
            } else {
              // Book exists with same status
              console.log(`Book "${existingBook.book.title}" already has status ${status}`);
              // Ensure state is synchronized
              if (state.userBooks.length !== currentUserBooks.length) {
                dispatch({ type: 'SET_USER_BOOKS', payload: currentUserBooks });
              }
              return { 
                success: true, // Changed to true since book is already in desired state
                message: 'Livro já possui este status!',
              userBook: existingBook
            };
          }
          }
          
          const userBook = await repositories.bookRepository.addBookToUser(
            currentUserId, 
            bookId, 
            status
          );

          console.log('DEBUG addBookToLibrary - addBookToUser returned', userBook);
          
          dispatch({ type: 'ADD_USER_BOOK', payload: userBook });
          
          // Force reload to ensure complete synchronization
          await loadUserDataWithUserId(currentUserId);
          
          // Update user limitations if guest
          if (state.user?.accountType === 'guest' && state.user.limitations) {
            const updatedUser = {
              ...state.user,
              limitations: {
                ...state.user.limitations,
                currentBookCount: state.user.limitations.currentBookCount + 1
              }
            };
            dispatch({ type: 'SET_USER', payload: updatedUser });
          }
          
          return { success: true, userBook };
        }
        
      } catch (error) {
        console.error('Failed to add book:', error);
        
        if (error instanceof Error && error.message.includes('already in library')) {
          // Handle race condition - book was added by another process
          try {
            await loadUserDataWithUserId(currentUserId);
            const refreshedUserBooks = await repositories.bookRepository.getUserBooks(currentUserId);
            const existingUserBook = refreshedUserBooks.find(ub => ub.book.id === bookId);
            
            return { 
              success: false, 
              message: 'Este livro já foi adicionado!',
              userBook: existingUserBook
            };
          } catch (refreshError) {
            console.error('Failed to refresh after race condition:', refreshError);
          }
        }
        
        return { success: false, message: 'Erro ao adicionar livro' };
      }
    },

    removeBookFromLibrary: async (bookId: string): Promise<{ success: boolean; message?: string }> => {
      // Get current user ID to avoid closure issues
      const currentUserId = state.user?.id;
      if (!currentUserId) return { success: false, message: 'Usuário não encontrado' };
      
      try {
        // Call repository to remove the book (handles duplicates)
        await repositories.bookRepository.removeBookFromUser(currentUserId, bookId);
        
        // Update state by filtering out the removed book
        const updatedUserBooks = state.userBooks.filter(ub => ub.book.id !== bookId);
        // Recalculate currently reading from the filtered list
        const updatedCurrentlyReading = updatedUserBooks.filter(ub => 
          ub.status === ReadingStatus.CURRENTLY_READING
        );
        
        dispatch({ type: 'SET_USER_BOOKS', payload: updatedUserBooks });
        dispatch({ type: 'SET_CURRENTLY_READING', payload: updatedCurrentlyReading });
        
        // Update user limitations if guest
        if (state.user?.accountType === 'guest' && state.user.limitations) {
          const updatedUser = {
            ...state.user,
            limitations: {
              ...state.user.limitations,
              currentBookCount: Math.max(0, state.user.limitations.currentBookCount - 1)
            }
          };
          dispatch({ type: 'SET_USER', payload: updatedUser });
        }
        
        return { success: true };
      } catch (error) {
        console.error('Failed to remove book:', error);
        return { success: false, message: 'Erro ao remover livro' };
      }
    },

    updateReadingProgress: async (userBookId: string, currentPage: number) => {
      try {
        console.log('Updating reading progress for userBookId:', userBookId, 'page:', currentPage);
        const updatedUserBook = await repositories.bookRepository.updateUserBookProgress(
          userBookId, 
          currentPage
        );
        console.log('Progress updated successfully, dispatching update');
        dispatch({ type: 'UPDATE_USER_BOOK', payload: updatedUserBook });
      } catch (error) {
        console.error('Failed to update progress:', error);
        
        // If userBook not found, try to recover by reloading user data
        if (error instanceof Error && error.message.includes('User book not found')) {
          console.log('UserBook not found, attempting to reload user data');
          const currentUserId = state.user?.id;
          if (currentUserId) {
            try {
              await loadUserDataWithUserId(currentUserId);
              console.log('User data reloaded, attempting progress update again');
              
              // Try once more with the refreshed data
              const refreshedUserBooks = await repositories.bookRepository.getUserBooks(currentUserId);
              const userBook = refreshedUserBooks.find(ub => ub.id === userBookId);
              
              if (userBook) {
                const retryUpdatedUserBook = await repositories.bookRepository.updateUserBookProgress(
                  userBookId, 
                  currentPage
                );
                dispatch({ type: 'UPDATE_USER_BOOK', payload: retryUpdatedUserBook });
                console.log('Progress update succeeded on retry');
              } else {
                console.warn('UserBook still not found after reload, progress not saved');
              }
            } catch (reloadError) {
              console.error('Failed to reload user data after progress update error:', reloadError);
            }
          }
        }
        
        // Don't throw error to avoid disrupting reading experience
        // The user can still read, just progress won't be saved
      }
    },

    setTheme: (theme: 'light' | 'night') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },

    updateProfile: async (profileData: { name?: string; nickname?: string; avatar?: string; banner?: string }) => {
      if (!state.user) {
        throw new Error('Usuário não encontrado');
      }

      try {
        // Update user in repository
        const updatedUser = await repositories.userRepository.updateUser({
          ...profileData
        });
        
        // Update state
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: profileData });
        
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    },

    calculateUserStatistics: (): UserStatistics => {
      if (!state.user || !state.userBooks) {
        return {
          booksRead: 0,
          currentlyReading: 0,
          favorites: 0,
          toReadCount: 0,
          droppedCount: 0,
          booksLiked: 0,
          chaptersRead: 0,
          totalReadingTime: 0,
          streak: 0,
          favoriteGenre: 'Ficção'
        };
      }

      const stats = {
        booksRead: state.userBooks.filter(ub => ub.status === ReadingStatus.READ).length,
        currentlyReading: state.userBooks.filter(ub => ub.status === ReadingStatus.CURRENTLY_READING).length,
        favorites: state.userBooks.filter(ub => ub.status === ReadingStatus.WANT_TO_READ).length,
        toReadCount: state.userBooks.filter(ub => ub.status === ReadingStatus.WANT_TO_READ).length,
        droppedCount: 0, // Since we don't have DROPPED status, set to 0
        booksLiked: state.userBooks.filter(ub => ub.isFavorite).length,
  chaptersRead: state.userBooks.reduce((total, ub) => total + (ub.progress?.currentPage || 0), 0),
  totalReadingTime: state.userBooks.reduce((total, ub) => total + (ub.progress?.timeSpentReading || 0), 0),
        streak: state.user.statistics?.streak || 0,
        favoriteGenre: state.user.statistics?.favoriteGenre || 'Ficção'
      };

      return stats;
    },

    toggleFavorite: async (bookId: string): Promise<{ success: boolean; message?: string }> => {
      // Get current user ID to avoid closure issues
      const currentUserId = state.user?.id;
      if (!currentUserId) return { success: false, message: 'Usuário não encontrado' };
      
      try {
        // Always get fresh data from repository to avoid state sync issues
        const currentUserBooks = await repositories.bookRepository.getUserBooks(currentUserId);
        const existingUserBook = currentUserBooks.find(ub => ub.book.id === bookId);
        
        if (!existingUserBook) {
          // Book not in library - add it as favorite with "Favoritos" status
          
          const userBook = await repositories.bookRepository.addBookToUser(
            currentUserId,
            bookId,
            ReadingStatus.WANT_TO_READ
          );
          
          // Immediately set as favorite
          const favoriteUserBook = await repositories.bookRepository.toggleUserBookFavorite(userBook.id);
          
          // Update state
          dispatch({ type: 'ADD_USER_BOOK', payload: favoriteUserBook });
          
          // Update user limitations if guest
          if (state.user?.accountType === 'guest' && state.user.limitations) {
            const updatedUser = {
              ...state.user,
              limitations: {
                ...state.user.limitations,
                currentBookCount: state.user.limitations.currentBookCount + 1
              }
            };
            dispatch({ type: 'SET_USER', payload: updatedUser });
          }
          
          return { success: true, message: 'Livro adicionado aos favoritos!' };
        }
        
        // Book exists in library - toggle favorite status
        const updatedUserBook = await repositories.bookRepository.toggleUserBookFavorite(existingUserBook.id);
        
        // If becoming favorite and not already "Favoritos", move to "Favoritos"
        let finalUserBook = updatedUserBook;
        if (updatedUserBook.isFavorite && updatedUserBook.status !== ReadingStatus.WANT_TO_READ) {
          finalUserBook = await repositories.bookRepository.updateUserBookStatus(
            updatedUserBook.id,
            ReadingStatus.WANT_TO_READ
          );
        }
        
        // Update state with final book
        dispatch({ type: 'UPDATE_USER_BOOK', payload: finalUserBook });
        
        // Also update currently reading list if status changed
        if (finalUserBook.status !== existingUserBook.status) {
          const updatedCurrentlyReading = await repositories.bookRepository.getUserBooksByStatus(
            currentUserId, 
            ReadingStatus.CURRENTLY_READING
          );
          dispatch({ type: 'SET_CURRENTLY_READING', payload: updatedCurrentlyReading });
        }
        
        // Force a complete reload to ensure all data is in sync
        await loadUserDataWithUserId(currentUserId);
        
        const isFavorite = finalUserBook.isFavorite;
        return { 
          success: true, 
          message: isFavorite ? 'Livro adicionado aos favoritos!' : 'Livro removido dos favoritos!' 
        };
        
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        
        // If book already exists error, try to reload and get current status
        if (error instanceof Error && error.message.includes('already in library')) {
          try {
            await actions.loadUserData(currentUserId);
            return { success: false, message: 'Este livro já foi adicionado!' };
          } catch (reloadError) {
            console.error('Failed to reload after duplicate error:', reloadError);
          }
        }
        
        // If user book not found, try to recover by reloading data
        if (error instanceof Error && error.message.includes('User book not found')) {
          try {
            await actions.loadUserData(currentUserId);
            return { success: false, message: 'Estado sincronizado. Tente novamente.' };
          } catch (reloadError) {
            console.error('Failed to reload after not found error:', reloadError);
          }
        }
        
        return { success: false, message: 'Erro ao alterar favorito' };
      }
    }
  }), [repositories, state.user]);

  return (
    <AppContext.Provider value={{ state, actions, repositories }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}