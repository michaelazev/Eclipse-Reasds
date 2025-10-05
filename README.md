
  # Eclipse Reads App

  Este repositório contém o código do aplicativo "Eclipse Reads" — uma UI de leitura/gestão de livros (versão local / demo). O design original foi criado no Figma: https://www.figma.com/design/PBt2VfqKMRk128kpyFyb0T/Eclipse-Reads-App

  ## O que tem aqui
  - Frontend em React + Vite (TypeScript)
  - Mock local para livros e usuários (útil para desenvolvimento off-line)
  - Integração com Supabase (autenticação, armazenamento de biblioteca)
  - Serviços para Google Books API (busca de livros) e comportamento de fallback

  ## Requisitos
  - Node 18+ (ou compatível com Vite)
  - npm ou pnpm

  ## Como executar (desenvolvimento)
  No Windows Powershell (ou terminal):

  ```powershell
  # instalar dependências
  npm install

  # iniciar servidor de desenvolvimento (Vite)
  npm run dev

  # build para produção
  npm run build
  ```

  Abra o navegador em http://localhost:5173 (ou a porta que o Vite indicar).

  ## Arquivo de ambiente (.env)
  Para facilitar a configuração, criei um arquivo de exemplo `.env.example` na raiz do projeto. Copie esse arquivo para um arquivo `.env` e preencha com suas credenciais do Supabase:

  ```powershell
  copy .env.example .env
  # Em PowerShell: Copy-Item .env.example .env
  ```

  Exemplo do conteúdo (não comite chaves reais):
  ```text
  VITE_APP_SUPABASE_URL=https://SEU_PROJETO_ID.supabase.co
  VITE_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
  ```

  ## Adicionando/alterando livros mock
  - Os livros mock estão em `src/repositories/BookRepository.ts` no array `mockBooks`.
  - Para adicionar mais livros, edite esse array e inclua objetos que sigam a interface `Book` (veja `src/models/Book.ts`). Exemplo mínimo:

  ```ts
  {
    id: '21',
    title: 'Nome do Livro',
    authors: ['Autor'],
    author: 'Autor',
    coverUrl: 'https://.../cover.png',
    description: 'Descrição',
    pages: 200,
    rating: 4.0,
    genres: ['Ficção'],
    categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
    source: 'local'
  }
  ```

  Depois de editar, reinicie o servidor de dev para ver as mudanças.

  ## Problemas comuns e soluções rápidas
  - redirect_uri_mismatch (Google OAuth): verifique os redirect URIs no Google Cloud Console e no painel do Supabase. Use exatamente a origem (ex.: `http://localhost:5173/`) se o app está em dev.
  - Erro de tipo com imagens `figma:asset`: já resolvido por `src/types/figma-assets.d.ts`. Se preferir solução alternativa, copie as imagens para `src/assets/` e altere imports.
  - Livro não aparecendo na Biblioteca após marcar "Já Li": verifique se a navegação redirecionou para a aba `library` (o app foi ajustado para navegar para a biblioteca após ação). Se ainda não aparecer, cheque os logs DEBUG no console.

  ## Testes e desenvolvimento rápido
  - Não há suite de testes automatizados no momento. Para testar manualmente:
    1. Rode `npm run dev`.
    2. Faça login como Guest (opção na tela de autenticação) para testar sem Supabase.
    3. Abra um livro e clique em "Já Li", "Favoritar" e "Ler Agora" e acompanhe os toasts e logs no Console.

  ## Contribuindo
  - Pull requests são bem-vindos. Prefira mudanças pequenas e documente o que foi alterado.

  ## Contato / Ajuda
  - Se algo não funcionar como esperado, cole aqui o log do Console (mensagens `DEBUG` ou erros do Supabase) e eu ajudo a analisar.