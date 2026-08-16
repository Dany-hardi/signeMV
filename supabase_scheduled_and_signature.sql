-- ============================================================
-- SQL Migration : Publication Programmée & Signature MV (Fix 2)
-- ============================================================

-- 1. Mettre à jour la contrainte des statuts sur la table 'poemes'
ALTER TABLE poemes DROP CONSTRAINT IF EXISTS poemes_statut_check;
ALTER TABLE poemes ADD CONSTRAINT poemes_statut_check 
  CHECK (statut IN ('brouillon', 'publie', 'archive', 'programme'));

-- 2. Ajouter la colonne date_programmation si absente
ALTER TABLE poemes ADD COLUMN IF NOT EXISTS date_programmation TIMESTAMP WITH TIME ZONE;

-- 3. Re-créer proprement la vue des poèmes publiés (DROP préalable requis par PostgreSQL)
DROP VIEW IF EXISTS poemes_publies CASCADE;

CREATE VIEW poemes_publies AS
SELECT 
    p.id,
    p.slug,
    p.titre,
    p.contenu,
    p.extrait,
    p.meta_description,
    p.date_ecriture,
    COALESCE(p.date_programmation, p.publie_le, p.created_at) AS publie_le,
    p.statut,
    p.collection_id,
    c.titre AS collection_titre,
    c.slug AS collection_slug,
    c.couleur AS collection_couleur,
    p.reading_time_minutes,
    p.audio_url,
    p.audio_duration_secondes,
    p.illustration_url,
    p.illustration_alt,
    p.og_image_url,
    p.is_featured,
    p.likes_count,
    p.vues_count,
    p.created_at,
    p.updated_at
FROM poemes p
LEFT JOIN collections c ON p.collection_id = c.id
WHERE (p.statut = 'publie' AND p.publie_le <= NOW())
   OR (p.statut = 'programme' AND COALESCE(p.date_programmation, p.publie_le) <= NOW());
