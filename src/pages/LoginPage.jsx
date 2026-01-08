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
            toast.error('Champs requis');
            return;
        }

        setIsLoading(true);

        const result = await login(email.trim(), password);

        setIsLoading(false);

        if (result.success) {
            toast.success('Connecté');
            // Rediriger vers le dashboard après connexion réussie
            navigate('/', { replace: true });
        } else {
            toast.error('Erreur', {
                description: 'Identifiants incorrects',
            });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-wider">
                        REDBOU TE BZ
                    </h1>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-700"
                            autoComplete="email"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-700"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-medium rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? '...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

