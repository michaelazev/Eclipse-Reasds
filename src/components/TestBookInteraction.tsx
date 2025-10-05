/**
 * Componente de Teste para Verificar o Fluxo de Interação dos Botões
 * 
 * Testa especificamente:
 * 1. Botões Ler Agora, Favoritar, Já Li
 * 2. Toast de feedback
 * 3. Redirecionamento para home
 * 4. Animações de transição
 * 5. Confirmação de adição
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { BookOpen, Heart, CheckCircle, ArrowRight } from 'lucide-react';

interface TestBookInteractionProps {
  onNavigateToLibrary?: (bookId: string) => void;
}

export function TestBookInteraction({ onNavigateToLibrary }: TestBookInteractionProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mockBook = {
    id: 'test-book-12345',
    title: 'Livro de Teste - Dom Casmurro',
    author: 'Machado de Assis',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop'
  };

  const handleReadNow = async () => {
    setSelectedAction('read');
    setIsProcessing(true);

    try {
      // Simular adição aos favoritos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Começando a leitura!');
      
      // Aguardar o toast ser exibido antes de navegar
      setTimeout(() => {
        if (onNavigateToLibrary) {
          onNavigateToLibrary(mockBook.id);
        }
        setIsProcessing(false);
        setSelectedAction(null);
      }, 1500);
      
    } catch (error) {
      toast.error('Erro ao iniciar leitura');
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const handleFavorite = async () => {
    setSelectedAction('favorite');
    setIsProcessing(true);

    try {
      // Simular adição aos favoritos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Livro adicionado aos favoritos!');
      
      // Aguardar o toast ser exibido antes de navegar
      setTimeout(() => {
        if (onNavigateToLibrary) {
          onNavigateToLibrary(mockBook.id);
        }
        setIsProcessing(false);
        setSelectedAction(null);
      }, 1500);
      
    } catch (error) {
      toast.error('Erro ao favoritar livro');
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const handleMarkAsRead = async () => {
    setSelectedAction('completed');
    setIsProcessing(true);

    try {
      // Simular marcação como lido
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Livro marcado como lido!');
      
      // Aguardar o toast ser exibido antes de navegar
      setTimeout(() => {
        if (onNavigateToLibrary) {
          onNavigateToLibrary(mockBook.id);
        }
        setIsProcessing(false);
        setSelectedAction(null);
      }, 1500);
      
    } catch (error) {
      toast.error('Erro ao marcar como lido');
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          🧪 Teste de Interação
        </h2>

        {/* Mock Book Display */}
        <motion.div 
          className="bg-white/5 rounded-lg p-4 mb-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-4">
            <img 
              src={mockBook.coverUrl}
              alt={mockBook.title}
              className="w-16 h-20 object-cover rounded"
            />
            <div>
              <h3 className="text-white font-medium">{mockBook.title}</h3>
              <p className="text-white/70 text-sm">{mockBook.author}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleReadNow}
            disabled={isProcessing}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors ${
              selectedAction === 'read' ? 'opacity-50' : ''
            }`}
          >
            <BookOpen size={16} className="mr-2" />
            {selectedAction === 'read' && isProcessing ? 'Processando...' : 'Ler Agora'}
          </Button>

          <Button
            onClick={handleFavorite}
            disabled={isProcessing}
            className={`w-full bg-pink-600 hover:bg-pink-700 text-white transition-colors ${
              selectedAction === 'favorite' ? 'opacity-50' : ''
            }`}
          >
            <Heart size={16} className="mr-2" />
            {selectedAction === 'favorite' && isProcessing ? 'Processando...' : 'Favoritar'}
          </Button>

          <Button
            onClick={handleMarkAsRead}
            disabled={isProcessing}
            className={`w-full bg-green-600 hover:bg-green-700 text-white transition-colors ${
              selectedAction === 'completed' ? 'opacity-50' : ''
            }`}
          >
            <CheckCircle size={16} className="mr-2" />
            {selectedAction === 'completed' && isProcessing ? 'Processando...' : 'Já Li'}
          </Button>
        </div>

        {/* Status Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-400 text-sm">
                Processando ação...
              </span>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <ArrowRight size={16} />
            Como testar:
          </h4>
          <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
            <li>Clique em qualquer botão acima</li>
            <li>Observe o toast de feedback</li>
            <li>Aguarde o redirecionamento automático</li>
            <li>Verifique a confirmação de adição</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
}