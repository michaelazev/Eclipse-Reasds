import { useState, useEffect, useMemo, SetStateAction } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Type,
  Palette,
  Sun,
  Moon,
  List,
  User,
  Search,
  Bookmark,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';
import { Book } from '../../models/Book';
import { useApp } from '../../contexts/AppContext';

interface Chapter {
  id: string;
  title: string;
  content: string;
  pageStart: number;
  pageEnd: number;
}

interface ReadingModeProps {
  bookTitle: string;
  book?: Book;
  bookContent?: string;
  currentPage?: number;
  onBack: () => void;
  onPageChange?: (page: number) => void;
}

export function ReadingMode({ 
  bookTitle, 
  book,
  bookContent: providedContent,
  currentPage: providedCurrentPage,
  onBack,
  onPageChange
}: ReadingModeProps) {
  const { actions, state } = useApp();
  const [bookContentState, setBookContentState] = useState<string>(providedContent || '');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(providedCurrentPage ? providedCurrentPage - 1 : 0);
  const [isLoading, setIsLoading] = useState(!providedContent);
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Simplified reading settings - only essential ones
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  const [fontFamily, setFontFamily] = useState<'sans' | 'times' | 'merriweather'>('sans');
  
  // TOC and search
  const [tocSearchTerm, setTocSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Simplified font family mappings - keeping only allowed fonts (removed first, third, and last two from original list)
  const getFontName = (family: 'sans' | 'times' | 'merriweather') => {
    switch (family) {
      case 'sans': return 'Arial';
      case 'times': return 'Times New Roman';
      case 'merriweather': return 'Merriweather';
      default: return 'Arial';
    }
  };

  const getFontFamily = (family: 'sans' | 'times' | 'merriweather') => {
    switch (family) {
      case 'sans': return 'Arial, "Helvetica Neue", sans-serif';
      case 'times': return '"Times New Roman", Times, serif';
      case 'merriweather': return 'Merriweather, Georgia, serif';
      default: return 'Arial, "Helvetica Neue", sans-serif';
    }
  };

  // Fixed page margin styles
  const getMarginClass = () => {
    return 'px-8 md:px-12';
  };

  // Load book content and chapters with timeout handling
  useEffect(() => {
    if (providedContent || !book) {
      setIsLoading(false);
      return;
    }
    
    const loadBookContent = async () => {
      setIsLoading(true);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      try {
        // Generate demo content using repository
        const content = await actions.repositories.bookRepository.getBookContent(book);
        const chaptersData: Chapter[] = [
          {
            id: '1', title: 'Capítulo I', content: 'Conteúdo do primeiro capítulo...',
            pageStart: 0,
            pageEnd: 0
          },
          {
            id: '2', title: 'Capítulo II', content: 'Conteúdo do segundo capítulo...',
            pageStart: 0,
            pageEnd: 0
          },
          {
            id: '3', title: 'Capítulo III', content: 'Conteúdo do terceiro capítulo...',
            pageStart: 0,
            pageEnd: 0
          }
        ];
        
        setBookContentState(content || `${book.title}\nPor ${book.author}\n\n${book.description}\n\nConteúdo de demonstração do Eclipse Reads.\n\nEste é um exemplo de conteúdo para demonstrar as funcionalidades do leitor. O texto pode ser navegado usando as setas do teclado, cliques nas laterais da tela, ou os controles de navegação.\n\nAs configurações de leitura permitem personalizar a fonte, tamanho do texto, tema de cores e muito mais para uma experiência de leitura confortável e personalizada.`);
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error loading book content:', error);
        
        const fallbackContent = `${book.title}\nPor ${book.author}\n\n${book.description}\n\nConteúdo de demonstração do Eclipse Reads.\n\nEste é um exemplo de conteúdo para demonstrar as funcionalidades completas do leitor digital. O sistema de leitura oferece uma experiência imersiva e personalizável.\n\n**Características principais:**\n\n• Navegação intuitiva por páginas\n• Configurações simplificadas de leitura\n• Sistema de marcadores\n• Modo de leitura adaptável\n• Atalhos de teclado para produtividade\n\n**Como usar:**\n\nUse as setas do teclado (← →) ou clique nas laterais da tela para navegar entre as páginas. Pressione 'S' para abrir as configurações e 'T' para o sumário.\n\nO leitor se adapta automaticamente ao seu dispositivo, oferecendo uma experiência otimizada tanto em desktop quanto em dispositivos móveis.\n\n**Personalização:**\n\nAcesse as configurações para personalizar:\n- Tamanho e tipo de fonte\n- Tema de cores (claro, escuro, sépia)\n\nSua experiência de leitura é única e pode ser personalizada de acordo com suas preferências.\n\n**Marcadores:**\n\nUse a tecla 'B' ou o ícone de marcador para salvar páginas importantes.\n\nO Eclipse Reads transforma a leitura digital em uma experiência rica e envolvente, combinando funcionalidade moderna com design elegante.`;
        
        setBookContentState(fallbackContent);
        setChapters([
          {
            id: '1',
            title: 'Introdução ao Eclipse Reads',
            content: 'Conteúdo do primeiro capítulo...',
            pageStart: 1,
            pageEnd: 3
          },
          {
            id: '2',
            title: 'Funcionalidades Principais',
            content: 'Conteúdo do segundo capítulo...',
            pageStart: 4,
            pageEnd: 7
          },
          {
            id: '3',
            title: 'Personalização Simplificada',
            content: 'Conteúdo do terceiro capítulo...',
            pageStart: 8,
            pageEnd: 12
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookContent();
  }, [book, providedContent]);

  // Split content into pages with fluid formatting
  const pages = useMemo(() => {
    if (!bookContentState) return [''];
    
    const paragraphs = bookContentState.split('\n\n').filter(p => p.trim());
    const wordsPerPage = Math.max(300, Math.min(800, fontSize * 25));
    const pages: string[] = [];
    let currentPageContent = '';
    let wordCount = 0;

    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.split(' ').length;
      
      if (wordCount + paragraphWords > wordsPerPage && currentPageContent) {
        pages.push(currentPageContent.trim());
        currentPageContent = paragraph + '\n\n';
        wordCount = paragraphWords;
      } else {
        currentPageContent += paragraph + '\n\n';
        wordCount += paragraphWords;
      }
    }
    
    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }

    return pages.length > 0 ? pages : ['Conteúdo não disponível'];
  }, [bookContentState, fontSize]);

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      const newPageIndex = currentPageIndex + 1;
      setCurrentPageIndex(newPageIndex);
      
      if (onPageChange) {
        onPageChange(newPageIndex + 1);
      }
      
      if (book) {
        const userBook = state.userBooks.find(ub => ub.book.id === book.id);
        if (userBook) {
          try {
            actions.updateReadingProgress(userBook.id, newPageIndex + 1);
          } catch (error) {
            console.warn('Failed to update reading progress:', error);
          }
        }
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      const newPageIndex = currentPageIndex - 1;
      setCurrentPageIndex(newPageIndex);
      
      if (onPageChange) {
        onPageChange(newPageIndex + 1);
      }
      
      if (book) {
        const userBook = state.userBooks.find(ub => ub.book.id === book.id);
        if (userBook) {
          try {
            actions.updateReadingProgress(userBook.id, newPageIndex + 1);
          } catch (error) {
            console.warn('Failed to update reading progress:', error);
          }
        }
      }
    }
  };

  // Bookmark functions
  const toggleBookmark = () => {
    setBookmarks(prev => {
      if (prev.includes(currentPageIndex)) {
        return prev.filter(page => page !== currentPageIndex);
      } else {
        return [...prev, currentPageIndex].sort((a, b) => a - b);
      }
    });
  };

  const isBookmarked = bookmarks.includes(currentPageIndex);

  const goToChapter = (chapterIndex: number) => {
    if (chapters.length > 0 && chapterIndex >= 0 && chapterIndex < chapters.length) {
      setCurrentChapterIndex(chapterIndex);
      const chapter = chapters[chapterIndex];
      const pageIndex = Math.max(0, Math.floor((chapter.pageStart - 1) * pages.length / (book?.pages || 100)));
      setCurrentPageIndex(Math.min(pageIndex, pages.length - 1));
      setShowTOC(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        goToNextPage();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousPage();
      }
      if (event.key === '=' || event.key === '+') {
        event.preventDefault();
        setFontSize(prev => Math.min(28, prev + 2));
      }
      if (event.key === '-') {
        event.preventDefault();
        setFontSize(prev => Math.max(12, prev - 2));
      }
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        setShowTOC(true);
      }
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        setShowSettings(true);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowTOC(false);
        setShowSettings(false);
      }
      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        toggleBookmark();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPageIndex, pages.length]);

  // Simplified theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white',
          text: 'text-gray-900',
          accent: 'text-purple-600',
          card: 'bg-gray-50 border-gray-200',
          header: 'bg-gray-50/80'
        };
      case 'sepia':
        return {
          background: 'bg-amber-50',
          text: 'text-amber-900',
          accent: 'text-amber-700',
          card: 'bg-amber-100/50 border-amber-200',
          header: 'bg-amber-100/80'
        };
      default: // dark
        return {
          background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
          text: 'text-gray-100',
          accent: 'text-purple-400',
          card: 'bg-white/10 border-white/10',
          header: 'bg-black/30'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Filter chapters for TOC search
  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(tocSearchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/90 mb-2">Carregando livro...</p>
          <p className="text-white/60 text-sm">Preparando conteúdo para leitura</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100;

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-10 ${themeStyles.header} backdrop-blur-sm border-b border-white/10 px-4 py-2 flex-shrink-0`}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="rounded-full p-2 flex-shrink-0 hover:bg-white/10"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-medium truncate text-lg">{book?.title || bookTitle}</h1>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <User size={14} />
                <span>{book?.author || 'Autor Desconhecido'}</span>
                <span>•</span>
                <BookOpen size={14} />
                <span>Página {currentPageIndex + 1} de {pages.length}</span>
                <span>•</span>
                <span>{Math.round(progressPercentage)}% concluído</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              className={`rounded-full p-2 hover:bg-white/10 ${isBookmarked ? 'text-yellow-400' : ''}`}
              title={isBookmarked ? "Remover marcador (B)" : "Adicionar marcador (B)"}
            >
              <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
            </Button>

            {/* TOC Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTOC(true)}
              className="rounded-full p-2 hover:bg-white/10"
              title="Sumário (T)"
            >
              <List size={20} />
            </Button>
            
            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="rounded-full p-2 hover:bg-white/10"
              title="Configurações (S)"
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2">
          <div className="w-full bg-white/10 rounded-full h-1">
            <motion.div 
              className="bg-purple-400 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Reading Content */}
      <div className="flex-1 relative px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto h-full">
          <motion.div 
            key={currentPageIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`${themeStyles.card} backdrop-blur-sm rounded-2xl ${getMarginClass()} min-h-[calc(100vh-180px)] cursor-pointer shadow-2xl border relative`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const centerX = rect.width / 2;
              
              if (clickX > centerX + 100) {
                goToNextPage();
              } else if (clickX < centerX - 100) {
                goToPreviousPage();
              }
            }}
          >
            {/* Reading Settings Display */}
            <div className="absolute top-4 right-4 z-10">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-black/20 backdrop-blur-sm text-white border-white/20">
                  {getFontName(fontFamily)} {fontSize}px
                </Badge>
                <Badge variant="secondary" className="bg-black/20 backdrop-blur-sm text-white border-white/20">
                  {theme === 'light' ? '☀️' : theme === 'sepia' ? '🌅' : '🌙'} {theme}
                </Badge>
                {isBookmarked && (
                  <Badge variant="secondary" className="bg-yellow-500/20 backdrop-blur-sm text-yellow-400 border-yellow-400/20">
                    <Bookmark size={12} className="fill-current" />
                  </Badge>
                )}
              </div>
            </div>

            {/* Book Content */}
            <div 
              className={`prose prose-lg leading-relaxed max-w-none ${themeStyles.text} pt-8`}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                textAlign: 'justify',
                fontFamily: getFontFamily(fontFamily)
              }}
            >
              <div className="whitespace-pre-line">
                {pages[currentPageIndex] || 'Conteúdo não disponível'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compact Page Navigation - Bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-3 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
            <Button
              variant="ghost"
              onClick={goToPreviousPage}
              disabled={currentPageIndex === 0}
              size="sm"
              className="p-2 hover:bg-white/20 disabled:opacity-30 rounded-full"
            >
              <ChevronLeft size={18} />
            </Button>
            
            <div className="flex items-center gap-2 px-3">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span className="text-sm font-medium text-white">
                {currentPageIndex + 1} / {pages.length}
              </span>
              <div className="w-1.5 h-1.5 bg-purple-400/30 rounded-full"></div>
            </div>

            <Button
              variant="ghost"
              onClick={goToNextPage}
              disabled={currentPageIndex === pages.length - 1}
              size="sm"
              className="p-2 hover:bg-white/20 disabled:opacity-30 rounded-full"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Simplified Table of Contents Modal */}
      <Dialog open={showTOC} onOpenChange={setShowTOC}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-50 text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <List size={20} />
              Sumário e Navegação
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Navegue pelos capítulos e acesse seus marcadores
            </DialogDescription>
          </DialogHeader>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar no livro..."
              value={tocSearchTerm}
              onChange={(e) => setTocSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chapters */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-700">
                <BookOpen size={16} />
                Capítulos
              </h3>
              <ScrollArea className="h-[300px]">
                {filteredChapters.length > 0 ? (
                  <div className="space-y-2">
                    {filteredChapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => goToChapter(index)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">{chapter.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Páginas {chapter.pageStart} - {chapter.pageEnd}
                            </p>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum capítulo encontrado</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Bookmarks */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-700">
                <Bookmark size={16} />
                Marcadores
              </h3>
              <ScrollArea className="h-[300px]">
                {bookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {bookmarks.map((pageIndex) => (
                      <button
                        key={pageIndex}
                        onClick={() => {
                          setCurrentPageIndex(pageIndex);
                          setShowTOC(false);
                        }}
                        className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-yellow-50 hover:border-yellow-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">
                              Página {pageIndex + 1}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {pages[pageIndex]?.substring(0, 60)}...
                            </p>
                          </div>
                          <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum marcador salvo</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simplified Reading Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg bg-gray-50 text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <Settings size={20} />
              Configurações de Leitura
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Personalize sua experiência de leitura
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Tamanho da Fonte
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className="p-2"
                >
                  <Minus size={16} />
                </Button>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value: SetStateAction<number>[]) => setFontSize(value[0])}
                  max={28}
                  min={12}
                  step={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                  className="p-2"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {fontSize}px
              </div>
            </div>

            <Separator />

            {/* Font Family - Simplified list */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Tipo de Fonte
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(['sans', 'times', 'merriweather'] as const).map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      fontFamily === font
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getFontName(font)}</span>
                      <span 
                        className="text-lg"
                        style={{ fontFamily: getFontFamily(font) }}
                      >
                        Aa
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Tema
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Sun size={20} className="text-yellow-500" />
                  <div className="text-left">
                    <h4 className="font-medium">Modo Claro</h4>
                    <p className="text-xs opacity-70">Fundo branco, ideal para ambientes bem iluminados</p>
                  </div>
                </button>

                <button
                  onClick={() => setTheme('sepia')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    theme === 'sepia'
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-5 h-5 bg-amber-400 rounded-full"></div>
                  <div className="text-left">
                    <h4 className="font-medium">Modo Sépia</h4>
                    <p className="text-xs opacity-70">Tom amarelado, reduz o cansaço visual</p>
                  </div>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Moon size={20} className="text-blue-400" />
                  <div className="text-left">
                    <h4 className="font-medium">Modo Escuro</h4>
                    <p className="text-xs opacity-70">Fundo escuro, ideal para leitura noturna</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}