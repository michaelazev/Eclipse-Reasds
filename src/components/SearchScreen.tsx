import { useState, useEffect, useCallback } from 'react';
// Removed motion imports for better performance
import { useApp } from '../contexts/AppContext';
import { Book } from '../models/Book';
import { BookCard } from './book/BookCard';
import { BookDetailModal } from './book/BookDetailModal';
import { ReadingMode } from './book/ReadingMode';
import { SearchBarWithInlineFilter } from './SearchBarWithInlineFilter';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Search, BookOpen, Clock, Filter, X, Star } from 'lucide-react';
import { toast } from 'sonner';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os Gêneros' },
  { value: 'fiction', label: 'Ficção' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mistério' },
  { value: 'fantasy', label: 'Fantasia' },
  { value: 'science_fiction', label: 'Ficção Científica' },
  { value: 'history', label: 'História' },
  { value: 'biography', label: 'Biografia' },
  { value: 'self_help', label: 'Autoajuda' },
  { value: 'classic', label: 'Clássicos' },
  { value: 'adventure', label: 'Aventura' },
  { value: 'horror', label: 'Terror' },
  { value: 'comedy', label: 'Comédia' },
  { value: 'drama', label: 'Drama' },
  { value: 'non_fiction', label: 'Não-ficção' }
];

export function SearchScreen() {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  const [newAdditions, setNewAdditions] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [readingMode, setReadingMode] = useState<{
    book: Book;
    content: string;
    currentPage?: number;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSearchData();
  }, []);

  const loadSearchData = async () => {
    setIsLoadingData(true);
    try {
      const books = await actions.repositories.bookRepository.getTrendingBooks();
      setRecommendedBooks(books.slice(0, 10));

      setNewAdditions(books.slice(0, 10).reverse()); // Simulate new additions
    } catch (error) {
      console.warn('Error loading search data:', error);
      toast.error('Erro ao carregar dados de busca');
    } finally {
      setIsLoadingData(false);
    }
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const books = await actions.repositories.bookRepository.searchBooks(searchQuery);
      setSearchResults(books);
      
      if (books.length === 0) {
        toast.info(`Nenhum resultado encontrado para "${searchQuery}"`);
      }
    } catch (error) {
      console.warn('Error searching books:', error);
      toast.error('Erro na busca. Verifique sua conexão com a internet.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [actions.repositories.bookRepository]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  useEffect(() => {
    // Auto-search when user types
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    performSearch(searchTerm);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleStartReading = async (bookId: string, bookContent?: string) => {
    const book = searchResults.find(b => b.id === bookId) || 
                 recommendedBooks.find(b => b.id === bookId) ||
                 newAdditions.find(b => b.id === bookId);
    
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
      // Try to load content for available books
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
        console.error('Failed to load book content:', error);
        toast.error('Não foi possível carregar o conteúdo do livro. Verifique sua conexão.');
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
        // Try alternative approach
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Buscar livros
          </h1>
          <p className="text-white/70">
            Descubra sua próxima leitura favorita
          </p>
        </div>

        {/* Search Bar with Inline Filter */}
        <div>
          <SearchBarWithInlineFilter
            query={query}
            selectedFilter={selectedFilter}
            filterOptions={FILTER_OPTIONS}
            onQueryChange={setQuery}
            onFilterChange={setSelectedFilter}
            onSearch={handleSearch}
            onClear={clearSearch}
            isSearching={isSearching}
            placeholder="Buscar por título, autor ou gênero..."
          />
        </div>



        {/* Search Results */}
        {hasSearched && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Search className="text-purple-400" size={24} />
                <h2 className="text-2xl font-bold text-white">
                  Resultados da busca
                  {query && <span className="text-purple-400 ml-2">"{query}"</span>}
                </h2>
              </div>
              {searchResults.length > 0 && (
                <p className="text-white/70">{searchResults.length} livro{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}</p>
              )}
            </div>

            {isSearching ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 md:h-48 w-full rounded-2xl" />
                    <Skeleton className="h-3 md:h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    variant="compact"
                    onOpenBook={handleBookClick}
                    showActions={true}
                    className="hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="text-white/30 mx-auto mb-4" size={64} />
                <p className="text-white/60 mb-4">Nenhum livro encontrado para sua busca.</p>
                <p className="text-white/50 mb-6">Tente buscar por outros termos ou explore nossas sugestões.</p>
                <Button onClick={clearSearch} variant="outline" className="border-purple-400 text-purple-400">
                  Limpar busca
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Recommendations Sections */}
        {!hasSearched && (
          <div className="space-y-8">
            {/* Recommended for You */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-xl">
                    <Star className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Recomendados para você</h2>
                </div>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20 text-sm">
                  Ver todos
                </Button>
              </div>

              {isLoadingData ? (
                <div className="overflow-x-auto responsive-scroll">
                  <div className="flex gap-4 pb-2 min-w-max">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-32 md:w-40 space-y-3">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : recommendedBooks.length > 0 ? (
                <div className="overflow-x-auto responsive-scroll">
                  <div className="flex gap-4 pb-2 min-w-max">
                    {recommendedBooks.map((book) => (
                      <div key={book.id} className="flex-shrink-0 w-32 md:w-40">
                        <BookCard
                          book={book}
                          variant="compact"
                          onOpenBook={handleBookClick}
                          showActions={true}
                          className="hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="text-white/30 mx-auto mb-4" size={64} />
                  <p className="text-white/60 mb-4">Não foi possível carregar recomendações.</p>
                  <Button onClick={loadSearchData} variant="outline" className="border-purple-400 text-purple-400">
                    Tentar novamente
                  </Button>
                </div>
              )}
            </section>



            {/* New Additions */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-xl">
                    <BookOpen className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Novidades adicionadas</h2>
                </div>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20 text-sm">
                  Ver todos
                </Button>
              </div>

              {isLoadingData ? (
                <div className="overflow-x-auto responsive-scroll">
                  <div className="flex gap-4 pb-2 min-w-max">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-32 md:w-40 space-y-3">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : newAdditions.length > 0 ? (
                <div className="overflow-x-auto responsive-scroll">
                  <div className="flex gap-4 pb-2 min-w-max">
                    {newAdditions.map((book) => (
                      <div key={book.id} className="flex-shrink-0 w-32 md:w-40">
                        <BookCard
                          book={book}
                          variant="compact"
                          onOpenBook={handleBookClick}
                          showActions={true}
                          className="hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="text-white/30 mx-auto mb-4" size={64} />
                  <p className="text-white/60 mb-4">Não foi possível carregar novidades.</p>
                  <Button onClick={loadSearchData} variant="outline" className="border-purple-400 text-purple-400">
                    Tentar novamente
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}

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