import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par vos propres clés Supabase
// Vous pouvez les trouver dans votre projet Supabase : Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifier si Supabase est configuré
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                              supabaseUrl !== '' && supabaseAnonKey !== '' &&
                              !supabaseUrl.includes('YOUR_SUPABASE') && 
                              !supabaseAnonKey.includes('YOUR_SUPABASE') &&
                              !supabaseUrl.includes('votre-projet') && 
                              !supabaseAnonKey.includes('votre_cle') &&
                              supabaseUrl.startsWith('https://') &&
                              supabaseUrl.includes('.supabase.co');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase n\'est pas configuré. Veuillez créer un fichier .env avec vos clés Supabase.');
  console.warn('   VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis.');
}

// Créer le client Supabase même si non configuré (pour éviter les erreurs)
// Les appels échoueront mais l'application ne plantera pas
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isConfigured = isSupabaseConfigured;

