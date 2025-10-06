# Eclipse Reads

## Sobre

O *Eclipse Reads* é um aplicativo / web app para organizar leituras, gerenciar a biblioteca pessoal de livros e acompanhar o progresso de leitura. O repositório contém o frontend da aplicação (TypeScript + React) e arquivos de suporte para integração com serviços como Supabase.

Algumas funcionalidades esperadas ou já implementadas (verificar o código para detalhes):

- Gerenciamento de livros (cards, listagem, detalhe)
- Modos de leitura e acompanhamento de progresso
- Pesquisa e filtros
- Integração com Supabase para persistência/SSR
- Componentes de UI reutilizáveis (Radix, ícones, controles)

## Tecnologias / Stack

Baseado nas dependências e arquivos de configuração do repositório:

- TypeScript
- React 18
- Vite
- Supabase 
- Radix UI 
- Hono (presente como dependência; possivelmente usado em funções/rotas serverless)
- Vitest e Testing Library (testes)
- CSS
- Tailwindcss;

Arquivos de configuração presentes:

- tsconfig.json
- vite.config.ts
- vitest.config.ts
- vercel.json

## Requisitos

- Node.js 20.x (conforme engines em package.json)
- npm (ou outro gerenciador compatível)

## Instalação (Desenvolvimento Local)

1. Clone o repositório:

bash
git clone https://github.com/michaelazev/Eclipse-Reasds.git
cd Eclipse-Reasds


2. Instale as dependências:

bash
npm install


3. Configure variáveis de ambiente:

- Crie um arquivo .env na raiz com as variáveis necessárias. A base do projeto usa nomes de variáveis com prefixo VITE_ (variáveis expostas ao cliente) — alguns exemplos encontrados no repositório:

4. Rodar em modo desenvolvimento:

bash
npm run dev


O comando acima usa o script dev definido no package.json (executa vite).

5. Build de produção:

bash
npm run build


6. Preview do build (local):

bash
npm run preview


7. Testes:

bash
npm run test         # roda vitest em modo interativo
npm run test:ci      # roda vitest em modo CI/one-shot


## Scripts (conforme package.json)

- dev — inicia o servidor de desenvolvimento (Vite)
- build — build de produção (usa Vite)
- preview — preview local do build
- test — executa Vitest
- test:ci — executa Vitest em modo não interativo

## Supabase

O repositório contém integrações com Supabase:

- Cliente Supabase instalado (@supabase/supabase-js e um alias @jsr/supabase__supabase-js)
- Há scripts SQL de schema em src/supabase-schema.sql e src/supabase-complete-schema.sql.
- Verifique src/services/supabaseService.ts e a pasta supabase/ para ver como as variáveis são lidas e como a conexão é inicializada.

Se for usar Supabase localmente/produzindo, crie as variáveis de ambiente adequadas e importe os schemas se necessário.

## Deploy

Este repositório inclui vercel.json e está apto para Deploy: 
https://eclipse-reasds.vercel.app

## Contribuição

Para contribuir:

1. Faça fork do repositório
2. Crie uma branch: git checkout -b feature/minha-feature
3. Faça commits claros
4. Abra um pull request para main

Dicas:

- Garanta que os testes relevantes passem
- Atualize a documentação quando necessário
- Siga o padrão de codificação do projeto

## Autor / Contato

- Autor original: *michaelazev*
- Contribuidora: *jamiligabriela29*

Para colaborar ou relatar problemas, abra uma issue no GitHub.