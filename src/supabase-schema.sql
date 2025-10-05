-- Eclipse Reads - Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security (RLS) policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 1. Books table - Stores all books from Google Books API
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    description TEXT,
    cover_url TEXT,
    language TEXT DEFAULT 'pt',
    publisher TEXT,
    published_date TEXT,
    page_count INTEGER,
    categories TEXT,
    isbn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read books
CREATE POLICY "Anyone can view books" ON public.books
FOR SELECT USING (true);

-- RLS Policy: Anyone can insert books (for API integration)
CREATE POLICY "Anyone can insert books" ON public.books
FOR INSERT WITH CHECK (true);

-- RLS Policy: Anyone can update books (for API integration)
CREATE POLICY "Anyone can update books" ON public.books
FOR UPDATE USING (true);

-- 2. User Books table - Stores user's personal library
CREATE TABLE IF NOT EXISTS public.user_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id TEXT REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('want_to_read', 'currently_reading', 'read')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Enable RLS for user_books table
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own books
CREATE POLICY "Users can view own books" ON public.user_books
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own books
CREATE POLICY "Users can insert own books" ON public.user_books
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own books
CREATE POLICY "Users can update own books" ON public.user_books
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own books
CREATE POLICY "Users can delete own books" ON public.user_books
FOR DELETE USING (auth.uid() = user_id);

-- 3. Reading Sessions table - Track reading sessions and progress
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id TEXT REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    pages_read INTEGER DEFAULT 0,
    progress_before INTEGER DEFAULT 0,
    progress_after INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reading_sessions table
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own reading sessions
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own reading sessions
CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own reading sessions
CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own reading sessions
CREATE POLICY "Users can delete own reading sessions" ON public.reading_sessions
FOR DELETE USING (auth.uid() = user_id);

-- 4. User Preferences table - Store user app preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    reading_goal INTEGER DEFAULT 0,
    notifications_enabled BOOLEAN DEFAULT true,
    reading_reminders BOOLEAN DEFAULT false,
    reminder_time TIME DEFAULT '20:00:00',
    preferred_language TEXT DEFAULT 'pt',
    book_display_mode TEXT DEFAULT 'grid' CHECK (book_display_mode IN ('grid', 'list')),
    books_per_page INTEGER DEFAULT 20 CHECK (books_per_page > 0),
    privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('public', 'friends', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
FOR DELETE USING (auth.uid() = user_id);

-- 5. Book Reviews table - User reviews and ratings
CREATE TABLE IF NOT EXISTS public.book_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id TEXT REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Enable RLS for book_reviews table
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view public reviews and their own reviews
CREATE POLICY "Users can view public reviews and own reviews" ON public.book_reviews
FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policy: Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.book_reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.book_reviews
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.book_reviews
FOR DELETE USING (auth.uid() = user_id);

-- 6. Reading Statistics table - Track reading stats per user
CREATE TABLE IF NOT EXISTS public.reading_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_books_read INTEGER DEFAULT 0,
    total_pages_read INTEGER DEFAULT 0,
    total_reading_time INTEGER DEFAULT 0, -- in minutes
    books_read_this_year INTEGER DEFAULT 0,
    pages_read_this_year INTEGER DEFAULT 0,
    reading_streak INTEGER DEFAULT 0, -- days
    longest_reading_streak INTEGER DEFAULT 0,
    favorite_genre TEXT,
    average_rating DECIMAL(3,2),
    last_reading_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reading_statistics table
ALTER TABLE public.reading_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own statistics
CREATE POLICY "Users can view own statistics" ON public.reading_statistics
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own statistics
CREATE POLICY "Users can insert own statistics" ON public.reading_statistics
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own statistics
CREATE POLICY "Users can update own statistics" ON public.reading_statistics
FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_authors ON public.books(authors);
CREATE INDEX IF NOT EXISTS idx_books_categories ON public.books(categories);
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON public.user_books(book_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON public.user_books(status);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON public.reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON public.book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_public ON public.book_reviews(is_public);

-- Create functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_books_updated_at BEFORE UPDATE ON public.user_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_reviews_updated_at BEFORE UPDATE ON public.book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_statistics_updated_at BEFORE UPDATE ON public.reading_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize user preferences and statistics when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default preferences for new user
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- Insert default reading statistics for new user
    INSERT INTO public.reading_statistics (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically setup new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert some sample data (optional)
-- You can uncomment this to have some test data

/*
-- Sample books
INSERT INTO public.books (id, title, authors, description, language, categories) VALUES
('sample_1', 'Dom Casmurro', 'Machado de Assis', 'Um dos maiores clássicos da literatura brasileira.', 'pt', 'Ficção, Clássicos'),
('sample_2', 'O Cortiço', 'Aluísio Azevedo', 'Romance naturalista brasileiro do século XIX.', 'pt', 'Ficção, Clássicos'),
('sample_3', 'Capitães da Areia', 'Jorge Amado', 'Romance sobre meninos de rua em Salvador.', 'pt', 'Ficção, Literatura Brasileira');
*/

-- Success message
SELECT 'Eclipse Reads database schema created successfully!' as message;