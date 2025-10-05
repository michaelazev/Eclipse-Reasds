# Configuração do Supabase - Eclipse Reads

## Passos para configurar o Supabase

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite o nome do projeto: "Eclipse Reads"
6. Digite uma senha segura para o banco de dados
7. Escolha a região mais próxima do Brasil (South America - São Paulo)
8. Clique em "Create new project"

### 2. Obter as credenciais
1. No dashboard do projeto, vá para **Settings** → **API**
2. Copie a **Project URL**
3. Copie a **anon public** key
4. **NUNCA** compartilhe a **service_role** key publicamente

### 3. Configurar as variáveis de ambiente
1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` e substitua os valores:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 4. Criar as tabelas do banco de dados
1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Verifique se todas as tabelas foram criadas em **Table Editor**

### 5. Configurar autenticação com Google (Opcional)
1. Vá para **Authentication** → **Settings** → **Auth Providers**
2. Ative o **Google** provider
3. Configure as credenciais do Google OAuth:
   - Vá para [Google Cloud Console](https://console.cloud.google.com)
   - Crie ou selecione um projeto
   - Ative a Google+ API
   - Vá para **APIs & Services** → **Credentials**
   - Clique em **Create Credentials** → **OAuth 2.0 Client IDs**
   - Configure:
     - Application type: Web application
     - Authorized redirect URIs: `https://seu-projeto.supabase.co/auth/v1/callback`
   - Copie o Client ID e Client Secret
   - Cole no Supabase Auth Providers

### 6. Configurar políticas de segurança (RLS)
As políticas Row Level Security (RLS) já estão incluídas no script SQL e garantem que:
- Usuários só podem ver seus próprios livros
- Usuários só podem modificar seus próprios dados
- Reviews públicos são visíveis para todos
- Books são visíveis para todos (catálogo público)

### 7. Testar a conexão
1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Verifique se não há erros no console
3. Tente fazer login com Google (se configurado)
4. Adicione um livro aos favoritos para testar

## Tabelas criadas

### `books`
Armazena informações dos livros do catálogo (vindos da Google Books API)

### `user_books`
Relaciona usuários com livros (biblioteca pessoal, status de leitura)

### `reading_sessions`
Registra sessões de leitura para acompanhar progresso

### `user_preferences`
Configurações personalizadas do usuário

### `book_reviews`
Avaliações e resenhas dos usuários

### `reading_statistics`
Estatísticas de leitura por usuário

## Funcionalidades implementadas

- ✅ Autenticação com Google OAuth
- ✅ Biblioteca pessoal (Favoritos, Lendo, Lidos)
- ✅ Sincronização com Google Books API
- ✅ Sistema de progresso de leitura
- ✅ Políticas de segurança (RLS)
- ✅ Triggers automáticos para novos usuários
- 🚧 Sistema de avaliações (estrutura criada)
- 🚧 Estatísticas de leitura (estrutura criada)
- 🚧 Sessões de leitura (estrutura criada)

## Troubleshooting

### Erro: "Supabase not configured"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão preenchidas corretamente
- Reinicie o servidor de desenvolvimento

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon public)
- Certifique-se de que não há espaços extras

### Erro: "Permission denied"
- Verifique se as políticas RLS foram criadas corretamente
- Execute novamente o script `supabase-schema.sql`

### Erro de CORS
- Adicione seu domínio local (`http://localhost:3000`) nas configurações do projeto:
  - **Settings** → **API** → **CORS Origins**