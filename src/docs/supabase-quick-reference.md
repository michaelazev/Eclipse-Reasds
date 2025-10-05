# 📖 Supabase - Guia Rápido de Referência

Este documento contém exemplos práticos de como usar o Supabase no Eclipse Reads.

## 🔐 Autenticação

### Login com Google

```typescript
import { AuthService } from '../services/supabaseService';

// Iniciar login com Google
const handleGoogleLogin = async () => {
  const result = await AuthService.signInWithGoogle();
  if (result.success) {
    console.log('Login iniciado, redirecionando...');
  } else {
    console.error('Erro:', result.error);
  }
};
```

### Login com Email/Senha

```typescript
const handleEmailLogin = async (email: string, password: string) => {
  const result = await AuthService.signInWithEmail(email, password);
  if (result.success) {
    console.log('Usuário logado:', result.user);
  } else {
    console.error('Erro:', result.error);
  }
};
```

### Criar Conta

```typescript
const handleSignUp = async (email: string, password: string, name: string) => {
  const result = await AuthService.signUpWithEmail(email, password, name);
  if (result.success) {
    console.log('Conta criada:', result.user);
  } else {
    console.error('Erro:', result.error);
  }
};
```

### Verificar Usuário Atual

```typescript
const checkCurrentUser = async () => {
  const result = await AuthService.getCurrentUser();
  if (result.success && result.user) {
    console.log('Usuário logado:', result.user);
  } else {
    console.log('Nenhum usuário logado');
  }
};
```

### Listener de Mudanças de Autenticação

```typescript
import { useEffect } from 'react';

useEffect(() => {
  const { data } = AuthService.onAuthStateChange((user) => {
    if (user) {
      console.log('Usuário logado:', user);
      // Atualizar estado do app
    } else {
      console.log('Usuário deslogado');
      // Limpar estado do app
    }
  });

  // Cleanup
  return () => {
    data.subscription.unsubscribe();
  };
}, []);
```

### Logout

```typescript
const handleLogout = async () => {
  const result = await AuthService.signOut();
  if (result.success) {
    console.log('Logout realizado');
  }
};
```

---

## 👤 Perfil do Usuário

### Buscar Perfil

```typescript
import { ProfileService } from '../services/supabaseService';

const loadProfile = async (userId: string) => {
  const result = await ProfileService.getProfile(userId);
  if (result.success) {
    console.log('Perfil:', result.profile);
    // result.profile contém: name, nickname, email, avatar, banner, account_type, plan_type
  }
};
```

### Atualizar Perfil

```typescript
const updateUserProfile = async (userId: string) => {
  const result = await ProfileService.updateProfile(userId, {
    name: 'Novo Nome',
    nickname: 'novonick',
    avatar: 'https://exemplo.com/avatar.jpg',
    banner: 'https://exemplo.com/banner.jpg'
  });
  
  if (result.success) {
    console.log('Perfil atualizado:', result.profile);
  }
};
```

### Atualizar Plano

```typescript
const upgradeToPremium = async (userId: string) => {
  const result = await ProfileService.updateProfile(userId, {
    account_type: 'premium',
    plan_type: 'premium'
  });
  
  if (result.success) {
    console.log('Plano atualizado para premium!');
  }
};
```

---

## ⚙️ Preferências

### Buscar Preferências

```typescript
import { PreferencesService } from '../services/supabaseService';

const loadPreferences = async (userId: string) => {
  const result = await PreferencesService.getPreferences(userId);
  if (result.success) {
    console.log('Preferências:', result.preferences);
    // theme, language, daily_reminder, weekly_progress, books_per_year, etc.
  }
};
```

### Atualizar Tema

```typescript
const changeTheme = async (userId: string, theme: 'light' | 'dark' | 'night') => {
  const result = await PreferencesService.updatePreferences(userId, {
    theme: theme
  });
  
  if (result.success) {
    console.log('Tema atualizado!');
  }
};
```

### Atualizar Notificações

```typescript
const updateNotifications = async (userId: string) => {
  const result = await PreferencesService.updatePreferences(userId, {
    daily_reminder: true,
    weekly_progress: false,
    new_recommendations: true
  });
  
  if (result.success) {
    console.log('Notificações atualizadas!');
  }
};
```

