-- =====================================================
-- ECLIPSE READS - SCHEMA COMPLETO DO SUPABASE
-- =====================================================
-- Este arquivo contém todas as tabelas, triggers, funções
-- e políticas RLS necessárias para o Eclipse Reads funcionar
-- =====================================================

-- EXTENSÕES NECESSÁRIAS
-- =====================================================
create extension if not exists "uuid-ossp";

-- TABELA: profiles (Perfis dos usuários)
-- =====================================================
-- Armazena informações adicionais dos usuários além do auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  nickname text,
  email text unique,
  avatar text,
  banner text,
  account_type text not null default 'registered' check (account_type in ('guest', 'registered', 'premium')),
  plan_type text check (plan_type in ('basico', 'premium', 'familia')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para melhor performance
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_account_type_idx on public.profiles(account_type);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Políticas RLS para profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Perfis são públicos para leitura"
  on public.profiles for select
  using (true);

-- TABELA: user_preferences (Preferências do usuário)
-- =====================================================
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  theme text not null default 'light' check (theme in ('light', 'dark', 'system', 'night')),
  language text not null default 'pt-BR',
  
  -- Notificações
  daily_reminder boolean default true,
  weekly_progress boolean default true,
  new_recommendations boolean default true,
  
  -- Metas de leitura
  books_per_year integer default 12,
  minutes_per_day integer default 30,
  chapters_per_day integer,
  chapters_per_week integer,
  chapters_per_month integer,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists user_preferences_user_id_idx on public.user_preferences(user_id);

-- RLS
alter table public.user_preferences enable row level security;

create policy "Usuários podem ver suas próprias preferências"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias preferências"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias preferências"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- TABELA: user_statistics (Estatísticas do usuário)
-- =====================================================
create table if not exists public.user_statistics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  
  -- Estatísticas de livros
  books_read integer default 0,
  currently_reading integer default 0,
  favorites integer default 0,
  to_read_count integer default 0,
  dropped_count integer default 0,
  books_liked integer default 0,
  
  -- Estatísticas de leitura
  chapters_read integer default 0,
  total_reading_time integer default 0, -- em minutos
  
  -- Streaks (sequências)
  streak integer default 0, -- dias consecutivos lendo
  current_streak integer default 0,
  longest_streak integer default 0,
  
  -- Estatísticas diárias/semanais/mensais
  chapters_read_today integer default 0,
  chapters_read_this_week integer default 0,
  chapters_read_this_month integer default 0,
  reading_time_today integer default 0, -- em minutos
  
  -- Preferências
  favorite_genre text default 'Ficção',
  
  -- Timestamps
  last_read_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists user_statistics_user_id_idx on public.user_statistics(user_id);
create index if not exists user_statistics_last_read_date_idx on public.user_statistics(last_read_date);

-- RLS
alter table public.user_statistics enable row level security;

create policy "Usuários podem ver suas próprias estatísticas"
  on public.user_statistics for select
  using (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias estatísticas"
  on public.user_statistics for update
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias estatísticas"
  on public.user_statistics for insert
  with check (auth.uid() = user_id);

-- TABELA: books (Livros)
-- =====================================================
create table if not exists public.books (
  id text primary key,
  title text not null,
  authors text not null,
  description text,
  cover_url text,
  language text default 'pt',
  publisher text,
  published_date text,
  page_count integer,
  categories text,
  isbn text,
  
  -- Campos adicionais
  rating numeric(3,2) default 0.0,
  preview_link text,
  info_link text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists books_title_idx on public.books(title);
create index if not exists books_authors_idx on public.books(authors);
create index if not exists books_isbn_idx on public.books(isbn);
create index if not exists books_language_idx on public.books(language);

-- RLS
alter table public.books enable row level security;

create policy "Livros são públicos para leitura"
  on public.books for select
  using (true);

create policy "Apenas usuários autenticados podem adicionar livros"
  on public.books for insert
  with check (auth.uid() is not null);

create policy "Apenas usuários autenticados podem atualizar livros"
  on public.books for update
  using (auth.uid() is not null);

-- TABELA: user_books (Biblioteca do usuário)
-- =====================================================
create table if not exists public.user_books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text references public.books(id) on delete cascade not null,
  
  -- Status e progresso
  status text not null check (status in ('want_to_read', 'currently_reading', 'read')),
  progress integer default 0,
  current_page integer default 0,
  
  -- Favoritos e notas
  is_favorite boolean default false,
  notes text,
  review text,
  rating integer check (rating >= 1 and rating <= 5),
  
  -- Timestamps
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint para evitar duplicatas
  unique(user_id, book_id)
);

-- Índices
create index if not exists user_books_user_id_idx on public.user_books(user_id);
create index if not exists user_books_book_id_idx on public.user_books(book_id);
create index if not exists user_books_status_idx on public.user_books(status);
create index if not exists user_books_is_favorite_idx on public.user_books(is_favorite);

-- RLS
alter table public.user_books enable row level security;

create policy "Usuários podem ver seus próprios livros"
  on public.user_books for select
  using (auth.uid() = user_id);

create policy "Usuários podem adicionar livros à sua biblioteca"
  on public.user_books for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios livros"
  on public.user_books for update
  using (auth.uid() = user_id);

create policy "Usuários podem remover seus próprios livros"
  on public.user_books for delete
  using (auth.uid() = user_id);

-- TABELA: reading_sessions (Sessões de leitura)
-- =====================================================
-- Rastreia sessões individuais de leitura para estatísticas
create table if not exists public.reading_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text references public.books(id) on delete cascade not null,
  
  -- Dados da sessão
  pages_read integer default 0,
  chapters_read integer default 0,
  duration_minutes integer default 0,
  start_page integer,
  end_page integer,
  
  -- Timestamps
  session_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists reading_sessions_user_id_idx on public.reading_sessions(user_id);
create index if not exists reading_sessions_book_id_idx on public.reading_sessions(book_id);
create index if not exists reading_sessions_session_date_idx on public.reading_sessions(session_date);

-- RLS
alter table public.reading_sessions enable row level security;

create policy "Usuários podem ver suas próprias sessões"
  on public.reading_sessions for select
  using (auth.uid() = user_id);

create policy "Usuários podem criar suas próprias sessões"
  on public.reading_sessions for insert
  with check (auth.uid() = user_id);

-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_user_statistics_updated_at on public.user_statistics;
create trigger set_user_statistics_updated_at
  before update on public.user_statistics
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
  before update on public.books
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_user_books_updated_at on public.user_books;
create trigger set_user_books_updated_at
  before update on public.user_books
  for each row
  execute function public.handle_updated_at();

-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    'registered'
  );
  
  -- Criar preferências padrão
  insert into public.user_preferences (user_id)
  values (new.id);
  
  -- Criar estatísticas padrão
  insert into public.user_statistics (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Função para atualizar estatísticas quando um livro é adicionado/atualizado
create or replace function public.update_user_statistics_on_book_change()
returns trigger as $$
declare
  stats_record record;
begin
  -- Buscar estatísticas atuais
  select * into stats_record
  from public.user_statistics
  where user_id = coalesce(new.user_id, old.user_id);
  
  -- Se não existir, criar
  if not found then
    insert into public.user_statistics (user_id)
    values (coalesce(new.user_id, old.user_id));
    
    select * into stats_record
    from public.user_statistics
    where user_id = coalesce(new.user_id, old.user_id);
  end if;
  
  -- Atualizar contadores baseado no status
  update public.user_statistics
  set
    currently_reading = (
      select count(*) from public.user_books
      where user_id = stats_record.user_id and status = 'currently_reading'
    ),
    books_read = (
      select count(*) from public.user_books
      where user_id = stats_record.user_id and status = 'read'
    ),
    to_read_count = (
      select count(*) from public.user_books
      where user_id = stats_record.user_id and status = 'want_to_read'
    ),
    favorites = (
      select count(*) from public.user_books
      where user_id = stats_record.user_id and is_favorite = true
    ),
    books_liked = (
      select count(*) from public.user_books
      where user_id = stats_record.user_id and is_favorite = true
    ),
    updated_at = timezone('utc'::text, now())
  where user_id = stats_record.user_id;
  
  return new;
end;
$$ language plpgsql;

-- Triggers para atualizar estatísticas
drop trigger if exists update_stats_on_user_book_insert on public.user_books;
create trigger update_stats_on_user_book_insert
  after insert on public.user_books
  for each row
  execute function public.update_user_statistics_on_book_change();

drop trigger if exists update_stats_on_user_book_update on public.user_books;
create trigger update_stats_on_user_book_update
  after update on public.user_books
  for each row
  execute function public.update_user_statistics_on_book_change();

drop trigger if exists update_stats_on_user_book_delete on public.user_books;
create trigger update_stats_on_user_book_delete
  after delete on public.user_books
  for each row
  execute function public.update_user_statistics_on_book_change();

-- Função para atualizar streak (sequência de leitura)
create or replace function public.update_reading_streak()
returns void as $$
declare
  user_record record;
  days_since_last_read integer;
begin
  for user_record in select * from public.user_statistics loop
    if user_record.last_read_date is not null then
      days_since_last_read := current_date - user_record.last_read_date;
      
      if days_since_last_read = 0 then
        -- Leu hoje, manter streak
        continue;
      elsif days_since_last_read = 1 then
        -- Leu ontem, incrementar streak
        update public.user_statistics
        set
          streak = streak + 1,
          current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          updated_at = timezone('utc'::text, now())
        where user_id = user_record.user_id;
      else
        -- Quebrou a sequência
        update public.user_statistics
        set
          streak = 0,
          current_streak = 0,
          updated_at = timezone('utc'::text, now())
        where user_id = user_record.user_id;
      end if;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Função para registrar sessão de leitura
create or replace function public.record_reading_session(
  p_user_id uuid,
  p_book_id text,
  p_pages_read integer default 0,
  p_chapters_read integer default 0,
  p_duration_minutes integer default 0,
  p_start_page integer default null,
  p_end_page integer default null
)
returns uuid as $$
declare
  session_id uuid;
begin
  -- Criar sessão de leitura
  insert into public.reading_sessions (
    user_id,
    book_id,
    pages_read,
    chapters_read,
    duration_minutes,
    start_page,
    end_page
  ) values (
    p_user_id,
    p_book_id,
    p_pages_read,
    p_chapters_read,
    p_duration_minutes,
    p_start_page,
    p_end_page
  )
  returning id into session_id;
  
  -- Atualizar estatísticas do usuário
  update public.user_statistics
  set
    chapters_read = chapters_read + p_chapters_read,
    total_reading_time = total_reading_time + p_duration_minutes,
    chapters_read_today = chapters_read_today + p_chapters_read,
    chapters_read_this_week = chapters_read_this_week + p_chapters_read,
    chapters_read_this_month = chapters_read_this_month + p_chapters_read,
    reading_time_today = reading_time_today + p_duration_minutes,
    last_read_date = current_date,
    updated_at = timezone('utc'::text, now())
  where user_id = p_user_id;
  
  return session_id;
end;
$$ language plpgsql security definer;

-- FUNÇÕES ÚTEIS PARA O APP
-- =====================================================

-- Função para buscar biblioteca completa do usuário com informações do livro
create or replace function public.get_user_library(p_user_id uuid)
returns table (
  user_book_id uuid,
  book_id text,
  title text,
  authors text,
  description text,
  cover_url text,
  page_count integer,
  categories text,
  status text,
  progress integer,
  current_page integer,
  is_favorite boolean,
  rating integer,
  notes text,
  added_at timestamp with time zone,
  updated_at timestamp with time zone
) as $$
begin
  return query
  select
    ub.id as user_book_id,
    b.id as book_id,
    b.title,
    b.authors,
    b.description,
    b.cover_url,
    b.page_count,
    b.categories,
    ub.status,
    ub.progress,
    ub.current_page,
    ub.is_favorite,
    ub.rating,
    ub.notes,
    ub.added_at,
    ub.updated_at
  from public.user_books ub
  join public.books b on b.id = ub.book_id
  where ub.user_id = p_user_id
  order by ub.updated_at desc;
end;
$$ language plpgsql security definer;

-- Função para buscar estatísticas do usuário
create or replace function public.get_user_dashboard_stats(p_user_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'booksRead', coalesce(books_read, 0),
    'currentlyReading', coalesce(currently_reading, 0),
    'favorites', coalesce(favorites, 0),
    'toReadCount', coalesce(to_read_count, 0),
    'chaptersRead', coalesce(chapters_read, 0),
    'totalReadingTime', coalesce(total_reading_time, 0),
    'streak', coalesce(current_streak, 0),
    'longestStreak', coalesce(longest_streak, 0),
    'favoriteGenre', coalesce(favorite_genre, 'Ficção')
  ) into result
  from public.user_statistics
  where user_id = p_user_id;
  
  return result;
end;
$$ language plpgsql security definer;

-- COMENTÁRIOS NAS TABELAS
-- =====================================================

comment on table public.profiles is 'Perfis dos usuários com informações adicionais';
comment on table public.user_preferences is 'Preferências e configurações do usuário';
comment on table public.user_statistics is 'Estatísticas de leitura do usuário';
comment on table public.books is 'Catálogo de livros disponíveis';
comment on table public.user_books is 'Biblioteca pessoal de cada usuário';
comment on table public.reading_sessions is 'Histórico de sessões de leitura para estatísticas detalhadas';

-- DADOS INICIAIS (OPCIONAL)
-- =====================================================
-- Você pode adicionar alguns dados de exemplo aqui se desejar

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
-- Para executar este schema:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole todo este conteúdo
-- 4. Execute
-- 
-- Para configurar autenticação Google:
-- 1. Vá em Authentication > Providers
-- 2. Habilite Google
-- 3. Configure com suas credenciais OAuth do Google Cloud
-- 4. Adicione a URL de callback do Supabase nas configurações OAuth
-- =====================================================
