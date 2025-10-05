import { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SupabaseConnectionGuideProps {
  onComplete?: () => void;
}

export function SupabaseConnectionGuide({ onComplete }: SupabaseConnectionGuideProps) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      title: '1. Criar Projeto no Supabase',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Acesse o Supabase e crie um novo projeto:
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Abrir Supabase Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-sm text-white/70">Passos:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
              <li>Clique em "New Project"</li>
              <li>Preencha o nome (ex: "eclipse-reads")</li>
              <li>Escolha uma senha forte para o banco</li>
              <li>Selecione a região mais próxima</li>
              <li>Aguarde alguns minutos para criar</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: '2. Executar Schema SQL',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Execute o schema SQL para criar as tabelas:
          </p>
          <div className="space-y-2">
            <p className="text-sm text-white/70">No Supabase Dashboard:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
              <li>Vá em "SQL Editor" no menu lateral</li>
              <li>Clique em "New query"</li>
              <li>Copie o conteúdo do arquivo abaixo</li>
              <li>Cole no editor e clique "Run"</li>
            </ol>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">supabase-complete-schema.sql</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy('/supabase-complete-schema.sql', 'schema')}
                className="h-8 text-purple-400 hover:text-purple-300"
              >
                {copied === 'schema' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-white/50">
              Arquivo disponível na raiz do projeto
            </p>
          </div>
        </div>
      )
    },
    {
      title: '3. Configurar Credenciais',
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Copie suas credenciais do Supabase:
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-sm text-white/70">No Supabase Dashboard:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
              <li>Vá em Settings {'>'} API</li>
              <li>Copie a "Project URL"</li>
              <li>Copie a "anon/public key"</li>
            </ol>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-2 text-white/90">
                Project URL
              </label>
              <Input
                type="url"
                placeholder="https://xxxxx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white/90">
                Anon Key
              </label>
              <Input
                type="password"
                placeholder="eyJhbGc..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          {supabaseUrl && supabaseKey && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Credenciais preenchidas!</span>
              </div>
              <p className="text-sm text-white/70">
                Copie o código abaixo e adicione ao arquivo <code className="text-purple-400">.env</code>:
              </p>
              <div className="bg-black/30 rounded p-3 mt-2 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`,
                    'env'
                  )}
                  className="absolute top-2 right-2 h-7 text-purple-400 hover:text-purple-300"
                >
                  {copied === 'env' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <pre className="text-xs text-white/80 overflow-x-auto pr-8">
                  {`VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: '4. Configurar Google OAuth (Opcional)',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Para habilitar login com Google:
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-medium text-white mb-2">Google Cloud Console:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
                <li>Acesse console.cloud.google.com</li>
                <li>Crie um novo projeto ou use existente</li>
                <li>Vá em APIs & Services {'>'} Credentials</li>
                <li>Crie OAuth 2.0 Client ID (Web application)</li>
                <li>Configure URLs autorizadas</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">No Supabase:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
                <li>Vá em Authentication {'>'} Providers</li>
                <li>Habilite "Google"</li>
                <li>Cole Client ID e Client Secret do Google</li>
                <li>Salve as configurações</li>
              </ol>
            </div>
          </div>
          <a
            href="/CONFIGURACAO_SUPABASE.md"
            target="_blank"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            Ver guia completo de configuração
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Configurar Supabase
            </h2>
            <p className="text-white/60 text-sm">
              Configure o backend do Eclipse Reads
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-colors ${
                index + 1 <= step
                  ? 'bg-purple-500'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Current Step */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium text-white mb-4">
              {steps[step - 1].title}
            </h3>
            {steps[step - 1].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="text-white/70 hover:text-white"
            >
              Anterior
            </Button>
            <span className="text-sm text-white/50">
              Passo {step} de {steps.length}
            </span>
            {step < steps.length ? (
              <Button
                onClick={() => setStep(Math.min(steps.length, step + 1))}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!supabaseUrl || !supabaseKey}
              >
                Concluir
              </Button>
            )}
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60 text-center">
            Precisa de ajuda?{' '}
            <a
              href="/CONFIGURACAO_SUPABASE.md"
              target="_blank"
              className="text-purple-400 hover:text-purple-300"
            >
              Consulte a documentação completa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
