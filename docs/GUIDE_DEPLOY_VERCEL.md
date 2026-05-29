# Guide de Déploiement et de Tests sur Vercel (Local & Production)

Ce guide explique comment extraire, tester et déployer l'application **BiblioSphere** sur **Vercel** en production, ainsi que la configuration des variables d'environnement confidentielles (sensitive), tout en évitant les erreurs de routeurs ou les `404` sur l'API.

---

## 🚀 Étape 1 : Extraction et Configuration Locale

Après avoir récupéré l'archive `.zip` de l'application :

1. **Extraction de l'archive :**
   Décompressez le fichier `.zip` dans un répertoire propre sur votre poste de travail.

2. **Installation des dépendances :**
   Ouvrez votre terminal dans le dossier extrait et exécutez la commande suivante :
   ```bash
   npm install
   ```

---

## 💻 Étape 2 : Lancement en Développement Local

Vous disposez de deux méthodes pour exécuter l'application en local :

### Option A : Serveur Full-stack Intégré (Recommandé en Direct)
Cette méthode démarre le serveur Express qui sert à la fois les routes d'API et le frontend React avec rafraîchissement à chaud (via le middleware Vite).
```bash
npm run dev
```
👉 L'application complète est disponible sur [http://localhost:3000](http://localhost:3000). Les routes d'API comme `/api/books` et le frontend fonctionnent harmonieusement sur le même port.

### Option B : Émulation Vercel Locale (`vercel dev`)
Si vous préférez simuler le comportement exact de la plateforme Vercel (les Serverless Functions locales) avant de déployer en ligne :
1. Assurez-vous d'avoir installé le CLI Vercel :
   ```bash
   npm install -g vercel
   ```
2. Lancez l'émulateur local Vercel :
   ```bash
   vercel dev
   ```
👉 Grâce aux corrections apportées dans `vercel.json` et `server.ts`, les requêtes d'API `/api/*` sont automatiquement et proprement aiguillées vers la Serverless Function `/api/index.ts` sans générer de `404`.

---

## 🌐 Étape 3 : Déploiement en Production sur Vercel

Pour déployer l'application sur l'infrastructure Cloud de Vercel :

1. **Connexion et Initialisation du projet :**
   Exécutez la commande suivante à la racine du projet :
   ```bash
   vercel
   ```
   *Suivez les invites interactives dans votre terminal :*
   - Connectez-vous à votre compte Vercel si ce n'est pas déjà fait.
   - Confirmez la création du projet.
   - Lorsque Vercel vous demande si vous souhaitez modifier l'emplacement ou les scripts de build, choisissez **Non** (les configurations intégrées de détection automatique pour Vite sont parfaites).

2. **Déploiement final en Production :**
   Envoyez le projet en production avec la commande :
   ```bash
   vercel --prod
   ```

---

## 🔒 Étape 4 : Configuration des Variables d'Environnement (Sensitive)

Pour que l'IA (Sphera Chat), la base de données décentralisée Supabase ou votre serveur MySQL s'exécutent de façon résiliente et sécurisée :

1. Allez sur votre **tableau de bord Vercel** ([vercel.com](https://vercel.com)).
2. Cliquez sur votre projet **BiblioSphere**.
3. Allez dans l'onglet **Settings** > **Environment Variables**.
4. Ajoutez les variables secrètes d'environnement suivantes comme type **Sensitive** (en masquant les valeurs du log ou de l'affichage) :

| Clé (Variable) | Description | Recommandation / Format |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Clé secrète d'API Google pour alimenter le chatbot Sphera. | `AIzaSy...` (Masquée / Secrète) |
| `SUPABASE_URL` | L'URL d'API de votre instance Cloud Supabase. | `https://xxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | La clé secrète d'accès à la base de données Supabase. | Clé secrète de rôle de service (Service Role Key) |
| `DB_HOST` | *(Optionnel)* Hôte MySQL si raccordement à un serveur externe. | `127.0.0.1` ou serveur MySQL cloud |
| `DB_DATABASE` | *(Optionnel)* Nom de la base SQL. | `bibliosphere` |

5. Une fois les variables enregistrées, relancez un déploiement ou redéployez la production pour appliquer les nouvelles configurations sur vos fonctions serverless :
   ```bash
   vercel --prod
   ```

---

## 🛠️ Explications Techniques des Corrections Appliquées

Pour que tout fonctionne clé-en-main, nous avons résolu deux points bloquants d'infrastructure :
* **Correction du routage Vercel (`vercel.json`) :** Nous avons changé `"destination": "/api/index.ts"` en `"destination": "/api"`. Vercel compile et cartographie les fonctions sans l'extension de fichier. L'ancienne valeur cherchait un fichier d'index brut et retournait une page de non trouvé `404`.
* **Robustesse de l'aiguillage Express (`server.ts`) :** Nous avons configuré l'instance de l'application Express pour écouter sur les routes préfixées par `/api` ET les routes sans préfixe `/` (`app.use('/api', api);` et `app.use('/', api);`). Cela empêche l'app de retourner `404` si l'agent Vercel local ou Cloud omet ou réécrit le chemin d'API.
* **Sécurité du démarrage :** Désactivation automatique de l'écoute manuelle de port Express (`app.listen`) lorsque l'environnement Vercel est détecté (`process.env.VERCEL`), laissant Vercel orchestrer le démarrage.
