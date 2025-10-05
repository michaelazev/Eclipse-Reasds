import {
  BookFile,
  BookChapter,
  ReadingProgress,
  Bookmark,
  ReadingSession,
} from "../models/BookFile";

export class BookFileRepository {
  private bookFiles: BookFile[] = [];
  private readingProgress: Map<string, ReadingProgress> =
    new Map();
  private readingSessions: ReadingSession[] = [];

  constructor() {
    this.initializeSampleFiles();
  }

  private initializeSampleFiles() {
    // Sample book files - in production, these would be uploaded by admin
    const sampleFiles: BookFile[] = [
      {
        id: "1",
        bookId: "1",
        type: "epub",
        filename: "dom_casmurro.epub",
        fileSize: 1024000, // 1MB
        uploadDate: new Date("2024-01-15"),
        filePath: "/books/dom_casmurro.epub",
        chapters: [
          {
            id: "1-1",
            title: "Capítulo I - Do título",
            startPage: 1,
            endPage: 3,
            wordCount: 450,
            readingTime: 2,
          },
          {
            id: "1-2",
            title: "Capítulo II - Do livro",
            startPage: 4,
            endPage: 7,
            wordCount: 680,
            readingTime: 3,
          },
          {
            id: "1-3",
            title: "Capítulo III - A denúncia",
            startPage: 8,
            endPage: 12,
            wordCount: 890,
            readingTime: 4,
          },
          {
            id: "1-4",
            title: "Capítulo IV - Um dever amaríssimo",
            startPage: 13,
            endPage: 18,
            wordCount: 1020,
            readingTime: 5,
          },
        ],
      },
      {
        id: "2",
        bookId: "2",
        type: "pdf",
        filename: "o_cortico.pdf",
        fileSize: 2048000, // 2MB
        uploadDate: new Date("2024-01-20"),
        filePath: "/books/o_cortico.pdf",
        chapters: [
          {
            id: "2-1",
            title: "Capítulo I",
            startPage: 1,
            endPage: 8,
            wordCount: 1200,
            readingTime: 6,
          },
          {
            id: "2-2",
            title: "Capítulo II",
            startPage: 9,
            endPage: 16,
            wordCount: 1150,
            readingTime: 5,
          },
          {
            id: "2-3",
            title: "Capítulo III",
            startPage: 17,
            endPage: 25,
            wordCount: 1300,
            readingTime: 6,
          },
        ],
      },
    ];

    this.bookFiles = sampleFiles;
  }

  async getBookFile(bookId: string): Promise<BookFile | null> {
    return (
      this.bookFiles.find((file) => file.bookId === bookId) ||
      null
    );
  }

  async getBookChapters(
    bookId: string,
  ): Promise<BookChapter[]> {
    const bookFile = await this.getBookFile(bookId);
    return bookFile?.chapters || [];
  }

  async getReadingProgress(
    bookId: string,
    userId: string,
  ): Promise<ReadingProgress | null> {
    const key = `${userId}-${bookId}`;
    return this.readingProgress.get(key) || null;
  }

  async updateReadingProgress(
    bookId: string,
    userId: string,
    progress: Partial<ReadingProgress>,
  ): Promise<ReadingProgress> {
    const key = `${userId}-${bookId}`;
    const existing = this.readingProgress.get(key);
    const bookFile = await this.getBookFile(bookId);

    if (!bookFile) {
      throw new Error("Book file not found");
    }

    const updated: ReadingProgress = {
      currentChapter: 0,
      currentPage: 1,
      chaptersCompleted: 0,
      totalChapters: bookFile.chapters.length,
      percentage: 0,
      lastReadAt: new Date(),
      bookmarks: [],
      ...existing,
      ...progress,
    };

    // Calculate percentage based on completed chapters
    updated.percentage = Math.round(
      (updated.chaptersCompleted / updated.totalChapters) * 100,
    );

    this.readingProgress.set(key, updated);
    return updated;
  }

  async addBookmark(
    bookId: string,
    userId: string,
    bookmark: Omit<Bookmark, "id" | "createdAt">,
  ): Promise<Bookmark> {
    const key = `${userId}-${bookId}`;
    const progress = this.readingProgress.get(key);

    if (!progress) {
      throw new Error("Reading progress not found");
    }

    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      ...bookmark,
    };

    progress.bookmarks.push(newBookmark);
    this.readingProgress.set(key, progress);

    return newBookmark;
  }

  async removeBookmark(
    bookId: string,
    userId: string,
    bookmarkId: string,
  ): Promise<boolean> {
    const key = `${userId}-${bookId}`;
    const progress = this.readingProgress.get(key);

    if (!progress) {
      return false;
    }

    const index = progress.bookmarks.findIndex(
      (b) => b.id === bookmarkId,
    );
    if (index === -1) {
      return false;
    }

    progress.bookmarks.splice(index, 1);
    this.readingProgress.set(key, progress);

    return true;
  }

  async startReadingSession(
    bookId: string,
    userId: string,
  ): Promise<ReadingSession> {
    const session: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      startTime: new Date(),
      chaptersRead: 0,
      pagesRead: 0,
      totalTime: 0,
    };

    this.readingSessions.push(session);
    return session;
  }

  async endReadingSession(
    sessionId: string,
    chaptersRead: number,
    pagesRead: number,
  ): Promise<ReadingSession | null> {
    const session = this.readingSessions.find(
      (s) => s.id === sessionId,
    );

    if (!session) {
      return null;
    }

    session.endTime = new Date();
    session.chaptersRead = chaptersRead;
    session.pagesRead = pagesRead;
    session.totalTime = Math.floor(
      (session.endTime.getTime() -
        session.startTime.getTime()) /
        1000 /
        60,
    ); // minutes

    return session;
  }

  async getReadingSessions(
    bookId: string,
    userId: string,
  ): Promise<ReadingSession[]> {
    return this.readingSessions.filter(
      (s) => s.bookId === bookId,
    );
  }

  // Admin functions for file management
  async uploadBookFile(
    file: Omit<BookFile, "id" | "uploadDate">,
  ): Promise<BookFile> {
    const newFile: BookFile = {
      id: Math.random().toString(36).substr(2, 9),
      uploadDate: new Date(),
      ...file,
    };

    this.bookFiles.push(newFile);
    return newFile;
  }

  async deleteBookFile(fileId: string): Promise<boolean> {
    const index = this.bookFiles.findIndex(
      (f) => f.id === fileId,
    );
    if (index === -1) {
      return false;
    }

    this.bookFiles.splice(index, 1);
    return true;
  }

  async getAllBookFiles(): Promise<BookFile[]> {
    return [...this.bookFiles];
  }
}