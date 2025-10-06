import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Book, ReadingStatus } from '../../models/Book';
import { BookCard } from '../book/BookCard';
import { Button } from '../ui/button';
import { Search, BookOpen, Heart, Eye, CheckCircle } from 'lucide-react';
import { useIsDesktopLegacy as useIsDesktop } from '../../hooks/useMediaQuery';

interface LibraryScreenProps {
  onSelectBook: (bookId: string) => void;
  onNavigateToSearch: () => void;
}

type LibraryTab = 'favorites' | 'reading' | 'read';

export function LibraryScreen({ onSelectBook, onNavigateToSearch }: LibraryScreenProps) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites');
  const isDesktop = useIsDesktop();

  // Filter books based on active tab
  const getFilteredBooks = (): Book[] => {
    const userBooks = state.userBooks || [];
    
    switch (activeTab) {
      case 'favorites':
        return userBooks.filter(book => book.status === ReadingStatus.WANT_TO_READ);
      case 'reading':
        return userBooks.filter(book => book.status === ReadingStatus.CURRENTLY_READING);
      case 'read':
        return userBooks.filter(book => book.status === ReadingStatus.read);
      default:
        return userBooks.filter(book => book.status === ReadingStatus.WANT_TO_READ);
    }
  };

  const filteredBooks = getFilteredBooks();

  const tabConfig = [
    {
      id: 'favorites' as LibraryTab,
      label: 'Favoritos',
      icon: Heart,
      count: state.userBooks?.filter(book => book.status === ReadingStatus.WANT_TO_READ).length || 0
    },
    {
      id: 'reading' as LibraryTab,
      label: 'Lendo',
      icon: Eye,
      count: state.userBooks?.filter(book => book.status === ReadingStatus.CURRENTLY_READING).length || 0
    },
    {
      id: 'read' as LibraryTab,
      label: 'Lidos',
      icon: CheckCircle,
      count: state.userBooks?.filter(book => book.status === ReadingStatus.read).length || 0
    }
  ];

  const EmptyState = ({ tab }: { tab: LibraryTab }) => {
    const emptyMessages = {
      favorites: {
        title: 'Nenhum favorito ainda',
        description: 'Explore nosso catálogo e adicione livros aos seus favoritos.'
      },
      reading: {
        title: 'Nenhuma leitura em andamento',
        description: 'Comece a ler um livro e ele aparecerá aqui.'
      },
      read: {
        title: 'Nenhum livro concluído',
        description: 'Marque livros como "já li" quando terminar de lê-los.'
      }
    };

    const message = emptyMessages[tab];

    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-purple-300" />
        </div>
        
        <h3 className="text-xl mb-2 text-white">
          {message.title}
        </h3>
        
        <p className="text-white/70 mb-6 max-w-sm">
          {message.description}
        </p>

        {tab === 'favorites' && (
          <Button 
            onClick={onNavigateToSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar livros
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="flex-1 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-sm border-b border-white/10 z-10" style={{ background: 'rgba(30, 27, 75, 0.8)' }}>
        <div className="px-4 py-4">
          <h1 className="text-2xl text-white mb-4">
            Minha Biblioteca
          </h1>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center py-3 px-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className={isDesktop ? 'block' : 'hidden sm:block'}>
                    {tab.label}
                  </span>
                  {tab.count > 0 && (
                    <span className={`
                      ml-2 px-2 py-0.5 text-xs rounded-full
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-500/30 text-purple-200'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredBooks.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <motion.div 
            className={`
              grid gap-4
              ${isDesktop 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-2'
              }
            `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <BookCard
                  book={book}
                  onSelect={() => onSelectBook(book.id)}
                  showStatus={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add search button for favorites tab when there are books */}
        {activeTab === 'favorites' && filteredBooks.length > 0 && (
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button 
              onClick={onNavigateToSearch}
              variant="outline"
              className="border-purple-400 text-purple-300 hover:bg-purple-600/20 hover:border-purple-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar mais livros
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}