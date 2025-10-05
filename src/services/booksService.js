const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Cache para armazenar requisições recentes
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (aumentado de 10)

// Sistema de monitoramento da saúde da API
let apiHealthStatus = {
  isHealthy: true,
  lastError: null,
  errorCount: 0,
  lastSuccessfulRequest: Date.now(),
  consecutiveErrors: 0
};

/**
 * Atualiza o status de saúde da API
 */
function updateApiHealth(success, error = null) {
  if (success) {
    apiHealthStatus.isHealthy = true;
    apiHealthStatus.lastSuccessfulRequest = Date.now();
    apiHealthStatus.consecutiveErrors = 0;
  } else {
    apiHealthStatus.lastError = error;
    apiHealthStatus.errorCount++;
    apiHealthStatus.consecutiveErrors++;
    
    // Emite evento para componentes React
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: {
          error: error?.message || 'API Error',
          type: 'google-books-api',
          consecutiveErrors: apiHealthStatus.consecutiveErrors
        }
      }));
    }
    
    // API considerada não saudável após 3 erros consecutivos
    if (apiHealthStatus.consecutiveErrors >= 3) {
      apiHealthStatus.isHealthy = false;
      console.warn('🚨 API do Google Books marcada como não saudável após múltiplos erros');
    }
  }
}

/**
 * Verifica se a API parece estar instável
 */
function isApiUnstable() {
  const timeSinceLastSuccess = Date.now() - apiHealthStatus.lastSuccessfulRequest;
  return !apiHealthStatus.isHealthy || 
         timeSinceLastSuccess > 2 * 60 * 1000 || // Mais de 2 min sem sucesso
         apiHealthStatus.consecutiveErrors >= 2;
}

// Persistent cache usando localStorage
const PERSISTENT_CACHE_KEY = 'eclipse_books_cache';
const PERSISTENT_CACHE_DURATION = 60 * 60 * 1000; // 1 hora

/**
 * Limpa entradas antigas do cache
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

/**
 * Busca do cache persistente (localStorage)
 */
function getFromPersistentCache(key) {
  try {
    const persistentCache = localStorage.getItem(PERSISTENT_CACHE_KEY);
    if (!persistentCache) return null;
    
    const cache = JSON.parse(persistentCache);
    const item = cache[key];
    
    if (item && Date.now() - item.timestamp < PERSISTENT_CACHE_DURATION) {
      console.log('💾 Usando cache persistente para:', key);
      return item.data;
    }
  } catch (error) {
    console.warn('Erro ao ler cache persistente:', error);
  }
  return null;
}

/**
 * Adiciona ao cache persistente (localStorage)
 */
function addToPersistentCache(key, data) {
  try {
    let persistentCache = {};
    const existing = localStorage.getItem(PERSISTENT_CACHE_KEY);
    if (existing) {
      persistentCache = JSON.parse(existing);
    }
    
    persistentCache[key] = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(persistentCache));
  } catch (error) {
    console.warn('Erro ao salvar cache persistente:', error);
  }
}

/**
 * Busca do cache ou retorna null
 */
function getFromCache(key) {
  cleanCache();
  
  // Tenta cache em memória primeiro
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Usando cache em memória para:', key);
    return cached.data;
  }
  
  // Se não encontrar, tenta cache persistente
  return getFromPersistentCache(key);
}

/**
 * Adiciona dados ao cache
 */
function addToCache(key, data) {
  // Adiciona ao cache em memória
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Também adiciona ao cache persistente
  addToPersistentCache(key, data);
}

/**
 * Sleep function para delays entre retries
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch com retry e exponential backoff inteligente
 * @param {string} url - URL para fazer fetch
 * @param {number} maxRetries - Número máximo de tentativas (padrão: 2)
 * @param {number} baseDelay - Delay base em ms (padrão: 1000)
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, maxRetries = 2, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      // Se a resposta for OK, retorna imediatamente
      if (response.ok) {
        return response;
      }
      
      // Se for erro 503, 429 ou 502 (service issues), tenta novamente apenas uma vez mais
      if (response.status === 503 || response.status === 429 || response.status === 502) {
        lastError = new Error(`HTTP ${response.status}: Service temporarily unavailable`);
        
        // Só faz retry na primeira tentativa (máximo 2 tentativas total)
        if (attempt === 0) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), 3000); // Cap em 3s
          console.warn(`⚠️ API instável (${response.status}), tentando uma vez mais em ${delay}ms...`);
          await sleep(delay);
          continue;
        }
      }
      
      // Para outros erros HTTP, não faz retry
      throw new Error(`HTTP error! status: ${response.status}`);
      
    } catch (error) {
      lastError = error;
      
      // Se for erro de timeout ou rede, tenta uma vez mais
      if ((error.name === 'AbortError' || error.message.includes('fetch')) && attempt === 0) {
        const delay = Math.min(baseDelay, 2000); // Máximo 2s para timeout
        console.warn(`⚠️ Timeout da rede, tentando uma vez mais em ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      // Para outros tipos de erro ou tentativas extras, não faz retry
      throw error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw lastError;
}

/**
 * Resume uma descrição para um tamanho máximo
 * @param {string} description - Descrição original
 * @param {number} maxLength - Tamanho máximo em caracteres
 * @returns {string} Descrição resumida
 */
