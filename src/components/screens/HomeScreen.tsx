import { useState, useEffect } from 'react';
// Removed motion import for better performance
import { BookCard } from '../book/BookCard';
import { BookDetailModal } from '../book/BookDetailModal';
import { ReadingMode } from '../book/ReadingMode';
import { BookQuoteCard } from '../BookQuoteCard';
import { Button } from '../ui/button';
import { Book, UserBook } from '../../models/Book';
import { useApp } from '../../contexts/AppContext';
import { Skeleton } from '../ui/skeleton';
import { ChevronRight, BookOpen, TrendingUp, Star, Clock, Grid3X3, LayoutList, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export function HomeScreen() {
  const { state, actions } = useApp();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyUpdates, setDailyUpdates] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyReading, setCurrentlyReading] = useState<UserBook[]>([]);
  const [readingMode, setReadingMode] = useState<{
    book: Book;
    content: string;
    currentPage?: number;
  } | null>(null);
  const [gridLayout, setGridLayout] = useState<'grid' | 'list'>('grid');
  const [showAllBooks, setShowAllBooks] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, [state.user]);

  useEffect(() => {
    if (state.user) {
      setCurrentlyReading(state.currentlyReading);
    }
  }, [state.currentlyReading]);

  const loadHomeData = async () => {
    if (!state.user) return;

    setIsLoading(true);
    try {
      // Use getAllBooks so local mockBooks (including recently added ones) are included
      const all = await actions.repositories.bookRepository.getAllBooks();
      setDailyUpdates(all.slice(0, 50)); // 50 books as requested
    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error('Erro ao carregar livros. Verifique sua conexão com a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleStartReading = async (bookId: string, bookContent?: string) => {
    const book = dailyUpdates.find(b => b.id === bookId) ||
                 currentlyReading.find(ub => ub.book.id === bookId)?.book;
    
    if (!book) {
      toast.error('Livro não encontrado');
      return;
    }

    setIsModalOpen(false);

    // If we have content, go directly to reading mode
    if (bookContent) {
      const userBook = state.userBooks.find(ub => ub.book.id === bookId);
      setReadingMode({
        book,
        content: bookContent,
        currentPage: userBook?.progress?.currentPage || 1
      });
    } else if (book.source === 'elivros') {
      // For elivros.info books, try to get the content
      try {
        toast.info('Carregando conteúdo do livro...');
        const content = await actions.repositories.bookRepository.getBookContent(book);
        const userBook = state.userBooks.find(ub => ub.book.id === bookId);
        
        setReadingMode({
          book,
          content,
          currentPage: userBook?.progress?.currentPage || 1
        });
      } catch (error) {
        console.error('Failed to load elivros.info book content:', error);
        toast.error('Não foi possível carregar o conteúdo do livro.');
      }
    } else if (book.source === 'gutenberg' && book.isPublicDomain) {
      // Try to download content for Gutenberg books
      try {
        toast.info('Baixando conteúdo do livro...');
        const content = await actions.repositories.bookRepository.getBookContent(book);
        const userBook = state.userBooks.find(ub => ub.book.id === bookId);
        
        setReadingMode({
          book,
          content,
          currentPage: userBook?.progress?.currentPage || 1
        });
      } catch (error) {
        console.error('Failed to download book content:', error);
        toast.error('Não foi possível baixar o conteúdo do livro. Verifique sua conexão.');
      }
    } else {
      // For other books, show placeholder content
      toast.info('Modo de demonstração - conteúdo simulado');
      setReadingMode({
        book,
        content: `Este é o início de "${book.title}" por ${book.author}.\n\nEste é um modo de demonstração. Para livros completos, recomendamos usar livros do Project Gutenberg que estão disponíveis gratuitamente.\n\n${book.description}\n\nPara continuar lendo este livro, você precisaria adquiri-lo através dos canais oficiais do editor.`,
        currentPage: 1
      });
    }
  };

  const handleBackFromReading = () => {
    setReadingMode(null);
  };

  const handlePageChange = async (page: number) => {
    if (!readingMode) return;
    
    const userBook = state.userBooks.find(ub => ub.book.id === readingMode.book.id);
    if (userBook) {
      try {
        console.log('Updating progress for userBook:', userBook.id, 'page:', page);
        await actions.updateReadingProgress(userBook.id, page);
      } catch (error) {
        console.error('Failed to update reading progress:', error);
        // Try alternative approach - update by book ID if userBook ID fails
        try {
          await actions.updateReadingProgress(readingMode.book.id, page);
        } catch (alternativeError) {
          console.error('Alternative update also failed:', alternativeError);
        }
      }
    } else {
      console.warn('UserBook not found for book:', readingMode.book.id);
    }
  };

  // If in reading mode, show the reading interface
  if (readingMode) {
    return (
      <ReadingMode
        bookTitle={readingMode.book.title}
        book={readingMode.book}
        bookContent={readingMode.content}
        currentPage={readingMode.currentPage}
        onBack={handleBackFromReading}
        onPageChange={handlePageChange}
      />
    );
  }

  const isGuest = state.user?.accountType === 'guest';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Olá, {state.user?.name || 'Usuário'}!
            </h1>
            <p className="text-white/70">
              O que gostaria de ler hoje?
            </p>
          </div>
        </div>

        {/* Welcome Card - Mobile Optimized */}
        <section className="glass rounded-2xl p-4 md:p-6 border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-purple-600/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 bg-purple-500/30 rounded-lg flex-shrink-0">
                <LogIn className="text-purple-300" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-0.5 truncate">
                  {isGuest ? "Libere Todos os Livros!" : "Acesso Completo"}
                </h3>
                <p className="text-white/70 text-xs md:text-sm leading-tight">
                  {isGuest 
                    ? "Faça login para recursos ilimitados"
                    : "Aproveite livros sem limitação"
                  }
                </p>
              </div>
            </div>
            {isGuest && (
              <Button 
                onClick={actions.logout}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2 text-xs md:text-sm flex-shrink-0"
              >
                Fazer Login
              </Button>
            )}
          </div>
        </section>

        {/* Book Quote Card for Logged Users */}
        {!isGuest && (
          <section>
            <BookQuoteCard />
          </section>
        )}

        {/* Continue Reading Section */}
        {currentlyReading.length > 0 && (
          <section className="glass rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-xl">
                  <Clock className="text-purple-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Continue Lendo</h2>
              </div>
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300 text-sm">
                Ver todos
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentlyReading.slice(0, 4).map((userBook) => (
                <BookCard
                  key={userBook.id}
                  book={userBook.book}
                  userBook={userBook}
                  onOpenBook={handleBookClick}
                  onStartReading={handleStartReading}
                  className="hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </section>
        )}

        {/* Daily Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Star className="text-purple-400" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Atualizações do Dia</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGridLayout(gridLayout === 'grid' ? 'list' : 'grid')}
                className="text-purple-400 hover:text-purple-300 p-2"
                title={gridLayout === 'grid' ? 'Visualização em lista' : 'Visualização em grid'}
              >
                {gridLayout === 'grid' ? <LayoutList size={20} /> : <Grid3X3 size={20} />}
              </Button>
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300 text-sm">
                Ver todos
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className={gridLayout === 'grid' 
              ? "grid grid-cols-3 md:grid-cols-6 gap-4" 
              : "space-y-4"
            }>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={gridLayout === 'grid' ? "space-y-3" : "flex gap-4 p-4 glass rounded-2xl"}>
                  <Skeleton className={gridLayout === 'grid' ? "h-48 w-full rounded-2xl" : "h-24 w-16 rounded-lg"} />
                  <div className={gridLayout === 'grid' ? "space-y-2" : "flex-1 space-y-2"}>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={gridLayout === 'grid' 
              ? "grid grid-cols-3 md:grid-cols-6 gap-4" 
              : "space-y-4"
            }>
              {dailyUpdates.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  variant={gridLayout === 'grid' ? "compact" : "list"}
                  onOpenBook={handleBookClick}
                  onStartReading={handleStartReading}
                  className="hover:scale-105 transition-transform"
                />
              ))}
            </div>
          )}

          {!isLoading && dailyUpdates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="text-white/30 mx-auto mb-4" size={64} />
              <p className="text-white/60 mb-4">Não foi possível carregar as atualizações do dia.</p>
              <Button onClick={loadHomeData} variant="outline" className="border-purple-400 text-purple-400">
                Tentar novamente
              </Button>
            </div>
          )}
        </section>



        {/* Book Detail Modal */}
        <BookDetailModal
          book={selectedBook}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStartReading={(book) => handleStartReading(book.id)}
        />
      </div>
    </div>
  );
}