# Guide de Déploiement vers Vercel

Pour que votre site fonctionnant avec Deriv soit stable et opérationnel, suivez ces étapes :

## 1. Paramètres Deriv
Allez sur [api.deriv.com](https://api.deriv.com/) et connectez-vous.
- Assurez-vous que votre **App ID** (ex: `126885`) est bien créé.
- Dans la configuration de votre application, ajoutez l'URL de votre site Vercel (ex: `https://votre-projet.vercel.app`) dans :
  - **Redirect URL**
  - **Verification Domain**

## 2. Variables d'Environnement sur Vercel
Lors du déploiement sur Vercel, ajoutez ces variables dans les paramètres du projet (`Settings` > `Environment Variables`) :
- `VITE_DERIV_APP_ID` : Votre App ID (ex: `126885`).

## 3. Connexion du Robot 🤖
Si vous avez un jeton (token) pour votre robot :
- Le jeton ne doit jamais être écrit en clair dans le code.
- Utilisez les variables d'environnement (`VITE_DERIV_TOKEN`) si vous souhaitez l'intégrer, mais soyez prudent avec la sécurité si le projet est public sur GitHub.

## 4. Retirer le projet de GitHub
Si vous souhaitez supprimer le projet :
1. Allez sur GitHub > Votre Projet.
2. Cliquez sur **Settings**.
3. Descendez à **Danger Zone**.
4. Cliquez sur **Delete this repository**.