function summarizeDescription(description, maxLength = 200) {
  if (!description || description.length <= maxLength) {
    return description || 'Descrição não disponível';
  }
  
  // Remove tags HTML se houver
  const cleanText = description.replace(/<[^>]*>/g, '');
  
  // Corta no último espaço antes do limite para não cortar palavras
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) { // Se o último espaço não está muito longe
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Transforma dados da Google Books API para o formato usado no app
 */
function transformBookData(item) {
  const volumeInfo = item.volumeInfo || {};
  const saleInfo = item.saleInfo || {};
  
  return {
    id: item.id,
    title: volumeInfo.title || 'Título não disponível',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
    coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    description: summarizeDescription(volumeInfo.description),
    publishedDate: volumeInfo.publishedDate || '',
    pages: volumeInfo.pageCount || 0,
    rating: volumeInfo.averageRating || 0,
    genres: volumeInfo.categories || [],
    publisher: volumeInfo.publisher || '',
    language: volumeInfo.language || 'pt-BR',
    isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
          volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || 
          'N/A',
    categories: volumeInfo.categories?.map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      name: cat,
      icon: '📚'
    })) || [{ id: 'geral', name: 'Geral', icon: '📚' }],
    source: 'google-books',
    previewLink: volumeInfo.previewLink,
    infoLink: volumeInfo.infoLink,
    isPublicDomain: saleInfo.isEbook && saleInfo.saleability === 'FREE'
  };
}

/**
 * Busca livros na Google Books API com fallback inteligente
 * @param {string} query - Termo de busca
 * @param {number} maxResults - Número máximo de resultados (padrão: 20)
 * @param {number} startIndex - Índice inicial para paginação (padrão: 0)
 * @returns {Promise<Array>} Array de livros transformados
 */
export async function searchBooks(query, maxResults = 20, startIndex = 0) {
  const cacheKey = `search_${query}_${maxResults}_${startIndex}`;
  
  // Verifica cache primeiro
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Se a API está instável, retorna dados de exemplo mais rapidamente
  if (isApiUnstable() && startIndex === 0) {
    console.warn('⚠️ API instável detectada, usando dados de exemplo para busca:', query);
    return generateFallbackSearchResults(query, maxResults);
  }
  
  try {
    const encodedQuery = encodeURIComponent(query);
    // Força busca por livros em português e adiciona filtro para literatura brasileira
    const url = `${GOOGLE_BOOKS_API}?q=${encodedQuery}+inauthor:(brasileiro OR brasil OR portuguesa)&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=pt&orderBy=relevance`;
    
    const response = await fetchWithRetry(url, 2, 1000); // Reduz tentativas para pesquisa
    const data = await response.json();
    
    updateApiHealth(true); // Marca sucesso
    
    if (!data.items) {
      const emptyResult = [];
      addToCache(cacheKey, emptyResult);
      return emptyResult;
    }
    
    const books = data.items.map(transformBookData);
    addToCache(cacheKey, books);
    return books;
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    updateApiHealth(false, error); // Marca erro
    
    // Em caso de erro, retorna dados de exemplo se for uma busca nova
    if (startIndex === 0) {
      console.log('📚 Retornando resultados de exemplo devido a erro da API');
      return generateFallbackSearchResults(query, maxResults);
    }
    
    // Para paginação, retorna array vazio
    return [];
  }
}

/**
 * Gera resultados de exemplo para quando a API está indisponível
 */
