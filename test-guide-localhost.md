# Guide d'Installation de BiblioSphere en Local (Localhost & WampServer)

Ce guide pas-à-pas décrit la configuration et le déploiement local de la plateforme intelligente **BiblioSphere** en utilisant un serveur MySQL local (WampServer, XAMPP, Laragon) et l'intégration Laravel-React.

---

## 📋 Prérequis Matériels & Logiciels

Avant de commencer, vérifiez que votre ordinateur dispose de :
1.  **WampServer 3.x+** ou **Laragon** (embarquant **MySQL 8.0+** ou MariaDB, et **PHP 8.2+**).
2.  **Node.js 18+** & **npm** pour la compilation du client React.
3.  **Composer** (Gestionnaire de dépendances PHP pour Laravel).

---

## 🛠️ Étape 1 : Préparation de la Base de Données (MySQL & WampServer)

1.  Démarrez **WampServer** et attendez que l'icône dans la barre des tâches devienne **verte**.
2.  Ouvrez votre navigateur et allez sur **phpMyAdmin** : `http://localhost/phpmyadmin/`.
3.  Connectez-vous avec l'utilisateur par défaut `root` (sans mot de passe par défaut sur WampServer).
4.  Cliquez sur l'onglet **Importer** (Import) dans le menu supérieur.
5.  Sélectionnez le fichier **`database.sql`** situé à la racine du projet BiblioSphere.
6.  Cliquez sur **Importer** en bas de la page.
    *   *Alternative en ligne de commande :*
        ```bash
        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bibliosphere;"
        mysql -u root -p bibliosphere < database.sql
        ```
    La base de données `bibliosphere` est maintenant créée et peuplée avec les tables, relations, contraintes d'intégrité et données réelles de test.

---

## 💾 Étape 2 : Configuration du Backend Laravel 12 API (Optionnel / Production locale)

Si vous utilisez le dossier `/laravel` fourni dans le projet pour exposer l'API REST de production :

1.  Allez dans le répertoire du backend Laravel :
    ```bash
    cd laravel
    ```
2.  Installez les dépendances Composer :
    ```bash
    composer install
    ```
3.  Dupliquez le fichier de configuration environnementale :
    ```bash
    cp .env.example .env
    ```
4.  Éditez le fichier `.env` pour le faire pointer sur votre base de données locale WampServer :
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=bibliosphere
    DB_USERNAME=root
    DB_PASSWORD=
    ```
5.  Générez la clé secrète de sécurité du chiffrement Laravel :
    ```bash
    php artisan key:generate
    ```
6.  Exécutez les migrations et les seeders si vous préférez re-générer les tables dynamiquement :
    ```bash
    php artisan migrate --seed
    ```
7.  Lancez le serveur local de test PHP :
    ```bash
    php artisan serve
    ```
    L'API Laravel écoute dorénavant sur `http://127.0.0.1:8000`.

---

## 🖥️ Étape 3 : Configuration du Frontend React & Dev-Server

1.  Allez à la racine du projet BiblioSphere (contenant `package.json` et `vite.config.ts`) :
    ```bash
    cd ..
    ```
2.  Installez les dépendances npm :
    ```bash
    npm install
    ```
3.  Modifiez le fichier `.env.local` ou `.env` pour raccorder l'interface React à l'API locale correspondante :
    ```env
    VITE_API_URL=http://localhost:3000/api
    # Si raccordement direct au backend Laravel physique :
    # VITE_API_URL=http://127.0.0.1:8000/api
    ```
4.  Démarrez le serveur de développement Vite :
    ```bash
    npm run dev
    ```

---

## 🧪 Étape 4 : Comptes de Test pré-configurés pour la Maquette

Pour évaluer les différents types de privilèges (RBAC) sur l'interface, utilisez les profils de test installés par le script SQL ou les simulateurs d'acteurs de la barre d'accueil supérieure :

| Rôle | E-mail du compte | Mot de passe | Privilèges applicatifs |
|:-----|:-----------------|:-------------|:-----------------------|
| 👑 **Administrateur** | `admin@bibliosphere.com` | `password` | Contrôle total, Journaux d'audit, Paramètres, Encaissement d'amendes |
| 📚 **Bibliothécaire** | `librarian@bibliosphere.com` | `password` | Gestion des stocks de livres, enregistrement manuel de prêts, encaissement |
| 👤 **Membre Adhérent** | `lucas@gmail.com` | `password` | Réservation express de livres, suggestions IA Sphera, historique personnel, profil |
| 🔴 **Membre Suspendu** | `sophie.dupond@gmail.com` | `password` | Lecture seule, actions bloquées d'office en raison d'une amende de retard |

---

## 💡 Astuces de Résolution de Problèmes Communs sur WampServer

*   **Erreur `Port 3306 occupé` :** WampServer utilise parfois le port `3307` par défaut pour éviter les conflits si vous avez déjà un autre service MySQL d'installé. Dans ce cas, modifiez la valeur de `DB_PORT` dans le fichier `.env` ou testez la connexion sur le port alternative.
*   **Permissions d'accès (CORS) :** Si vous connectez React à l'API Laravel physique sur des ports séparés (ex: 3000 et 8000), vérifiez que la configuration CORS de Laravel dans `config/cors.php` autorise l'origine `http://localhost:3000`.

---

## ⚡ Autre Option : Déploiement Cloud Serverless (Vercel)
Si vous souhaitez déployer **BiblioSphere** sur **Vercel** en cloud ou le tester localement avec l'émulateur Vercel `vercel dev`, consultez le guide dédié :
📂 **[GUIDE_DEPLOY_VERCEL.md](./GUIDE_DEPLOY_VERCEL.md)**

