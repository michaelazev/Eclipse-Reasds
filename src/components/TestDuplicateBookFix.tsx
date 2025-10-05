/**
 * Teste para verificar se o erro de livros duplicados foi corrigido
 * 
 * Este teste verifica:
 * 1. Adicionar um livro pela primeira vez (sucesso)
 * 2. Tentar adicionar o mesmo livro novamente (deve atualizar, não dar erro)
 * 3. Adicionar o mesmo livro com status diferente (deve atualizar status)
 * 4. Verificar se não há mais warnings de duplicata
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { useApp } from '../contexts/AppContext';
import { ReadingStatus } from '../models/Book';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

export function TestDuplicateBookFix() {
  const { actions } = useApp();
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const runDuplicateTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Capturar console.warn para verificar se warnings aparecem
    const originalWarn = console.warn;
    let warnCount = 0;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Attempted to add duplicate book')) {
        warnCount++;
      }
      originalWarn(...args);
    };

    try {
      const testBookId = '1'; // Dom Casmurro

      // Teste 1: Adicionar livro pela primeira vez
      addTestResult('Teste 1', 'pending', 'Adicionando livro pela primeira vez...');
      
      const result1 = await actions.addBookToLibrary(testBookId, ReadingStatus.WANT_TO_READ);
      
      if (result1.success) {
        addTestResult('Teste 1', 'success', 'Livro adicionado com sucesso aos favoritos');
        toast.success('✅ Teste 1: Livro adicionado aos favoritos');
      } else {
        addTestResult('Teste 1', 'error', `Falhou: ${result1.message}`);
        toast.error(`❌ Teste 1: ${result1.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Teste 2: Tentar adicionar o mesmo livro novamente (mesmo status)
      addTestResult('Teste 2', 'pending', 'Tentando adicionar o mesmo livro novamente...');
      
      const result2 = await actions.addBookToLibrary(testBookId, ReadingStatus.WANT_TO_READ);
      
      if (result2.success) {
        addTestResult('Teste 2', 'success', 'Livro já existia - operação bem-sucedida');
        toast.success('✅ Teste 2: Livro já estava nos favoritos');
      } else {
        addTestResult('Teste 2', 'error', `Falhou: ${result2.message}`);
        toast.error(`❌ Teste 2: ${result2.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Teste 3: Adicionar o mesmo livro com status diferente
      addTestResult('Teste 3', 'pending', 'Mudando status do livro para "Lendo"...');
      
      const result3 = await actions.addBookToLibrary(testBookId, ReadingStatus.CURRENTLY_READING);
      
      if (result3.success) {
        addTestResult('Teste 3', 'success', 'Status do livro atualizado com sucesso');
        toast.success('✅ Teste 3: Status alterado para "Lendo"');
      } else {
        addTestResult('Teste 3', 'error', `Falhou: ${result3.message}`);
        toast.error(`❌ Teste 3: ${result3.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Teste 4: Marcar como lido
      addTestResult('Teste 4', 'pending', 'Marcando livro como lido...');
      
      const result4 = await actions.addBookToLibrary(testBookId, ReadingStatus.READ);
      
      if (result4.success) {
        addTestResult('Teste 4', 'success', 'Livro marcado como lido');
        toast.success('✅ Teste 4: Livro marcado como lido');
      } else {
        addTestResult('Teste 4', 'error', `Falhou: ${result4.message}`);
        toast.error(`❌ Teste 4: ${result4.message}`);
      }

      // Verificar warnings
      addTestResult('Verificação de Warnings', warnCount === 0 ? 'success' : 'error', 
        warnCount === 0 ? 'Nenhum warning de duplicata detectado' : `${warnCount} warnings de duplicata encontrados`);

      if (warnCount === 0) {
        toast.success('🎉 Teste completo: Erro de duplicatas corrigido!');
      } else {
        toast.error(`⚠️ Ainda há ${warnCount} warnings de duplicata`);
      }

    } catch (error) {
      addTestResult('Erro Geral', 'error', (error as Error).message);
      toast.error('❌ Erro durante o teste');
    } finally {
      // Restaurar console.warn original
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen eclipse-bg-pattern p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6"
        >
          <h1 className="text-2xl font-semibold text-white mb-4">
            🔧 Teste - Correção de Livros Duplicados
          </h1>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Problema Original:</h3>
            <p className="text-white/80 text-sm mb-2">
              ❌ "Attempted to add duplicate book: Why This World"
            </p>
            <p className="text-white/70 text-sm">
              O sistema estava tentando adicionar livros duplicados e gerando warnings.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Solução Implementada:</h3>
            <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
              <li>✅ Modificado reducer para atualizar livros existentes ao invés de rejeitar</li>
              <li>✅ Melhorada função addBookToLibrary para lidar com mudanças de status</li>
              <li>✅ Adicionada lógica para atualizar status de livros existentes</li>
              <li>✅ Removidos warnings desnecessários</li>
            </ul>
          </div>

          <Button
            onClick={runDuplicateTest}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isRunning ? 'Executando Teste...' : 'Iniciar Teste de Duplicatas'}
          </Button>
        </motion.div>

        {/* Resultados do Teste */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              📊 Resultados do Teste
            </h2>

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getStatusIcon(result.status)}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.test}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {result.message}
                      </p>
                      <p className="text-white/40 text-xs mt-2">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!isRunning && testResults.length > 0 && (
              <div className="mt-6">
                {testResults.filter(r => r.status === 'error').length === 0 ? (
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h3 className="text-green-400 font-medium">
                          Teste Bem-Sucedido!
                        </h3>
                        <p className="text-white/80 text-sm">
                          Todos os testes passaram. O erro de duplicatas foi corrigido!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h3 className="text-red-400 font-medium">
                          Teste com Falhas
                        </h3>
                        <p className="text-white/80 text-sm">
                          {testResults.filter(r => r.status === 'error').length} de {testResults.length} testes falharam.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Explicação Técnica */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            🔧 Detalhes Técnicos da Correção
          </h2>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">1. Reducer UPDATE_USER_BOOK</h3>
              <p className="text-white/70 text-sm">
                Modificado para atualizar livros existentes ao invés de apenas rejeitar duplicatas.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">2. Função addBookToLibrary</h3>
              <p className="text-white/70 text-sm">
                Agora verifica se o livro existe e permite atualizações de status ao invés de falhar.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">3. Status Updates</h3>
              <p className="text-white/70 text-sm">
                Usa updateUserBookStatus() para mudanças de status em livros existentes.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">4. Error Handling</h3>
              <p className="text-white/70 text-sm">
                Removidos warnings desnecessários e melhorado tratamento de casos edge.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Toaster />
    </div>
  );
}