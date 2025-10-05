# Integração com elivros.info

## Visão Geral

A integração com o domínio https://elivros.info/ foi implementada para expandir o catálogo de livros disponíveis no Eclipse Reads, focando especialmente em literatura brasileira e livros em português.

## Características da Integração

### Funcionalidades Implementadas

1. **Busca de Livros**: Integração completa com o sistema de busca
2. **Livros em Destaque**: Aparece na página inicial junto com livros locais
3. **Leitura Online**: Suporte para leitura online (sem download)
4. **Categorização**: Livros organizados por gêneros compatíveis
5. **Sistema de Favoritos**: Funciona normalmente com livros do elivros.info

### Limitações por Design

- **Apenas Leitura Online**: Não oferece opção de download
- **Foco em Literatura Brasileira**: Catálogo concentrado em autores nacionais
- **Conteúdo Simulado**: Atualmente usando dados mock para demonstração

## Identificação Visual

### Indicadores no BookCard
- **Badge Verde "Online"**: Aparece no canto superior direito
- **Badge "🌐 elivros.info"**: Aparece nas categorias para identificar a fonte
- **Cor Verde**: Usada para destacar disponibilidade online

### Indicadores no BookDetailScreen
- **Badge "Leitura Online"**: No canto da capa do livro
- **Seção Especial**: "Disponível no elivros.info" com tags específicas
- **Descrição Explicativa**: Explica a fonte e natureza da biblioteca digital

## Estrutura Técnica

### Arquivo Principal
- `services/ElivrosInfoService.ts`: Service principal para integração

### Arquivos Modificados
- `repositories/BookRepository.ts`: Integração nos métodos de busca
- `components/book/BookCard.tsx`: Indicadores visuais
- `components/screens/BookDetailScreen.tsx`: Informações detalhadas
- `components/screens/HomeScreen.tsx`: Suporte para leitura

### Livros Incluídos (Mock Data)
1. **Memórias Póstumas de Brás Cubas** - Machado de Assis
2. **O Auto da Compadecida** - Ariano Suassuna
3. **A Hora da Estrela** - Clarice Lispector
4. **Capitães da Areia** - Jorge Amado
5. **Vidas Secas** - Graciliano Ramos
6. **O Tempo e o Vento** - Erico Verissimo
7. **O Guarani** - José de Alencar
8. **O Sítio do Picapau Amarelo** - Monteiro Lobato

## Fluxo de Funcionamento

### 1. Exibição na Home
- Livros do elivros.info aparecem misturados com livros locais
- Proporção: 50% locais, 50% elivros.info nos featured/trending

### 2. Busca
- Resultados incluem ambas as fontes
- Identificação clara da fonte através de badges

### 3. Adição aos Favoritos
- Funciona normalmente com sistema de favoritos
- Conteúdo carregado dinamicamente

### 4. Leitura
- Carregamento de conteúdo via `getBookContent()`
- Mensagem indicando fonte (elivros.info)
- Funcionalidade completa de leitura

## Implementação Futura

Para implementação com dados reais:

1. **API Integration**: Substituir mock data por calls reais à API/scraping
2. **Caching**: Implementar cache para melhor performance
3. **Sync**: Sincronização periódica do catálogo
4. **Error Handling**: Melhor tratamento de erros de conectividade

## Benefícios

- **Catálogo Expandido**: Mais opções de leitura
- **Literatura Nacional**: Foco em autores brasileiros
- **Gratuidade**: Todos os livros disponíveis gratuitamente
- **Integração Seamless**: Experiência unificada com outras fontes