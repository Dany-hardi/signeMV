import React, { createContext, useContext, useState } from 'react';

export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation
  navHome: string;
  navPoems: string;
  navAbout: string;
  navContact: string;
  navAdmin: string;
  
  // Hero & General
  heroSubtitle: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  discoverBtn: string;
  listenAudio: string;
  featuredPoem: string;
  todayQuote: string;

  // Collections & Filters
  collectionsTitle: string;
  collectionsSubtitle: string;
  allThemes: string;
  searchPlaceholder: string;
  noPoemsFound: string;
  readTime: string;
  publishedOn: string;
  
  // Reader
  fontSize: string;
  fontSmall: string;
  fontMedium: string;
  fontLarge: string;
  likePoem: string;
  bookmarkPoem: string;
  sharePoem: string;
  backToPoems: string;
  readingMode: string;
  copySuccess: string;

  // Contact
  contactTitle: string;
  contactSubtitle: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  objectLabel: string;
  messageLabel: string;
  sendBtn: string;
  sendingMsg: string;
  contactSuccess: string;

  // Newsletter
  newsletterTitle: string;
  newsletterSubtitle: string;
  subscribeBtn: string;
  subscribingMsg: string;
  newsletterSuccess: string;
  privacyNotice: string;

  // Admin CMS
  adminTitle: string;
  adminSubtitle: string;
  newPoemBtn: string;
  saveBtn: string;
  deleteBtn: string;
  confirmDeleteTitle: string;
  confirmDeleteMsg: string;
  statusPublished: string;
  statusDraft: string;
  statusArchived: string;
  tabPoems: string;
  tabNewsletters: string;
  tabMessages: string;
  tabAnalytics: string;
  titleLabel: string;
  slugLabel: string;
  contentLabel: string;
  excerptLabel: string;
  themeLabel: string;
  
  // Common
  cancel: string;
  close: string;
  loading: string;
  error: string;
}

const translationsFR: Translations = {
  navHome: 'Accueil',
  navPoems: 'Recueils & Vers',
  navAbout: 'Poétique & Esprit',
  navContact: 'Correspondance',
  navAdmin: 'Administration',

  heroSubtitle: 'Écrin numérique & poésie contemporaine',
  heroTitle1: 'Des mots comme des empreintes,',
  heroTitle2: 'gravés dans le silence du papier.',
  heroDesc: 'Explorez une poésie introspective et sensible. Des vers écrits pour apaiser l\'âme, suspendre le temps et écouter les échos du cœur.',
  discoverBtn: 'Explorer les vers',
  listenAudio: 'Écouter la lecture',
  featuredPoem: 'Poème à l\'honneur',
  todayQuote: 'Pensée du jour',

  collectionsTitle: 'Thématiques & Recueils',
  collectionsSubtitle: 'Parcourez les paysages intérieurs à travers nos thèmes de prédilection.',
  allThemes: 'Tous les thèmes',
  searchPlaceholder: 'Rechercher un mot, un titre, un vers...',
  noPoemsFound: 'Aucun poème ne correspond à votre recherche.',
  readTime: 'temps de lecture',
  publishedOn: 'Publié le',

  fontSize: 'Taille du texte',
  fontSmall: 'Moyenne',
  fontMedium: 'Grande',
  fontLarge: 'Très grande',
  likePoem: 'J\'aime',
  bookmarkPoem: 'Enregistrer dans vos favoris',
  sharePoem: 'Partager ce poème',
  backToPoems: 'Retour aux recueils',
  readingMode: 'Mode Liseuse',
  copySuccess: 'Lien copié dans le presse-papier',

  contactTitle: 'Lettres & Correspondances',
  contactSubtitle: 'Une question, une invitation ou un mot doux ? Laissez votre empreinte ici.',
  nameLabel: 'Votre Nom ou Pseudonyme',
  emailLabel: 'Adresse Email',
  subjectLabel: 'Sujet de votre message',
  objectLabel: 'Motif de votre message',
  messageLabel: 'Votre message poétique ou demande',
  sendBtn: 'Transmettre votre lettre',
  sendingMsg: 'Envoi en cours...',
  contactSuccess: 'Votre message a été transmis avec soin. Merci pour vos mots.',

  newsletterTitle: 'Les Lettres du Silence',
  newsletterSubtitle: 'Recevez chaque mois un poème inédit et les mots manuscrits de MV directement dans votre boîte.',
  subscribeBtn: 'Rejoindre la correspondance',
  subscribingMsg: 'Inscription...',
  newsletterSuccess: 'Merci pour votre confiance. Votre premier vers arrivera très bientôt.',
  privacyNotice: 'Vos informations restent confidentielles et protégées. Aucun spam.',

  adminTitle: 'Espace Édition & CMS — MV',
  adminSubtitle: 'Gestion complète des œuvres, des lettres et des abonnés.',
  newPoemBtn: 'Nouveau Poème',
  saveBtn: 'Sauvegarder',
  deleteBtn: 'Supprimer',
  confirmDeleteTitle: 'Confirmer la suppression',
  confirmDeleteMsg: 'Êtes-vous certain de vouloir supprimer ce poème ? Cette action est irréversible.',
  statusPublished: 'Publié',
  statusDraft: 'Brouillon',
  statusArchived: 'Archivé',
  tabPoems: 'Poèmes & Vers',
  tabNewsletters: 'Newsletters',
  tabMessages: 'Messages Reçus',
  tabAnalytics: 'Statistiques',
  titleLabel: 'Titre du poème',
  slugLabel: 'Permalien (Slug)',
  contentLabel: 'Corps du poème',
  excerptLabel: 'Extrait récapitulatif',
  themeLabel: 'Collection / Thème',

  cancel: 'Annuler',
  close: 'Fermer',
  loading: 'Chargement...',
  error: 'Une erreur s\'est produite',
};

