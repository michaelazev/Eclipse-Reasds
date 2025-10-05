import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { BookOpen, Target, Clock, TrendingUp } from 'lucide-react';

export function UserStats() {
  const { state } = useApp();
  
  // Safe access to user statistics with comprehensive fallbacks
  const user = state.user;
  const statistics = {
    booksRead: user?.statistics?.booksRead || 0,
    totalPages: user?.statistics?.totalPages || 0,
    readingTime: user?.statistics?.readingTime || 0,
    currentStreak: user?.statistics?.currentStreak || 0
  };
  
  const preferences = {
    readingGoals: {
      booksPerYear: user?.preferences?.readingGoals?.booksPerYear || 24,
      minutesPerDay: user?.preferences?.readingGoals?.minutesPerDay || 30
    }
  };

  const booksProgress = Math.round((statistics.booksRead / preferences.readingGoals.booksPerYear) * 100);
  const dailyGoalProgress = Math.min((statistics.readingTime / preferences.readingGoals.minutesPerDay) * 100, 100);

  const stats = [
    {
      title: 'Livros Lidos',
      value: statistics.booksRead,
      icon: BookOpen,
      description: `de ${preferences.readingGoals.booksPerYear} meta anual`,
      progress: booksProgress,
      color: 'text-blue-400'
    },
    {
      title: 'Páginas Lidas',
      value: statistics.totalPages.toLocaleString('pt-BR'),
      icon: TrendingUp,
      description: 'total de páginas',
      color: 'text-green-400'
    },
    {
      title: 'Tempo de Leitura',
      value: `${Math.floor(statistics.readingTime / 60)}h ${statistics.readingTime % 60}m`,
      icon: Clock,
      description: `Meta: ${preferences.readingGoals.minutesPerDay}min/dia`,
      progress: dailyGoalProgress,
      color: 'text-purple-400'
    },
    {
      title: 'Sequência Atual',
      value: `${statistics.currentStreak} dias`,
      icon: Target,
      description: 'lendo consecutivamente',
      color: 'text-orange-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/10 ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">{stat.title}</p>
                      <p className="font-semibold text-white">{stat.value}</p>
                    </div>
                  </div>
                  
                  {stat.progress !== undefined && (
                    <div className="space-y-2">
                      <Progress 
                        value={stat.progress} 
                        className="h-2 bg-white/20"
                      />
                      <p className="text-xs text-white/60">{stat.progress}% da meta</p>
                    </div>
                  )}
                  
                  {!stat.progress && (
                    <p className="text-xs text-white/60">{stat.description}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Reading Goal Summary */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo do Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{statistics.booksRead}</p>
              <p className="text-sm text-white/70">Livros</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.floor(statistics.totalPages / 1000) || 0}k
              </p>
              <p className="text-sm text-white/70">Páginas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.floor(statistics.readingTime / 60) || 0}
              </p>
              <p className="text-sm text-white/70">Horas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}