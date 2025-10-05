import { Book, UserBook, ReadingStatus, ReadingProgress } from '../models/Book';
import { 
  searchBooks, 
  getBookById as getGoogleBookById, 
  getPopularBooks, 
  getFeaturedBooks as getGoogleFeaturedBooks,
  getTrendingBooks as getGoogleTrendingBooks,
  getBooksByCategory as getGoogleBooksByCategory
} from '../services/booksService.js';

// Placeholder URLs for book cover images
const iracemaCover = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop';
const autoCompadecidaCover = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop';

export interface BookRepository {
  getAllBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | null>;
  getFeaturedBooks(): Promise<Book[]>;
  getTrendingBooks(): Promise<Book[]>;
  getBooksByCategory(categoryId: string): Promise<Book[]>;
  searchBooks(query: string): Promise<Book[]>;
  getUserBooks(userId: string): Promise<UserBook[]>;
  getUserBooksByStatus(userId: string, status: ReadingStatus): Promise<UserBook[]>;
  addBookToUser(userId: string, bookId: string, status: ReadingStatus): Promise<UserBook>;
  removeBookFromUser(userId: string, bookId: string): Promise<void>;
  updateUserBookProgress(userBookId: string, currentPage: number): Promise<UserBook>;
  updateUserBookStatus(userBookId: string, status: ReadingStatus): Promise<UserBook>;
  getBookContent(book: Book): Promise<string>;
  toggleUserBookFavorite(userBookId: string): Promise<UserBook>;
}

