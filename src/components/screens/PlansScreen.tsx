import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Crown, 
  Check, 
  X, 
  ArrowLeft,
  BookOpen,
  Download,
  Zap,
  Shield,
  Star,
  Palette,
  BarChart3,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface PlansScreenProps {
  onBack?: () => void;
}

export function PlansScreen({ onBack }: PlansScreenProps) {
  const { state, actions } = useApp();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const isDesktop = useIsDesktop();

  const user = state.user;
  const currentPlan = user?.accountType || 'guest';

  const handleUpgradeToPremium = async () => {
    if (isUpgrading) return;
    
    setIsUpgrading(true);
    try {
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success - in real app would handle payment
      await actions.upgradeToPremium();
      toast.success('Parabéns! Você agora é Premium! 🎉');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      toast.error('Erro ao processar upgrade. Tente novamente.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatExpirationDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Add 1 month
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const freeFeatures = [
    { icon: BookOpen, text: 'Acesso a livros básicos', included: true },
    { icon: BookOpen, text: 'Leitura online', included: true },
    { icon: Zap, text: 'Sincronização entre dispositivos', included: true },
    { icon: BookOpen, text: 'Marcadores de páginas', included: true },
  ];

  const premiumFeatures = [
    { icon: Check, text: 'Todos os recursos gratuitos', included: true },
    { icon: Crown, text: 'Acesso a livros exclusivos', included: true },
    { icon: Download, text: 'Download para leitura offline', included: true },
    { icon: X, text: 'Sem anúncios', included: true },
    { icon: Zap, text: 'Lançamentos antecipados', included: true },
    { icon: Shield, text: 'Suporte prioritário', included: true },
    { icon: BarChart3, text: 'Estatísticas avançadas', included: true },
    { icon: Palette, text: 'Temas personalizados', included: true },
  ];

  const benefits = [
    {
      icon: Crown,
      title: 'Conteúdo Exclusivo',
      description: 'Acesso a títulos exclusivos e lançamentos antecipados'
    },
    {
      icon: Star,
      title: 'Experiência Completa',
      description: 'Leitura offline, sem anúncios e com recursos avançados'
    },
    {
      icon: Headphones,
      title: 'Suporte Premium',
      description: 'Atendimento prioritário e suporte dedicado'
    }
  ];

  return (
    <div className="min-h-screen responsive-scroll">
      <div className={`${isDesktop ? 'max-w-6xl mx-auto px-6 py-8' : 'px-4 py-6'}`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10 p-2 rounded-full"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Crown className="text-yellow-400" size={32} />
                Planos e Assinatura
              </h1>
              <p className="text-white/70 mt-2">Escolha o plano ideal para você</p>
            </div>
          </div>

          {/* Current Plan Status */}
          <Card className="glass border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Plano Atual</h3>
                  <p className="text-2xl font-bold text-white">
                    {currentPlan === 'premium' ? 'Premium' : 'Gratuito'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Válido até</p>
                  <p className="text-white font-medium">
                    {formatExpirationDate()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plans Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Free Plan */}
          <Card className="glass border-white/20 relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Gratuito</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">R$ 0</div>
                  <div className="text-white/60 text-sm">Plano Atual</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="text-blue-400" size={16} />
                    <span className="text-white/80 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button 
                disabled
                className="w-full bg-gray-600/50 text-gray-300 cursor-not-allowed"
              >
                Plano Atual
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="glass border-yellow-400/30 relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-3 py-1">
                <Crown size={14} className="mr-1" />
                Recomendado
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Premium</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">R$ 19,90</div>
                  <div className="text-white/60 text-sm">/mês</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="text-green-400" size={16} />
                    <span className="text-white/80 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleUpgradeToPremium}
                disabled={isUpgrading || currentPlan === 'premium'}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                    Processando...
                  </>
                ) : currentPlan === 'premium' ? (
                  <>
                    <Crown size={16} className="mr-2" />
                    Plano Ativo
                  </>
                ) : (
                  <>
                    <Crown size={16} className="mr-2" />
                    Assinar Premium
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Choose Premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Por que escolher Premium?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass border-white/20 hover:border-yellow-400/30 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="text-yellow-400" size={24} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Call to Action for Free Users */}
        {currentPlan !== 'premium' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30">
              <CardContent className="p-6 text-center">
                <Crown className="text-yellow-400 mx-auto mb-4" size={48} />
                <h3 className="text-white font-bold text-lg mb-2">
                  Desbloqueie Todo o Potencial do Eclipse Reads
                </h3>
                <p className="text-white/70 mb-6">
                  Acesse conteúdo exclusivo, leia offline e tenha uma experiência sem limites
                </p>
                <Button 
                  onClick={handleUpgradeToPremium}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 px-8 py-3"
                  size="lg"
                >
                  {isUpgrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Crown size={20} className="mr-2" />
                      Começar Premium Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}