import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, Mail, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isConfigured } from '../lib/supabase';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        // Validation basique de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            toast.error('Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);
        
        const result = await login(email.trim(), password);
        
        setIsLoading(false);

        if (result.success) {
            toast.success('Connexion réussie', {
                description: `Bienvenue !`,
            });
            // Rediriger vers le dashboard après connexion réussie
            navigate('/', { replace: true });
        } else {
            toast.error('Échec de la connexion', {
                description: result.error || 'Email ou mot de passe incorrect',
            });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-2xl text-white">S</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                        SaaS Dashboard
                    </h1>
                    <p className="text-zinc-400">Connectez-vous pour accéder au tableau de bord</p>
                </div>

                {/* Login Card */}
                <Card className="bg-zinc-900/50 border-zinc-800 shadow-2xl">
                    <div className="p-8">
                        {/* Message d'erreur si Supabase n'est pas configuré */}
                        {!isConfigured && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-red-400 mb-1">
                                            Configuration Supabase requise
                                        </p>
                                        <p className="text-xs text-red-300/80">
                                            Veuillez créer un fichier <code className="bg-zinc-800 px-1 py-0.5 rounded">.env</code> à la racine du projet avec vos clés Supabase :
                                        </p>
                                        <pre className="mt-2 text-xs bg-zinc-950 p-2 rounded border border-zinc-800 overflow-x-auto">
{`VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Mail size={16} />
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Entrez votre adresse email"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Lock size={16} />
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/20"
                                disabled={isLoading || !email.trim() || !password.trim()}
                                isLoading={isLoading}
                            >
                                {!isLoading && (
                                    <>
                                        <LogIn size={18} className="mr-2" />
                                        Se connecter
                                    </>
                                )}
                                {isLoading && (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Connexion...
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Link to Sign Up */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-zinc-400">
                                Pas encore de compte ?{' '}
                                <Link
                                    to="/signup"
                                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                                >
                                    Créer un compte
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Footer */}
                <p className="text-center text-zinc-600 text-sm mt-6">
                    &copy; {new Date().getFullYear()} Admin Dashboard. Secure Connection.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

