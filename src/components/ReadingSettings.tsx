import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Bookmark, 
  Monitor, 
  Smartphone, 
  Sun, 
  Moon, 
  Type, 
  Palette,
  ArrowLeft,
  Settings,
  Target,
  ArrowDown,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface ReadingSettingsProps {
  onBack: () => void;
}

export function ReadingSettings({ onBack }: ReadingSettingsProps) {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState<'themes' | 'goals'>('goals');

  // Reading preferences
  const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('vertical');
  const [autoBookmark, setAutoBookmark] = useState(true);
  const [fontSize, setFontSize] = useState([16]);
  const [lineHeight, setLineHeight] = useState([1.5]);
  const [pageMargin, setPageMargin] = useState([20]);
  const [nightMode, setNightMode] = useState(false);
  const [fontFamily, setFontFamily] = useState('system');

  // Goal settings
  const [dailyGoal, setDailyGoal] = useState(state.user?.preferences.readingGoals.chaptersPerDay || 1);
  const [weeklyGoal, setWeeklyGoal] = useState(state.user?.preferences.readingGoals.chaptersPerWeek || 7);
  const [monthlyGoal, setMonthlyGoal] = useState(state.user?.preferences.readingGoals.chaptersPerMonth || 30);
  const [yearlyGoal, setYearlyGoal] = useState(state.user?.preferences.readingGoals.booksPerYear || 24);

  const fontOptions = [
    { value: 'system', label: 'Sistema', preview: 'Aa' },
    { value: 'serif', label: 'Times New Roman', preview: 'Aa' },
    { value: 'sans', label: 'Arial', preview: 'Aa' },
    { value: 'mono', label: 'Courier New', preview: 'Aa' },
    { value: 'crimson', label: 'Crimson Text', preview: 'Aa' },
    { value: 'merriweather', label: 'Merriweather', preview: 'Aa' },
    { value: 'lora', label: 'Lora', preview: 'Aa' },
    { value: 'playfair', label: 'Playfair Display', preview: 'Aa' },
    { value: 'opensans', label: 'Open Sans', preview: 'Aa' },
    { value: 'roboto', label: 'Roboto', preview: 'Aa' },
    { value: 'sourcesans', label: 'Source Sans Pro', preview: 'Aa' },
    { value: 'inter', label: 'Inter', preview: 'Aa' }
  ];

  const handleSaveSettings = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  const handleSaveGoals = () => {
    toast.success('Metas atualizadas com sucesso!');
  };

  const handleSaveReadingMode = () => {
    toast.success('Modo de leitura atualizado!');
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-white/20 px-4 py-4 sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">Configurações</h1>
            <p className="text-sm text-white/70">Personalize sua experiência de leitura</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={activeTab === 'goals' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('goals')}
            className={activeTab === 'goals' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'text-white hover:bg-white/10'
            }
          >
            <Target size={16} className="mr-1" />
            Metas
          </Button>
          <Button
            variant={activeTab === 'themes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('themes')}
            className={activeTab === 'themes' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'text-white hover:bg-white/10'
            }
          >
            <Palette size={16} className="mr-1" />
            Temas
          </Button>
        </div>
      </motion.div>

      <div className="px-4 py-6 space-y-6">
        {activeTab === 'themes' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Theme Settings */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Palette size={20} />
                  Tema do Aplicativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-3 block">Tema do Aplicativo</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Light Theme */}
                    <button
                      onClick={() => actions.setTheme('light')}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                        state.theme === 'light'
                          ? 'bg-purple-600/20 border-purple-500 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Sun size={20} className="text-yellow-400" />
                      <div className="text-left">
                        <h4 className="font-medium">Modo Dia</h4>
                        <p className="text-xs opacity-70">Roxo estrela - ideal para ambientes claros</p>
                      </div>
                    </button>

                    {/* Night Theme */}
                    <button
                      onClick={() => actions.setTheme('night')}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                        state.theme === 'night'
                          ? 'bg-purple-600/20 border-purple-500 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="relative">
                        <Moon size={20} className="text-blue-400" />
                        <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium">Modo Noite</h4>
                        <p className="text-xs opacity-70">Azul estrelado - céu noturno relaxante</p>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveSettings}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Salvar Configurações
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Daily Goals */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target size={20} />
                  Metas de Leitura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">Capítulos por Dia</Label>
                    <Input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value) || 1)}
                      min={1}
                      max={10}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Capítulos por Semana</Label>
                    <Input
                      type="number"
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 7)}
                      min={1}
                      max={50}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Capítulos por Mês</Label>
                    <Input
                      type="number"
                      value={monthlyGoal}
                      onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 30)}
                      min={1}
                      max={200}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Livros por Ano</Label>
                    <Input
                      type="number"
                      value={yearlyGoal}
                      onChange={(e) => setYearlyGoal(parseInt(e.target.value) || 24)}
                      min={1}
                      max={365}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* Goals Preview */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{dailyGoal}</div>
                    <div className="text-xs text-white/70">Cap/Dia</div>
                  </div>
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{weeklyGoal}</div>
                    <div className="text-xs text-white/70">Cap/Semana</div>
                  </div>
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{monthlyGoal}</div>
                    <div className="text-xs text-white/70">Cap/Mês</div>
                  </div>
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{yearlyGoal}</div>
                    <div className="text-xs text-white/70">Livros/Ano</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveGoals}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Salvar Metas
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}