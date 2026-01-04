import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, Mail, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            toast.error('Veuillez entrer une adresse email valide');
            return;
        }

        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        // Vérifier la longueur du mot de passe
        if (password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);
        
        const result = await signUp(email.trim(), password);
        
        setIsLoading(false);

        if (result.success) {
            toast.success('Compte créé avec succès !', {
                description: 'Vérifiez votre email pour confirmer votre compte.',
            });
            // Rediriger vers la page de login
            navigate('/login', { replace: true });
        } else {
            toast.error('Échec de l\'inscription', {
                description: result.error || 'Une erreur est survenue lors de la création du compte',
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
                        Créer un compte
                    </h1>
                    <p className="text-zinc-400">Inscrivez-vous pour accéder au tableau de bord</p>
                </div>

                {/* Sign Up Card */}
                <Card className="bg-zinc-900/50 border-zinc-800 shadow-2xl">
                    <div className="p-8">
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
                                    placeholder="Créez un mot de passe (min. 6 caractères)"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Lock size={16} />
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmez votre mot de passe"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/20"
                                disabled={isLoading || !email.trim() || !password.trim() || !confirmPassword.trim()}
                                isLoading={isLoading}
                            >
                                {!isLoading && (
                                    <>
                                        <UserPlus size={18} className="mr-2" />
                                        Créer un compte
                                    </>
                                )}
                                {isLoading && (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Création...
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Link to Login */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-zinc-400">
                                Déjà un compte ?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                                >
                                    Se connecter
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

export default SignUpPage;

