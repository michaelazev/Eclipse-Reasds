import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface BookQuote {
  id: string;
  quote: string;
  bookTitle: string;
  author: string;
}

const bookQuotes: BookQuote[] = [
  {
    id: "1",
    quote: "A vida não é a que a gente viveu, e sim a que a gente recorda, e como recorda para contá-la.",
    bookTitle: "Viver para Contar",
    author: "Gabriel García Márquez"
  },
  {
    id: "2", 
    quote: "Não são as palavras que dizemos ou os pensamentos que pensamos, mas sim aquilo que fazemos que nos define.",
    bookTitle: "O Hobbit",
    author: "J.R.R. Tolkien"
  },
  {
    id: "3",
    quote: "O tempo é o fogo no qual nós queimamos.",
    bookTitle: "Star Trek: Generations",
    author: "Delmore Schwartz"
  },
  {
    id: "4",
    quote: "Tudo o que somos é resultado do que pensamos. É fundado em nossos pensamentos e é feito de nossos pensamentos.",
    bookTitle: "Dhammapada",
    author: "Buda"
  },
  {
    id: "5",
    quote: "A imaginação é mais importante que o conhecimento, pois o conhecimento é limitado, enquanto a imaginação abrange o mundo inteiro.",
    bookTitle: "Como Vejo o Mundo",
    author: "Albert Einstein"
  },
  {
    id: "6",
    quote: "A única maneira de fazer um trabalho excelente é amar o que você faz.",
    bookTitle: "Steve Jobs",
    author: "Walter Isaacson"
  },
  {
    id: "7",
    quote: "Ser ou não ser, eis a questão.",
    bookTitle: "Hamlet",
    author: "William Shakespeare"
  },
  {
    id: "8",
    quote: "A vida é aquilo que acontece enquanto você está ocupado fazendo outros planos.",
    bookTitle: "Beautiful Boy",
    author: "John Lennon"
  }
];

export function BookQuoteCard() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto rotation every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextQuote();
    }, 8000);

    return () => clearInterval(interval);
  }, [currentQuoteIndex]);

  const nextQuote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % bookQuotes.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevQuote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev - 1 + bookQuotes.length) % bookQuotes.length);
      setIsAnimating(false);
    }, 300);
  };

  const currentQuote = bookQuotes[currentQuoteIndex];

  return (
    <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-400/30 shadow-2xl relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
      <div className="absolute top-4 right-4 opacity-20">
        <Quote size={48} className="text-purple-300" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Quote size={20} className="text-purple-300" />
            <span className="text-purple-300 font-medium text-sm">Frase do Dia</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevQuote}
              disabled={isAnimating}
              className="p-1 h-8 w-8 text-white/70 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex gap-1 mx-2">
              {bookQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentQuoteIndex 
                      ? 'bg-purple-400 scale-110' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentQuoteIndex(index);
                        setIsAnimating(false);
                      }, 300);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextQuote}
              disabled={isAnimating}
              className="p-1 h-8 w-8 text-white/70 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-4"
        >
          <blockquote className="text-white text-lg leading-relaxed italic">
            "{currentQuote.quote}"
          </blockquote>
          
          <div className="flex items-center justify-end">
            <div className="text-right">
              <p className="text-purple-200 font-medium">{currentQuote.bookTitle}</p>
              <p className="text-white/70 text-sm">— {currentQuote.author}</p>
            </div>
          </div>
        </motion.div>

        {/* Subtle animation overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`} />
      </CardContent>
    </Card>
  );
}