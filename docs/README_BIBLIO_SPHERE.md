# BiblioSphere — Manuel de l'Architecte & Documentation SaaS
Version Laravel 12 API / React 19 / Clean Architecture Modulaire
________________________________________

Bienvenue dans l'écosystème **BiblioSphere**, une plateforme SaaS moderne de gestion intelligente de bibliothèque conçue selon les plus hauts standards d'ingénierie logicielle. Ce document étudie la structure globale du projet, le schéma relationnel de la base de données, la spécification complète de l'API REST et les instructions d'alignement pour intégrer le backend Laravel et le frontend React.

---

## 1. ARCHITECTURE APPLICATIVE (CLEAN ARCHITECTURE)

La plateforme BiblioSphere applique le principe de **Séparation des Préoccupations (SoC)** ainsi que l'architecture multiniveaux découplée :

```
    +-------------------------------------------------------------+
    |                     COUCHE PRÉSENTATION                     |
    |                 React 19 + Vite + Tailwind v4               |
    +------------------------------+------------------------------+
                                   | HTTP REST (Sanctum Auth)
                                   v
    +-------------------------------------------------------------+
    |                  COUCHE REST API & VALIDS                   |
    |                Controllers + FormRequests + API Resources   |
    +------------------------------+------------------------------+
                                   | Service Injection
                                   v
    +-------------------------------------------------------------+
    |                      COUCHE MÉTIER                          |
    |              Services Layer (BorrowingService, etc.)        |
    +------------------------------+------------------------------+
                                   | Repository Interface
                                   v
    +-------------------------------------------------------------+
    |                      COUCHE ACCÈS DONNÉES                   |
    |            Repository Pattern (Eloquent models, MySQL)      |
    +-------------------------------------------------------------+
```

### Justification des choix :
1. **Controllers fins (Thin Controllers) :** Capturent uniquement les entrées HTTP, délèguent les validations aux objets `FormRequest` dédiés et renvoient les données via les `API Resources`.
2. **Couche Service (Services Layer) :** Contient la logique d'affaires métier. C'est ici que sont évaluées les contraintes (ex: vérification de l'abonnement actif, limite d'emprunts, calcul des amendes journalières).
3. **Repository Pattern :** Isole la logique d'accès à la base de données de la logique métier principale, permettant de substituer Eloquent par d'autres moteurs d'accès en cas de besoin.

---

## 2. STRUCTURE DE DOSSIERS NATIVE GENEREE

```
app/
 ├── Http/
 │    ├── Controllers/
 │    │    └── API/
 │    │         ├── BookController.php          <-- REST API Livres
 │    │         └── BorrowingController.php     <-- REST API Emprunts
 │    ├── Requests/
 │    │    └── BookStoreRequest.php             <-- Validation validation stricte
 │    └── Resources/
 │         └── BookResource.php                 <-- Sérialisation JSON normalisée
 ├── Models/
 │    ├── Author.php                            <-- Modèle Auteur
 │    ├── Book.php                              <-- Modèle Livre + Scopes
 │    ├── Borrowing.php                         <-- Modèle Prêts & Retards
 │    ├── Penalty.php                           <-- Modèle Amende
 │    └── Subscription.php                      <-- Modèle Abonnements
 ├── Services/
 │    └── BorrowingService.php                  <-- Logique d'affaires de validation
 └── Repositories/
      └── Eloquent/
           └── BookRepository.php               <-- Pattern d'accès encapsulé

database/
 ├── migrations/
 │    └── 2026_05_19_000000_create_library_tables.php  <-- Dictionnaire SQL
 └── seeders/
      └── DatabaseSeeder.php                    <-- Données de démonstration SaaS

routes/
 └── api.php                                    <-- Déclarations des routes RESTful
```

---

## 3. SCHÉMA DE LA BASE DE DONNÉES RELATIONNELLE

### Table : `users`
| Champ | Type | Contraintes | Rôle |
|:---|:---|:---|:---|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `firstname` | string | NOT NULL | Prénom de l'usager |
| `lastname` | string | NOT NULL | Nom de famille |
| `email` | string | UNIQUE, NOT NULL | Adresse de connexion |
| `role` | enum | ADMIN, LIBRARIAN, MEMBER | Rôles applicatifs |
| `status` | enum | ACTIVE, SUSPENDED, PENDING | Statut du compte |

