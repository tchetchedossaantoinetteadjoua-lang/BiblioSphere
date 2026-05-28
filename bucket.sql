-- Script SQL de création automatique et de configuration du bucket Supabase Storage pour BiblioSphere.
-- Ce script peut être exécuté dans l'éditeur SQL de votre tableau de bord Supabase.

-- 1. Insertion du bucket "book-pdfs" dans les buckets de stockage de niveau supérieur
-- S'il n'existe pas déjà, nous créons un bucket public nommé "book-pdfs"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-pdfs', 
  'book-pdfs', 
  true, 
  52428800, -- Limite de taille à 50 Mo (50 * 1024 * 1024 octets)
  ARRAY['application/pdf'] -- Uniquement les fichiers PDF autorisés pour la sécurité du catalogue
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Configuration des stratégies de sécurité des objets de stockage (Row Level Security)
-- Nous permettons la lecture publique globale de tous les PDFs de la bibliothèque
CREATE POLICY "Allow Public Read Access on book-pdfs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'book-pdfs');

-- Autoriser l'insertion/upload d'objets (fichiers PDF) dans le bucket par n'importe quel rôle (visiteur, membre, admin)
-- pour correspondre au mode d'upload anonyme simplifié.
CREATE POLICY "Allow Public Upload Access on book-pdfs"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'book-pdfs');

-- Autoriser la mise à jour (remplacement) des fichiers du bucket par n'importe quel rôle
CREATE POLICY "Allow Public Update Access on book-pdfs"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'book-pdfs')
WITH CHECK (bucket_id = 'book-pdfs');

-- Autoriser la suppression des fichiers du bucket par n'importe quel rôle administrateur ou membre
CREATE POLICY "Allow Public Delete Access on book-pdfs"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'book-pdfs');
