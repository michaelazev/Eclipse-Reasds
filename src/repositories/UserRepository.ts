import { User, UserStatistics } from '../models/User';

export interface UserRepository {
  getCurrentUser(): Promise<User | null>;
  createGuestUser(): Promise<User>;
  createUser(email: string, name: string): Promise<User>;
  updateUser(user: Partial<User>): Promise<User>;
  getUserStatistics(userId: string): Promise<UserStatistics>;
  updateUserStatistics(userId: string, stats: Partial<UserStatistics>): Promise<UserStatistics>;
}

export class MockUserRepository implements UserRepository {
  private currentUser: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async createGuestUser(): Promise<User> {
    this.currentUser = {
      id: 'guest_' + Date.now(),
      name: 'Usuário Convidado',
      email: 'guest@eclipsereads.com',
      avatar: undefined,
      createdAt: new Date(),
      accountType: 'guest',
      limitations: {
        maxBooks: 5,
        currentBookCount: 0
      },
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          dailyReminder: false,
          weeklyProgress: false,
          newRecommendations: false
        },
        readingGoals: {
          booksPerYear: 12,
          minutesPerDay: 15,
          chaptersPerDay: 1,
          chaptersPerWeek: 7,
          chaptersPerMonth: 30
        }
      },
      statistics: {
        booksRead: 0,
        currentlyReading: 0,
        favorites: 0,
        toReadCount: 0,
        droppedCount: 0,
        booksLiked: 0,
        chaptersRead: 0,
        totalReadingTime: 0,
        streak: 0,
        currentStreak: 0,
        longestStreak: 0,
        chaptersReadToday: 0,
        chaptersReadThisWeek: 0,
        chaptersReadThisMonth: 0,
        readingTimeToday: 0,
        favoriteGenre: 'Ficção'
      }
    };
    return this.currentUser;
  }

  async createUser(email: string, name: string): Promise<User> {
    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new Error('Email inválido');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Nome inválido');
    }

    // Create new registered user
    this.currentUser = {
      id: 'user_' + Date.now(),
      name: name,
      email: email,
      avatar: undefined,
      createdAt: new Date(),
      accountType: 'registered',
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          dailyReminder: true,
          weeklyProgress: true,
          newRecommendations: true
        },
        readingGoals: {
          booksPerYear: 12,
          minutesPerDay: 30,
          chaptersPerDay: 2,
          chaptersPerWeek: 14,
          chaptersPerMonth: 60
        }
      },
      statistics: {
        booksRead: 0,
        currentlyReading: 0,
        favorites: 0,
        toReadCount: 0,
        droppedCount: 0,
        booksLiked: 0,
        chaptersRead: 0,
        totalReadingTime: 0,
        streak: 0,
        currentStreak: 0,
        longestStreak: 0,
        chaptersReadToday: 0,
        chaptersReadThisWeek: 0,
        chaptersReadThisMonth: 0,
        readingTimeToday: 0,
        favoriteGenre: 'Ficção'
      }
    };
    return this.currentUser;
  }

  async updateUser(user: Partial<User>): Promise<User> {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...user };
    }
    return this.currentUser!;
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const user = await this.getCurrentUser();
    return user?.statistics || {
      booksRead: 0,
      currentlyReading: 0,
      favorites: 0,
      toReadCount: 0,
      droppedCount: 0,
      booksLiked: 0,
      chaptersRead: 0,
      totalReadingTime: 0,
      streak: 0,
      favoriteGenre: 'Ficção'
    };
  }

  async updateUserStatistics(userId: string, stats: Partial<UserStatistics>): Promise<UserStatistics> {
    const user = await this.getCurrentUser();
    if (user) {
      user.statistics = { ...user.statistics, ...stats };
    }
    return user!.statistics;
  }

  async loginUser(email: string, password: string): Promise<User> {
    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new Error('Email inválido');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Senha inválida');
    }

    // Mock login - in real app, would authenticate with backend
    const emailName = email.includes('@') ? email.split('@')[0] : 'Usuário';
    
    this.currentUser = {
      id: '1',
      name: emailName,
      email: email,
      avatar: undefined,
      createdAt: new Date(),
      accountType: 'premium',
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          dailyReminder: true,
          weeklyProgress: true,
          newRecommendations: false
        },
        readingGoals: {
          booksPerYear: 24,
          minutesPerDay: 30,
          chaptersPerDay: 2,
          chaptersPerWeek: 14,
          chaptersPerMonth: 60
        }
      },
      statistics: {
        booksRead: 0,
        currentlyReading: 0,
        favorites: 0,
        toReadCount: 0,
        droppedCount: 0,
        booksLiked: 0,
        chaptersRead: 0,
        totalReadingTime: 0,
        streak: 0,
        currentStreak: 0,
        longestStreak: 0,
        chaptersReadToday: 0,
        chaptersReadThisWeek: 0,
        chaptersReadThisMonth: 0,
        readingTimeToday: 0,
        favoriteGenre: 'Ficção'
      }
    };
    return this.currentUser;
  }
}