import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LayoutDashboard, MessageSquareText, LogOut, User, Sun, Moon, Clock } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import BRPage from './pages/BRPage';

import { cn } from './lib/utils';
import { StatsProvider } from './context/StatsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState, useRef, useEffect } from 'react';

import AccountModal from './components/ui/AccountModal';

const NavItem = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
        isActive
          ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-sm"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
      )}
    >
      <Icon size={18} />
      {children}
    </NavLink>
  );
};

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <div className="text-zinc-500 dark:text-zinc-400">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour la navigation (affiché seulement si connecté)
const AppNavigation = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <>
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">R</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:inline-block transition-colors">REDBOU hacoo</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2 p-1 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full transition-colors overflow-x-auto scrollbar-hide">
              <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/br" icon={Clock}>BR</NavItem>
              <NavItem to="/chat" icon={MessageSquareText}>Chat</NavItem>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors border border-zinc-200 dark:border-zinc-700"
                title="Mon compte"
              >
                <User size={18} className="text-zinc-600 dark:text-zinc-300" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Compte connecté</p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-200 truncate font-medium">{user?.email}</p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAccountModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <User size={14} />
                      Compte
                    </button>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Composant principal de l'application (routes protégées)
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const paths = ['/', '/br', '/chat'];
      const currentIndex = paths.indexOf(location.pathname);

      if (currentIndex === -1) return;

      if (isLeftSwipe) {
        // Swipe Left -> Next Page (e.g. Dashboard -> BR)
        if (currentIndex < paths.length - 1) {
          navigate(paths[currentIndex + 1]);
        }
      } else {
        // Swipe Right -> Previous Page (e.g. BR -> Dashboard)
        if (currentIndex > 0) {
          navigate(paths[currentIndex - 1]);
        }
      }
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col relative transition-colors duration-300"
    >
      {/* Toast Notifications */}
      <Toaster position="top-center" theme="dark" closeButton />

      {/* Global Navigation - affichée seulement si connecté */}
      {isAuthenticated && <AppNavigation />}

      {/* Main Content Area */}
      <main className={cn("flex-1", isAuthenticated ? "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" : "")}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/br"
            element={
              <ProtectedRoute>
                <BRPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer - affiché seulement si connecté */}
      {isAuthenticated && (
        <footer className="border-t border-zinc-200 dark:border-zinc-900 py-6 text-center text-zinc-500 dark:text-zinc-600 text-sm transition-colors">
          &copy; {new Date().getFullYear()} REDBOU hacoo. Secure Connection.
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatsProvider>
          <Router>
            <AppContent />
          </Router>
        </StatsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
