import { OracleCard } from '../types';
import { DEFAULT_ORACLE_CARDS } from '../data/oracleCards';
import { supabaseAdmin, supabase } from '../lib/supabase';

const STORAGE_KEY = 'signemv_oracle_cards';

export const OracleCardsService = {
  /** Récupérer toutes les cartes (pour le CMS administration) */
  async getAll(): Promise<OracleCard[]> {
    try {
      const { data, error } = await supabase
        .from('citations' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          texte: c.texte || c.contenu,
          theme: c.auteur || c.theme || 'Introspection',
          actif: c.is_featured ?? true,
          createdAt: c.created_at
        }));
      }
    } catch (err) {
      console.warn('Fallback stockage local Oracle Cards:', err);
    }

    // Fallback local storage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Erreur parsing cartes locales:', e);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORACLE_CARDS));
    return DEFAULT_ORACLE_CARDS;
  },

  /** Récupérer uniquement les cartes actives pour les lecteurs */
  async getActive(): Promise<OracleCard[]> {
    const all = await this.getAll();
    const activeCards = all.filter(c => c.actif);
    return activeCards.length > 0 ? activeCards : DEFAULT_ORACLE_CARDS;
  },

  /** Sauvegarder ou ajouter une carte (CMS) */
  async saveCard(card: OracleCard): Promise<OracleCard[]> {
    const all = await this.getAll();
    const existingIndex = all.findIndex(c => c.id === card.id);
    let updated: OracleCard[];

    if (existingIndex >= 0) {
      updated = all.map(c => c.id === card.id ? card : c);
    } else {
      updated = [card, ...all];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Async attempt Supabase persistence
    try {
      await (supabaseAdmin.from('citations' as any) as any).upsert({
        id: card.id,
        texte: card.texte,
        auteur: card.theme,
        is_featured: card.actif
      });
    } catch (e) {
      console.warn('Erreur synchro Supabase citation:', e);
    }

    return updated;
  },

  /** Basculer l'état actif/inactif d'une carte (CMS) */
  async toggleActive(id: string): Promise<OracleCard[]> {
    const all = await this.getAll();
    const updated = all.map(c => c.id === id ? { ...c, actif: !c.actif } : c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /** Supprimer une carte (CMS) */
  async deleteCard(id: string): Promise<OracleCard[]> {
    const all = await this.getAll();
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      await (supabaseAdmin.from('citations' as any) as any).delete().eq('id', id);
    } catch (e) {
      console.warn('Erreur suppression Supabase citation:', e);
    }

    return updated;
  }
};
