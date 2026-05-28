-- =============================================================================
-- SYSTEME DE BASE DE DONNEES BIBLIOSPHERE
-- SCRIPT SQL DE CREATION ET POPULATION MAQUETTE DE PRODUCTION EN LOCALHOST
-- CIBLE : MySQL 8.x / MariaDB (Compatible WampServer, XAMPP, Laragon, Docker)
-- ARCHITECTURE DE TYPE RELATIONNELLE - REGLES D'INTEGRITE SERRÉES
-- =============================================================================

-- =============================================================================
-- SCRIPT DE NETTOYAGE PROPRE DE TOUTE LA BASE DE DONNEES (RESET COMPLET)
-- =============================================================================
DROP DATABASE IF EXISTS `bibliosphere`;
CREATE DATABASE `bibliosphere` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bibliosphere`;

-- Désactiver les clés étrangères pour éliminer les conflits d'ordre lors de l'écrasement potentiel
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `penalties`;
DROP TABLE IF EXISTS `borrowings`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `authors`;
DROP TABLE IF EXISTS `categories`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. TABLE : categories
-- -----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nom thématique du rayon d\'ouvrages',
  `slug` VARCHAR(110) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLE : authors
-- -----------------------------------------------------------------------------
CREATE TABLE `authors` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL COMMENT 'Nom complet de l\'auteur littéraire',
  `bio` TEXT NULL,
  `nationality` VARCHAR(100) DEFAULT 'Française',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLE : users (Membres, Bibliothécaires, Administrateurs)
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Haché via bcrypt dans l\'API Sanctum Laravel',
  `role` ENUM('admin', 'librarian', 'member') NOT NULL DEFAULT 'member',
  `status` ENUM('active', 'suspended', 'banned') NOT NULL DEFAULT 'active',
  `membership_type` ENUM('Classic', 'Premium', 'VIP Diamond') NOT NULL DEFAULT 'Classic',
  `subscription_expires_at` TIMESTAMP NULL COMMENT 'Échéance annuelle d\'adhésion physique',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLE : books
-- -----------------------------------------------------------------------------
CREATE TABLE `books` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `isbn` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Code à barres unique d\'inventaire',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL COMMENT 'Résumé littéraire',
  `author_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `publisher` VARCHAR(150) DEFAULT 'Hachette',
  `publication_year` INT UNSIGNED DEFAULT 2025,
  `cover_image` VARCHAR(255) NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 3,
  `available_quantity` INT UNSIGNED NOT NULL DEFAULT 3,
  `shelf_location` VARCHAR(100) DEFAULT 'Rayon A - Étagère 1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_books_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  INDEX `idx_isbn` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLE : reservations
-- -----------------------------------------------------------------------------
CREATE TABLE `reservations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `reserved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL COMMENT 'Rétention max de 3 jours avant annulation d\'office',
  `status` ENUM('pending', 'completed', 'expired', 'canceled') NOT NULL DEFAULT 'pending',
  CONSTRAINT `fk_res_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  INDEX `idx_status_res` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLE : borrowings (Registre d'emprunts en cours)
-- -----------------------------------------------------------------------------
CREATE TABLE `borrowings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `borrowed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `due_date` TIMESTAMP NOT NULL COMMENT 'Calculé par défaut à J+14 jours',
  `returned_at` TIMESTAMP NULL,
  `renewed_count` INT UNSIGNED DEFAULT 0 COMMENT 'Max 1 prolongation autorisée',
  `status` ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
  CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loans_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  INDEX `idx_status_loans` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABLE : penalties (Amendes financières de retard accumulées)
-- -----------------------------------------------------------------------------
CREATE TABLE `penalties` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `borrowing_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Tarif d\'amende standardisé : 500 CFA / jour de retard',
  `days_overdue` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
  `paid_at` TIMESTAMP NULL,
  CONSTRAINT `fk_penalties_loan` FOREIGN KEY (`borrowing_id`) REFERENCES `borrowings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_penalties_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_penalty_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLE : notifications
-- -----------------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLE : audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user` VARCHAR(255) NOT NULL,
  `action` VARCHAR(150) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- INJECTIONS DE TEST REALISTES - JEU DE DONNEES SEED EN FRANCAIS
-- =============================================================================

INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Développement Web & IA', 'developpement-web-ia'),
(2, 'Littérature Classique', 'litterature-classique'),
(3, 'Histoire & Civilisation', 'histoire-civilisation'),
(4, 'Sciences & Innovations', 'sciences-innovations'),
(5, 'Roman d\'Aventures & Fiction', 'roman-aventures-fiction');

INSERT INTO `authors` (`id`, `name`, `bio`, `nationality`) VALUES
(1, 'Victor Hugo', 'Écrivain, poète et homme de politique majeur de la littérature romanesque française.', 'Française'),
(2, 'Albert Camus', 'Philosophe et auteur couronné du prix Nobel d\'expression existentialiste.', 'Française'),
(3, 'Marc-André Selosse', 'Professeur émérite du Muséum d\'Histoire Naturelle, spécialiste de microbiologie.', 'Française'),
(4, 'Jules Verne', 'Romancier visionnaire célèbre pour son anticipation et ses aventures extraordinaires.', 'Française'),
(5, 'Taylor Otwell', 'Créateur acclamé de l\'écosystème Laravel en langage PHP.', 'Américaine');

-- Les tables users, borrowings, penalties, reservations restent vides au démarrage pour que l'utilisateur crée ses propres membres et administrateurs.

INSERT INTO `books` (`id`, `isbn`, `title`, `description`, `author_id`, `category_id`, `publisher`, `publication_year`, `cover_image`, `quantity`, `available_quantity`, `shelf_location`) VALUES
(1, '978-2070403028', 'L\'Étranger', 'Un récit saisissant d\'Albert Camus illustrant l\'absurdité de la condition de l\'homme.', 2, 2, 'Gallimard Folio', 1942, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', 5, 5, 'Rayon A - Étagère 3'),
(2, '978-2070409778', 'Les Misérables', 'Le chef-d\'œuvre intemporel de Victor Hugo narrant la trajectoire rédemptrice de Jean Valjean.', 1, 2, 'Gallimard Poche', 1862, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600', 3, 3, 'Rayon B - Étagère 1'),
(3, '978-2081514332', 'L\'Architecture Laravel Pro', 'Le manuel technique de référence pour l\'ingénierie de plateformes web complexes robustes.', 5, 1, 'O\'Reilly Tech', 2026, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', 8, 8, 'Rayon Tech - Étagère 4'),
(4, '978-2253011311', 'Vingt Mille Lieues sous les mers', 'Les extraordinaires pérégrinations océaniques imaginées par Jules Verne à bord du Nautilus.', 4, 5, 'Livre de Poche', 1870, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600', 4, 4, 'Rayon C - Étagère 2');

-- Les tables borrowings, penalties, reservations et audit_logs restent vides au démarrage pour que l'utilisateur crée ses propres membres et transactions.

INSERT INTO `audit_logs` (`id`, `user`, `action`, `target`, `timestamp`) VALUES
(1, 'Admin BiblioSphere', 'Initialisation', 'Catalogue nettoyé et prêt', '2026-05-21 18:13:00');

-- =============================================================================
-- FIN DES DIRECTIVES SQL SYSTEME BIBLIOSPHERE
-- =============================================================================
