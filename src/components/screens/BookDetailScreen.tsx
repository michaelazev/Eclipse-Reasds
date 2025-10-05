import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { Book, ReadingStatus } from '../../models/Book';
import { BookDetailModal } from '../book/BookDetailModal';
import { ReadingMode } from '../book/ReadingMode';
import { Button } from '../ui/button';
import { ArrowLeft, BookOpen, Star, Heart, CheckCircle } from 'lucide-react';
import { useIsDesktopLegacy as useIsDesktop } from '../../hooks/useMediaQuery';
import { toast } from 'sonner';

interface BookDetailScreenProps {
  bookId: string | null;
  onBack: () => void;
  onNavigateToHome?: (bookId: string) => void;
}

export function BookDetailScreen({ bookId, onBack, onNavigateToHome }: BookDetailScreenProps) {
  const { state, actions } = useApp();
  const [book, setBook] = useState<Book | null>(null);
  const [showReadingMode, setShowReadingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Create timeout promise - 30 segundos para dar tempo de todas as tentativas de retry
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 30000);
        });
        
        // Race between actual request and timeout
        const foundBook = await Promise.race([
          actions.repositories.bookRepository.getBookById(bookId),
          timeoutPromise
        ]) as Book | null;
        
        setBook(foundBook);
        
        // Se recebeu dados temporários (fallback), mostra aviso discreto
        if (foundBook && (foundBook as any).isTemporaryData) {
          console.warn('⚠️ Exibindo dados de fallback para livro:', bookId);
          // Não mostra toast aqui pois já tem o banner visual
        }
      } catch (error) {
        console.error('Error loading book:', error);
        setBook(null);
        toast.error('Não foi possível carregar o livro. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId, actions.repositories.bookRepository]);

  const handleStartReading = async (book: Book) => {
    const existingUserBook = state.userBooks.find(ub => ub.book.id === book.id);
    
    if (existingUserBook) {
      // Book already in library, start reading
      toast.success('Iniciando leitura!');
      setTimeout(() => {
        setShowReadingMode(true);
      }, 1000);
    } else {
      // Add book to library first, then start reading
      try {
        const result = await actions.addBookToLibrary(book.id, ReadingStatus.CURRENTLY_READING);
        
        if (result.success) {
          toast.success('Começando a leitura!');
          // Start reading immediately since book was successfully added
          setTimeout(() => {
            setShowReadingMode(true);
          }, 1000);
        } else {
          toast.error(result.message || 'Erro ao adicionar livro');
        }
      } catch (error) {
        toast.error('Erro ao adicionar livro');
      }
    }
  };

  const handleAddToLibrary = async (status: ReadingStatus) => {
    try {
      const result = await actions.addBookToLibrary(book!.id, status);
      
      if (result.success) {
        let message = 'Livro adicionado com sucesso!';
        if (status === ReadingStatus.WANT_TO_READ) message = 'Livro adicionado aos favoritos!';
        if (status === ReadingStatus.READ) message = 'Livro marcado como lido!';
        
        toast.success(message);
        
        // Auto-navigate to library after successful action
        setTimeout(() => {
          if (onNavigateToHome) {
            onNavigateToHome(book!.id);
          }
        }, 1500); // Wait 1.5s to show the toast before navigating
      } else {
        toast.error(result.message || 'Erro ao adicionar livro');
      }
    } catch (error) {
      toast.error('Erro ao adicionar livro');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await actions.toggleFavorite(book!.id);
      
      if (result.success) {
        // Force reload to ensure updated data is shown
        await actions.loadUserData();
        toast.success(result.message);
        
        // Auto-navigate to library after successful action
        setTimeout(() => {
          if (onNavigateToHome) {
            onNavigateToHome(book!.id);
          }
        }, 1500); // Wait 1.5s to show the toast before navigating
      } else {
        toast.error(result.message || 'Erro ao alterar favorito');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao alterar favorito');
    }
  };

  const handleMarkAsRead = async () => {
    if (!book) return;
    
    const existingUserBook = state.userBooks.find(ub => ub.book.id === book.id);
    console.log('DEBUG handleMarkAsRead - user:', state.user);
    console.log('DEBUG handleMarkAsRead - existingUserBook:', existingUserBook);
    console.log('DEBUG handleMarkAsRead - bookId:', book.id);
    
    if (existingUserBook) {
      // Update status if book is already in library
      try {
        const updatedUserBook = await actions.repositories.bookRepository.updateUserBookStatus(
          existingUserBook.id, 
          ReadingStatus.READ
        );
        console.log('DEBUG handleMarkAsRead - updatedUserBook:', updatedUserBook);
        // Force reload to ensure consistency
        await actions.loadUserData();
        toast.success('Livro marcado como lido!');
        
        // Auto-navigate to library after successful action
        setTimeout(() => {
          if (onNavigateToHome) {
            onNavigateToHome(book.id);
          }
        }, 1500); // Wait 1.5s to show the toast before navigating
      } catch (error) {
        console.error('Error updating book status:', error);
        toast.error('Erro ao marcar como lido');
      }
    } else {
      // Add book to library if not present
      try {
        console.log('DEBUG handleMarkAsRead - calling addBookToLibrary for', book.id);
        const result = await actions.addBookToLibrary(book.id, ReadingStatus.READ);
        console.log('DEBUG handleMarkAsRead - addBookToLibrary result:', result);
        if (result.success) {
          toast.success('Livro marcado como lido!');
          
          // Auto-navigate to library after successful action
          setTimeout(() => {
            if (onNavigateToHome) {
              onNavigateToHome(book.id);
            }
          }, 1500); // Wait 1.5s to show the toast before navigating
        } else {
          toast.error(result.message || 'Erro ao marcar como lido');
        }
      } catch (error) {
        console.error('Error adding book as read:', error);
        toast.error('Erro ao marcar como lido');
      }
    }
  };

  if (showReadingMode && book) {
    return (
      <ReadingMode
        bookTitle={book.title}
        book={book}
        onBack={() => setShowReadingMode(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/90">Carregando detalhes do livro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Livro temporariamente indisponível</h2>
          <p className="text-white/70 mb-6">
            Não foi possível carregar os detalhes deste livro no momento. 
            A API do Google Books pode estar temporariamente indisponível.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={onBack}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isDesktop) {
    // Mobile: Use modal approach
    return (
      <BookDetailModal
        book={book}
        isOpen={true}
        onClose={onBack}
        onStartReading={handleStartReading}
      />
    );
  }

  // Desktop: Full page layout
  const isTemporaryData = (book as any).isTemporaryData;
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Button 
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        {/* Warning banner for temporary data */}
        {isTemporaryData && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-900/30 border border-yellow-700">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-yellow-200 font-medium mb-1">Dados Temporariamente Indisponíveis</h4>
                <p className="text-yellow-100/80 text-sm mb-3">
                  A API do Google Books está temporariamente indisponível (erro 503). Os detalhes completos do livro não puderam ser carregados. Por favor, tente novamente em alguns minutos.
                </p>
                <Button 
                  onClick={() => {
                    // Limpa o cache e recarrega
                    import('../../services/booksService').then(service => {
                      service.clearCache();
                      window.location.reload();
                    });
                  }}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          {/* Left side - Book cover and basic info */}
          <div className="flex flex-col items-center justify-center">
            <div className="glass rounded-3xl p-8 max-w-md w-full">
              {/* Book Cover */}
              <div className="aspect-[3/4] w-full max-w-80 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden rounded-2xl">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="text-white opacity-50" size={64} />
                  </div>
                )}
                
                {/* Status badges */}
                {book.id === 'dom_casmurro' ? (
                  <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="text-white" size={14} />
                      <span className="text-white text-xs font-medium">E-book Funcionando</span>
                    </div>
                  </div>
                ) : book.source === 'elivros' ? (
                  <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="text-white" size={14} />
                      <span className="text-white text-xs font-medium">Leitura Online</span>
                    </div>
                  </div>
                ) : book.isPublicDomain && (
                  <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="text-white" size={14} />
                      <span className="text-white text-xs font-medium">Disponível</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Basic info */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">{book.title}</h1>
                <p className="text-white/70 text-lg mb-2">por {book.author}</p>
                <p className="text-white/60 text-sm mb-4">{book.publishedYear}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={20} />
                    <span className="text-white text-lg font-medium">{(book.rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-white/60">•</span>
                  <span className="text-white/60">{book.pages} páginas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Detailed information and actions */}
          <div className="flex flex-col">
            <div className="glass rounded-3xl p-8 flex-1 overflow-y-auto responsive-scroll">
              <div className="space-y-6">
                {/* Book Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-white">Páginas:</span> 
                    <span className="ml-1 text-gray-300">{book.pages}</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Idioma:</span> 
                    <span className="ml-1 text-gray-300">
                      {book.language === 'pt' ? 'Português' : book.language === 'en' ? 'Inglês' : book.language || 'N/A'}
                    </span>
                  </div>
                  {book.isbn && (
                    <div className="col-span-2">
                      <span className="font-medium text-white">ISBN:</span> 
                      <span className="ml-1 text-gray-300">{book.isbn}</span>
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {(book.categories || []).map((category) => (
                    <div
                      key={category.id}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon} {category.name}
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Sobre o livro</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Book Availability */}
                {book.source === 'elivros' ? (
                  <div className="p-4 rounded-xl border border-green-700 bg-green-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="text-green-400" size={20} />
                      <p className="font-medium text-white">Disponível no elivros.info</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Leitura Online</span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Brasileiro</span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Literatura Nacional</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Este livro está disponível para leitura online através do site elivros.info, uma biblioteca digital de literatura brasileira.
                    </p>
                  </div>
                ) : book.isPublicDomain && (
                  <div className="p-4 rounded-xl border border-blue-700 bg-blue-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="text-green-400" size={20} />
                      <p className="font-medium text-white">Disponível para Leitura</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Online</span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Domínio Público</span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Gratuito</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Obra de domínio público - Leitura online gratuita
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <Button
                    onClick={() => handleStartReading(book)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                    disabled={!actions.canAddMoreBooks() && !state.userBooks.find(ub => ub.book.id === book.id)}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {state.userBooks.find(ub => ub.book.id === book.id)?.status === ReadingStatus.CURRENTLY_READING 
                      ? 'Continuar Lendo' 
                      : 'Ler Agora'
                    }
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Like Button - permanent, like in cards */}
                    <Button
                      onClick={handleToggleFavorite}
                      className={`transition-all ${
                        state.userBooks.find(ub => ub.book.id === book.id)?.isFavorite
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      disabled={!actions.canAddMoreBooks() && !state.userBooks.find(ub => ub.book.id === book.id)}
                      title={
                        state.userBooks.find(ub => ub.book.id === book.id)?.isFavorite
                          ? 'Remover dos favoritos'
                          : actions.canAddMoreBooks() || state.userBooks.find(ub => ub.book.id === book.id)
                            ? 'Adicionar aos favoritos'
                            : 'Limite atingido'
                      }
                    >
                      <Heart className={`w-4 h-4 mr-2 ${
                        state.userBooks.find(ub => ub.book.id === book.id)?.isFavorite ? 'fill-current text-white' : 'text-white'
                      }`} />
                      Favoritar
                    </Button>
                    
                    {/* Mark as Read Button - permanent */}
                    <Button
                      onClick={handleMarkAsRead}
                      className={`transition-all ${
                        state.userBooks.find(ub => ub.book.id === book.id)?.status === ReadingStatus.READ
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      disabled={!actions.canAddMoreBooks() && !state.userBooks.find(ub => ub.book.id === book.id)}
                      title={
                        state.userBooks.find(ub => ub.book.id === book.id)?.status === ReadingStatus.READ
                          ? 'Já marcado como lido'
                          : actions.canAddMoreBooks() || state.userBooks.find(ub => ub.book.id === book.id)
                            ? 'Marcar como lido'
                            : 'Limite atingido'
                      }
                    >
                      <CheckCircle className={`w-4 h-4 mr-2 ${
                        state.userBooks.find(ub => ub.book.id === book.id)?.status === ReadingStatus.READ ? 'fill-current text-white' : 'text-white'
                      }`} />
                      Já Li
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}