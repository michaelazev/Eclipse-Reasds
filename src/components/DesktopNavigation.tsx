import { motion } from 'framer-motion';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useApp } from '../contexts/AppContext';
import { 
  Home, 
  Search, 
  BookOpen,
  User, 
  Menu,
  Settings,
  LogOut,
  Crown,
  Star
} from 'lucide-react';
import { WebLogo } from './WebLogo';

interface DesktopNavigationProps {
  activeTab: string;
  onTabChange: (tab: "home" | "search" | "library" | "profile") => void;
}

export function DesktopNavigation({ activeTab, onTabChange }: DesktopNavigationProps) {
  const { state, actions } = useApp();
  const user = state.user;

  const handleLogout = () => {
    actions.logout();
  };

  const handleSettings = () => {
    // Dispatch event to show settings directly
    try {
      const settingsEvent = new CustomEvent('showSettingsScreen');
      window.dispatchEvent(settingsEvent);
    } catch (error) {
      console.error('Error dispatching settings event:', error);
      // Fallback: try direct navigation if event dispatch fails
      onTabChange("profile");
    }
  };

  const handleShowPlans = () => {
    // Dispatch event to show plans screen
    try {
      const plansEvent = new CustomEvent('showPlansScreen');
      window.dispatchEvent(plansEvent);
    } catch (error) {
      console.error('Error dispatching plans event:', error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/20 px-6 py-4 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <WebLogo className="w-16 h-16 object-contain" />
          <h1 className="text-xl font-semibold text-white">Eclipse Reads</h1>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id as "home" | "search" | "library" | "profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? 'text-white bg-blue-600/30 shadow-lg shadow-blue-500/25' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar || ''} />
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block">
                <p className="text-white text-sm font-medium">
                  {user?.nickname || user?.name?.split(' ')[0] || 'Usuário'}
                </p>
                <Badge 
                  variant={user?.accountType === 'premium' ? 'default' : 'secondary'}
                  className={`text-xs ${user?.accountType === 'premium' 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                    : 'bg-gray-500/50 text-white/80'
                  }`}
                >
                  {user?.accountType === 'premium' ? '👑 Premium' : '👤 Gratuito'}
                </Badge>
              </div>
              <Menu size={16} className="text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="glass border-white/20 min-w-[200px]" 
            align="end"
          >
            <DropdownMenuItem 
              onClick={() => onTabChange("profile")}
              className="text-white hover:bg-blue-600/20 cursor-pointer"
            >
              <User size={16} className="mr-2" />
              Ver Perfil
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/20" />
            
            <DropdownMenuItem 
              onClick={handleShowPlans}
              className="text-yellow-400 hover:bg-yellow-400/20 cursor-pointer"
            >
              {user?.accountType === 'premium' ? (
                <>
                  <Crown size={16} className="mr-2" />
                  Gerenciar Plano
                </>
              ) : (
                <>
                  <Star size={16} className="mr-2" />
                  Ver Planos
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/20" />
            
            <DropdownMenuItem 
              onClick={handleSettings}
              className="text-white hover:bg-blue-600/20 cursor-pointer"
            >
              <Settings size={16} className="mr-2" />
              Configurações
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/20" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-500/20 cursor-pointer"
            >
              <LogOut size={16} className="mr-2" />
              Sair da Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}