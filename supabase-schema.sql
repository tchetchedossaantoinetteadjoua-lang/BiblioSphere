-- =============================================================================
-- SYSTEME DE BASE DE DONNEES BIBLIOSPHERE (POSTGRESQL / SUPABASE)
-- SCRIPT SQL DE CREATION ET POPULATION DE REFERENCE POUR SUPABASE
-- TARGET : PostgreSQL (Supabase Default)
-- =============================================================================

-- Desactiver les contraintes de cles etrangeres temporairement pour reinitialisation propre
-- (Equivalent TRUNCATE CASCADE sur Supabase)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS penalties CASCADE;
DROP TABLE IF EXISTS borrowings CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Definition d'un type ENUM personnalisé si besoin ou utilisation de contraintes CHECK de Postgres (plus evolutif)
-- Nous privilégierons des contraintes CHECK ou VARCHAR standard pour rester compatible avec des flux Supabase REST standard.

-- -----------------------------------------------------------------------------
-- 1. TABLE : categories
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(110) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. TABLE : authors
-- -----------------------------------------------------------------------------
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  bio TEXT NULL,
  nationality VARCHAR(100) DEFAULT 'Française',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. TABLE : users (Membres, Bibliothecaires, Administrateurs)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Mot de passe haché (bcrypt)
  role VARCHAR(30) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'librarian', 'member')),
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  membership_type VARCHAR(50) NOT NULL DEFAULT 'Classic' CHECK (membership_type IN ('Classic', 'Premium', 'VIP Diamond')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. TABLE : books
-- -----------------------------------------------------------------------------
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_id INT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  publisher VARCHAR(150) DEFAULT 'Hachette',
  publication_year INT DEFAULT 2025,
  cover_image VARCHAR(512) NULL,
  pdf_url VARCHAR(512) NULL, -- Stockage de l'adresse du PDF uploadé sur le Bucket Supabase
  quantity INT NOT NULL DEFAULT 3,
  available_quantity INT NOT NULL DEFAULT 3,
  shelf_location VARCHAR(100) DEFAULT 'Rayon A - Étagère 1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. TABLE : reservations
-- -----------------------------------------------------------------------------
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'canceled'))
);

-- -----------------------------------------------------------------------------
-- 6. TABLE : borrowings (Registre d'emprunts en cours)
-- -----------------------------------------------------------------------------
CREATE TABLE borrowings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE NULL,
  renewed_count INT DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue'))
);

-- -----------------------------------------------------------------------------
-- 7. TABLE : penalties (Amendes de retard accumulees)
-- -----------------------------------------------------------------------------
CREATE TABLE penalties (
  id SERIAL PRIMARY KEY,
  borrowing_id INT NOT NULL REFERENCES borrowings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  days_overdue INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE NULL
);

-- -----------------------------------------------------------------------------
-- 8. TABLE : notifications
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. TABLE : audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  "user" VARCHAR(255) NOT NULL,
  action VARCHAR(150) NOT NULL,
  target VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexations d'optimisation
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_penalties_status ON penalties(status);

-- =============================================================================
-- POPULATION DES DONNEES DE PARCOURS INITIALES
-- =============================================================================

INSERT INTO categories (id, name, slug) VALUES
(1, 'Sciences & Informatique', 'sciences-informatique'),
(2, 'Littérature & Fiction', 'litterature-fiction'),
(3, 'Histoire & Biographies', 'histoire-biographies'),
(4, 'Arts & Photographie', 'arts-photographie'),
(5, 'Développement Personnel', 'developpement-personnel'),
(6, 'Bandes Dessinées & Mangas', 'bandes-dessinees-mangas')
ON CONFLICT (id) DO NOTHING;

-- Reprise automatique de sequences
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

INSERT INTO authors (id, name, bio, nationality) VALUES
(1, 'Albert Camus', 'Écrivain, dramaturge et philosophe français, prix Nobel de littérature en 1957. Connu pour L''Étranger et La Peste.', 'Française'),
(2, 'Isaac Asimov', 'Écrivain de science-fiction américain d''origine russe. Célèbre pour le cycle de Fondation et les lois de la robotique.', 'Américaine'),
(3, 'Stephen King', 'Spécialiste incontesté de l''épouvante, du fantastique et du suspense psychologique.', 'Américaine'),
(4, 'Jules Verne', 'Romancier visionnaire célèbre pour son anticipation et ses aventures extraordinaires.', 'Française'),
(5, 'Taylor Otwell', 'Créateur acclamé de l''écosystème Laravel en langage PHP.', 'Américaine')
ON CONFLICT (id) DO NOTHING;

-- Reprise automatique de sequences
SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors));

-- Exemple de livre initial
INSERT INTO books (id, isbn, title, description, author_id, category_id, publisher, publication_year, cover_image, quantity, available_quantity, shelf_location) VALUES
(1, '978-2070403028', 'L''Étranger', 'Un récit saisissant d''Albert Camus illustrant l''absurdité de la condition de l''homme.', 1, 2, 'Gallimard Folio', 1942, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', 5, 5, 'Rayon A - Étagère 3'),
(2, '978-2207249116', 'Fondation', 'Le chef-d''œuvre absolu de l''histoire du futur où le psycho-historien Hari Seldon prédit la chute de l''Empire.', 2, 1, 'Denoël Présence du futur', 1951, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600', 3, 3, 'Rayon B - Double Étagère 1')
ON CONFLICT (id) DO NOTHING;

SELECT setval('books_id_seq', (SELECT MAX(id) FROM books));
