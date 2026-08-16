// ============================================================
// src/lib/supabase.ts
// Client Supabase + types complets de la base de données
// ============================================================

import { createClient } from '@supabase/supabase-js';

// Variables d'environnement — à définir dans .env
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('[Supabase] Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes dans .env');
}

// ============================================================
// TYPES — miroir exact du schéma SQL
// ============================================================

export type StatutPoeme     = 'brouillon' | 'publie' | 'archive' | 'programme';
export type TypeMedia       = 'image' | 'audio' | 'pdf' | 'video' | 'autre';
export type StatutMessage   = 'non_lu' | 'lu' | 'repondu' | 'archive';
export type ObjetContact    = 'lecture_publique' | 'collaboration' | 'tirage' | 'mot_lecteur' | 'presse' | 'autre';
export type StatutNewsletter = 'brouillon' | 'planifie' | 'envoye' | 'annule';
export type SourceAbonne    = 'homepage' | 'liseuse' | 'footer' | 'about' | 'poeme' | 'autre';
export type RoleUtilisateur = 'super_admin' | 'editeur';
export type StatutCommentaire = 'en_attente' | 'approuve' | 'rejete' | 'spam';
export type StatutEvenement = 'annonce' | 'passe' | 'annule';

// --- Utilisateur Admin ---
export interface Utilisateur {
  id:            string;
  email:         string;
  password_hash: string;
  role:          RoleUtilisateur;
  is_active:     boolean;
  last_login:    string | null;
  created_at:    string;
  updated_at:    string;
}

// --- Profil Poète ---
export interface Poete {
  id:              string;
  nom:             string;
  prenom:          string | null;
  bio:             string | null;
  bio_courte:      string | null;
  photo_url:       string | null;
  email_contact:   string | null;
  site_web:        string | null;
  reseaux_sociaux: Record<string, string | null>;
  created_at:      string;
  updated_at:      string;
}

