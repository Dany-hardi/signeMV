// ============================================================
// src/services/db.ts
// Couche d'accès aux données — toutes les requêtes Supabase
// ============================================================

import { supabase, supabaseAdmin } from '../lib/supabase';
import type {
  Poeme, PoemePublic, Collection,
  AbonneNewsletter, MessageContact, Signet,
  Evenement, Citation,
  StatsPoeme, DashboardAdmin, Poete, Media,
  StatutPoeme, ObjetContact, SourceAbonne
} from '../lib/supabase';

export type { AbonneNewsletter, MessageContact, DashboardAdmin, StatsPoeme, Poeme };

// ============================================================
// POÈMES
// ============================================================

export const PoemesService = {

  /** Tous les poèmes publiés (vue publique) */
  async getPublies(): Promise<PoemePublic[]> {
    const { data, error } = await supabase
      .from('poemes_publies')
      .select('*');
    if (error) throw error;
    return data ?? [];
  },

  /** Un poème par slug (public) */
  async getBySlug(slug: string): Promise<PoemePublic | null> {
    const { data, error } = await supabase
      .from('poemes_publies')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data;
  },

  /** Poème mis en avant (featured) */
  async getFeatured(): Promise<PoemePublic | null> {
    const { data, error } = await supabase
      .from('poemes_publies')
      .select('*')
      .eq('is_featured', true)
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data;
  },

  /** Par collection */
  async getByCollection(collectionSlug: string): Promise<PoemePublic[]> {
    const { data, error } = await supabase
      .from('poemes_publies')
      .select('*')
      .eq('collection_slug', collectionSlug);
    if (error) throw error;
    return data ?? [];
  },

  /** Recherche full-text */
  async search(query: string): Promise<PoemePublic[]> {
    const { data, error } = await supabase
      .from('poemes_publies')
      .select('*')
      .or(`titre.ilike.%${query}%,contenu.ilike.%${query}%,extrait.ilike.%${query}%`);
    if (error) throw error;
    return data ?? [];
  },

  // ---- ADMIN ----

  /** Tous les poèmes (admin) */
  async getAll(): Promise<Poeme[]> {
    const { data, error } = await supabaseAdmin
      .from('poemes')
      .select('*, collections(titre, slug, couleur)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Poeme[];
  },

  /** Créer un poème */
  async create(poeme: Omit<Poeme, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'vues_count'>): Promise<Poeme> {
    const { data, error } = await (supabaseAdmin.from('poemes' as any) as any)
      .insert(poeme)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Mettre à jour un poème */
  async update(id: string, changes: Partial<Poeme>): Promise<Poeme> {
    const { data, error } = await (supabaseAdmin.from('poemes' as any) as any)
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Changer le statut */
  async setStatut(id: string, statut: StatutPoeme): Promise<void> {
    const { error } = await (supabaseAdmin.from('poemes' as any) as any)
      .update({ statut })
      .eq('id', id);
    if (error) throw error;
  },

  /** Supprimer un poème */
  async delete(id: string): Promise<void> {
    const { error } = await (supabaseAdmin.from('poemes' as any) as any)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// COLLECTIONS
// ============================================================

export const CollectionsService = {

  async getAll(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('ordre');
    if (error) throw error;
    return data ?? [];
  },

  async getBySlug(slug: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data;
  },
};

// ============================================================
// LIKES
// ============================================================

export const LikesService = {

  /** Vérifier si l'utilisateur a déjà liké (via ipHash) */
  async hasLiked(poemeId: string, ipHash: string): Promise<boolean> {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('poeme_id', poemeId)
      .eq('ip_hash', ipHash)
      .maybeSingle();
    return !!data;
  },

  /** Ajouter un like */
  async add(poemeId: string, ipHash: string, sessionId?: string): Promise<void> {
    const { error } = await (supabase.from('likes' as any) as any)
      .insert({ poeme_id: poemeId, ip_hash: ipHash, session_id: sessionId ?? null });
    if (error && error.code !== '23505') throw error; // ignore doublons
  },

  /** Retirer un like */
  async remove(poemeId: string, ipHash: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('poeme_id', poemeId)
      .eq('ip_hash', ipHash);
    if (error) throw error;
  },
};

// ============================================================
// SIGNETS (favoris lecteurs)
// ============================================================

export const SignetsService = {

  /** Lister les signets d'un lecteur */
  async getByToken(lecteurToken: string): Promise<Signet[]> {
    const { data, error } = await supabase
      .from('signets')
      .select('*')
      .eq('lecteur_token', lecteurToken);
    if (error) throw error;
    return data ?? [];
  },

  /** Ajouter un signet */
  async add(poemeId: string, lecteurToken: string): Promise<void> {
    const { error } = await (supabase.from('signets' as any) as any)
      .insert({ poeme_id: poemeId, lecteur_token: lecteurToken });
    if (error && error.code !== '23505') throw error;
  },

  /** Retirer un signet */
  async remove(poemeId: string, lecteurToken: string): Promise<void> {
    const { error } = await supabase
      .from('signets')
      .delete()
      .eq('poeme_id', poemeId)
      .eq('lecteur_token', lecteurToken);
    if (error) throw error;
  },

  /** Vérifier si un poème est en signet */
  async isSaved(poemeId: string, lecteurToken: string): Promise<boolean> {
    const { data } = await supabase
      .from('signets')
      .select('id')
      .eq('poeme_id', poemeId)
      .eq('lecteur_token', lecteurToken)
      .maybeSingle();
    return !!data;
  },
};

// ============================================================
// NEWSLETTER
// ============================================================

export const NewsletterService = {

  /** Inscrire un abonné */
  async subscribe(email: string, source: SourceAbonne, prenom?: string): Promise<AbonneNewsletter> {
    const { data, error } = await (supabase.from('abonnes_newsletter' as any) as any)
      .insert({ email, prenom: prenom ?? null, source })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('Email déjà inscrit');
      throw error;
    }
    return data;
  },

  /** Confirmer via token */
  async confirm(token: string): Promise<boolean> {
    const { error } = await (supabase.from('abonnes_newsletter' as any) as any)
      .update({ confirme: true, confirme_le: new Date().toISOString() })
      .eq('token_confirmation', token)
      .eq('confirme', false);
    return !error;
  },

  /** Désinscrire via token */
  async unsubscribe(token: string): Promise<boolean> {
    const { error } = await (supabase.from('abonnes_newsletter' as any) as any)
      .update({ desabonne_le: new Date().toISOString() })
      .eq('token_desinscription', token);
    return !error;
  },
};

// ============================================================
// MESSAGES CONTACT
// ============================================================

export const ContactService = {

  /** Envoyer un message */
  async send(payload: {
    nom: string;
    email: string;
    sujet: string;
    objet: ObjetContact;
    message: string;
  }): Promise<MessageContact> {
    const ipHash = await hashString(navigator.userAgent + Date.now());
    const { data, error } = await (supabase.from('messages_contact' as any) as any)
      .insert({ ...payload, ip_hash: ipHash, user_agent: navigator.userAgent })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================
// VISITES (analytics)
// ============================================================

export const VisitesService = {

  /** Enregistrer une visite de page */
  async track(page: string, poemeId?: string): Promise<void> {
    const ipHash = await hashString(navigator.userAgent);
    await (supabase.from('visites' as any) as any).insert({
      page,
      poeme_id:  poemeId ?? null,
      referrer:  document.referrer || null,
      ip_hash:   ipHash,
    });
  },

  /** Enregistrer la durée de lecture */
  async updateDuration(visiteId: string, dureeSecondes: number, scrollMax: number): Promise<void> {
    await (supabase.from('visites' as any) as any)
      .update({ duree_secondes: dureeSecondes, scroll_max_pourcent: scrollMax })
      .eq('id', visiteId);
  },
};

// ============================================================
// ÉVÉNEMENTS
// ============================================================

export const EvenementsService = {
  async getAVenir(): Promise<Evenement[]> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .eq('statut', 'annonce')
      .gte('date_debut', new Date().toISOString())
      .order('date_debut');
    if (error) throw error;
    return data ?? [];
  },
};

// ============================================================
// CITATIONS
// ============================================================

export const CitationsService = {
  async getVedettes(): Promise<Citation[]> {
    const { data, error } = await supabase
      .from('citations')
      .select('*')
      .eq('is_vedette', true);
    if (error) throw error;
    return data ?? [];
  },

  async getByPoeme(poemeId: string): Promise<Citation[]> {
    const { data, error } = await supabase
      .from('citations')
      .select('*')
      .eq('poeme_id', poemeId);
    if (error) throw error;
    return data ?? [];
  },
};

// ============================================================
// PROFIL POÈTE
// ============================================================

export const PoeteService = {
  async get(): Promise<Poete | null> {
    const { data, error } = await supabase
      .from('poete')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data;
  },
};

// ============================================================
// MÉDIAS
// ============================================================

export const MediasService = {

  /** Uploader un fichier dans Supabase Storage */
  async upload(file: File, bucket: 'audios' | 'illustrations' | 'couvertures'): Promise<string> {
    const ext  = file.name.split('.').pop();
    const path = `${bucket}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /** Enregistrer les métadonnées d'un média */
  async save(media: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    const { data, error } = await (supabase.from('medias' as any) as any)
      .insert(media)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================
// DASHBOARD ADMIN
// ============================================================

export const AdminService = {

  async getDashboard(): Promise<DashboardAdmin | null> {
    const { data, error } = await supabaseAdmin
      .from('dashboard_admin')
      .select('*')
      .single();
    if (error) return null;
    return data;
  },

  async getStatsPoemes(): Promise<StatsPoeme[]> {
    const { data, error } = await supabaseAdmin
      .from('stats_poemes')
      .select('*');
    if (error) return [];
    return data ?? [];
  },

  async getMessages(statut?: string): Promise<MessageContact[]> {
    let q = supabaseAdmin.from('messages_contact').select('*').order('created_at', { ascending: false });
    if (statut) q = q.eq('statut', statut);
    const { data, error } = await q;
    if (error) return [];
    return data ?? [];
  },

  async getAbonnes(): Promise<AbonneNewsletter[]> {
    const { data, error } = await supabaseAdmin
      .from('abonnes_newsletter')
      .select('*')
      .eq('confirme', true)
      .is('desabonne_le', null)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },
};

// ============================================================
// UTILITAIRES
// ============================================================

/** Hash SHA-256 d'une chaîne (anonymisation RGPD) */
async function hashString(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Générer un UUID lecteur (stocké en localStorage) */
export function getLecteurToken(): string {
  const KEY = 'mv_lecteur_token';
  let token = localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(KEY, token);
  }
  return token;
}
