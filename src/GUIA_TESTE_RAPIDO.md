# 🚀 Guia de Teste Rápido - Eclipse Reads

## 📱 Testando o App

O Eclipse Reads funciona em **dois modos**:

### 1️⃣ **Modo Local** (Sem Supabase)
✅ Funciona imediatamente, sem configuração  
✅ Login com email e senha (mock)  
✅ Modo convidado (limite de 5 livros)  
❌ Login com Google não disponível  
❌ Dados não sincronizam entre dispositivos  

### 2️⃣ **Modo Supabase** (Com Backend)
✅ Autenticação real  
✅ Login com email e senha  
✅ Login com Google OAuth  
✅ Sincronização entre dispositivos  
✅ Dados persistentes no banco  

---

## 🧪 Como Testar

### **Modo Local (Padrão)**

O app está configurado para funcionar **sem Supabase** por padrão.

#### **Teste 1: Criar Conta**
1. Abra o app
2. Clique em "Cadastro"
3. Preencha:
   - Nome: `Seu Nome`
   - Email: `teste@example.com`
   - Senha: `123456`
   - Confirme a senha
   - Aceite os termos
4. Clique em "Criar Conta"
5. ✅ **Resultado**: Você será logado e verá a tela Home

#### **Teste 2: Login**
1. Faça logout
2. Na tela de login:
   - Email: `teste@example.com`
   - Senha: qualquer senha com 6+ caracteres
3. Clique em "Entrar"
4. ✅ **Resultado**: Você será logado

#### **Teste 3: Modo Convidado**
1. Clique em "Continuar como Convidado"
2. ✅ **Resultado**: Acesso limitado a 5 livros

#### **Teste 4: Google Login (Sem Supabase)**
1. Clique no botão "Entrar com Google"
2. ❌ **Resultado**: Erro informando que precisa configurar Supabase
3. ✅ **Esperado**: Mensagem clara direcionando para usar email

---

### **Modo Supabase**

Para testar com backend real, você precisa:

#### **Passo 1: Verificar Conexão**

Abra o console do navegador e procure por:
```
Supabase status: Connected
```

Se aparecer "Not configured", o Supabase não está conectado.

#### **Passo 2: Executar SQL**

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto "MILI"
3. Vá em **SQL Editor**
4. Execute o conteúdo do arquivo `/supabase-complete-schema.sql`

#### **Passo 3: Testar Cadastro Real**

1. Abra o app
2. Clique em "Cadastro"
3. Use um **email real** que você tenha acesso
4. Preencha os dados e crie a conta
5. **Importante**: Você receberá um email de confirmação
6. Clique no link do email para confirmar
7. ✅ Faça login com as credenciais criadas

#### **Passo 4: Verificar no Banco**

1. No Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione a tabela `profiles`
4. ✅ Você deve ver seu perfil lá!

#### **Passo 5: Login com Google**

**Requisitos**:
- Google OAuth configurado (veja `/CONFIGURACAO_SUPABASE.md`)

**Teste**:
1. Clique em "Entrar com Google"
2. Será redirecionado para o Google
3. Autorize a aplicação
4. ✅ Será redirecionado de volta, já logado

---

## 🔍 Verificando Funcionalidades

### ✅ **Adicionar Livros**

1. Faça login (qualquer modo)
2. Vá para "Buscar"
3. Pesquise por "Harry Potter"
4. Clique em um livro
5. Clique em "+ Adicionar à Biblioteca"
6. Escolha um status (Ex: "Lendo Agora")
7. ✅ Livro aparece na sua Biblioteca

**No Modo Supabase**:
- Abra o Supabase Dashboard
- Vá em Table Editor > `user_books`
- ✅ O livro está salvo lá!

### ✅ **Sincronização (Só Supabase)**

1. Adicione livros no dispositivo 1
2. Abra o app no dispositivo 2 (ou outro navegador)
3. Faça login com a mesma conta
4. ✅ Os livros aparecem automaticamente!

### ✅ **Estatísticas**

1. Adicione vários livros com diferentes status
2. Vá para "Perfil"
3. ✅ Veja as estatísticas atualizadas

**No Modo Supabase**:
- Table Editor > `user_statistics`
- ✅ Os números correspondem!

---

## 🐛 Solução de Problemas

### ❌ Erro: "repositories.userRepository.createUser is not a function"

**Causa**: Código antigo sem o método createUser

**Solução**: 
✅ JÁ CORRIGIDO! O método foi adicionado ao MockUserRepository

---

### ❌ Erro: "Supabase não configurado"

**Causa**: Variáveis de ambiente não definidas

**Solução**:
1. Verifique se está no Figma Make
2. O projeto "MILI" deve estar conectado
3. Se não estiver, conecte via menu de configurações

**OU use o Modo Local**:
- O app funciona perfeitamente sem Supabase!
- Use login com email normalmente

---

### ❌ Login com Google não funciona

**Causa**: Google OAuth não configurado

**Solução**:
- Veja o guia completo em `/CONFIGURACAO_SUPABASE.md`
- Seção "3. Configurar Autenticação Google"

**OU use Email/Senha**:
- Funciona sem configuração adicional!

---

### ❌ Livros não aparecem após adicionar

**Causa**: Erro ao carregar biblioteca

**Solução**:
1. Abra o console do navegador (F12)
2. Procure por erros em vermelho
3. Faça logout e login novamente
4. Se persistir, limpe o cache do navegador

---

## 📊 Status de Funcionalidades

| Funcionalidade | Modo Local | Modo Supabase |
|----------------|------------|---------------|
| Login Email/Senha | ✅ Mock | ✅ Real |
| Cadastro | ✅ Mock | ✅ Real |
| Login Google | ❌ | ✅ (se configurado) |
| Modo Convidado | ✅ | ✅ |
| Adicionar Livros | ✅ | ✅ |
| Biblioteca | ✅ Local | ✅ Sincronizada |
| Estatísticas | ✅ Local | ✅ Persistente |
| Perfil | ✅ Local | ✅ Persistente |
| Sincronização | ❌ | ✅ |
| Multi-dispositivo | ❌ | ✅ |

---

## 🎯 Recomendações

### 👥 **Para Testes Rápidos**
✅ Use o **Modo Local**
- Funciona imediatamente
- Não precisa configurar nada
- Perfeito para desenvolvimento

### 🚀 **Para Produção**
✅ Use o **Modo Supabase**
- Dados persistentes
- Sincronização real
- Login com Google
- Melhor experiência

---

## 📝 Próximos Passos

1. ✅ Teste o app em Modo Local (funciona agora!)
2. 📋 Execute o SQL do schema no Supabase
3. 🔐 Configure Google OAuth (opcional)
4. 🧪 Teste com Supabase conectado
5. 🎉 App completo e funcional!

---

## 💡 Dicas

- **Console do navegador** é seu amigo! Pressione F12 para ver logs
- **Limpe o cache** se algo não atualizar
- **Use emails reais** ao testar Supabase (precisa confirmar)
- **Modo Local** é perfeito para desenvolvimento rápido
- **Supabase** é essencial para produção

---

## 🆘 Precisa de Ajuda?

📚 **Documentação Completa**:
- `/COMO_USAR_SUPABASE.md` - Guia detalhado de uso
- `/CONFIGURACAO_SUPABASE.md` - Configuração passo a passo
- `/docs/supabase-quick-reference.md` - Referência rápida

---

**✨ Eclipse Reads - Sua biblioteca digital na nuvem!**