export class MockBookRepository implements BookRepository {
  private userBooks: UserBook[] = [];
  private mockBooks: Book[] = [
    {
      id: '1',
      title: 'Dom Casmurro',
      authors: ['Machado de Assis'],
      author: 'Machado de Assis',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      description: 'Romance clássico sobre Bentinho e sua obsessão por Capitu.',
      publishedDate: '1899',
      pages: 256,
      rating: 4.2,
      genres: ['Romance', 'Clássico', 'Literatura Brasileira'],
      publisher: 'Garnier',
      language: 'pt-BR',
      isbn: '978-85-359-0277-4',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '2',
      title: 'O Cortiço',
      authors: ['Aluísio Azevedo'],
      author: 'Aluísio Azevedo',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      description: 'Retrato naturalista da vida em um cortiço carioca.',
      publishedDate: '1890',
      pages: 304,
      rating: 4.0,
      genres: ['Romance', 'Naturalismo', 'Literatura Brasileira'],
      publisher: 'Teixeira & Irmão',
      language: 'pt-BR',
      isbn: '978-85-359-0278-1',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '3',
      title: 'Iracema',
      authors: ['José de Alencar'],
      author: 'José de Alencar',
      coverUrl: iracemaCover,
      description: 'Lenda da fundação do Ceará através do amor entre Iracema e Martim.',
      publishedDate: '1865',
      pages: 128,
      rating: 3.8,
      genres: ['Romance', 'Indianismo', 'Literatura Brasileira'],
      publisher: 'Vianna & Filhos',
      language: 'pt-BR',
      isbn: '978-85-359-0279-8',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '4',
      title: 'O Auto da Compadecida',
      authors: ['Ariano Suassuna'],
      author: 'Ariano Suassuna',
      coverUrl: autoCompadecidaCover,
      description: 'Teatro medieval com cultura popular nordestina.',
      publishedDate: '1955',
      pages: 176,
      rating: 4.5,
      genres: ['Teatro', 'Comédia', 'Literatura Brasileira'],
      publisher: 'Agir',
      language: 'pt-BR',
      isbn: '978-85-359-0280-4',
      categories: [{ id: 'teatro', name: 'Teatro', icon: '🎭' }],
      source: 'local'
    },
    {
      id: '5',
      title: 'A Hora da Estrela',
      authors: ['Clarice Lispector'],
      author: 'Clarice Lispector',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      description: 'História de Macabéa, uma jovem nordestina.',
      publishedDate: '1977',
      pages: 96,
      rating: 4.3,
      genres: ['Romance', 'Literatura Brasileira', 'Modernismo'],
      publisher: 'José Olympio',
      language: 'pt-BR',
      isbn: '978-85-359-0281-1',
      categories: [{ id: 'modernismo', name: 'Modernismo', icon: '🎨' }],
      source: 'local'
    },
    {
      id: '6',
      title: 'Memórias Póstumas de Brás Cubas',
      authors: ['Machado de Assis'],
      author: 'Machado de Assis',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      description: 'Romance narrado por um defunto autor.',
      publishedDate: '1881',
      pages: 208,
      rating: 4.4,
      genres: ['Romance', 'Realismo', 'Literatura Brasileira'],
      publisher: 'Tipografia Nacional',
      language: 'pt-BR',
      isbn: '978-85-359-0282-8',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '7',
      title: 'Grande Sertão: Veredas',
      authors: ['João Guimarães Rosa'],
      author: 'João Guimarães Rosa',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      description: 'Memórias do jagunço Riobaldo no sertão.',
      publishedDate: '1956',
      pages: 624,
      rating: 4.1,
      genres: ['Romance', 'Literatura Brasileira', 'Regionalismo'],
      publisher: 'José Olympio',
      language: 'pt-BR',
      isbn: '978-85-359-0283-5',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '8',
      title: 'Capitães da Areia',
      authors: ['Jorge Amado'],
      author: 'Jorge Amado',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      description: 'Vida de meninos de rua em Salvador nos anos 1930.',
      publishedDate: '1937',
      pages: 280,
      rating: 4.2,
      genres: ['Romance', 'Literatura Brasileira', 'Social'],
      publisher: 'José Olympio',
      language: 'pt-BR',
      isbn: '978-85-359-0284-2',
      categories: [{ id: 'social', name: 'Literatura Social', icon: '⚖️' }],
      source: 'local'
    },
    {
      id: '9',
      title: 'Vidas Secas',
      authors: ['Graciliano Ramos'],
      author: 'Graciliano Ramos',
      coverUrl: 'https://images.unsplash.com/photo-1667408521317-bef962a97098?w=300&h=400&fit=crop',
      description: 'Retrata a vida de uma família sertaneja em sua luta pela sobrevivência no árido sertão nordestino.',
      publishedDate: '1938',
      pages: 176,
      rating: 4.4,
      genres: ['Romance', 'Literatura Brasileira', 'Regionalismo'],
      publisher: 'José Olympio',
      language: 'pt-BR',
      isbn: '978-85-209-2630-7',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '10',
      title: 'A Moreninha',
      authors: ['Joaquim Manuel de Macedo'],
      author: 'Joaquim Manuel de Macedo',
      coverUrl: 'https://images.unsplash.com/photo-1674154642704-0a4f0bdcb676?w=300&h=400&fit=crop',
      description: 'Primeiro romance brasileiro de sucesso, conta a história de amor entre Augusto e Carolina.',
      publishedDate: '1844',
      pages: 144,
      rating: 3.9,
      genres: ['Romance', 'Literatura Brasileira', 'Romantismo'],
      publisher: 'Paula Brito',
      language: 'pt-BR',
      isbn: '978-85-08-10923-8',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '11',
      title: 'Triste Fim de Policarpo Quaresma',
      authors: ['Lima Barreto'],
      author: 'Lima Barreto',
      coverUrl: 'https://images.unsplash.com/photo-1615413833480-6e8427dbcc5e?w=300&h=400&fit=crop',
      description: 'Crítica social através da história de um patriota idealista que enfrenta a dura realidade brasileira.',
      publishedDate: '1915',
      pages: 256,
      rating: 4.3,
      genres: ['Romance', 'Literatura Brasileira', 'Pré-Modernismo'],
      publisher: 'Revista dos Tribunaes',
      language: 'pt-BR',
      isbn: '978-85-08-09846-3',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '12',
      title: 'Memórias de um Sargento de Milícias',
      authors: ['Manuel Antônio de Almeida'],
      author: 'Manuel Antônio de Almeida',
      coverUrl: 'https://images.unsplash.com/photo-1631691971525-3f4b54255fea?w=300&h=400&fit=crop',
      description: 'Romance de costumes que retrata o Rio de Janeiro do século XIX através das aventuras de Leonardo.',
      publishedDate: '1854',
      pages: 288,
      rating: 4.0,
      genres: ['Romance', 'Literatura Brasileira', 'Romance de Costumes'],
      publisher: 'Tipografia Brasiliense',
      language: 'pt-BR',
      isbn: '978-85-08-16458-9',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    }
    ,
    {
      id: '13',
      title: 'O Primo Basílio',
      authors: ['Eça de Queirós'],
      author: 'Eça de Queirós',
      coverUrl: 'https://images.unsplash.com/photo-1529654069718-5e1423a32b7b?w=300&h=400&fit=crop',
      description: 'Romance realista que critica a sociedade lisboeta do século XIX.',
      publishedDate: '1878',
      pages: 320,
      rating: 4.0,
      genres: ['Romance', 'Realismo'],
      publisher: 'Livraria Chardron',
      language: 'pt-BR',
      isbn: '978-85-359-0290-0',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '14',
      title: 'Os Sertões',
      authors: ['Euclides da Cunha'],
      author: 'Euclides da Cunha',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      description: 'Relato e análise da Guerra de Canudos e do sertão nordestino.',
      publishedDate: '1902',
      pages: 512,
      rating: 4.5,
      genres: ['Ensaios', 'História'],
      publisher: 'Garnier',
      language: 'pt-BR',
      isbn: '978-85-359-0291-7',
      categories: [{ id: 'classicos', name: 'Clássicos', icon: '📚' }],
      source: 'local'
    },
    {
      id: '15',
      title: '1984',
      authors: ['George Orwell'],
      author: 'George Orwell',
      coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop',
      description: 'Distopia clássica sobre vigilância e autoritarismo.',
      publishedDate: '1949',
      pages: 328,
      rating: 4.6,
      genres: ['Ficção', 'Distopia'],
      publisher: 'Secker & Warburg',
      language: 'en',
      isbn: '978-0-452-28423-4',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    },
    {
      id: '16',
      title: 'Grande Gatsby',
      authors: ['F. Scott Fitzgerald'],
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop',
      description: 'Retrato da alta sociedade americana nos anos 1920.',
      publishedDate: '1925',
      pages: 180,
      rating: 4.2,
      genres: ['Ficção', 'Clássico'],
      publisher: 'Charles Scribner\'s Sons',
      language: 'en',
      isbn: '978-0-7432-7356-5',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    },
    {
      id: '17',
      title: 'Cem Anos de Solidão',
      authors: ['Gabriel García Márquez'],
      author: 'Gabriel García Márquez',
      coverUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&h=400&fit=crop',
      description: 'Saga da família Buendía na mítica Macondo.',
      publishedDate: '1967',
      pages: 417,
      rating: 4.7,
      genres: ['Ficção', 'Realismo Mágico'],
      publisher: 'Editorial Sudamericana',
      language: 'es',
      isbn: '978-0-06-088328-7',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    },
    {
      id: '18',
      title: 'O Pequeno Príncipe',
      authors: ['Antoine de Saint-Exupéry'],
      author: 'Antoine de Saint-Exupéry',
      coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
      description: 'Um conto poético e filosófico para todas as idades.',
      publishedDate: '1943',
      pages: 96,
      rating: 4.8,
      genres: ['Infantil', 'Fábula'],
      publisher: 'Reynal & Hitchcock',
      language: 'fr',
      isbn: '978-0-15-601219-5',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    },
    {
      id: '19',
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      authors: ['J.R.R. Tolkien'],
      author: 'J.R.R. Tolkien',
      coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop',
      description: 'A primeira parte da épica trilogia de fantasia.',
      publishedDate: '1954',
      pages: 423,
      rating: 4.9,
      genres: ['Fantasia', 'Aventura'],
      publisher: 'Allen & Unwin',
      language: 'en',
      isbn: '978-0-618-00222-8',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    },
    {
      id: '20',
      title: 'A Metamorfose',
      authors: ['Franz Kafka'],
      author: 'Franz Kafka',
      coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop',
      description: 'Conto sobre alienação e transformação.',
      publishedDate: '1915',
      pages: 74,
      rating: 4.1,
      genres: ['Ficção', 'Modernismo'],
      publisher: 'Kurt Wolff Verlag',
      language: 'de',
      isbn: '978-0-14-310524-4',
      categories: [{ id: 'ficcao', name: 'Ficção', icon: '📖' }],
      source: 'local'
    }
    ,
    {
      id: '21',
      title: 'Ensaios de um Observador',
      authors: ['Autor Exemplar'],
      author: 'Autor Exemplar',
      coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
      description: 'Uma coletânea fictícia de ensaios que refletem sobre cultura, tempo e memória.',
      publishedDate: '2010',
      pages: 220,
      rating: 4.0,
      genres: ['Ensaio', 'Cultura'],
      publisher: 'Editora Exemplo',
      language: 'pt-BR',
      isbn: '978-85-000-0000-1',
      categories: [{ id: 'ensaio', name: 'Ensaio', icon: '✍️' }],
      source: 'local'
    },
    {
      id: '22',
      title: 'Pequenos Portos',
      authors: ['Mariana Costa'],
      author: 'Mariana Costa',
      coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop',
      description: 'Contos e ensaios sobre lugares e pessoas do litoral brasileiro.',
      publishedDate: '2018',
      pages: 176,
      rating: 4.2,
      genres: ['Ensaio', 'Contos'],
      publisher: 'Casa & Letras',
      language: 'pt-BR',
      isbn: '978-85-000-0000-2',
      categories: [{ id: 'ensaio', name: 'Ensaio', icon: '✍️' }],
      source: 'local'
    },
    {
      id: '23',
      title: 'Ensaios Sobre o Cotidiano',
      authors: ['Ricardo Alves'],
      author: 'Ricardo Alves',
      coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
      description: 'Reflexões curtas sobre hábitos, tecnologia e sociedade.',
      publishedDate: '2021',
      pages: 142,
      rating: 3.9,
      genres: ['Ensaio', 'Sociologia'],
      publisher: 'Observador',
      language: 'pt-BR',
      isbn: '978-85-000-0000-3',
      categories: [{ id: 'ensaio', name: 'Ensaio', icon: '✍️' }],
      source: 'local'
    },
    {
      id: '24',
      title: 'Manual do Viajante Imaginário',
      authors: ['Helena M.'],
      author: 'Helena M.',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      description: 'Um ensaio poético sobre viagens, memórias e a cidade.',
      publishedDate: '2015',
      pages: 198,
      rating: 4.1,
      genres: ['Ensaio', 'Poesia'],
      publisher: 'Rota Editorial',
      language: 'pt-BR',
      isbn: '978-85-000-0000-4',
      categories: [{ id: 'ensaio', name: 'Ensaio', icon: '✍️' }],
      source: 'local'
    }
  ];

