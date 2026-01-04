# Commandes pour publier sur GitHub

## Après avoir créé le repository sur GitHub, exécutez ces commandes :

```bash
# Ajouter le remote (remplacez VOTRE_USERNAME et NOM_DU_REPOSITORY)
git remote add origin https://github.com/VOTRE_USERNAME/NOM_DU_REPOSITORY.git

# Renommer la branche en main (si nécessaire)
git branch -M main

# Pousser le code sur GitHub
git push -u origin main
```

## Exemple concret :

Si votre username GitHub est `lucac` et que vous avez créé un repository nommé `dashboard-n8n`, les commandes seraient :

```bash
git remote add origin https://github.com/lucac/dashboard-n8n.git
git branch -M main
git push -u origin main
```

## Note :

Si Git n'est pas dans votre PATH, utilisez cette commande d'abord :
```powershell
$env:Path += ";C:\Program Files\Git\bin"
```

Puis exécutez les commandes git ci-dessus.




