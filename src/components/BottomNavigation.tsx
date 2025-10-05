import { Home, Search, BookOpen, User, Settings } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "home" | "search" | "library" | "profile";
  onTabChange: (tab: "home" | "search" | "library" | "profile") => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const handleSettings = () => {
    // Dispatch event to show settings directly
    const settingsEvent = new CustomEvent('showSettingsScreen');
    window.dispatchEvent(settingsEvent);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 via-blue-700 to-blue-600/90 backdrop-blur-lg border-t border-white/10 px-3 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange("home")}
          className={`relative flex flex-col items-center p-3 rounded-lg transition-colors duration-300 ${
            activeTab === "home" 
              ? "text-white bg-white/20" 
              : "text-blue-200/80"
          }`}
        >
          {activeTab === "home" && (
            <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
          <Home size={20} />
          <span className="text-xs mt-1 font-medium">
            Home
          </span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => onTabChange("search")}
          className={`relative flex flex-col items-center p-3 rounded-lg transition-colors duration-300 ${
            activeTab === "search" 
              ? "text-white bg-white/20" 
              : "text-blue-200/80"
          }`}
        >
          {activeTab === "search" && (
            <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
          <Search size={20} />
          <span className="text-xs mt-1 font-medium">
            Busca
          </span>
        </button>

        {/* Library Tab */}
        <button
          onClick={() => onTabChange("library")}
          className={`relative flex flex-col items-center p-3 rounded-lg transition-colors duration-300 ${
            activeTab === "library" 
              ? "text-white bg-white/20" 
              : "text-blue-200/80"
          }`}
        >
          {activeTab === "library" && (
            <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
          <BookOpen size={20} />
          <span className="text-xs mt-1 font-medium">
            Biblioteca
          </span>
        </button>



        {/* Settings Tab */}
        <button
          onClick={handleSettings}
          className="relative flex flex-col items-center p-3 rounded-lg transition-colors duration-300 text-blue-200/80"
        >
          <Settings size={20} />
          <span className="text-xs mt-1 font-medium">
            Config
          </span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange("profile")}
          className={`relative flex flex-col items-center p-3 rounded-lg transition-colors duration-300 ${
            activeTab === "profile" 
              ? "text-white bg-white/20" 
              : "text-blue-200/80"
          }`}
        >
          {activeTab === "profile" && (
            <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
          <User size={20} />
          <span className="text-xs mt-1 font-medium">
            Perfil
          </span>
        </button>
      </div>
    </div>
  );
}