const translationsEN: Translations = {
  navHome: 'Home',
  navPoems: 'Collections & Poems',
  navAbout: 'Poetics & Essence',
  navContact: 'Correspondence',
  navAdmin: 'Administration',

  heroSubtitle: 'Digital sanctuary & contemporary poetry',
  heroTitle1: 'Words like delicate footprints,',
  heroTitle2: 'etched upon the quiet paper.',
  heroDesc: 'Explore introspective and soul-stirring poetry. Verses written to soothe the mind, suspend time, and listen to the heart\'s quiet echoes.',
  discoverBtn: 'Explore the verses',
  listenAudio: 'Listen to recitation',
  featuredPoem: 'Featured Poem',
  todayQuote: 'Thought of the Day',

  collectionsTitle: 'Themes & Collections',
  collectionsSubtitle: 'Journey through inner landscapes across our curated themes.',
  allThemes: 'All Themes',
  searchPlaceholder: 'Search a word, title, or line...',
  noPoemsFound: 'No poems match your search.',
  readTime: 'read time',
  publishedOn: 'Published on',

  fontSize: 'Text Size',
  fontSmall: 'Medium',
  fontMedium: 'Large',
  fontLarge: 'Extra Large',
  likePoem: 'Like',
  bookmarkPoem: 'Save to bookmarks',
  sharePoem: 'Share this poem',
  backToPoems: 'Back to collections',
  readingMode: 'Reader Mode',
  copySuccess: 'Link copied to clipboard',

  contactTitle: 'Letters & Correspondence',
  contactSubtitle: 'A question, an invitation, or a kind note? Leave your message here.',
  nameLabel: 'Your Name or Pen Name',
  emailLabel: 'Email Address',
  subjectLabel: 'Subject',
  objectLabel: 'Purpose',
  messageLabel: 'Your message or inquiry',
  sendBtn: 'Send your letter',
  sendingMsg: 'Sending letter...',
  contactSuccess: 'Your message has been delivered with care. Thank you.',

  newsletterTitle: 'Letters of Silence',
  newsletterSubtitle: 'Receive a handwritten original poem and letters from MV directly to your inbox every month.',
  subscribeBtn: 'Subscribe to letters',
  subscribingMsg: 'Subscribing...',
  newsletterSuccess: 'Thank you for your trust. Your first poem will arrive very soon.',
  privacyNotice: 'Your information remains confidential and protected. No spam.',

  adminTitle: 'Editor CMS — MV',
  adminSubtitle: 'Complete management of poems, newsletters, and reader letters.',
  newPoemBtn: 'New Poem',
  saveBtn: 'Save',
  deleteBtn: 'Delete',
  confirmDeleteTitle: 'Confirm Deletion',
  confirmDeleteMsg: 'Are you sure you want to delete this poem? This action cannot be undone.',
  statusPublished: 'Published',
  statusDraft: 'Draft',
  statusArchived: 'Archived',
  tabPoems: 'Poems & Verses',
  tabNewsletters: 'Newsletters',
  tabMessages: 'Received Messages',
  tabAnalytics: 'Analytics',
  titleLabel: 'Poem Title',
  slugLabel: 'Permalink (Slug)',
  contentLabel: 'Poem Content',
  excerptLabel: 'Summary Excerpt',
  themeLabel: 'Collection / Theme',

  cancel: 'Cancel',
  close: 'Close',
  loading: 'Loading...',
  error: 'An error occurred',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('signemv_lang');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('signemv_lang', lang);
  };

  const t = language === 'fr' ? translationsFR : translationsEN;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
