import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier l'état de connexion au montage et écouter les changements
    useEffect(() => {
        if (!isConfigured) {
            // Si Supabase n'est pas configuré, on passe directement en mode non chargé
            setIsLoading(false);
            return;
        }

        // Récupérer la session actuelle
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (error) {
                    console.error('Erreur lors de la récupération de la session:', error);
                }
                setUser(session?.user ?? null);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération de la session:', error);
                setIsLoading(false);
            });

        // Écouter les changements d'authentification
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const login = async (email, password) => {
        if (!isConfigured) {
            return { success: false, error: 'Supabase n\'est pas configuré. Veuillez configurer vos clés dans le fichier .env' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message || 'Une erreur est survenue' };
        }
    };

    const signUp = async (email, password) => {
        if (!isConfigured) {
            return { success: false, error: 'Supabase n\'est pas configuré. Veuillez configurer vos clés dans le fichier .env' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message || 'Une erreur est survenue' };
        }
    };

    const logout = async () => {
        if (!isConfigured) {
            setUser(null);
            return;
        }

        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            setUser(null);
        }
    };

    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{ user, login, signUp, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

