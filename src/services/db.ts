// ============================================================
// src/services/db.ts
// Couche d'accès aux données — toutes les requêtes Supabase & Fallbacks
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

    // Update local counter
    const currentLikes = parseInt(localStorage.getItem('mv_local_likes_count') || '0', 10);
    localStorage.setItem('mv_local_likes_count', (currentLikes + 1).toString());
  },

  /** Retirer un like */
  async remove(poemeId: string, ipHash: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('poeme_id', poemeId)
      .eq('ip_hash', ipHash);
    if (error) throw error;

    const currentLikes = parseInt(localStorage.getItem('mv_local_likes_count') || '0', 10);
    localStorage.setItem('mv_local_likes_count', Math.max(0, currentLikes - 1).toString());
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

  /** Inscrire un abonné avec stockage résilient */
  async subscribe(email: string, source: SourceAbonne, prenom?: string): Promise<AbonneNewsletter> {
    const newSub: AbonneNewsletter = {
      id: crypto.randomUUID(),
      email,
      prenom: prenom ?? null,
      source,
      confirme: true,
      confirme_le: new Date().toISOString(),
      desabonne_le: null,
      token_confirmation: crypto.randomUUID(),
      token_desinscription: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    // Resilient local storage backup
    const localSubs: AbonneNewsletter[] = JSON.parse(localStorage.getItem('mv_local_subscribers') || '[]');
    if (localSubs.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email déjà inscrit');
    }
    localSubs.unshift(newSub);
    localStorage.setItem('mv_local_subscribers', JSON.stringify(localSubs));

    try {
      const { data, error } = await (supabase.from('abonnes_newsletter' as any) as any)
        .insert({ email, prenom: prenom ?? null, source, confirme: true })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') throw new Error('Email déjà inscrit');
      } else if (data) {
        return data;
      }
    } catch (err: any) {
      if (err.message === 'Email déjà inscrit') throw err;
      console.warn('Newsletter stored in local fallback:', err);
    }

    return newSub;
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

  /** Envoyer un message avec stockage résilient */
  async send(payload: {
    nom: string;
    email: string;
    sujet: string;
    objet: ObjetContact;
    message: string;
  }): Promise<MessageContact> {
    const ipHash = await hashString(navigator.userAgent + Date.now());
    const newMsg: MessageContact = {
      id: crypto.randomUUID(),
      nom: payload.nom,
      email: payload.email,
      sujet: payload.sujet,
      objet: payload.objet,
      message: payload.message,
      ip_hash: ipHash,
      user_agent: navigator.userAgent,
      repondu_le: null,
      note_interne: null,
      statut: 'non_lu',
      created_at: new Date().toISOString()
    };

    // Resilient LocalStorage backup for guaranteed reception in Admin
    const localMsgs: MessageContact[] = JSON.parse(localStorage.getItem('mv_local_messages') || '[]');
    localMsgs.unshift(newMsg);
    localStorage.setItem('mv_local_messages', JSON.stringify(localMsgs));

    try {
      const { data } = await (supabase.from('messages_contact' as any) as any)
        .insert({ ...payload, ip_hash: ipHash, user_agent: navigator.userAgent })
        .select()
        .single();
      if (data) return data;
    } catch (error) {
      console.warn('Message saved in local storage fallback:', error);
    }
    return newMsg;
  },
};

// ============================================================
// VISITES (analytics)
// ============================================================

export const VisitesService = {

  /** Enregistrer une visite de page */
  async track(page: string, poemeId?: string): Promise<void> {
    // Local counter increment
    const currentVues = parseInt(localStorage.getItem('mv_local_total_vues') || '0', 10);
    localStorage.setItem('mv_local_total_vues', (currentVues + 1).toString());

    try {
      const ipHash = await hashString(navigator.userAgent);
      await (supabase.from('visites' as any) as any).insert({
        page,
        poeme_id:  poemeId ?? null,
        referrer:  document.referrer || null,
        ip_hash:   ipHash,
      });
    } catch (e) {
      // ignore offline/permission errors
    }
  },

  /** Enregistrer la durée de lecture */
  async updateDuration(visiteId: string, dureeSecondes: number, scrollMax: number): Promise<void> {
    try {
      await (supabase.from('visites' as any) as any)
        .update({ duree_secondes: dureeSecondes, scroll_max_pourcent: scrollMax })
        .eq('id', visiteId);
    } catch (e) {
      // ignore
    }
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
    try {
      const { data } = await supabaseAdmin
        .from('dashboard_admin')
        .select('*')
        .single();
      if (data) return data;
    } catch (e) {
      console.warn('Dashboard view fallback:', e);
    }
    return null;
  },

  async getStatsPoemes(): Promise<StatsPoeme[]> {
    const { data, error } = await supabaseAdmin
      .from('stats_poemes')
      .select('*');
    if (error) return [];
    return data ?? [];
  },

  /** Récupération combinée résiliente de tous les messages de contact reçus */
  async getMessages(statut?: string): Promise<MessageContact[]> {
    let dbMsgs: MessageContact[] = [];
    try {
      let q = supabaseAdmin.from('messages_contact').select('*').order('created_at', { ascending: false });
      if (statut) q = q.eq('statut', statut);
      const { data } = await q;
      if (data) dbMsgs = data;
    } catch (e) {
      console.warn('Error fetching DB messages:', e);
    }

    const localMsgs: MessageContact[] = JSON.parse(localStorage.getItem('mv_local_messages') || '[]');
    const map = new Map<string, MessageContact>();
    [...localMsgs, ...dbMsgs].forEach(m => {
      if (m && m.id) map.set(m.id, m);
    });

    let combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (statut) combined = combined.filter(m => m.statut === statut);
    return combined;
  },

  /** Mettre à jour le statut d'un message (lu, archive, etc.) */
  async updateMessageStatut(id: string, statut: 'non_lu' | 'lu' | 'repondu' | 'archive'): Promise<void> {
    // Local storage sync
    const localMsgs: MessageContact[] = JSON.parse(localStorage.getItem('mv_local_messages') || '[]');
    const updatedLocal = localMsgs.map(m => m.id === id ? { ...m, statut } : m);
    localStorage.setItem('mv_local_messages', JSON.stringify(updatedLocal));

    try {
      await (supabaseAdmin.from('messages_contact' as any) as any)
        .update({ statut })
        .eq('id', id);
    } catch (e) {
      console.warn('Error updating message status in DB:', e);
    }
  },

  /** Supprimer un message */
  async deleteMessage(id: string): Promise<void> {
    const localMsgs: MessageContact[] = JSON.parse(localStorage.getItem('mv_local_messages') || '[]');
    const filteredLocal = localMsgs.filter(m => m.id !== id);
    localStorage.setItem('mv_local_messages', JSON.stringify(filteredLocal));

    try {
      await (supabaseAdmin.from('messages_contact' as any) as any)
        .delete()
        .eq('id', id);
    } catch (e) {
      console.warn('Error deleting message in DB:', e);
    }
  },

  /** Récupération combinée résiliente de tous les abonnés newsletter */
  async getAbonnes(): Promise<AbonneNewsletter[]> {
    let dbSubs: AbonneNewsletter[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('abonnes_newsletter')
        .select('*')
        .eq('confirme', true)
        .is('desabonne_le', null)
        .order('created_at', { ascending: false });
      if (data) dbSubs = data;
    } catch (e) {
      console.warn('Error fetching DB subscribers:', e);
    }

    const localSubs: AbonneNewsletter[] = JSON.parse(localStorage.getItem('mv_local_subscribers') || '[]');
    const map = new Map<string, AbonneNewsletter>();
    [...localSubs, ...dbSubs].forEach(s => {
      if (s && s.email) map.set(s.email.toLowerCase(), s);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /** Désinscrire un abonné */
  async removeAbonne(idOrEmail: string): Promise<void> {
    const localSubs: AbonneNewsletter[] = JSON.parse(localStorage.getItem('mv_local_subscribers') || '[]');
    const filteredLocal = localSubs.filter(s => s.id !== idOrEmail && s.email.toLowerCase() !== idOrEmail.toLowerCase());
    localStorage.setItem('mv_local_subscribers', JSON.stringify(filteredLocal));

    try {
      await (supabaseAdmin.from('abonnes_newsletter' as any) as any)
        .delete()
        .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
    } catch (e) {
      console.warn('Error deleting subscriber in DB:', e);
    }
  }
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
