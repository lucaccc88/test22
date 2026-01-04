# SaaS Dashboard

Application React avec authentification Supabase, dashboard et chat.

## Configuration Supabase

Pour utiliser l'authentification, vous devez configurer vos clés Supabase :

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez vos clés Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

Vous pouvez trouver ces clés dans votre projet Supabase : **Settings > API**

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

## Fonctionnalités

- ✅ Authentification sécurisée avec Supabase
- ✅ Page de connexion (Login)
- ✅ Page d'inscription (Sign Up)
- ✅ Protection des routes
- ✅ Dashboard avec actions
- ✅ Chat avec webhook
- ✅ Sauvegarde des messages dans localStorage
