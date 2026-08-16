import type { PoemePublic, Poeme } from '../lib/supabase';
import type { Poem, ThemeCategory } from '../types';

/**
 * Mapper pour convertir une entité DB Supabase en type Poem du frontend.
 */
export function mapPoemeToPoem(dbPoeme: PoemePublic | Poeme): Poem {
  const collectionName = ('collection_titre' in dbPoeme && dbPoeme.collection_titre)
    ? dbPoeme.collection_titre
    : (dbPoeme as any).collections?.titre || 'Introspection';

  // Format date
  const dateObj = dbPoeme.publie_le ? new Date(dbPoeme.publie_le) : new Date(dbPoeme.created_at);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const statutMap: Record<string, 'publié' | 'brouillon' | 'archivé' | 'programmé'> = {
    publie: 'publié',
    brouillon: 'brouillon',
    archive: 'archivé',
    programme: 'programmé',
  };

  const isProgramme = dbPoeme.statut === 'programme';
  const dateProg = isProgramme ? ((dbPoeme as any).date_programmation || dbPoeme.publie_le || undefined) : undefined;

  return {
    id: dbPoeme.id,
    slug: dbPoeme.slug,
    titre: dbPoeme.titre,
    contenu: dbPoeme.contenu,
    extrait: dbPoeme.extrait || dbPoeme.contenu.slice(0, 150) + '...',
    datePublication: formattedDate,
    dateProgrammation: dateProg,
    theme: collectionName as ThemeCategory,
    readingTime: `${dbPoeme.reading_time_minutes || 2} min`,
    illustration: dbPoeme.illustration_url || undefined,
    audioUrl: dbPoeme.audio_url || undefined,
    audioDuration: dbPoeme.audio_duration_secondes 
      ? `${Math.floor(dbPoeme.audio_duration_secondes / 60)}:${(dbPoeme.audio_duration_secondes % 60).toString().padStart(2, '0')}`
      : undefined,
    statut: statutMap[dbPoeme.statut] || 'publié',
    likesCount: dbPoeme.likes_count || 0,
  };
}

export function mapThemeToSlug(theme: ThemeCategory): string {
  const map: Record<ThemeCategory, string> = {
    Introspection: 'introspection',
    Étreintes: 'etreintes',
    Mélancolie: 'melancolie',
    Saisons: 'saisons',
    Silences: 'silences',
    Nocturnes: 'nocturnes',
  };
  return map[theme] || 'introspection';
}

export function mapStatutToDb(statut: 'publié' | 'brouillon' | 'archivé' | 'programmé'): 'publie' | 'brouillon' | 'archive' | 'programme' {
  if (statut === 'publié') return 'publie';
  if (statut === 'archivé') return 'archive';
  if (statut === 'programmé') return 'programme';
  return 'brouillon';
}
