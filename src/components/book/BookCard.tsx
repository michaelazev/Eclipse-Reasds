// Removed motion import for better performance
import { useState, useEffect } from "react";
import {
  Book,
  UserBook,
  ReadingStatus,
} from "../../models/Book";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Star,
  BookOpen,
  Lock,
  Heart,
  Check,
  Play,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";

interface BookCardProps {
  book: Book;
  userBook?: UserBook;
  variant?:
    | "default"
    | "compact"
    | "featured"
    | "wide"
    | "list";
  onOpenBook?: (book: Book) => void;
  onStartReading?: (
    bookId: string,
    bookContent?: string,
  ) => void;
  onSelect?: () => void;
  showStatus?: boolean;
  showActions?: boolean;
  className?: string;
}

export function BookCard({
  book,
  userBook,
  variant = "default",
  onOpenBook,
  onStartReading,
  onSelect,
  showStatus = false,
  showActions = false,
  className = "",
}: BookCardProps) {
  const { state, actions } = useApp();
  
  // Check if we're in desktop mode
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardVariants = {
    default: "w-56",    
    compact: "w-40",    
    featured: "w-72",  
    wide: "w-96",     
    list: "w-80", 
  };

  const imageVariants = {
    default: "h-48",
    compact: "h-40",
    featured: "h-64",
    wide: "h-20",
    list: "h-24",
  };



  const handleBookClick = () => {
    // If onSelect is provided (from LibraryScreen), use it
    if (onSelect) {
      onSelect();
      return;
    }

    // Desktop: Navigate to full page book detail
    if (isDesktop) {
      const event = new CustomEvent('showBookDetail', {
        detail: { bookId: book.id }
      });
      window.dispatchEvent(event);
    } else {
      // Mobile: Use the existing modal approach
      if (onOpenBook) {
        onOpenBook(book);
      }
    }
  };

  const handleReadNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await actions.addBookToLibrary(
        book.id,
        ReadingStatus.CURRENTLY_READING,
      );
      if (result.success) {
        toast.success('Livro adicionado à seção "Lendo"!');
      } else {
        toast.error(result.message || 'Erro ao adicionar livro');
      }
    } catch (error) {
      toast.error('Erro ao adicionar livro');
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await actions.addBookToLibrary(
        book.id,
        ReadingStatus.WANT_TO_READ
      );
      if (result.success) {
        toast.success('Livro adicionado aos favoritos!');
      } else {
        toast.error(result.message || 'Erro ao adicionar livro');
      }
    } catch (error) {
      toast.error('Erro ao adicionar livro');
    }
  };
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await actions.addBookToLibrary(
        book.id, 
        ReadingStatus.READ,
      );
      if (result.success) {
        toast.success('Livro marcado como lido!');
      } else {
        toast.error(result.message || 'Erro ao adicionar livro');
      }
    } catch (error) {
      toast.error('Erro ao adicionar livro');
    }
  };

  const handleStartReading = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onStartReading) {
      const existingUserBook = state.userBooks.find(
        (ub) => ub.book.id === book.id,
      );

      if (existingUserBook) {
        // Book is already in user's list
        let bookContent = existingUserBook.bookContent;

        if (
          !bookContent &&
          (book.source === "gutenberg" && book.isPublicDomain) ||
          (book.source === "elivros")
        ) {
          try {
            toast.info("Carregando conteúdo do livro...");
            bookContent =
              await actions.repositories.bookRepository.getBookContent(
                book,
              );
          } catch (error) {
            console.error(
              "Failed to fetch book content:",
              error,
            );
            toast.error(
              "Não foi possível carregar o conteúdo do livro",
            );
            return;
          }
        }

        onStartReading(book.id, bookContent);
      } else {
        // Add book to user's list first, then start reading
        try {
          const result = await actions.addBookToLibrary(
            book.id,
            ReadingStatus.CURRENTLY_READING,
          );

          if (result.success && result.userBook) {
            // Use the returned userBook directly instead of relying on state update
            onStartReading(book.id, result.userBook.bookContent);
          } else {
            toast.error(
              result.message || "Erro ao adicionar livro",
            );
          }
        } catch (error) {
          toast.error("Erro ao adicionar livro");
        }
      }
    }
  };

  const canAddBook = actions.canAddMoreBooks();
  const isGuest = state.user?.accountType === "guest";

  // Check if book is already in user's list
  const existingUserBook = state.userBooks.find(
    (ub) => ub.book.id === book.id,
  );
  const isInUserList = !!existingUserBook;

  if (variant === "wide" || variant === "list") {
    return (
      <div
        className={`${cardVariants[variant]} ${className} cursor-pointer transition-transform hover:-translate-y-1`}
        onClick={handleBookClick}
      >
        <div className="glass rounded-2xl overflow-hidden hover-eclipse p-4">
          <div className="flex items-center gap-4">
            {/* Cover Image */}
            <div
              className={`${imageVariants[variant]} ${variant === "list" ? "w-16" : "w-14"} bg-gradient-to-br from-purple-400 to-purple-600 relative rounded-lg flex-shrink-0 overflow-hidden`}
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback =
                        parent.querySelector(".fallback-icon");
                      if (fallback) {
                        (
                          fallback as HTMLElement
                        ).style.display = "flex";
                      }
                    }
                  }}
                />
              ) : null}
              <div
                className="absolute inset-0 flex items-center justify-center fallback-icon"
                style={{
                  display: book.coverUrl ? "none" : "flex",
                }}
              >
                <BookOpen
                  className="text-white opacity-50"
                  size={20}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-white/70 truncate">
                    {book.author || 'Autor desconhecido'}
                  </p>
                  <p className="text-xs text-white/60 mt-1 truncate">
                    {book.categories?.[0]?.name || 'Geral'} • {book.pages || book.pageCount || 0}{" "}
                    páginas
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star
                      className="text-yellow-400 fill-current"
                      size={14}
                    />
                    <span className="text-white text-sm">
                      {(book.rating || 0).toFixed(1)}
                    </span>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${cardVariants[variant]} ${className} cursor-pointer transition-transform hover:-translate-y-2`}
      onClick={handleBookClick}
    >
      <div className="glass rounded-2xl overflow-hidden hover-eclipse">
        {/* Cover Image */}
        <div
          className={`${imageVariants[variant]} bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden`}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  const fallback =
                    parent.querySelector(".fallback-icon");
                  if (fallback) {
                    (fallback as HTMLElement).style.display =
                      "flex";
                  }
                }
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 flex items-center justify-center fallback-icon"
            style={{ display: book.coverUrl ? "none" : "flex" }}
          >
            <BookOpen
              className="text-white opacity-50"
              size={variant === "compact" ? 24 : 32}
            />
          </div>



          {/* User List Status Badge */}
          {isInUserList && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-white text-xs font-medium">
                {existingUserBook?.isFavorite
                  ? "❤️ Favorito"
                  : existingUserBook?.status ===
                      ReadingStatus.CURRENTLY_READING
                    ? "📖 Lendo"
                    : "✅ Lido"}
              </span>
            </div>
          )}

          {/* Status Badge - E-book funcionando para Dom Casmurro, Online para elivros.info ou Rating para outros */}
          {!isInUserList && (
            <div className={`absolute top-2 right-2 backdrop-blur-sm rounded-full px-2 py-1 ${
              book.id === 'dom_casmurro' 
                ? 'bg-blue-500/90' 
                : book.source === 'elivros' 
                  ? 'bg-green-500/90' 
                  : 'bg-black/20'
            }`}>
              <div className="flex items-center gap-1">
                {book.id === 'dom_casmurro' ? (
                  <>
                    <BookOpen
                      className="text-white"
                      size={12}
                    />
                    <span className="text-white text-xs font-medium">
                      E-book
                    </span>
                  </>
                ) : book.source === 'elivros' ? (
                  <>
                    <BookOpen
                      className="text-white"
                      size={12}
                    />
                    <span className="text-white text-xs font-medium">
                      Online
                    </span>
                  </>
                ) : (
                  <>
                    <Star
                      className="text-yellow-400 fill-current"
                      size={12}
                    />
                    <span className="text-white text-xs font-medium">
                      {(book.rating || 0).toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress for user books */}
          {userBook && userBook.progress && userBook.progress.percentage > 0 && (
            <div className="absolute bottom-2 left-2 right-2">
              <Progress
                value={userBook.progress.percentage}
                className="h-1.5 bg-white/20"
              />
              <span className="text-white text-xs mt-1 block">
                {userBook.progress.percentage}% completo
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-white/70 truncate">
                {book.author || 'Autor desconhecido'}
              </p>
            </div>
          </div>

          {/* Categories */}
          {variant !== "compact" && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(book.categories || []).slice(0, 2).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs bg-white/10 text-white/80 border-white/20"
                >
                  {category.icon} {category.name}
                </Badge>
              ))}
              {/* Source indicator for elivros.info */}
              {book.source === 'elivros' && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-500/20 text-green-300 border-green-500/30"
                >
                  🌐 elivros.info
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {variant === "featured" && (
            <p className="text-sm text-white/70 mb-4 line-clamp-2">
              {book.description}
            </p>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-1">
              {canAddBook || isInUserList ? (
                <>
                  <Button
                    onClick={handleReadNow}
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    size="sm"
                  >
                    <Play size={14} className="mr-1" />
                    Ler agora
                  </Button>
                  <Button
                    onClick={handleFavorite}
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    size="sm"
                  >
                    <Heart size={14} />
                  </Button>
                  <Button
                    onClick={handleMarkAsRead}
                    variant="outline"
                    className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                    size="sm"
                  >
                    <Check size={14} />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  variant="outline"
                  className="flex-1 border-white/30 text-white/50 cursor-not-allowed"
                  size="sm"
                  disabled
                >
                  <Lock size={16} className="mr-2" />
                  Limite Atingido
                </Button>
              )}
            </div>
          )}

          {/* Status display for library */}
          {showStatus && isInUserList && (
            <div className="mt-2 text-center">
              <Badge
                variant="secondary"
                className={`text-xs ${
                  existingUserBook?.status === ReadingStatus.CURRENTLY_READING
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : existingUserBook?.status === ReadingStatus.WANT_TO_READ
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                    : existingUserBook?.status === ReadingStatus.READ
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-white/10 text-white/80 border-white/20'
                }`}
              >
                {existingUserBook?.status === ReadingStatus.CURRENTLY_READING
                  ? '📖 Lendo'
                  : existingUserBook?.status === ReadingStatus.WANT_TO_READ
                  ? '❤️ Favorito'
                  : existingUserBook?.status === ReadingStatus.READ
                  ? '✅ Lido'
                  : 'Na biblioteca'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}