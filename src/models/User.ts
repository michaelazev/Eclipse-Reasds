export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  avatar?: string;
  banner?: string;
  createdAt: Date;
  preferences: UserPreferences;
  statistics: UserStatistics;
  accountType: 'guest' | 'registered' | 'premium';
  planType?: 'basico' | 'premium' | 'familia';
  limitations?: UserLimitations;
}

export interface UserLimitations {
  maxBooks: number;
  currentBookCount: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  readingGoals: ReadingGoals;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  weeklyProgress: boolean;
  newRecommendations: boolean;
}

export interface ReadingGoals {
  booksPerYear: number;
  minutesPerDay: number;
  chaptersPerDay?: number;
  chaptersPerWeek?: number;
  chaptersPerMonth?: number;
}

export interface UserStatistics {
  booksRead: number;
  currentlyReading: number;
  favorites: number;
  toReadCount: number;
  droppedCount: number;
  booksLiked: number;
  chaptersRead: number;
  totalReadingTime: number; // in minutes
  streak: number; // days
  currentStreak?: number;
  longestStreak?: number;
  chaptersReadToday?: number;
  chaptersReadThisWeek?: number;
  chaptersReadThisMonth?: number;
  readingTimeToday?: number;
  favoriteGenre: string;
}