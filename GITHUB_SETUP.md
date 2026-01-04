# Instructions pour publier sur GitHub

## Prérequis

1. Installer Git : https://git-scm.com/download/win
2. Créer un compte GitHub si vous n'en avez pas : https://github.com

## Étapes pour publier le site

### 1. Ouvrir un terminal dans le dossier du projet

Ouvrez PowerShell ou Git Bash dans le dossier : `C:\Users\Lucac\Desktop\test anti`

### 2. Initialiser Git (si pas déjà fait)

```bash
git init
```

### 3. Ajouter tous les fichiers

```bash
git add .
```

### 4. Faire le premier commit

```bash
git commit -m "Initial commit: Dashboard avec chat intégré à n8n"
```

### 5. Créer un repository sur GitHub

1. Allez sur https://github.com
2. Cliquez sur le bouton "+" en haut à droite
3. Sélectionnez "New repository"
4. Donnez un nom à votre repository (ex: "dashboard-n8n")
5. Ne cochez PAS "Initialize this repository with a README"
6. Cliquez sur "Create repository"

### 6. Connecter le repository local à GitHub

Remplacez `VOTRE_USERNAME` et `NOM_DU_REPOSITORY` par vos valeurs :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/NOM_DU_REPOSITORY.git
```

### 7. Pousser le code sur GitHub

```bash
git branch -M main
git push -u origin main
```

## Commandes Git utiles pour plus tard

- Voir l'état : `git status`
- Ajouter des fichiers : `git add .`
- Faire un commit : `git commit -m "Votre message"`
- Envoyer sur GitHub : `git push`
- Télécharger depuis GitHub : `git pull`

## Note importante

Les fichiers suivants sont automatiquement ignorés (grâce à .gitignore) :
- node_modules/
- dist/
- fichiers .log
- fichiers de configuration locale

Cela évite de publier des fichiers inutiles sur GitHub.