// --- Collection (Recueil / Thème) ---
export interface Collection {
  id:          string;
  titre:       string;
  slug:        string;
  description: string | null;
  couleur:     string;
  icone:       string | null;
  ordre:       number;
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

// --- Poème ---
export interface Poeme {
  id:                    string;
  slug:                  string;
  titre:                 string;
  contenu:               string;
  extrait:               string | null;
  meta_description:      string | null;
  date_ecriture:         string | null;
  publie_le:             string | null;
  statut:                StatutPoeme;
  collection_id:         string | null;
  reading_time_minutes:  number | null;
  ordre_dans_collection: number;
  audio_url:             string | null;
  audio_duration_secondes: number | null;
  illustration_url:      string | null;
  illustration_alt:      string | null;
  og_image_url:          string | null;
  is_featured:           boolean;
  likes_count:           number;
  vues_count:            number;
  created_by:            string | null;
  created_at:            string;
  updated_at:            string;
}

// Vue étendue avec info collection
export interface PoemePublic extends Poeme {
  collection_titre: string | null;
  collection_slug:  string | null;
  collection_couleur: string | null;
}

// --- Tag ---
export interface Tag {
  id:         string;
  nom:        string;
  slug:       string;
  couleur:    string;
  created_at: string;
}

// --- Média ---
export interface Media {
  id:             string;
  nom:            string;
  type:           TypeMedia;
  url:            string;
  storage_path:   string | null;
  taille_octets:  number | null;
  mime_type:      string | null;
  alt_text:       string | null;
  largeur:        number | null;
  hauteur:        number | null;
  duree_secondes: number | null;
  poeme_id:       string | null;
  uploaded_by:    string | null;
  created_at:     string;
}

// --- Abonné Newsletter ---
export interface AbonneNewsletter {
  id:                    string;
  email:                 string;
  prenom:                string | null;
  token_confirmation:    string;
  confirme:              boolean;
  confirme_le:           string | null;
  token_desinscription:  string;
  source:                SourceAbonne;
  created_at:            string;
  desabonne_le:          string | null;
}

// --- Newsletter (campagne) ---
export interface Newsletter {
  id:               string;
  sujet:            string;
  contenu_html:     string | null;
  contenu_texte:    string | null;
  poeme_id:         string | null;
  statut:           StatutNewsletter;
  planifie_le:      string | null;
  envoye_le:        string | null;
  nb_destinataires: number;
  nb_ouvertures:    number;
  nb_clics:         number;
  created_by:       string | null;
  created_at:       string;
  updated_at:       string;
}

// --- Message Contact ---
export interface MessageContact {
  id:           string;
  nom:          string;
  email:        string;
  sujet:        string;
  objet:        ObjetContact;
  message:      string;
  statut:       StatutMessage;
  ip_hash:      string | null;
  user_agent:   string | null;
  repondu_le:   string | null;
  note_interne: string | null;
  created_at:   string;
}

// --- Like ---
export interface Like {
  id:         string;
  poeme_id:   string;
  ip_hash:    string;
  session_id: string | null;
  created_at: string;
}

// --- Signet ---
export interface Signet {
  id:            string;
  poeme_id:      string;
  lecteur_token: string;
  created_at:    string;
}

// --- Visite ---
export interface Visite {
  id:                   string;
  page:                 string;
  poeme_id:             string | null;
  referrer:             string | null;
  ip_hash:              string | null;
  pays:                 string | null;
  duree_secondes:       number | null;
  scroll_max_pourcent:  number | null;
  created_at:           string;
}

// --- Événement ---
export interface Evenement {
  id:              string;
  titre:           string;
  description:     string | null;
  lieu:            string | null;
  adresse:         string | null;
  ville:           string | null;
  pays:            string;
  date_debut:      string;
  date_fin:        string | null;
  url_inscription: string | null;
  url_affiche:     string | null;
  statut:          StatutEvenement;
  is_en_ligne:     boolean;
  url_streaming:   string | null;
  created_at:      string;
  updated_at:      string;
}

// --- Publication (livre) ---
export interface Publication {
  id:               string;
  titre:            string;
  sous_titre:       string | null;
  editeur:          string | null;
  date_publication: string | null;
  isbn:             string | null;
  description:      string | null;
  couverture_url:   string | null;
  prix:             number | null;
  url_achat:        string | null;
  is_disponible:    boolean;
  created_at:       string;
  updated_at:       string;
}

// --- Commentaire ---
export interface Commentaire {
  id:           string;
  poeme_id:     string;
  auteur_nom:   string;
  auteur_email: string;
  contenu:      string;
  statut:       StatutCommentaire;
  ip_hash:      string | null;
  parent_id:    string | null;
  created_at:   string;
}

// --- Citation ---
export interface Citation {
  id:         string;
  poeme_id:   string;
  texte:      string;
  is_vedette: boolean;
  created_at: string;
}

// --- Vues Dashboard ---
export interface StatsPoeme {
  id:               string;
  titre:            string;
  statut:           StatutPoeme;
  likes_count:      number;
  vues_count:       number;
  nb_signets:       number;
  nb_commentaires:  number;
  collection:       string | null;
}

export interface DashboardAdmin {
  poemes_publies:     number;
  poemes_brouillons:  number;
  abonnes_actifs:     number;
  messages_non_lus:   number;
  total_likes:        number;
  total_vues:         number;
  evenements_a_venir: number;
}

// ============================================================
// DÉFINITION DES TABLES (pour Supabase generics)
// ============================================================

export type Database = {
  public: {
    Tables: {
      utilisateurs:       { Row: Utilisateur;       Insert: Partial<Utilisateur> & { email: string; password_hash: string }; Update: Partial<Utilisateur>; Relationships: []; };
      poete:              { Row: Poete;              Insert: Partial<Poete> & { nom: string };                              Update: Partial<Poete>; Relationships: []; };
      collections:        { Row: Collection;         Insert: Partial<Collection> & { titre: string; slug: string };        Update: Partial<Collection>; Relationships: []; };
      poemes:             { Row: Poeme;              Insert: Partial<Poeme> & { slug: string; titre: string; contenu: string }; Update: Partial<Poeme>; Relationships: []; };
      tags:               { Row: Tag;                Insert: Partial<Tag> & { nom: string; slug: string };                  Update: Partial<Tag>; Relationships: []; };
      poemes_tags:        { Row: { poeme_id: string; tag_id: string }; Insert: { poeme_id: string; tag_id: string }; Update: never; Relationships: []; };
      medias:             { Row: Media;              Insert: Partial<Media> & { nom: string; type: TypeMedia; url: string }; Update: Partial<Media>; Relationships: []; };
      abonnes_newsletter: { Row: AbonneNewsletter;   Insert: { email: string; prenom?: string | null; source: SourceAbonne }; Update: Partial<AbonneNewsletter>; Relationships: []; };
      newsletters:        { Row: Newsletter;         Insert: Partial<Newsletter> & { sujet: string };                        Update: Partial<Newsletter>; Relationships: []; };
      messages_contact:   { Row: MessageContact;     Insert: { nom: string; email: string; sujet: string; objet: ObjetContact; message: string; ip_hash?: string | null; user_agent?: string | null }; Update: Partial<MessageContact>; Relationships: []; };
      likes:              { Row: Like;               Insert: { poeme_id: string; ip_hash: string; session_id?: string | null }; Update: Partial<Like>; Relationships: []; };
      signets:            { Row: Signet;             Insert: { poeme_id: string; lecteur_token: string };                    Update: Partial<Signet>; Relationships: []; };
      visites:            { Row: Visite;             Insert: { page: string; poeme_id?: string | null; referrer?: string | null; ip_hash?: string | null; pays?: string | null; duree_secondes?: number | null; scroll_max_pourcent?: number | null }; Update: Partial<Visite>; Relationships: []; };
      sessions_admin:     { Row: { id: string; utilisateur_id: string; token: string; ip_address: string | null; user_agent: string | null; expire_le: string; created_at: string }; Insert: Omit<{ id: string; utilisateur_id: string; token: string; ip_address: string | null; user_agent: string | null; expire_le: string; created_at: string }, 'id' | 'token' | 'created_at'>; Update: never; Relationships: []; };
      evenements:         { Row: Evenement;          Insert: Partial<Evenement> & { titre: string; date_debut: string };  Update: Partial<Evenement>; Relationships: []; };
      publications:       { Row: Publication;        Insert: Partial<Publication> & { titre: string };                     Update: Partial<Publication>; Relationships: []; };
      commentaires:       { Row: Commentaire;        Insert: Partial<Commentaire> & { poeme_id: string; auteur_nom: string; auteur_email: string; contenu: string }; Update: Partial<Commentaire>; Relationships: []; };
      citations:          { Row: Citation;           Insert: Partial<Citation> & { poeme_id: string; texte: string };      Update: Partial<Citation>; Relationships: []; };
    };
    Views: {
      poemes_publies: { Row: PoemePublic };
      stats_poemes:   { Row: StatsPoeme };
      dashboard_admin: { Row: DashboardAdmin };
    };
  };
};

// ============================================================
// CLIENT SUPABASE PUBLIC (anon key — lecteurs)
// ============================================================

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// CLIENT SUPABASE ADMIN (service_role — CMS, bypass RLS)
// ⚠️ À utiliser UNIQUEMENT côté serveur ou dans des contextes
//    protégés (dashboard admin authentifié). Ne jamais exposer
//    la service_role key au public.
// ============================================================

const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string;

export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession:  false,
        autoRefreshToken: false,
      },
    })
  : supabase; // fallback sur le client public si pas de service key

export default supabase;
