# Guide de Déploiement vers Vercel

Pour que votre site fonctionnant avec Deriv soit stable et opérationnel, suivez ces étapes :

## 1. Paramètres Deriv
Allez sur [api.deriv.com](https://api.deriv.com/) et connectez-vous.
- Assurez-vous que votre **App ID** (ex: `126885`) est bien créé.
- Dans la configuration de votre application, ajoutez l'URL de votre site Vercel (ex: `https://votre-projet.vercel.app`) dans :
  - **Redirect URL**
  - **Verification Domain**

## 2. Variables d'Environnement
Lors du déploiement (Cloud Run, Vercel, Render, etc.), ajoutez ces variables dans les paramètres de votre plateforme :
- `VITE_DERIV_APP_ID` : Votre App ID (ex: `126885`).
- `NODE_ENV` : Doit être réglé sur `production` pour activer les optimisations de performance et de sécurité.

## 3. Sécurité et Performance
- Le fichier `.env.example` sert de modèle. Ne commitez jamais votre fichier `.env` réel contenant des secrets.
- L'App ID est public par nature chez Deriv, mais assurez-vous que les domaines autorisés dans le dashboard Deriv correspondent à votre URL de production.

## 4. Retirer le projet de GitHub
Si vous souhaitez supprimer le projet :
1. Allez sur GitHub > Votre Projet.
2. Cliquez sur **Settings**.
3. Descendez à **Danger Zone**.
4. Cliquez sur **Delete this repository**.
