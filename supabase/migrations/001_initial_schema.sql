-- ============================================================
-- signeMV — Schéma complet PostgreSQL (Supabase)
-- Migration 001 : Initial Schema
-- ============================================================

-- Extensions (uuid-ossp et pgcrypto sont gérés par Supabase nativement)
-- gen_random_uuid() est disponible sans extension sur PostgreSQL >= 13

-- ============================================================
-- TYPES ENUM
-- ============================================================

CREATE TYPE statut_poeme AS ENUM ('brouillon', 'publie', 'archive', 'programme');
CREATE TYPE type_media AS ENUM ('image', 'audio', 'pdf', 'video', 'autre');
CREATE TYPE statut_message AS ENUM ('non_lu', 'lu', 'repondu', 'archive');
CREATE TYPE objet_contact AS ENUM ('lecture_publique', 'collaboration', 'tirage', 'mot_lecteur', 'presse', 'autre');
CREATE TYPE statut_newsletter AS ENUM ('brouillon', 'planifie', 'envoye', 'annule');
CREATE TYPE source_abonne AS ENUM ('homepage', 'liseuse', 'footer', 'about', 'poeme', 'autre');
CREATE TYPE role_utilisateur AS ENUM ('super_admin', 'editeur');
CREATE TYPE statut_commentaire AS ENUM ('en_attente', 'approuve', 'rejete', 'spam');
CREATE TYPE statut_evenement AS ENUM ('annonce', 'passe', 'annule');

-- ============================================================
-- TABLE : utilisateurs (comptes admin)
-- ============================================================

CREATE TABLE utilisateurs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          role_utilisateur NOT NULL DEFAULT 'editeur',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : poete (profil unique de la poétesse MV)
-- ============================================================

