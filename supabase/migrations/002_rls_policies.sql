-- ============================================================
-- Migration 002 : Row Level Security (RLS)
-- Politique de sécurité Supabase
-- ============================================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE utilisateurs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE poete              ENABLE ROW LEVEL SECURITY;
ALTER TABLE poemes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE poemes_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnes_newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_contact   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE signets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_admin     ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires       ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLITIQUES : lecture publique (anonyme)
-- ============================================================

-- Poèmes : seuls les publiés sont visibles par le public
CREATE POLICY "public_read_poemes_publies"
  ON poemes FOR SELECT
  USING (statut = 'publie' AND (publie_le IS NULL OR publie_le <= NOW()));

-- Collections actives visibles par tous
CREATE POLICY "public_read_collections"
  ON collections FOR SELECT
  USING (is_active = TRUE);

-- Tags visibles par tous
CREATE POLICY "public_read_tags"
  ON tags FOR SELECT
  TO anon USING (TRUE);

-- Liaisons poemes_tags visibles par tous
CREATE POLICY "public_read_poemes_tags"
  ON poemes_tags FOR SELECT
  TO anon USING (TRUE);

-- Médias publics (images/audios rattachés à des poèmes publiés)
CREATE POLICY "public_read_medias"
  ON medias FOR SELECT
  USING (TRUE);

-- Événements annoncés visibles par tous
CREATE POLICY "public_read_evenements"
  ON evenements FOR SELECT
  USING (statut = 'annonce');

-- Publications disponibles visibles par tous
CREATE POLICY "public_read_publications"
  ON publications FOR SELECT
  USING (is_disponible = TRUE);

-- Citations visibles par tous
CREATE POLICY "public_read_citations"
  ON citations FOR SELECT
  TO anon USING (TRUE);

-- Profil poète visible par tous
CREATE POLICY "public_read_poete"
  ON poete FOR SELECT
  TO anon USING (TRUE);

-- Commentaires approuvés visibles par tous
CREATE POLICY "public_read_commentaires"
  ON commentaires FOR SELECT
  USING (statut = 'approuve');

-- ============================================================
-- POLITIQUES : actions anonymes (lecteurs)
-- ============================================================

-- Likes : un anonyme peut insérer (avec son ip_hash)
CREATE POLICY "anon_insert_like"
  ON likes FOR INSERT
  TO anon WITH CHECK (TRUE);

-- Likes : un anonyme peut voir ses propres likes
CREATE POLICY "anon_read_own_likes"
  ON likes FOR SELECT
  TO anon USING (TRUE);

-- Likes : un anonyme peut supprimer son like (par ip_hash)
CREATE POLICY "anon_delete_own_like"
  ON likes FOR DELETE
  TO anon USING (TRUE);

-- Signets : lecture et écriture via token
CREATE POLICY "anon_manage_signets"
  ON signets FOR ALL
  TO anon USING (TRUE) WITH CHECK (TRUE);

-- Visites : tout le monde peut insérer une visite
CREATE POLICY "anon_insert_visite"
  ON visites FOR INSERT
  TO anon WITH CHECK (TRUE);

-- Newsletter : tout le monde peut s'inscrire
CREATE POLICY "anon_insert_abonne"
  ON abonnes_newsletter FOR INSERT
  TO anon WITH CHECK (TRUE);

-- Contact : tout le monde peut envoyer un message
CREATE POLICY "anon_insert_message"
  ON messages_contact FOR INSERT
  TO anon WITH CHECK (TRUE);

-- Commentaires : un anonyme peut soumettre (en attente de modération)
CREATE POLICY "anon_insert_commentaire"
  ON commentaires FOR INSERT
  TO anon WITH CHECK (statut = 'en_attente');

-- ============================================================
-- POLITIQUES : admin full access (service_role ou authenticated)
-- ============================================================

-- Poèmes : admin peut tout faire
CREATE POLICY "admin_full_poemes"
  ON poemes FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Toutes les tables : accès complet pour les utilisateurs authentifiés (admin)
CREATE POLICY "admin_full_collections"     ON collections        FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_tags"            ON tags               FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_poemes_tags"     ON poemes_tags        FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_medias"          ON medias             FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_abonnes"         ON abonnes_newsletter FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_newsletters"     ON newsletters        FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_messages"        ON messages_contact   FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_likes"           ON likes              FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_signets"         ON signets            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_visites"         ON visites            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_sessions"        ON sessions_admin     FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_evenements"      ON evenements         FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_publications"    ON publications       FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_commentaires"    ON commentaires       FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_citations"       ON citations          FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_utilisateurs"    ON utilisateurs       FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "admin_full_poete"           ON poete              FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
