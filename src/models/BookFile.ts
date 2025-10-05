export interface BookFile {
  id: string;
  bookId: string;
  type: 'pdf' | 'epub' | 'mobi';
  filename: string;
  fileSize: number;
  uploadDate: Date;
  filePath: string;
  chapters: BookChapter[];
}

export interface BookChapter {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  wordCount: number;
  readingTime: number; // in minutes
}

export interface ReadingProgress {
  currentChapter: number;
  currentPage: number;
  chaptersCompleted: number;
  totalChapters: number;
  percentage: number;
  lastReadAt: Date;
  bookmarks: Bookmark[];
}

export interface Bookmark {
  id: string;
  chapterIndex: number;
  pageNumber: number;
  note?: string;
  createdAt: Date;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime?: Date;
  chaptersRead: number;
  pagesRead: number;
  totalTime: number; // in minutes
}