function generateFallbackSearchResults(query, maxResults) {
  const exampleBooks = [
    {
      id: 'fallback_dom_casmurro',
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      coverUrl: null,
      description: 'Clássico da literatura brasileira que narra a história de Bentinho e Capitu.',
      publishedDate: '1899',
      pages: 256,
      rating: 4.5,
      genres: ['Literatura Brasileira', 'Romance'],
      publisher: 'Editora Garnier',
      language: 'pt-BR',
      isbn: 'N/A',
      categories: [{ id: 'literatura-brasileira', name: 'Literatura Brasileira', icon: '📚' }],
      source: 'fallback-search',
      isFallback: true
    },
    {
      id: 'fallback_o_cortico',
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      coverUrl: null,
      description: 'Romance naturalista que retrata a vida em um cortiço no Rio de Janeiro.',
      publishedDate: '1890',
      pages: 324,
      rating: 4.2,
      genres: ['Literatura Brasileira', 'Naturalismo'],
      publisher: 'Editora Ática',
      language: 'pt-BR',
      isbn: 'N/A',
      categories: [{ id: 'literatura-brasileira', name: 'Literatura Brasileira', icon: '📚' }],
      source: 'fallback-search',
      isFallback: true
    },
    {
      id: 'fallback_capitaes_areia',
      title: 'Capitães da Areia',
      author: 'Jorge Amado',
      coverUrl: null,
      description: 'Romance sobre um grupo de meninos órfãos que vivem nas ruas de Salvador.',
      publishedDate: '1937',
      pages: 280,
      rating: 4.4,
      genres: ['Literatura Brasileira', 'Romance Social'],
      publisher: 'Companhia das Letras',
      language: 'pt-BR',
      isbn: 'N/A',
      categories: [{ id: 'literatura-brasileira', name: 'Literatura Brasileira', icon: '📚' }],
      source: 'fallback-search',
      isFallback: true
    }
  ];
  
  // Retorna até maxResults livros
  const results = exampleBooks.slice(0, Math.min(maxResults, exampleBooks.length));
  
  // Adiciona aviso sobre dados temporários
  results.forEach(book => {
    book.description += '\n\n⚠️ Exemplo temporário - A API do Google Books está temporariamente indisponível.';
  });
  
  return results;
}

/**
 * Busca livros populares/trending - fixos brasileiros
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} Array de livros populares brasileiros
 */
