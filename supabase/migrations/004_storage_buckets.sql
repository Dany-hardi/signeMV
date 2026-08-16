-- ============================================================
-- Migration 004 : Supabase Storage — Buckets
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- Bucket pour les illustrations (images des poèmes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'illustrations', 'illustrations', TRUE,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- Bucket pour les fichiers audio (lectures vocales)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audios', 'audios', TRUE,
  52428800, -- 50 MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
);

-- Bucket pour les couvertures de publications/livres
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'couvertures', 'couvertures', TRUE,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket pour les affiches d'événements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evenements', 'evenements', TRUE,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/pdf']
);

-- ============================================================
-- Politiques Storage : lecture publique
-- ============================================================

CREATE POLICY "public_read_illustrations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'illustrations');

CREATE POLICY "public_read_audios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audios');

CREATE POLICY "public_read_couvertures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'couvertures');

CREATE POLICY "public_read_evenements_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evenements');

-- ============================================================
-- Politiques Storage : upload admin uniquement
-- ============================================================

CREATE POLICY "admin_upload_illustrations"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'illustrations');

CREATE POLICY "admin_upload_audios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audios');

CREATE POLICY "admin_upload_couvertures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'couvertures');

CREATE POLICY "admin_delete_media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (TRUE);
