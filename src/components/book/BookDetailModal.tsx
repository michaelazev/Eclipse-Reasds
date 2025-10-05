// Removed motion imports for better performance
import { Book, ReadingStatus } from '../../models/Book';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Star, BookOpen, Heart, X, Clock, CheckCircle, HeartOff, Trash2, Download } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useIsMobile, useIsTablet, useIsDesktop } from '../../hooks/useMediaQuery';
import { toast } from 'sonner';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onStartReading?: (book: Book) => void;
}

export function BookDetailModal({ book, isOpen, onClose, onStartReading }: BookDetailModalProps) {
  const { state, actions } = useApp();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (!book) return null;

  const handleAddToLibrary = async (status: ReadingStatus) => {
    try {
      const result = await actions.addBookToLibrary(book.id, status);
      
      if (result.success) {
        let message = 'Livro adicionado com sucesso!';
        if (status === ReadingStatus.WANT_TO_READ) message = 'Livro adicionado aos favoritos!';
        if (status === ReadingStatus.CURRENTLY_READING) message = 'Começando a leitura!';
        if (status === ReadingStatus.READ) message = 'Livro marcado como lido!';
        
        toast.success(message);
        onClose();
      } else {
        toast.error(result.message || 'Erro ao adicionar livro');
      }
    } catch (error) {
      toast.error('Erro ao adicionar livro');
    }
  };

  const handleRemoveFromLibrary = async () => {
    try {
      const result = await actions.removeBookFromLibrary(book.id);
      
      if (result.success) {
        toast.success('Livro removido com sucesso!');
        onClose();
      } else {
        toast.error(result.message || 'Erro ao remover livro');
      }
    } catch (error) {
      toast.error('Erro ao remover livro');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await actions.toggleFavorite(book.id);
      
      if (result.success) {
        // Force reload to ensure updated data is shown
        await actions.loadUserData();
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Erro ao alterar favorito');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao alterar favorito');
    }
  };

  const handleMarkAsRead = async () => {
    if (existingUserBook) {
      // Update status if book is already in user's list
      try {
        const updatedUserBook = await actions.repositories.bookRepository.updateUserBookStatus(
          existingUserBook.id, 
          ReadingStatus.READ
        );
        // Force reload to ensure consistency
        await actions.loadUserData();
        toast.success('Livro marcado como lido!');
        onClose();
      } catch (error) {
        console.error('Error updating book status:', error);
        toast.error('Erro ao marcar como lido');
      }
    } else {
      // Add book to library if not present
      try {
        const result = await actions.addBookToLibrary(book.id, ReadingStatus.READ);
        if (result.success) {
          toast.success('Livro marcado como lido!');
          onClose();
        } else {
          toast.error(result.message || 'Erro ao marcar como lido');
        }
      } catch (error) {
        console.error('Error adding book as read:', error);
        toast.error('Erro ao marcar como lido');
      }
    }
  };

  const handleStartReading = async () => {
    const existingUserBook = state.userBooks.find(ub => ub.book.id === book.id);
    
    if (existingUserBook) {
      // Update status to currently reading if not already
      if (existingUserBook.status !== ReadingStatus.CURRENTLY_READING) {
        try {
          await actions.repositories.bookRepository.updateUserBookStatus(
            existingUserBook.id, 
            ReadingStatus.CURRENTLY_READING
          );
          await actions.loadUserData();
          toast.success('Começando a leitura!');
        } catch (error) {
          console.error('Error updating book status:', error);
        }
      }
      
      // Start reading
      if (onStartReading) {
        onStartReading(book);
        onClose();
      }
    } else {
      // Add book to library first, then start reading
      try {
        const result = await actions.addBookToLibrary(book.id, ReadingStatus.CURRENTLY_READING);
        
        if (result.success) {
          toast.success('Começando a leitura!');
          // Give a moment for state to update
          setTimeout(() => {
            if (onStartReading) {
              onStartReading(book);
              onClose();
            }
          }, 100);
        } else {
          toast.error(result.message || 'Erro ao adicionar livro');
        }
      } catch (error) {
        console.error('Error adding book to library:', error);
        toast.error('Erro ao adicionar livro');
      }
    }
  };

  const canAddBook = actions.canAddMoreBooks();
  const isGuest = state.user?.accountType === 'guest';
  
  // Check if book is already in user's library
  const existingUserBook = state.userBooks.find(ub => ub.book.id === book.id);
  const isInLibrary = !!existingUserBook;
  const isFavorited = existingUserBook?.isFavorite || false;

  // Removed getBookSourceInfo function to eliminate external links

  // Determine responsive sizing
  const getModalSize = () => {
    if (isMobile) return 'max-w-[95vw] max-h-[90vh]';
    if (isTablet) return 'max-w-lg max-h-[85vh]';
    return 'max-w-xl max-h-[80vh]';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalSize()} p-0`} style={{
        backgroundColor: state.theme === 'night' ? 'rgb(25,25,112)' : undefined,
        color: state.theme === 'night' ? '#ffffff' : undefined
      }}>
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
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
                <BookOpen className="text-white opacity-50" size={48} />
              </div>
            )}
            
            {/* Source Badge */}
            {book.id === 'dom_casmurro' ? (
              <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="flex items-center gap-1">
                  <BookOpen className="text-white" size={14} />
                  <span className="text-white text-xs font-medium">E-book Funcionando</span>
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
            


            {/* Rating - Moved to left side */}
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="text-white font-medium">{(book.rating || 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Library Status */}
            {isInLibrary && (
              <div className={`absolute bottom-4 left-4 backdrop-blur-sm rounded-full px-3 py-1 ${
                isFavorited 
                  ? 'bg-red-500/90' 
                  : existingUserBook?.status === ReadingStatus.CURRENTLY_READING 
                    ? 'bg-blue-500/90' 
                    : 'bg-green-500/90'
              }`}>
                <div className="flex items-center gap-1">
                  {isFavorited ? (
                    <Heart className="text-white fill-current" size={16} />
                  ) : (
                    <BookOpen className="text-white" size={16} />
                  )}
                  <span className="text-white font-medium">
                    {isFavorited ? 'Favorito' : existingUserBook?.status === ReadingStatus.CURRENTLY_READING ? 'Lendo' : 'Lido'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <DialogHeader className="text-left p-0 mb-4">
              <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>
                {book.title}
              </DialogTitle>
              <DialogDescription className={`mt-1 ${state.theme === 'night' ? 'text-gray-300' : 'text-gray-600'}`}>
                por {book.author} • {book.publishedYear}
                {book.publisher && ` • ${book.publisher}`}
              </DialogDescription>
            </DialogHeader>

            {/* Book Info */}
            <div className={`grid grid-cols-2 gap-4 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <div>
                <span className={`font-medium ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>Páginas:</span> 
                <span className={`ml-1 ${state.theme === 'night' ? 'text-gray-300' : 'text-black'}`}>{book.pages || book.pageCount || 'N/A'}</span>
              </div>
              <div>
                <span className={`font-medium ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>Idioma:</span> 
                <span className={`ml-1 ${state.theme === 'night' ? 'text-gray-300' : 'text-black'}`}>
                  {book.language === 'pt' ? 'Português' : book.language === 'en' ? 'Inglês' : book.language || 'N/A'}
                </span>
              </div>
              {book.isbn && (
                <div className="col-span-2">
                  <span className={`font-medium ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>ISBN:</span> 
                  <span className={`ml-1 ${state.theme === 'night' ? 'text-gray-300' : 'text-black'}`}>{book.isbn}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(book.categories || []).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.icon} {category.name}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <ScrollArea className={`${isMobile ? 'h-24' : 'h-32'} mb-4`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed ${state.theme === 'night' ? 'text-gray-300' : 'text-black'}`}>
                {book.description}
              </p>
            </ScrollArea>

            {/* Book Availability */}
            {book.isPublicDomain && (
              <div className={`mb-4 p-3 rounded-lg border ${state.theme === 'night' ? 'bg-blue-900/30 border-blue-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className={`${state.theme === 'night' ? 'text-green-400' : 'text-green-600'}`} size={16} />
                  <p className={`text-sm font-medium ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>
                    Disponível para Leitura
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Online</Badge>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Domínio Público</Badge>
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Gratuito</Badge>
                </div>
                <p className={`text-xs mb-2 ${state.theme === 'night' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Obra de domínio público - Leitura online gratuita
                </p>
                <div className="space-y-1">
                  <p className={`text-xs font-medium ${state.theme === 'night' ? 'text-white' : 'text-black'}`}>
                    Disponível também em:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href="https://www.gutenberg.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Project Gutenberg
                    </a>
                    <a 
                      href="https://openlibrary.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Open Library
                    </a>
                    <a 
                      href="https://manybooks.net" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      ManyBooks
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Limit Warning */}
            {!canAddBook && isGuest && !isInLibrary && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  Limite de livros atingido. Crie uma conta para adicionar mais livros!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isInLibrary ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleStartReading}
                      className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <BookOpen size={16} />
                      {existingUserBook?.status === ReadingStatus.CURRENTLY_READING ? 'Continuar Lendo' : 'Ler Agora'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Like Button - permanent, purple like main button */}
                    <Button
                      onClick={handleToggleFavorite}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Heart size={16} className={`mr-2 ${isFavorited ? 'fill-current text-white' : 'text-white'}`} />
                      Favoritar
                    </Button>
                    
                    {/* Mark as Read Button - permanent, purple like main button */}
                    <Button
                      onClick={handleMarkAsRead}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <CheckCircle size={16} className="mr-2 text-white" />
                      Já Li
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={handleRemoveFromLibrary}
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remover dos Favoritos
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {isFavorited ? 'Livro nos seus favoritos' : 'Livro adicionado'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleStartReading}
                      className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                      disabled={!canAddBook}
                    >
                      <BookOpen size={16} />
                      Ler Agora
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleToggleFavorite}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!canAddBook}
                    >
                      <Heart size={16} className="mr-2 text-white" />
                      Favoritar
                    </Button>
                    
                    <Button
                      onClick={handleMarkAsRead}
                      variant="outline"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!canAddBook}
                    >
                      <CheckCircle size={16} className="mr-2 text-white" />
                      Já Li
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}