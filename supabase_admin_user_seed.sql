-- ============================================================
-- SQL Migration : Création / Mise à jour Sécurisée de l'Utilisateur Admin
-- ============================================================

-- 1. S'assurer que la table 'utilisateurs' possède la structure requise
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          role_utilisateur NOT NULL DEFAULT 'editeur',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Activer l'extension pgcrypto pour le hachage sécurisé PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Insérer ou mettre à jour le compte administrateur poète
-- Remplacez 'VOTRE_MOT_DE_PASSE' par votre mot de passe secret lors de l'exécution dans l'Éditeur SQL Supabase
INSERT INTO utilisateurs (email, password_hash, role, is_active)
VALUES (
  'contact@signemv.com',
  crypt('VOTRE_MOT_DE_PASSE_SECRET', gen_salt('bf', 10)),
  'super_admin',
  TRUE
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();
