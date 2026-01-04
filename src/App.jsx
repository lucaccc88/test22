import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LayoutDashboard, MessageSquareText, LogOut } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { cn } from './lib/utils';
import { StatsProvider } from './context/StatsContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const NavItem = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
        isActive
          ? "bg-zinc-100 text-zinc-900 shadow-sm"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Chargement...</div>
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="font-bold text-zinc-100">S</span>
            </div>
            <span className="font-semibold text-zinc-100 hidden sm:inline-block">SaaS Dashboard</span>
          </div>

          <div className="flex items-center gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-full">
            <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/chat" icon={MessageSquareText}>Chat</NavItem>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 hidden sm:inline-block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Composant principal de l'application (routes protégées)
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Toast Notifications */}
      <Toaster position="top-center" theme="dark" closeButton />

      {/* Global Navigation - affichée seulement si connecté */}
      {isAuthenticated && <AppNavigation />}

      {/* Main Content Area */}
      <main className={cn("flex-1", isAuthenticated ? "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" : "")}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer - affiché seulement si connecté */}
      {isAuthenticated && (
        <footer className="border-t border-zinc-900 py-6 text-center text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} Admin Dashboard. Secure Connection.
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <Router>
          <AppContent />
        </Router>
      </StatsProvider>
    </AuthProvider>
  );
}

export default App;
