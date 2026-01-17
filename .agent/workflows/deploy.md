---
description: Comment déployer les changements sur Firebase
---

# Déploiement Firebase via GitHub

## ⚠️ Configuration Spéciale

Ce projet utilise un **système de déploiement miroir** car Firebase App Hosting écoute le dépôt `hiromain/studio` au lieu de `hiromain/cuisine`.

## Procédure de Déploiement

Après chaque modification importante :

// turbo-all
1. **Commit les changements**
   ```bash
   git add -A
   git commit -m "feat: description du changement"
   ```

2. **Push vers le dépôt officiel (cuisine)**
   ```bash
   git push origin HEAD:main
   git push origin HEAD:develop
   ```

3. **Push vers le dépôt miroir (studio) pour déclencher Firebase**
   ```bash
   git push studio_mirror HEAD:main -f
   ```

## Vérification

- Le site se met à jour automatiquement sous 1-3 minutes
- URL de production : https://studio--studio-8164507608-7d4ae.us-central1.hosted.app/

## Configuration des Remotes

Les remotes Git sont déjà configurés :
- `origin` → https://github.com/hiromain/cuisine.git (dépôt officiel)
- `studio_mirror` → https://github.com/hiromain/studio.git (déclencheur Firebase)

## Pour Futurs Projets

Si tu veux reproduire ce système ailleurs :

1. Identifie quel dépôt GitHub Firebase écoute (dans la Console Firebase > App Hosting)
2. Ajoute-le comme remote secondaire :
   ```bash
   git remote add firebase_trigger https://github.com/user/repo-firebase.git
   ```
3. Pousse toujours sur les deux :
   ```bash
   git push origin main
   git push firebase_trigger main -f
   ```
