import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { ReadingSettings } from '../ReadingSettings';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ImageWithFallback } from '../fallback/ImageWithFallback';
import { BookCard } from '../book/BookCard';
import { BookDetailModal } from '../book/BookDetailModal';
import { 
  Edit, 
  Settings, 
  BookOpen, 
  Heart,
  CheckCircle,
  BookMarked,
  Clock,
  XCircle,
  LogOut,
  Download,
  Smartphone,
  UserPlus,
  Camera,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { Book } from '../../models/Book';

export function ProfileScreen() {
  const { state, actions, repositories } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(state.user?.name || '');
  const [editNickname, setEditNickname] = useState(state.user?.nickname || '');
  const [editAvatar, setEditAvatar] = useState(state.user?.avatar || '');
  const [editBanner, setEditBanner] = useState(state.user?.banner || '');
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    loadRecentLibraryBooks();
  }, [state.userBooks]);

  useEffect(() => {
    // Update form fields when user data changes
    if (state.user) {
      setEditName(state.user.name || '');
      setEditNickname(state.user.nickname || '');
      setEditAvatar(state.user.avatar || '');
      setEditBanner(state.user.banner || '');
    }
  }, [state.user]);

  useEffect(() => {
    const handleShowSettings = () => {
      setShowSettings(true);
    };

    window.addEventListener('showSettings', handleShowSettings);
    return () => {
      window.removeEventListener('showSettings', handleShowSettings);
    };
  }, []);

  const loadRecentLibraryBooks = () => {
    try {
      // Get the most recently added books from user's library
      // Remove duplicates based on book ID and sort by most recent first
      const uniqueBooks = state.userBooks
        .filter((userBook, index, self) => 
          // Keep only the first occurrence of each book (by book.id)
          index === self.findIndex(ub => ub.book.id === userBook.book.id)
        )
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()) // Sort by most recent first
        .slice(0, 8) // Get first 8 books
        .map(userBook => userBook.book); // Extract the book data
      
      setRecentBooks(uniqueBooks);
    } catch (error) {
      console.error('Failed to load recent library books:', error);
    }
  };

  if (showSettings) {
    return <ReadingSettings onBack={() => setShowSettings(false)} />;
  }

  const handleSaveProfile = async () => {
    if (isUpdatingProfile) return;
    
    setIsUpdatingProfile(true);
    try {
      await actions.updateProfile({
        name: editName.trim() || undefined,
        nickname: editNickname.trim() || undefined,
        avatar: editAvatar.trim() || undefined,
        banner: editBanner.trim() || undefined,
      });
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const generateRandomAvatar = () => {
    const avatarId = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=300&h=300&fit=crop&crop=face&auto=format&q=80&seed=${avatarId}`;
  };

  const generateRandomBanner = () => {
    const bannerId = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-1614850716626-873413eb7c1b?w=800&h=200&fit=crop&auto=format&q=80&seed=${bannerId}`;
  };

  const handleAvatarChange = () => {
    const newAvatar = generateRandomAvatar();
    setEditAvatar(newAvatar);
  };

  const handleBannerChange = () => {
    const newBanner = generateRandomBanner();
    setEditBanner(newBanner);
  };

  const handleLogout = () => {
    actions.logout();
    toast.success('Você saiu da sua conta!');
  };

  const handleDownloadApp = () => {
    toast.success('Redirecionando para a loja de aplicativos...');
  };

  const handleGoToLogin = () => {
    actions.logout();
    toast.success('Redirecionando para o login...');
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookDetail(true);
  };

  const user = state.user;
  const stats = actions.calculateUserStatistics();

  // Dashboard style layout
  return (
    <div className="min-h-screen responsive-scroll">
      <div className={`${isDesktop ? 'max-w-6xl mx-auto px-6 py-8' : 'px-4 py-6'}`}>
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Cover Background */}
          <div className="h-32 md:h-40 relative rounded-2xl overflow-hidden mb-6">
            {user?.banner ? (
              <ImageWithFallback
                src={user.banner}
                alt="Banner do perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-eclipse-primary via-eclipse-secondary to-eclipse-accent">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-eclipse-darker/50 to-transparent"></div>
              </div>
            )}
            
            {/* Edit Cover Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBannerChange}
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2 opacity-80 hover:opacity-100 transition-all"
            >
              <Camera size={18} />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white/30 shadow-2xl">
                <AvatarImage src={user?.avatar || ''} />
                <AvatarFallback className="bg-eclipse-primary text-white text-2xl md:text-3xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAvatarChange}
                className="absolute -bottom-2 -right-2 bg-eclipse-secondary hover:bg-eclipse-accent text-white rounded-full p-2 w-8 h-8 shadow-lg"
              >
                <Camera size={14} />
              </Button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {user?.nickname || user?.name?.split(' ')[0] || 'Usuário'}
                </h1>
                <p className="text-white/70 text-base md:text-lg">@{user?.name?.toLowerCase().replace(/\s+/g, '') || 'usuario'}</p>
                <div className="flex justify-center md:justify-start mt-3">
                  <Badge 
                    variant={user?.accountType === 'premium' ? 'default' : 'secondary'}
                    className={user?.accountType === 'premium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg px-3 py-1' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-700 text-white px-3 py-1'
                    }
                  >
                    {user?.accountType === 'premium' ? '👑 Premium' : 'Gratuito'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-eclipse-primary text-white transition-colors duration-300 px-4"
                >
                  <Edit size={16} className="mr-2" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/20 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Editar Perfil</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Atualize suas informações pessoais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Nome Completo</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      style={{
                        '--selection-bg': '#C4B5FD',
                        '--selection-color': '#1A0B2E'
                      } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Nickname</Label>
                    <Input
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="bg-white/10 border-white/20 text-white"
                      style={{
                        '--selection-bg': '#C4B5FD',
                        '--selection-color': '#1A0B2E'
                      } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Avatar URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="URL da imagem do avatar"
                        className="bg-white/10 border-white/20 text-white flex-1"
                        style={{
                          '--selection-bg': '#C4B5FD',
                          '--selection-color': '#1A0B2E'
                        } as React.CSSProperties}
                      />
                      <Button
                        type="button"
                        onClick={handleAvatarChange}
                        variant="outline"
                        size="sm"
                        className="bg-eclipse-primary text-white transition-colors duration-300"
                      >
                        <Camera size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Banner URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editBanner}
                        onChange={(e) => setEditBanner(e.target.value)}
                        placeholder="URL da imagem do banner"
                        className="bg-white/10 border-white/20 text-white flex-1"
                        style={{
                          '--selection-bg': '#C4B5FD',
                          '--selection-color': '#1A0B2E'
                        } as React.CSSProperties}
                      />
                      <Button
                        type="button"
                        onClick={handleBannerChange}
                        variant="outline"
                        size="sm"
                        className="bg-eclipse-primary text-white transition-colors duration-300"
                      >
                        <Camera size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isUpdatingProfile}
                      className="flex-1 bg-eclipse-primary text-white transition-colors duration-300"
                    >
                      {isUpdatingProfile ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                      className="flex-1 text-white transition-colors duration-300"
                      style={{ backgroundColor: 'rgb(108, 67, 192)', borderColor: 'rgb(108, 67, 192)' }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Grid - Unified */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8"
        >
          {/* Curtidas (Hearts) */}
          <Card className="glass border-white/20 hover:border-pink-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <Heart className="text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.booksLiked}</div>
              <div className="text-xs text-white/70">Curtidas</div>
            </CardContent>
          </Card>

          {/* Capítulos Lidos */}
          <Card className="glass border-white/20 hover:border-blue-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <BookOpen className="text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.chaptersRead}</div>
              <div className="text-xs text-white/70">Capítulos</div>
            </CardContent>
          </Card>

          {/* Vou Ler */}
          <Card className="glass border-white/20 hover:border-yellow-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <BookMarked className="text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.toReadCount}</div>
              <div className="text-xs text-white/70">Vou Ler</div>
            </CardContent>
          </Card>

          {/* Lendo */}
          <Card className="glass border-white/20 hover:border-green-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <Clock className="text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.currentlyReading}</div>
              <div className="text-xs text-white/70">Lendo</div>
            </CardContent>
          </Card>

          {/* Lidos */}
          <Card className="glass border-white/20 hover:border-purple-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <CheckCircle className="text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.booksRead}</div>
              <div className="text-xs text-white/70">Lidos</div>
            </CardContent>
          </Card>

          {/* Dropados */}
          <Card className="glass border-white/20 hover:border-red-500/30 transition-all duration-300 group">
            <CardContent className="p-3 md:p-4 text-center">
              <XCircle className="text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.droppedCount}</div>
              <div className="text-xs text-white/70">Dropados</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Desktop App Download/Login Section - Only on Desktop */}
        {isDesktop && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-eclipse-primary/20 to-eclipse-secondary/20 backdrop-blur-xl border border-eclipse-accent/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="text-eclipse-accent" size={20} />
                  <h3 className="text-white font-semibold">
                    {user?.accountType === 'guest' ? 'Crie sua Conta' : 'App Mobile'}
                  </h3>
                </div>
                {user?.accountType === 'guest' ? (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm">
                      Faça login para desbloquear recursos completos e sincronizar seus dados em todos os dispositivos.
                    </p>
                    <Button
                      onClick={handleGoToLogin}
                      className="w-full md:w-auto bg-eclipse-primary hover:bg-eclipse-secondary hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      <UserPlus size={16} className="mr-2" />
                      Fazer Login / Criar Conta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white/80 text-sm">
                      Baixe nosso app móvel para ler seus livros em qualquer lugar, mesmo offline.
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <Button
                        onClick={handleDownloadApp}
                        className="bg-eclipse-primary hover:bg-eclipse-secondary hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        <Download size={16} className="mr-2" />
                        Baixar para Android
                      </Button>
                      <Button
                        onClick={handleDownloadApp}
                        className="bg-eclipse-primary hover:bg-eclipse-secondary hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        <Download size={16} className="mr-2" />
                        Baixar para iOS
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>📱 Interface otimizada</span>
                      <span>📖 Leitura offline</span>
                      <span>🔄 Sincronização</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Adicionadas Recentemente */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-blue-400" size={20} />
              Adicionadas Recentemente
            </h2>
            <span className="text-white/60 text-sm">{recentBooks.length} livros</span>
          </div>
          
          {recentBooks.length === 0 ? (
            <Card className="glass border-white/20">
              <CardContent className="p-8 text-center">
                <BookOpen className="text-white/40 mx-auto mb-3" size={48} />
                <h3 className="text-white/70 font-medium mb-2">Nenhum livro ainda</h3>
                <p className="text-white/50 text-sm">
                  Comece explorando e adicionando livros aos seus favoritos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto responsive-scroll">
              <div className="flex gap-4 pb-2 min-w-max">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex-shrink-0 w-32 md:w-40 group">
                    <BookCard
                      book={book}
                      variant="compact"
                      onOpenBook={handleBookClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {/* Plans Button */}
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('showPlansScreen'))}
            className="w-full bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 backdrop-blur-xl border border-yellow-400/30 text-white hover:from-yellow-400/20 hover:to-yellow-600/20 hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 shadow-xl"
            variant="outline"
            size="sm"
          >
            <Star size={16} className="mr-2 text-yellow-400" />
            {user?.accountType === 'premium' ? 'Gerenciar Plano' : 'Upgrade para Premium'}
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full bg-red-600/20 backdrop-blur-xl border border-red-500/30 text-white hover:bg-red-600/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 shadow-xl"
            variant="outline"
            size="sm"
          >
            <LogOut size={16} className="mr-2" />
            Sair da Conta
          </Button>
        </motion.div>
      </div>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={showBookDetail}
        onClose={() => setShowBookDetail(false)}
        onStartReading={(bookId) => {
          // Handle start reading logic
          setShowBookDetail(false);
        }}
      />
    </div>
  );
}