### Atualizar Metas de Leitura

```typescript
const updateReadingGoals = async (userId: string) => {
  const result = await PreferencesService.updatePreferences(userId, {
    books_per_year: 24,
    minutes_per_day: 60
  });
  
  if (result.success) {
    console.log('Metas atualizadas!');
  }
};
```

---

## 📊 Estatísticas

### Buscar Estatísticas

```typescript
import { StatisticsService } from '../services/supabaseService';

const loadStatistics = async (userId: string) => {
  const result = await StatisticsService.getStatistics(userId);
  if (result.success) {
    const stats = result.statistics;
    console.log(`Livros lidos: ${stats.books_read}`);
    console.log(`Lendo atualmente: ${stats.currently_reading}`);
    console.log(`Favoritos: ${stats.favorites}`);
    console.log(`Sequência atual: ${stats.current_streak} dias`);
    console.log(`Tempo total: ${stats.total_reading_time} minutos`);
  }
};
```

### Registrar Sessão de Leitura

```typescript
const recordSession = async (userId: string, bookId: string) => {
  const result = await StatisticsService.recordReadingSession(
    userId,
    bookId,
    {
      pagesRead: 15,
      chaptersRead: 1,
      durationMinutes: 30,
      startPage: 100,
      endPage: 115
    }
  );
  
  if (result.success) {
    console.log('Sessão registrada! ID:', result.sessionId);
    // As estatísticas são atualizadas automaticamente pelo trigger
  }
};
```

---

## 📚 Livros

### Salvar Livro

```typescript
import { BookService } from '../services/supabaseService';
import { Book } from '../models/Book';

const saveBookToCatalog = async (book: Book) => {
  const result = await BookService.saveBook(book);
  if (result.success) {
    console.log('Livro salvo no catálogo!');
  }
};
```

### Buscar Livro

```typescript
const getBookDetails = async (bookId: string) => {
  const result = await BookService.getBook(bookId);
  if (result.success) {
    console.log('Livro:', result.book);
  }
};
```

---

## 📖 Biblioteca do Usuário

### Adicionar Livro à Biblioteca

```typescript
import { UserBookService } from '../services/supabaseService';
import { ReadingStatus } from '../models/Book';

const addToLibrary = async (userId: string, book: Book) => {
  const result = await UserBookService.addBookToLibrary(
    userId,
    book.id,
    ReadingStatus.WANT_TO_READ,
    book // Opcional: passa o objeto completo para salvar no catálogo também
  );
  
  if (result.success) {
    console.log('Livro adicionado à biblioteca!');
  }
};
```

### Buscar Biblioteca Completa

```typescript
const loadLibrary = async (userId: string) => {
  const result = await UserBookService.getUserLibrary(userId);
  if (result.success) {
    const books = result.books;
    console.log(`${books.length} livros na biblioteca`);
    
    books.forEach(book => {
      console.log(`${book.title} - ${book.status} - ${book.progress}%`);
    });
  }
};
```

### Atualizar Progresso de Leitura

```typescript
const updateProgress = async (userId: string, bookId: string) => {
  const result = await UserBookService.updateProgress(
    userId,
    bookId,
    50 // 50% de progresso
  );
  
  if (result.success) {
    console.log('Progresso atualizado!');
  }
};
```

### Atualizar Notas

```typescript
const addNotes = async (userId: string, bookId: string) => {
  const result = await UserBookService.updateNotes(
    userId,
    bookId,
    'Achei o capítulo 5 muito interessante! O plot twist foi surpreendente.'
  );
  
  if (result.success) {
    console.log('Notas salvas!');
  }
};
```

### Remover da Biblioteca

```typescript
const removeFromLibrary = async (userId: string, bookId: string) => {
  const result = await UserBookService.removeBookFromLibrary(userId, bookId);
  if (result.success) {
    console.log('Livro removido da biblioteca');
  }
};
```

---

## 🔄 Exemplo Completo: Fluxo de Login e Carregamento