export async function getPopularBooks(maxResults = 20) {
  const cacheKey = `popular_${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  try {
    // Queries fixas para literatura brasileira
    const query = 'literatura brasileira machado assis clarice lispector';
    const books = await searchBooks(query, maxResults);
    addToCache(cacheKey, books);
    return books;
  } catch (error) {
    console.error('Erro ao buscar livros populares:', error);
    // Retorna dados de exemplo se a API falhar
    return generateFallbackSearchResults('literatura brasileira', Math.min(maxResults, 3));
  }
}

/**
 * Busca livros em destaque (featured books) - fixos brasileiros
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} Array de livros em destaque brasileiros
 */
export async function getFeaturedBooks(maxResults = 8) {
  const cacheKey = `featured_${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  try {
    // Query fixa para autores brasileiros clássicos
    const query = 'machado de assis dom casmurro';
    const books = await searchBooks(query, maxResults);
    const result = books.slice(0, maxResults);
    addToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar livros em destaque:', error);
    // Retorna dados de exemplo se a API falhar
    return generateFallbackSearchResults('machado de assis', Math.min(maxResults, 2));
  }
}

/**
 * Busca livros por categoria
 * @param {string} category - Categoria para buscar
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} Array de livros da categoria
 */
export async function getBooksByCategory(category, maxResults = 20) {
  const cacheKey = `category_${category}_${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  try {
    const categoryMap = {
      'classicos': 'classic literature portuguese',
      'romance': 'romance fiction portuguese',
      'ficcao': 'fiction portuguese',
      'biografia': 'biography portuguese',
      'historia': 'history portuguese',
      'ciencia': 'science portuguese',
      'arte': 'art portuguese',
      'poesia': 'poetry portuguese'
    };
    
    const query = categoryMap[category] || `${category} portuguese`;
    const books = await searchBooks(query, maxResults);
    addToCache(cacheKey, books);
    return books;
  } catch (error) {
    console.error('Erro ao buscar livros por categoria:', error);
    return [];
  }
}

/**
 * Dados de fallback para quando a API estiver instável
 */
const FALLBACK_BOOKS_DATA = {
  // Dados mais completos para casos emergenciais
  getFallbackBook: (bookId) => {
    const fallbackBooks = [
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        description: 'Romance clássico da literatura brasileira que narra a história de Bentinho e sua paixão por Capitu.',
        publisher: 'Editora Garnier',
        pages: 256,
        rating: 4.5,
        publishedDate: '1899'
      },
      {
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        description: 'Romance naturalista que retrata a vida em um cortiço no Rio de Janeiro do século XIX.',
        publisher: 'Editora Ática',
        pages: 324,
        rating: 4.2,
        publishedDate: '1890'
      },
      {
        title: 'A Hora da Estrela',
        author: 'Clarice Lispector',
        description: 'Último romance de Clarice Lispector, conta a história de Macabéa, uma jovem nordestina.',
        publisher: 'Editora Rocco',
        pages: 128,
        rating: 4.3,
        publishedDate: '1977'
      },
      {
        title: 'Capitães da Areia',
        author: 'Jorge Amado',
        description: 'Romance que conta a história de um grupo de meninos órfãos que vivem nas ruas de Salvador.',
        publisher: 'Companhia das Letras',
        pages: 280,
        rating: 4.4,
        publishedDate: '1937'
      },
      {
        title: 'Grande Sertão: Veredas',
        author: 'Guimarães Rosa',
        description: 'Obra-prima da literatura brasileira que narra as aventuras de Riobaldo pelos sertões.',
        publisher: 'Nova Fronteira',
        pages: 624,
        rating: 4.6,
        publishedDate: '1956'
      }
    ];

    // Usa o bookId para selecionar consistentemente o mesmo livro
    const index = Math.abs(bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackBooks.length;
    const selectedBook = fallbackBooks[index];
    
    return {
      id: bookId,
      title: selectedBook.title,
      author: selectedBook.author,
      coverUrl: null, // Sem capa para dados de fallback
      description: `${selectedBook.description}\n\n⚠️ Dados temporários - A API do Google Books está temporariamente indisponível. As informações completas serão carregadas assim que o serviço for restaurado.`,
      publishedDate: selectedBook.publishedDate,
      pages: selectedBook.pages,
      rating: selectedBook.rating,
      genres: ['Literatura Brasileira', 'Clássicos'],
      publisher: selectedBook.publisher,
      language: 'pt-BR',
      isbn: 'N/A',
      categories: [
        { id: 'literatura-brasileira', name: 'Literatura Brasileira', icon: '📚' },
        { id: 'classicos', name: 'Clássicos', icon: '📖' }
      ],
      source: 'fallback-data',
      previewLink: null,
      infoLink: null,
      isPublicDomain: false,
      isTemporaryData: true,
      isFallback: true
    };
  }
};

/**
 * Busca detalhes de um livro específico pelo ID
 * @param {string} bookId - ID do livro na Google Books API
 * @returns {Promise<Object|null>} Dados detalhados do livro ou null se não encontrado
 */
export async function getBookById(bookId) {
  const cacheKey = `book_${bookId}`;
  
  // Verifica cache primeiro
  const cached = getFromCache(cacheKey);
  if (cached) {
    // Se for dados de fallback e já passou mais de 5 min, tenta buscar dados reais
    if (cached.isFallback && Date.now() - (cached._cachedAt || 0) > 5 * 60 * 1000) {
      console.log('🔄 Tentando atualizar dados de fallback para dados reais...');
      // Continue para buscar dados atualizados, mas mantenha fallback como backup
    } else {
      return cached;
    }
  }
  
  try {
    const url = `${GOOGLE_BOOKS_API}/${bookId}`;
    
    const response = await fetchWithRetry(url, 2, 1500); // Apenas 2 tentativas, mais rápido
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`📚 Livro não encontrado: ${bookId}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const book = transformBookData(data);
    book._cachedAt = Date.now(); // Marca quando foi cacheado
    
    // Armazena no cache
    addToCache(cacheKey, book);
    
    return book;
  } catch (error) {
    console.error('Error loading book:', error);
    
    // Se temos dados de fallback em cache, retorna eles
    if (cached && cached.isFallback) {
      console.log('📖 Retornando dados de fallback do cache');
      return cached;
    }
    
    // Caso contrário, gera novos dados de fallback
    console.warn('⚠️ Usando fallback para livro:', bookId);
    
    const fallbackBook = FALLBACK_BOOKS_DATA.getFallbackBook(bookId);
    fallbackBook._cachedAt = Date.now();
    
    // Salva no cache com TTL menor para dados de fallback
    addToCache(cacheKey, fallbackBook);
    
    return fallbackBook;
  }
}

/**
 * Busca livros trending - fixos brasileiros
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} Array de livros trending brasileiros
 */
export async function getTrendingBooks(maxResults = 8) {
  const cacheKey = `trending_${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  try {
    // Query fixa para literatura brasileira contemporânea
    const query = 'clarice lispector jorge amado';
    const books = await searchBooks(query, maxResults);
    addToCache(cacheKey, books);
    return books;
  } catch (error) {
    console.error('Erro ao buscar livros trending:', error);
    return [];
  }
}

/**
 * Limpa todo o cache (útil para forçar refresh)
 */
export function clearCache() {
  cache.clear();
  try {
    localStorage.removeItem(PERSISTENT_CACHE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar cache persistente:', error);
  }
  console.log('🗑️ Cache limpo (memória e localStorage)');
}

/**
 * Limpa apenas cache antigo do localStorage
 */
export function cleanPersistentCache() {
  try {
    const persistentCache = localStorage.getItem(PERSISTENT_CACHE_KEY);
    if (!persistentCache) return;
    
    const cache = JSON.parse(persistentCache);
    const now = Date.now();
    const cleaned = {};
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp < PERSISTENT_CACHE_DURATION) {
        cleaned[key] = cache[key];
      }
    });
    
    localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(cleaned));
    console.log('🧹 Cache persistente limpo (itens expirados removidos)');
  } catch (error) {
    console.warn('Erro ao limpar cache persistente:', error);
  }
}