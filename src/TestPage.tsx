/**
 * PÁGINA DE TESTE COMPLETO DO FLUXO DE INTERAÇÃO
 * 
 * Esta página permite testar todas as funcionalidades implementadas:
 * - Animações de transição
 * - Toast de feedback
 * - Redirecionamento automático
 * - Destaque de livros na biblioteca
 * - Performance das animações
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TestBookInteraction } from './components/TestBookInteraction';
import { Button } from './components/ui/button';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckSquare, 
  Activity,
  Sparkles,
  BookOpen,
  Library
} from 'lucide-react';

type TestScreen = 'menu' | 'bookDetail' | 'library' | 'animations';

export default function TestPage() {
  const [currentScreen, setCurrentScreen] = useState<TestScreen>('menu');
  const [highlightedBookId, setHighlightedBookId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pass' | 'fail';
    duration: number;
  }>>([]);

  const handleNavigateToLibrary = (bookId: string) => {
    console.log('📱 Navegando para biblioteca com destaque no livro:', bookId);
    
    // Simular navegação
    setHighlightedBookId(bookId);
    setCurrentScreen('library');
    
    // Toast de confirmação da navegação
    toast.success('Redirecionado para a biblioteca!');
    
    // Remover destaque após 3 segundos
    setTimeout(() => {
      setHighlightedBookId(null);
      toast.info('Destaque removido automaticamente');
    }, 3000);
  };

  const runPerformanceTest = async () => {
    const startTime = performance.now();
    
    toast.info('Iniciando teste de performance...');
    
    // Teste 1: Animação de transição
    const animationStart = performance.now();
    setCurrentScreen('animations');
    await new Promise(resolve => setTimeout(resolve, 300));
    const animationDuration = performance.now() - animationStart;
    
    setTestResults(prev => [...prev, {
      test: 'Transição de Tela',
      status: animationDuration < 500 ? 'pass' : 'fail',
      duration: animationDuration
    }]);
    
    // Teste 2: Toast responsividade
    const toastStart = performance.now();
    toast.success('Teste de toast');
    const toastDuration = performance.now() - toastStart;
    
    setTestResults(prev => [...prev, {
      test: 'Toast de Feedback',
      status: toastDuration < 100 ? 'pass' : 'fail',
      duration: toastDuration
    }]);
    
    // Teste 3: Destaque de livro
    const highlightStart = performance.now();
    setHighlightedBookId('test-book-performance');
    await new Promise(resolve => setTimeout(resolve, 100));
    const highlightDuration = performance.now() - highlightStart;
    
    setTestResults(prev => [...prev, {
      test: 'Destaque de Livro',
      status: highlightDuration < 150 ? 'pass' : 'fail',
      duration: highlightDuration
    }]);
    
    const totalDuration = performance.now() - startTime;
    toast.success(`Teste concluído em ${totalDuration.toFixed(2)}ms`);
  };

  const TestMenu = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          🧪 Eclipse Reads - Teste de Funcionalidades
        </motion.h1>
        <p className="text-white/80">
          Teste completo do fluxo de interação dos botões de livro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setCurrentScreen('bookDetail')}
            className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <div className="text-center">
              <BookOpen size={24} className="mx-auto mb-2" />
              <span>Testar Detalhes do Livro</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setCurrentScreen('library')}
            className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <div className="text-center">
              <Library size={24} className="mx-auto mb-2" />
              <span>Testar Biblioteca</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setCurrentScreen('animations')}
            className="w-full h-20 bg-pink-600 hover:bg-pink-700 text-white"
          >
            <div className="text-center">
              <Sparkles size={24} className="mx-auto mb-2" />
              <span>Testar Animações</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={runPerformanceTest}
            className="w-full h-20 bg-green-600 hover:bg-green-700 text-white"
          >
            <div className="text-center">
              <Activity size={24} className="mx-auto mb-2" />
              <span>Teste de Performance</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">📊 Resultados dos Testes</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded">
                <span className="text-white">{result.test}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">
                    {result.duration.toFixed(2)}ms
                  </span>
                  <span className={result.status === 'pass' ? 'text-green-400' : 'text-red-400'}>
                    {result.status === 'pass' ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const BookDetailTest = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen p-6"
    >
      <Button
        onClick={() => setCurrentScreen('menu')}
        className="mb-6 bg-white/10 hover:bg-white/20 text-white"
      >
        <ArrowLeft size={16} className="mr-2" />
        Voltar ao Menu
      </Button>

      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        📖 Teste de Detalhes do Livro
      </h2>

      <TestBookInteraction onNavigateToLibrary={handleNavigateToLibrary} />
    </motion.div>
  );

  const LibraryTest = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen p-6"
    >
      <Button
        onClick={() => setCurrentScreen('menu')}
        className="mb-6 bg-white/10 hover:bg-white/20 text-white"
      >
        <ArrowLeft size={16} className="mr-2" />
        Voltar ao Menu
      </Button>

      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        📚 Teste da Biblioteca
      </h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => {
            const bookId = `test-book-${i}`;
            const isHighlighted = highlightedBookId === bookId;
            
            return (
              <motion.div
                key={bookId}
                className={`bg-white/10 rounded-lg p-4 transition-all duration-500 ${
                  isHighlighted 
                    ? 'scale-105 ring-2 ring-purple-400 ring-opacity-70 bg-white/20' 
                    : ''
                }`}
                initial={false}
                animate={isHighlighted ? { 
                  scale: [1, 1.05, 1, 1.05, 1],
                  boxShadow: [
                    "0 0 0 rgba(139, 92, 246, 0)",
                    "0 0 20px rgba(139, 92, 246, 0.4)",
                    "0 0 0 rgba(139, 92, 246, 0)",
                    "0 0 20px rgba(139, 92, 246, 0.4)",
                    "0 0 0 rgba(139, 92, 246, 0)"
                  ]
                } : false}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <div className="h-24 bg-white/20 rounded mb-2"></div>
                <h3 className="text-white text-sm font-medium">Livro {i + 1}</h3>
                <p className="text-white/60 text-xs">Autor {i + 1}</p>
                {isHighlighted && (
                  <div className="mt-2 text-xs text-purple-300 font-medium">
                    ✨ Destacado
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-medium mb-2">Como testar o destaque:</h3>
          <p className="text-white/70 text-sm mb-4">
            1. Vá para "Testar Detalhes do Livro"
            <br />
            2. Clique em qualquer botão de ação
            <br />
            3. Aguarde o redirecionamento automático
            <br />
            4. Observe o livro destacado aqui na biblioteca
          </p>
          
          <Button
            onClick={() => handleNavigateToLibrary('test-book-3')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Simular Destaque Manual
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const AnimationsTest = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen p-6"
    >
      <Button
        onClick={() => setCurrentScreen('menu')}
        className="mb-6 bg-white/10 hover:bg-white/20 text-white"
      >
        <ArrowLeft size={16} className="mr-2" />
        Voltar ao Menu
      </Button>

      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        ✨ Teste de Animações
      </h2>

      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-white/10 rounded-lg p-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <h3 className="text-white font-medium mb-4">Hover & Tap</h3>
          <p className="text-white/70 text-sm">
            Passe o mouse ou toque para ver a animação
          </p>
        </motion.div>

        <motion.div
          className="bg-white/10 rounded-lg p-6"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h3 className="text-white font-medium mb-4">Animação Contínua</h3>
          <p className="text-white/70 text-sm">
            Animação automática em loop
          </p>
        </motion.div>

        <motion.div
          className="bg-white/10 rounded-lg p-6"
          animate={{
            boxShadow: [
              "0 0 0 rgba(139, 92, 246, 0)",
              "0 0 20px rgba(139, 92, 246, 0.6)",
              "0 0 0 rgba(139, 92, 246, 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h3 className="text-white font-medium mb-4">Glow Effect</h3>
          <p className="text-white/70 text-sm">
            Efeito de brilho igual ao destaque dos livros
          </p>
        </motion.div>

        <motion.div
          className="bg-white/10 rounded-lg p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3 className="text-white font-medium mb-4">Entrada Suave</h3>
          <p className="text-white/70 text-sm">
            Animação de entrada como as transições de tela
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen eclipse-bg-pattern">
      <AnimatePresence mode="wait">
        <motion.div key={currentScreen}>
          {currentScreen === 'menu' && <TestMenu />}
          {currentScreen === 'bookDetail' && <BookDetailTest />}
          {currentScreen === 'library' && <LibraryTest />}
          {currentScreen === 'animations' && <AnimationsTest />}
        </motion.div>
      </AnimatePresence>
      
      <Toaster />
    </div>
  );
}