  private categories = [
    { id: 'classicos', name: 'Clássicos' },
    { id: 'teatro', name: 'Teatro' },
    { id: 'modernismo', name: 'Modernismo' },
    { id: 'social', name: 'Literatura Social' },
    { id: 'romance', name: 'Romance' },
    { id: 'ficcao', name: 'Ficção' }
    , { id: 'ensaio', name: 'Ensaio' }
  ];

  async getAllBooks(): Promise<Book[]> {
    try {
      const googleBooks = await getPopularBooks(20);
      return [...this.mockBooks, ...googleBooks];
    } catch (error) {
      console.error('Error fetching Google Books:', error);
      return [...this.mockBooks];
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    // First try local mock books
    const localBook = this.mockBooks.find(book => book.id === id);
    if (localBook) {
      return localBook;
    }
    
    // Then try Google Books API
    try {
      const gb = await getGoogleBookById(id);
      return (gb as unknown) as Book | null;
    } catch (error) {
      console.error('Error fetching book by ID:', error);
      return null;
    }
  }

  async getFeaturedBooks(): Promise<Book[]> {
    try {
      const googleBooks = await getGoogleFeaturedBooks(4);
      const localBooks = this.mockBooks.slice(0, 2);
      return [...localBooks, ...googleBooks].slice(0, 8);
    } catch (error) {
      console.error('Error fetching featured books:', error);
      return this.mockBooks.slice(0, 4);
    }
  }

  async getTrendingBooks(): Promise<Book[]> {
    try {
      const googleBooks = await getGoogleTrendingBooks(6);
      const localBooks = this.mockBooks.slice(2, 4);
      return [...localBooks, ...googleBooks].slice(0, 8);
    } catch (error) {
      console.error('Error fetching trending books:', error);
      return this.mockBooks.slice(2, 6);
    }
  }

  async getBooksByCategory(categoryId: string): Promise<Book[]> {
    try {
      const localBooks = this.mockBooks.filter(book => 
        book.categories.some(cat => cat.id === categoryId)
      );
      const googleBooks = await getGoogleBooksByCategory(categoryId, 10);
      return [...localBooks, ...googleBooks];
    } catch (error) {
      console.error('Error fetching books by category:', error);
      return this.mockBooks.filter(book => 
        book.categories.some(cat => cat.id === categoryId)
      );
    }
  }

  async searchBooks(query: string): Promise<Book[]> {
    try {
      // Search in local books first
      const searchTerm = query.toLowerCase();
      const localResults = this.mockBooks.filter(book => 
        (book.title || '').toLowerCase().includes(searchTerm) ||
        (book.author || '').toLowerCase().includes(searchTerm) ||
        (book.description || '').toLowerCase().includes(searchTerm) ||
        (book.genres || []).some(genre => genre.toLowerCase().includes(searchTerm))
      );
      
      // Search in Google Books API
      const googleResults = await searchBooks(query, 15);
      
      // Combine results, prioritizing local books
      return [...localResults, ...googleResults];
    } catch (error) {
      console.error('Error searching books:', error);
      // Fallback to local search only
      const searchTerm = query.toLowerCase();
      return this.mockBooks.filter(book => 
        (book.title || '').toLowerCase().includes(searchTerm) ||
        (book.author || '').toLowerCase().includes(searchTerm) ||
        (book.description || '').toLowerCase().includes(searchTerm) ||
        (book.genres || []).some(genre => genre.toLowerCase().includes(searchTerm))
      );
    }
  }

  async getUserBooks(userId: string): Promise<UserBook[]> {
    return this.userBooks.filter(userBook => userBook.userId === userId);
  }

  async getUserBooksByStatus(userId: string, status: ReadingStatus): Promise<UserBook[]> {
    return this.userBooks.filter(userBook => 
      userBook.userId === userId && userBook.status === status
    );
  }

  async addBookToUser(userId: string, bookId: string, status: ReadingStatus): Promise<UserBook> {
    // Check if book already exists for this user to prevent duplicates
    const existingUserBook = this.userBooks.find(
      ub => ub.userId === userId && ub.book.id === bookId
    );
    
    if (existingUserBook) {
      throw new Error('Book already in library');
    }

    const book = await this.getBookById(bookId);
    
    if (!book) {
      throw new Error('Book not found');
    }

    const userBook: UserBook = {
      id: `ub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      book,
      userId,
      status,
      progress: {
        currentPage: 0,
        totalPages: book.pages || 0,
        percentage: 0,
        lastReadAt: new Date(),
        timeSpentReading: 0
      },
      addedAt: new Date(),
      isFavorite: false
    };

    if (status === ReadingStatus.CURRENTLY_READING) {
      userBook.startedAt = new Date();
    }

    this.userBooks.push(userBook);
    return userBook;
  }

  async removeBookFromUser(userId: string, bookId: string): Promise<void> {
    this.userBooks = this.userBooks.filter(
      userBook => !(userBook.userId === userId && userBook.book.id === bookId)
    );
  }

  async updateUserBookProgress(userBookId: string, currentPage: number): Promise<UserBook> {
    const userBook = this.userBooks.find(ub => ub.id === userBookId);

    if (!userBook) {
      const alternativeUserBook = this.userBooks.find(ub => ub.book.id === userBookId);
      if (alternativeUserBook) {
  const totalPages = alternativeUserBook.progress?.totalPages || alternativeUserBook.book.pages || 0;
        const percentage = Math.min(100, Math.round((currentPage / (totalPages || 1)) * 100));

        alternativeUserBook.progress = {
          ...(alternativeUserBook.progress || { totalPages: totalPages }),
          currentPage,
          percentage,
          lastReadAt: new Date()
        } as ReadingProgress;

        if (percentage >= 100 && alternativeUserBook.status !== ReadingStatus.READ) {
          alternativeUserBook.status = ReadingStatus.READ;
          alternativeUserBook.finishedAt = new Date();
        }

        return alternativeUserBook;
      }

      throw new Error('User book not found - book may not be in library');
    }

  const totalPages = userBook.progress?.totalPages || userBook.book.pages || 0;
    const percentage = Math.min(100, Math.round((currentPage / (totalPages || 1)) * 100));

    userBook.progress = {
      ...(userBook.progress || { totalPages: totalPages }),
      currentPage,
      percentage,
      lastReadAt: new Date()
    } as ReadingProgress;

    if (percentage >= 100 && userBook.status !== ReadingStatus.READ) {
      userBook.status = ReadingStatus.READ;
      userBook.finishedAt = new Date();
    }

    return userBook;
  }

  async getBookContent(book: Book): Promise<string> {
    // Generate sample content for demonstration
    return `${book.title}
Por ${book.author}

Este é um modo de demonstração do Eclipse Reads.

${book.description}

Esta é uma amostra do conteúdo disponível. 

---

CAPÍTULO I

A história de "${book.title}" nos transporta para um mundo fascinante, onde cada página revela aspectos únicos da narrativa criada por ${book.author}.

---

CAPÍTULO II

Os eventos se desenrolam de maneira envolvente, mostrando a maestria literária que torna esta obra especial.

---

[Demonstração - Eclipse Reads]`;
  }

  async updateUserBookStatus(userBookId: string, status: ReadingStatus): Promise<UserBook> {
    const userBook = this.userBooks.find(ub => ub.id === userBookId);
    
    if (!userBook) {
      throw new Error('User book not found');
    }

    const oldStatus = userBook.status;
    userBook.status = status;

    if (status === ReadingStatus.CURRENTLY_READING && oldStatus !== ReadingStatus.CURRENTLY_READING) {
      userBook.startedAt = new Date();
    } else if (status === ReadingStatus.READ && oldStatus !== ReadingStatus.READ) {
      userBook.finishedAt = new Date();
      userBook.completedAt = new Date();
      // Ensure progress exists
      if (!userBook.progress) {
        userBook.progress = {
          currentPage: userBook.book.pages || 0,
          totalPages: userBook.book.pages || 0,
          percentage: 100,
          lastReadAt: new Date(),
          timeSpentReading: 0
        } as ReadingProgress;
      } else {
  userBook.progress.currentPage = userBook.progress.totalPages || userBook.book.pages || 0;
        userBook.progress.percentage = 100;
      }
    }

    return userBook;
  }

  async toggleUserBookFavorite(userBookId: string): Promise<UserBook> {
    const userBook = this.userBooks.find(ub => ub.id === userBookId);
    
    if (!userBook) {
      throw new Error('User book not found');
    }

    userBook.isFavorite = !userBook.isFavorite;
    return userBook;
  }

  // Helper method to get all available categories
  getAvailableCategories() {
    return this.categories;
  }
}