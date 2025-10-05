export interface Book {
  id: string;
  title: string;
  author?: string;
  authors: string[]; // For compatibility with Supabase
  description: string;
  genre?: string;
  genres?: string[]; // For Google Books API compatibility
  pages?: number;
  pageCount?: number; // For compatibility with Supabase
  rating: number;
  publishedYear?: number;
  publishedDate?: string; // For Google Books API compatibility
  isbn?: string;
  coverUrl?: string;
  categories: Category[];
  language?: string;
  publisher?: string;
  source?: 'openlibrary' | 'gutenberg' | 'manybooks' | 'dominiopublico' | 'local' | 'elivros' | 'baixelivros' | 'biblion' | 'dominio_publico' | 'obras_raras_usp' | 'project_gutenberg' | 'open_library' | 'online_books_page' | 'bookbub' | 'google-books';
  externalId?: string;
  textUrl?: string;
  isPublicDomain?: boolean;
  formats?: string[]; // Available formats: PDF, EPUB, MOBI, TXT, HTML, DOC
  // Google Books API specific fields
  previewLink?: string;
  infoLink?: string;
  // Supabase/Library specific fields
  status?: ReadingStatus;
  progress?: number;
  notes?: string;
  addedAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon: string;
}

export interface UserBook {
  id: string;
  bookId?: string;
  book: Book;
  userId: string;
  status: ReadingStatus;
  progress?: ReadingProgress;
  addedAt: Date | string;
  startedAt?: Date;
  finishedAt?: Date;
  completedAt?: Date; // When book was marked as completed
  rating?: number;
  review?: string;
  notes?: string;
  bookContent?: string; // For downloaded book text content
  isFavorite?: boolean; // Track if book is favorited
  currentPage?: number; // Alternative to progress for simple tracking
}

export enum ReadingStatus {
  WANT_TO_READ = 'want_to_read',
  CURRENTLY_READING = 'currently_reading',
  READ = 'read'
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: Date;
  timeSpentReading: number; // in minutes
}

export interface ReadingNote {
  id: string;
  content: string;
  page: number;
  createdAt: Date;
}