# Configuração do Supabase para Eclipse Reads

## Tabelas necessárias

### 1. Tabela `books`

```sql
CREATE TABLE books (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    authors TEXT NOT NULL,
    description TEXT,
    cover_url VARCHAR,
    language VARCHAR DEFAULT 'pt',
    publisher VARCHAR,
    published_date VARCHAR,
    page_count INTEGER,
    categories TEXT,
    isbn VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tabela `user_books`

```sql
CREATE TABLE user_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id VARCHAR REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR NOT NULL CHECK (status IN ('want_to_read', 'currently_reading', 'read')),
    progress INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);
```

## RLS (Row Level Security)

Ativar RLS para ambas as tabelas e criar as políticas:

### Para `books`:
```sql
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "Allow read access for authenticated users" ON books
    FOR SELECT TO authenticated
    USING (true);

-- Permitir inserção para todos os usuários autenticados  
CREATE POLICY "Allow insert for authenticated users" ON books
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

### Para `user_books`:
```sql
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver/modificar seus próprios livros
CREATE POLICY "Users can view own books" ON user_books
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON user_books
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON user_books
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON user_books
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
```

## Configuração da Autenticação

1. Ativar autenticação por Google no painel do Supabase
2. Configurar as URLs de redirect adequadas
3. Atualizar as credenciais no arquivo `supabaseService.ts`

## Como usar no projeto

1. **Configurar credenciais do Supabase:**
   
   Substitua as credenciais em `/services/supabaseService.ts`:
   ```typescript
   const supabaseUrl = 'https://seu-projeto.supabase.co';
   const supabaseKey = 'sua-chave-publica-aqui';
   ```

2. **Funcionamento atual:**
   - ✅ **Sem Supabase configurado**: O app funciona normalmente usando armazenamento local para todos os usuários
   - ✅ **Com Supabase configurado**: Usuários registrados usam Supabase, convidados usam armazenamento local
   - ✅ **Verificação automática**: O sistema detecta se o Supabase está configurado corretamente

3. **Status das funcionalidades:**
   - As funções já estão integradas ao contexto da aplicação
   - Fallback automático para armazenamento local quando Supabase não está disponível
   - Mensagens de erro informativos no console para debug

4. **Para desenvolvedores:**
   - O app funciona perfeitamente mesmo sem configurar o Supabase
   - Configure apenas quando quiser dados persistentes na nuvem
   - Todos os recursos da biblioteca funcionam independentemente da configuração