CREATE TABLE poete (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             VARCHAR(255) NOT NULL,
  prenom          VARCHAR(255),
  bio             TEXT,
  bio_courte      VARCHAR(500),
  photo_url       TEXT,
  email_contact   VARCHAR(255),
  site_web        TEXT,
  reseaux_sociaux JSONB DEFAULT '{}'::JSONB,
  -- Ex: {"instagram": "url", "substack": "url", "goodreads": "url"}
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : collections (recueils / thèmes)
-- ============================================================

CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  couleur     VARCHAR(7) DEFAULT '#8C5A4C',  -- hex
  icone       VARCHAR(50),                   -- lucide icon name
  ordre       INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed des collections initiales
INSERT INTO collections (titre, slug, description, couleur, icone, ordre) VALUES
  ('Introspection', 'introspection', 'Regards tournés vers l''intérieur, silences habités.', '#8C5A4C', 'Eye', 1),
  ('Étreintes',     'etreintes',    'Corps et âmes qui se rejoignent ou se séparent.',       '#6E4A58', 'Heart', 2),
  ('Mélancolie',    'melancolie',   'La beauté douce des choses qui s''éloignent.',           '#5B6B8C', 'Cloud', 3),
  ('Saisons',       'saisons',      'Le temps qui passe, les métamorphoses du vivant.',       '#5B6B5C', 'Leaf', 4),
  ('Silences',      'silences',     'Ce qui se dit sans mots.',                               '#7A6E5C', 'Wind', 5),
  ('Nocturnes',     'nocturnes',    'Écriture de la nuit, des veilles et des songes.',        '#3D3B5C', 'Moon', 6);

-- ============================================================
-- TABLE : poemes (entité centrale)
-- ============================================================

CREATE TABLE poemes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    VARCHAR(255) UNIQUE NOT NULL,
  titre                   VARCHAR(500) NOT NULL,
  contenu                 TEXT NOT NULL,
  extrait                 TEXT,                    -- 2-3 lignes pour les aperçus
  meta_description        VARCHAR(300),            -- pour SEO
  date_ecriture           DATE,
  publie_le               TIMESTAMPTZ,
  statut                  statut_poeme NOT NULL DEFAULT 'brouillon',
  collection_id           UUID REFERENCES collections(id) ON DELETE SET NULL,
  reading_time_minutes    DECIMAL(4,1),
  ordre_dans_collection   INTEGER DEFAULT 0,
  audio_url               TEXT,
  audio_duration_secondes INTEGER,
  illustration_url        TEXT,
  illustration_alt        TEXT,
  og_image_url            TEXT,                    -- image OG générée
  is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count             INTEGER NOT NULL DEFAULT 0,
  vues_count              INTEGER NOT NULL DEFAULT 0,
  created_by              UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_poemes_statut     ON poemes(statut);
CREATE INDEX idx_poemes_collection ON poemes(collection_id);
CREATE INDEX idx_poemes_publie_le  ON poemes(publie_le DESC);
CREATE INDEX idx_poemes_featured   ON poemes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_poemes_slug       ON poemes(slug);

-- ============================================================
-- TABLE : tags (mots-clés transversaux)
-- ============================================================

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        VARCHAR(100) UNIQUE NOT NULL,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  couleur    VARCHAR(7) DEFAULT '#8C5A4C',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : poemes_tags (many-to-many poemes <-> tags)
-- ============================================================

CREATE TABLE poemes_tags (
  poeme_id UUID NOT NULL REFERENCES poemes(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (poeme_id, tag_id)
);

-- ============================================================
-- TABLE : medias (fichiers uploadés)
-- ============================================================

CREATE TABLE medias (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom              VARCHAR(255) NOT NULL,
  type             type_media NOT NULL,
  url              TEXT NOT NULL,
  storage_path     TEXT,                      -- chemin dans Supabase Storage
  taille_octets    BIGINT,
  mime_type        VARCHAR(100),
  alt_text         TEXT,
  largeur          INTEGER,                   -- pour les images
  hauteur          INTEGER,
  duree_secondes   INTEGER,                   -- pour les audios
  poeme_id         UUID REFERENCES poemes(id) ON DELETE SET NULL,
  uploaded_by      UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medias_poeme ON medias(poeme_id);
CREATE INDEX idx_medias_type  ON medias(type);

-- ============================================================
-- TABLE : abonnes_newsletter
-- ============================================================

CREATE TABLE abonnes_newsletter (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 VARCHAR(255) UNIQUE NOT NULL,
  prenom                VARCHAR(100),
  token_confirmation    VARCHAR(64) UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  confirme              BOOLEAN NOT NULL DEFAULT FALSE,
  confirme_le           TIMESTAMPTZ,
  token_desinscription  VARCHAR(64) UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  source                source_abonne NOT NULL DEFAULT 'autre',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  desabonne_le          TIMESTAMPTZ,
  CONSTRAINT email_valide CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE INDEX idx_abonnes_confirme ON abonnes_newsletter(confirme);
CREATE INDEX idx_abonnes_email    ON abonnes_newsletter(email);

-- ============================================================
-- TABLE : newsletters (campagnes envoyées)
-- ============================================================

CREATE TABLE newsletters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sujet            VARCHAR(500) NOT NULL,
  contenu_html     TEXT,
  contenu_texte    TEXT,
  poeme_id         UUID REFERENCES poemes(id) ON DELETE SET NULL,
  statut           statut_newsletter NOT NULL DEFAULT 'brouillon',
  planifie_le      TIMESTAMPTZ,
  envoye_le        TIMESTAMPTZ,
  nb_destinataires INTEGER DEFAULT 0,
  nb_ouvertures    INTEGER DEFAULT 0,
  nb_clics         INTEGER DEFAULT 0,
  created_by       UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : messages_contact
-- ============================================================

CREATE TABLE messages_contact (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  sujet       VARCHAR(500) NOT NULL,
  objet       objet_contact NOT NULL DEFAULT 'autre',
  message     TEXT NOT NULL,
  statut      statut_message NOT NULL DEFAULT 'non_lu',
  ip_hash     VARCHAR(64),                    -- hash anonymisé (RGPD)
  user_agent  TEXT,
  repondu_le  TIMESTAMPTZ,
  note_interne TEXT,                          -- note privée de MV
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_statut     ON messages_contact(statut);
CREATE INDEX idx_messages_created_at ON messages_contact(created_at DESC);

-- ============================================================
-- TABLE : likes (votes par poème, dédupliqués par IP/session)
-- ============================================================

CREATE TABLE likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poeme_id   UUID NOT NULL REFERENCES poemes(id) ON DELETE CASCADE,
  ip_hash    VARCHAR(64) NOT NULL,           -- SHA256 anonymisé
  session_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_like UNIQUE (poeme_id, ip_hash)
);

CREATE INDEX idx_likes_poeme ON likes(poeme_id);

-- Trigger : mettre à jour likes_count sur poemes automatiquement
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE poemes SET likes_count = likes_count + 1 WHERE id = NEW.poeme_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE poemes SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.poeme_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================================
-- TABLE : signets (favoris lecteurs — token anonyme)
-- ============================================================

CREATE TABLE signets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poeme_id      UUID NOT NULL REFERENCES poemes(id) ON DELETE CASCADE,
  lecteur_token VARCHAR(64) NOT NULL,         -- UUID stocké en localStorage
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_signet UNIQUE (poeme_id, lecteur_token)
);

CREATE INDEX idx_signets_token ON signets(lecteur_token);

-- ============================================================
-- TABLE : visites (analytics léger)
-- ============================================================

CREATE TABLE visites (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page                 VARCHAR(255) NOT NULL,   -- 'home' | 'poemes' | 'poeme/:slug' | etc.
  poeme_id             UUID REFERENCES poemes(id) ON DELETE SET NULL,
  referrer             TEXT,
  ip_hash              VARCHAR(64),
  pays                 VARCHAR(2),              -- code ISO
  duree_secondes       INTEGER,
  scroll_max_pourcent  SMALLINT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visites_poeme      ON visites(poeme_id);
CREATE INDEX idx_visites_page       ON visites(page);
CREATE INDEX idx_visites_created_at ON visites(created_at DESC);

-- Trigger : incrémenter vues_count sur poemes
CREATE OR REPLACE FUNCTION update_vues_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.poeme_id IS NOT NULL THEN
    UPDATE poemes SET vues_count = vues_count + 1 WHERE id = NEW.poeme_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vues_count
AFTER INSERT ON visites
FOR EACH ROW EXECUTE FUNCTION update_vues_count();

-- ============================================================
-- TABLE : sessions_admin (gestion des tokens JWT maison)
-- ============================================================

CREATE TABLE sessions_admin (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  token          VARCHAR(128) UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  expire_le      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token  ON sessions_admin(token);
CREATE INDEX idx_sessions_user   ON sessions_admin(utilisateur_id);
CREATE INDEX idx_sessions_expire ON sessions_admin(expire_le);

-- ============================================================
-- TABLE : evenements (lectures publiques, salons, rencontres)
-- ============================================================

CREATE TABLE evenements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre           VARCHAR(500) NOT NULL,
  description     TEXT,
  lieu            VARCHAR(255),
  adresse         TEXT,
  ville           VARCHAR(100),
  pays            VARCHAR(2) DEFAULT 'FR',
  date_debut      TIMESTAMPTZ NOT NULL,
  date_fin        TIMESTAMPTZ,
  url_inscription TEXT,
  url_affiche     TEXT,
  statut          statut_evenement NOT NULL DEFAULT 'annonce',
  is_en_ligne     BOOLEAN DEFAULT FALSE,
  url_streaming   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evenements_date   ON evenements(date_debut DESC);
CREATE INDEX idx_evenements_statut ON evenements(statut);

-- ============================================================
-- TABLE : publications (livres, recueils publiés)
-- ============================================================

CREATE TABLE publications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre            VARCHAR(500) NOT NULL,
  sous_titre       VARCHAR(500),
  editeur          VARCHAR(255),
  date_publication DATE,
  isbn             VARCHAR(20),
  description      TEXT,
  couverture_url   TEXT,
  prix             DECIMAL(10, 2),
  url_achat        TEXT,
  is_disponible    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : commentaires (modérés, optionnels)
-- ============================================================

CREATE TABLE commentaires (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poeme_id      UUID NOT NULL REFERENCES poemes(id) ON DELETE CASCADE,
  auteur_nom    VARCHAR(255) NOT NULL,
  auteur_email  VARCHAR(255) NOT NULL,
  contenu       TEXT NOT NULL,
  statut        statut_commentaire NOT NULL DEFAULT 'en_attente',
  ip_hash       VARCHAR(64),
  parent_id     UUID REFERENCES commentaires(id) ON DELETE SET NULL,  -- réponses imbriquées
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commentaires_poeme   ON commentaires(poeme_id);
CREATE INDEX idx_commentaires_statut  ON commentaires(statut);

-- ============================================================
-- TABLE : citations (phrases fortes extraites des poèmes)
-- Utilisées pour cartes visuelles, réseaux sociaux
-- ============================================================

CREATE TABLE citations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poeme_id   UUID NOT NULL REFERENCES poemes(id) ON DELETE CASCADE,
  texte      TEXT NOT NULL,
  is_vedette BOOLEAN NOT NULL DEFAULT FALSE,   -- mise en avant sur homepage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citations_poeme   ON citations(poeme_id);
CREATE INDEX idx_citations_vedette ON citations(is_vedette) WHERE is_vedette = TRUE;

-- ============================================================
-- VUE : poemes_publies (pour les requêtes publiques)
-- ============================================================

CREATE VIEW poemes_publies AS
SELECT
  p.*,
  c.titre      AS collection_titre,
  c.slug       AS collection_slug,
  c.couleur    AS collection_couleur
FROM poemes p
LEFT JOIN collections c ON c.id = p.collection_id
WHERE p.statut = 'publie'
  AND (p.publie_le IS NULL OR p.publie_le <= NOW())
ORDER BY p.publie_le DESC NULLS LAST, p.created_at DESC;

-- ============================================================
-- VUE : stats_poeme (tableau de bord admin)
-- ============================================================

CREATE VIEW stats_poemes AS
SELECT
  p.id,
  p.titre,
  p.statut,
  p.likes_count,
  p.vues_count,
  COUNT(DISTINCT s.id)   AS nb_signets,
  COUNT(DISTINCT co.id)  AS nb_commentaires,
  c.titre                AS collection
FROM poemes p
LEFT JOIN signets     s  ON s.poeme_id  = p.id
LEFT JOIN commentaires co ON co.poeme_id = p.id AND co.statut = 'approuve'
LEFT JOIN collections  c  ON c.id        = p.collection_id
GROUP BY p.id, p.titre, p.statut, p.likes_count, p.vues_count, c.titre
ORDER BY p.likes_count DESC;

-- ============================================================
-- VUE : dashboard_admin (métriques globales)
-- ============================================================

CREATE VIEW dashboard_admin AS
SELECT
  (SELECT COUNT(*) FROM poemes WHERE statut = 'publie')    AS poemes_publies,
  (SELECT COUNT(*) FROM poemes WHERE statut = 'brouillon') AS poemes_brouillons,
  (SELECT COUNT(*) FROM abonnes_newsletter WHERE confirme = TRUE) AS abonnes_actifs,
  (SELECT COUNT(*) FROM messages_contact WHERE statut = 'non_lu') AS messages_non_lus,
  (SELECT SUM(likes_count) FROM poemes)                    AS total_likes,
  (SELECT SUM(vues_count)  FROM poemes)                    AS total_vues,
  (SELECT COUNT(*) FROM evenements WHERE statut = 'annonce' AND date_debut > NOW()) AS evenements_a_venir;

-- ============================================================
-- TRIGGERS : updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_poetes
  BEFORE UPDATE ON poete
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_collections
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_poemes
  BEFORE UPDATE ON poemes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_utilisateurs
  BEFORE UPDATE ON utilisateurs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_newsletters
  BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_publications
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_evenements
  BEFORE UPDATE ON evenements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER : publie_le automatique quand statut -> 'publie'
-- ============================================================

CREATE OR REPLACE FUNCTION set_publie_le()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'publie' AND OLD.statut != 'publie' AND NEW.publie_le IS NULL THEN
    NEW.publie_le = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_publie_le
  BEFORE UPDATE ON poemes
  FOR EACH ROW EXECUTE FUNCTION set_publie_le();
