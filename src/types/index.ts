export type ThemeCategory = 'Introspection' | 'Étreintes' | 'Mélancolie' | 'Saisons' | 'Silences' | 'Nocturnes';

export interface Poem {
  id: string;
  slug: string;
  titre: string;
  contenu: string;
  extrait: string;
  datePublication: string;
  dateProgrammation?: string;
  theme: ThemeCategory;
  readingTime: string;
  illustration?: string;
  audioUrl?: string;
  audioDuration?: string;
  statut: 'publié' | 'brouillon' | 'archivé' | 'programmé';
  likesCount?: number;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

export interface OracleCard {
  id: string;
  texte: string;
  theme: ThemeCategory | string;
  poemeId?: string;
  actif: boolean;
  createdAt?: string;
}

export type ActivePage = 'home' | 'poems' | 'poem-detail' | 'about' | 'contact' | 'admin';