### Table : `books`
| Champ | Type | Contraintes | Rôle |
|:---|:---|:---|:---|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `isbn` | string | UNIQUE, NOT NULL | Numéro standard international |
| `title` | string | NOT NULL | Titre de l'ouvrage |
| `author_id` | foreignId | CONSTRAINED TO `authors` | Clef étrangère auteur |
| `category_id` | foreignId | CONSTRAINED TO `categories` | Clef étrangère catégorie |
| `quantity` | integer | DEFAULT 1 | Quantité achetée |
| `available_quantity` | integer | DEFAULT 1 | Exemplaires en rayon |
| `status` | enum | AVAILABLE, BORROWED, RESERVED | État de l'exemplaire |

### Table : `borrowings`
| Champ | Type | Contraintes | Rôle |
|:---|:---|:---|:---|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Clef de transaction |
| `user_id` | foreignId | CONSTRAINED TO `users` | Clef membre emprunteur |
| `book_id` | foreignId | CONSTRAINED TO `books`| Clef livre emprunté |
| `borrowed_at` | timestamp | DEFAULT useCurrent() | Date d'attribution |
| `due_date` | timestamp | NOT NULL | Date limite de rendu (+14j) |
| `returned_at` | timestamp | NULLABLE | Date effective du retour |
| `status` | enum | ACTIVE, RETURNED, OVERDUE | Statut de l'emprunt |

### Table : `penalties`
| Champ | Type | Contraintes | Rôle |
|:---|:---|:---|:---|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Clef d'identification |
| `borrowing_id` | foreignId | CONSTRAINED TO `borrowings` | Clef de l'emprunt fautif |
| `user_id` | foreignId | CONSTRAINED TO `users` | Clef du membre pénalisé |
| `amount` | decimal | DEFAULT 0.00 | Montant total (jours × 500 CFA) |
| `status` | enum | UNPAID, PAID | Preuve de règlement |

---

## 4. CONTRATS ET CONCEPTS REST API

La plateforme implémente les routes API suivantes, sécurisées par authentification **Laravel Sanctum** :

### AUTHENTICATION
* **`POST /api/auth/register`**
  * *Entrées :* `firstname`, `lastname`, `email`, `password`, `membership_type`
  * *Régime :* Crée l'abonnement initial du membre et attribue un token Sanctum.
* **`POST /api/auth/login`**
  * *Entrées :* `email`, `password`
  * *Exception :* Le système jette une erreur HTTP 403 si le membre est suspendu en raison de pénalités impayées ou abonnement échu.
* **`POST /api/auth/logout`**
  * *Sortie :* Destructeur de sessions.

### CATALOGUE (BOOKS)
* **`GET /api/books`**
  * *Filtres :* `search` (ISBN/Auteur/Titre), `category_id`
  * *Format :* Paginated JSON `BookResource`.
* **`POST /api/books`**
  * *Rôle requis :* `admin` ou `librarian`
  * *Validation :* Gérée par `BookStoreRequest` (Champs obligatoires requis).
* **`PUT /api/books/{id}`** : Mise à jour des exemplaires et rayons de rangement.
* **`DELETE /api/books/{id}`** : Supprime l'ouvrage. Interdit si des prêts sont actifs.

### EMPRUNTS (BORROWINGS)
* **`POST /api/borrowings`**
  * *Métier :* Exécute les validations multi-blocages (max 5 prêts, abonnement expiré, amende impayée).
  * *Entrées :* `user_id`, `book_id`.
* **`POST /api/borrowings/return`**
  * *Métier :* Enregistre le retour, ré-incrémente l'inventaire en rayon et met à jour le dossier des retards.
  * *Entrées :* `borrowing_id`.

---

## 5. RECONGELER ET MANIPULER EN PRODUCTION

Pour configurer et déployer l'application sur votre infrastructure de production :

### Initialisation Backend Laravel :
```bash
# 1. Installer les modules dépendances PHP
composer install

# 2. Configurer le fichier d'environnement
cp .env.example .env
php artisan key:generate

# 3. Lancer les migrations structurées de base de données d'office avec la génération de seeders réalistes
php artisan migrate --seed
```

### Initialisation Frontend React VITE :
```bash
# 1. Installer les modules Javascript
npm install

# 2. Lancer le serveur d'affichage et de proxy
npm run dev
```

### Déploiement Cloud Serverless (Vercel) :
Pour déployer rapidement BiblioSphere sur l'infrastructure Vercel (en local via `vercel dev` ou en production via `vercel --prod`), veuillez vous référer au document complet et riche :
📂 **[GUIDE_DEPLOY_VERCEL.md](./GUIDE_DEPLOY_VERCEL.md)**

Grâce à son architecture, la communication asynchrone est prête et sécurisée. BiblioSphere est prêt au déploiement !
