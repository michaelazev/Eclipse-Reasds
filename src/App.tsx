import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { AuthScreen } from "./components/AuthScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { SearchScreen } from "./components/SearchScreen";
import { LibraryScreen } from "./components/screens/LibraryScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { BookDetailScreen } from "./components/screens/BookDetailScreen";
import { PlansScreen } from "./components/screens/PlansScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { BottomNavigation } from "./components/BottomNavigation";
import { DesktopNavigation } from "./components/DesktopNavigation";
import { ApiStatusBanner } from "./components/ApiStatusBanner";
import SupabaseStatusBanner, { SupabaseStatusReopenButton } from "./components/SupabaseStatusBanner";
import { SupabaseDebugInfo } from "./components/SupabaseDebugInfo";
import { Toaster } from "./components/ui/sonner";
import { useIsDesktopLegacy as useIsDesktop } from "./hooks/useMediaQuery";
// Import Supabase connectivity test
import "./utils/supabaseTest";

type Screen = "home" | "search" | "library" | "profile" | "bookDetail" | "plans";

function AppContent() {
  const { state, actions } = useApp();
  const [activeScreen, setActiveScreen] =
    useState<Screen>("home");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const isDesktop = useIsDesktop();

  // Limpa cache antigo ao iniciar
  useEffect(() => {
    import('./services/booksService').then(service => {
      if (service.cleanPersistentCache) {
        service.cleanPersistentCache();
      }
    });
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = "";
    if (state.theme === "night") {
      document.documentElement.classList.add("night");
    }
    // Removed dark mode - only light and night modes available
  }, [state.theme]);

  useEffect(() => {
    const handleShowSettings = () => {
      setShowSettings(true);
    };

    const handleShowBookDetail = (event: CustomEvent) => {
      const bookId = event.detail.bookId;
      setSelectedBookId(bookId);
      setActiveScreen("bookDetail");
    };

    const handleShowPlans = () => {
      setActiveScreen("plans");
    };

    window.addEventListener('showSettingsScreen', handleShowSettings);
    window.addEventListener('showBookDetail', handleShowBookDetail as EventListener);
    window.addEventListener('showPlansScreen', handleShowPlans);
    return () => {
      window.removeEventListener('showSettingsScreen', handleShowSettings);
      window.removeEventListener('showBookDetail', handleShowBookDetail as EventListener);
      window.removeEventListener('showPlansScreen', handleShowPlans);
    };
  }, []);

  const handleTabChange = (tab: Screen) => {
    setActiveScreen(tab);
    setShowSettings(false); // Close settings when changing tabs
    if (tab !== "bookDetail") {
      setSelectedBookId(null); // Clear selected book when leaving book detail
    }
  };

  const handleBackFromBookDetail = () => {
    setActiveScreen("home");
    setSelectedBookId(null);
  };

  const handleNavigateToHome = (bookId: string) => {
    // Navigate to library so user sees o livro marcado como lido
    setActiveScreen("library");
    setSelectedBookId(null);
  };

  const handleBackFromPlans = () => {
    setActiveScreen("profile");
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/90">
            Carregando Eclipse Reads...
          </p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen">
        <AuthScreen
          onLogin={actions.login}
          onSignUp={actions.signUp}
          onGoogleLogin={actions.loginWithGoogle}
          onGuestLogin={actions.loginAsGuest}
        />
      </div>
    );
  }

  const renderScreen = () => {
    if (showSettings) {
      return (
        <div className="responsive-scroll">
          <SettingsScreen onBack={() => setShowSettings(false)} />
        </div>
      );
    }

    if (activeScreen === "bookDetail") {
      return (
        <BookDetailScreen 
          bookId={selectedBookId} 
          onBack={handleBackFromBookDetail}
          onNavigateToHome={handleNavigateToHome}
        />
      );
    }

    if (activeScreen === "plans") {
      return (
        <PlansScreen 
          onBack={handleBackFromPlans}
        />
      );
    }

    const screens = {
      home: <HomeScreen />,
      search: <SearchScreen />,
      library: <LibraryScreen 
        onSelectBook={(bookId) => {
          setSelectedBookId(bookId);
          setActiveScreen("bookDetail");
        }}
        onNavigateToSearch={() => setActiveScreen("search")}
      />,
      profile: <ProfileScreen />,
    };

    return (
      <div className="responsive-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {screens[activeScreen as keyof typeof screens]}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const handleApiRefresh = async () => {
    // Force reload user data and clear caches
    try {
      await actions.loadUserData();
      // Clear books service cache
      const booksService = await import('./services/booksService');
      if (booksService.clearCache) {
        booksService.clearCache();
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <ApiStatusBanner onRefresh={handleApiRefresh} />
  <SupabaseStatusBanner />
  <SupabaseStatusReopenButton onShow={() => window.dispatchEvent(new CustomEvent('supabase:show'))} />
      <div className="relative z-10 flex flex-col min-h-screen">
        {isDesktop && activeScreen !== "bookDetail" && activeScreen !== "plans" && (
          <DesktopNavigation
            activeTab={activeScreen as "home" | "search" | "library" | "profile"}
            onTabChange={handleTabChange}
          />
        )}
        <div
          className={`flex-1 overflow-y-auto ${isDesktop ? "" : "pb-16"}`}
        >
          {renderScreen()}
        </div>
        {!isDesktop && (
          <BottomNavigation
            activeTab={activeScreen as "home" | "search" | "library" | "profile"}
            onTabChange={handleTabChange}
          />
        )}
        <Toaster />
        <SupabaseDebugInfo />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}