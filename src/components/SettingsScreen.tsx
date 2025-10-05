import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ChevronLeft,
  Palette,
  Moon,
  Sun,
  Globe,
  Volume2,
  VolumeX,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsDesktop } from '../hooks/useMediaQuery';

interface SettingsScreenProps {
  onBack?: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { state, actions } = useApp();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isDesktop = useIsDesktop();

  const handleThemeChange = (theme: 'light' | 'night') => {
    actions.setTheme(theme);
    toast.success(`Tema ${theme === 'light' ? 'claro' : 'noturno'} ativado!`);
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun, description: 'Tema padrão com cores claras' },
    { value: 'night', label: 'Noturno', icon: Moon, description: 'Cores azuis suaves para leitura noturna' }
  ];

  return (
    <div className="min-h-screen responsive-scroll">
      <div className={`${isDesktop ? 'max-w-4xl mx-auto px-6 py-8' : 'px-4 py-6'}`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 rounded-full p-2"
            >
              <ChevronLeft size={20} />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-white">Configurações & Temas</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Temas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="text-purple-400" size={20} />
                  Tema da Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {themeOptions.map((theme) => {
                  const Icon = theme.icon;
                  const isActive = state.theme === theme.value;
                  
                  return (
                    <div
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value as 'light' | 'night')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'border-purple-500 bg-purple-500/20' 
                          : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-purple-400/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon 
                            className={`${isActive ? 'text-purple-300' : 'text-white/70'}`} 
                            size={20} 
                          />
                          <div>
                            <div className={`font-medium ${isActive ? 'text-white' : 'text-white/90'}`}>
                              {theme.label}
                            </div>
                            <div className="text-sm text-white/60">
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <Badge className="bg-purple-500 text-white">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferências de Leitura */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="text-blue-400" size={20} />
                  Preferências de Leitura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Sons da Interface</div>
                    <div className="text-white/60 text-sm">Reproduzir sons ao navegar</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="text-green-400" size={16} /> : <VolumeX className="text-red-400" size={16} />}
                    <Switch 
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Notificações</div>
                    <div className="text-white/60 text-sm">Receber lembretes de leitura</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? <Bell className="text-green-400" size={16} /> : <BellOff className="text-red-400" size={16} />}
                    <Switch 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}