```typescript
import { useState, useEffect } from 'react';
import { 
  AuthService, 
  ProfileService, 
  PreferencesService,
  StatisticsService,
  UserBookService 
} from '../services/supabaseService';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    // Verificar usuário atual ao carregar
    checkAuth();

    // Listener para mudanças de autenticação
    const { data } = AuthService.onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(authUser);
        loadUserData(authUser.id);
      } else {
        setUser(null);
        clearUserData();
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const result = await AuthService.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
      await loadUserData(result.user.id);
    }
  };

  const loadUserData = async (userId: string) => {
    // Carregar todas as informações do usuário em paralelo
    const [profileRes, prefsRes, statsRes, libraryRes] = await Promise.all([
      ProfileService.getProfile(userId),
      PreferencesService.getPreferences(userId),
      StatisticsService.getStatistics(userId),
      UserBookService.getUserLibrary(userId)
    ]);

    if (profileRes.success) setProfile(profileRes.profile);
    if (prefsRes.success) setPreferences(prefsRes.preferences);
    if (statsRes.success) setStatistics(statsRes.statistics);
    if (libraryRes.success) setLibrary(libraryRes.books);
  };

  const clearUserData = () => {
    setProfile(null);
    setPreferences(null);
    setStatistics(null);
    setLibrary([]);
  };

  const handleLogin = async () => {
    const result = await AuthService.signInWithGoogle();
    if (!result.success) {
      console.error('Erro no login:', result.error);
    }
    // O listener de onAuthStateChange vai carregar os dados automaticamente
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    // O listener de onAuthStateChange vai limpar os dados automaticamente
  };

  // Renderizar interface...
}
```

---

## 🎯 Dicas e Boas Práticas

### 1. Sempre Verifique o Sucesso

```typescript
const result = await SomeService.someFunction();
if (result.success) {
  // Sucesso - usar result.data
} else {
  // Erro - mostrar result.error para o usuário
  console.error(result.error);
}
```

### 2. Use Listeners para Sincronização

```typescript
// Em vez de verificar manualmente, use listeners
useEffect(() => {
  const { data } = AuthService.onAuthStateChange(handleAuthChange);
  return () => data.subscription.unsubscribe();
}, []);
```

### 3. Carregue Dados em Paralelo

```typescript
// ✅ Bom - paralelo
const [data1, data2, data3] = await Promise.all([
  Service1.getData(),
  Service2.getData(),
  Service3.getData()
]);

// ❌ Ruim - sequencial
const data1 = await Service1.getData();
const data2 = await Service2.getData();
const data3 = await Service3.getData();
```

### 4. Trate Erros Apropriadamente

```typescript
try {
  const result = await UserBookService.addBookToLibrary(...);
  if (result.success) {
    toast.success('Livro adicionado!');
  } else {
    toast.error(result.error || 'Erro ao adicionar livro');
  }
} catch (error) {
  console.error('Erro inesperado:', error);
  toast.error('Erro inesperado');
}
```

### 5. Atualize o Cache Local

```typescript
// Após adicionar/atualizar dados, recarregue do servidor
const result = await UserBookService.addBookToLibrary(...);
if (result.success) {
  // Recarregar biblioteca para ter dados atualizados
  const libraryResult = await UserBookService.getUserLibrary(userId);
  if (libraryResult.success) {
    setLibrary(libraryResult.books);
  }
}
```

---

## 🔍 Debugging

### Ver Status da Conexão

```typescript
import { supabase } from '../services/supabaseService';

console.log('Supabase conectado:', supabase !== null);
```

### Ver Logs no Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **Logs** no menu lateral
3. Escolha o tipo de log:
   - **Postgres Logs**: Erros de banco de dados
   - **API Logs**: Requisições à API
   - **Auth Logs**: Eventos de autenticação

### Testar Políticas RLS

Use o SQL Editor para testar queries diretamente:

```sql
-- Ver seus próprios dados
SELECT * FROM profiles WHERE id = auth.uid();
SELECT * FROM user_books WHERE user_id = auth.uid();

-- Ver estatísticas
SELECT * FROM user_statistics WHERE user_id = auth.uid();
```

---

## 📞 Precisa de Ajuda?

- **Documentação Oficial**: [supabase.com/docs](https://supabase.com/docs)
- **Guia Completo**: Veja `/CONFIGURACAO_SUPABASE.md`
- **Schema SQL**: Veja `/supabase-complete-schema.sql`

---

**Última atualização**: 2025-01-04
