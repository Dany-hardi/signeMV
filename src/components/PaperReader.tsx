import React, { useState, useRef, useEffect } from 'react';
import { Poem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Share2, Play, Pause, Bookmark, Heart, Check, Maximize2, Minimize2, Feather } from 'lucide-react';
import { LikesService, SignetsService, VisitesService, getLecteurToken } from '../services/db';
import { buildPoemShareUrl } from '../utils/url';

interface PaperReaderProps {
  poem: Poem;
  onOpenShareModal?: (poem: Poem) => void;
  onOpenNewsletter?: () => void;
  onBookmarkToggle?: (poemId: string, isSaved: boolean) => void;
  onLikeToggle?: (poemId: string, isLiked: boolean) => void;
  isSavedInApp?: boolean;
}

export const PaperReader: React.FC<PaperReaderProps> = ({
  poem,
  onOpenShareModal,
  onOpenNewsletter: _onOpenNewsletter,
  onBookmarkToggle,
  onLikeToggle,
  isSavedInApp
}) => {
  const { t } = useLanguage();
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(poem.likesCount || 0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(isSavedInApp || false);
  const [isZenMode, setIsZenMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync likesCount from poem prop
  useEffect(() => {
    setLikesCount(poem.likesCount || 0);
  }, [poem.likesCount]);

  // Track visit & check initial like/bookmark state from Supabase
  useEffect(() => {
    const initReaderState = async () => {
      try {
        const token = getLecteurToken();
        VisitesService.track(`poeme/${poem.slug}`, poem.id);

        if (poem.id) {
          const isSavedInDb = await SignetsService.isSaved(poem.id, token);
          setSaved(isSavedInDb);

          const hasLikedInDb = await LikesService.hasLiked(poem.id, token);
          setIsLiked(hasLikedInDb);
        }
      } catch (err) {
        console.error('Error fetching reader state:', err);
      }
    };
    initReaderState();
  }, [poem.id, poem.slug]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base sm:text-lg leading-relaxed';
      case 'lg': return 'text-xl sm:text-2xl leading-loose';
      default: return 'text-lg sm:text-xl leading-loose';
    }
  };

  const handleShare = async () => {
    const shareUrl = buildPoemShareUrl(poem.slug);
    const shareData = {
      title: `${poem.titre} — MV Poésie`,
      text: poem.extrait,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log('Audio playback error', e));
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    const token = getLecteurToken();
    if (!poem.id) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    if (onLikeToggle) {
      onLikeToggle(poem.id, nextLiked);
    }

    if (nextLiked) {
      await LikesService.add(poem.id, token);
    } else {
      await LikesService.remove(poem.id, token);
    }
  };

  const handleBookmarkToggle = async () => {
    const token = getLecteurToken();
    if (!poem.id) return;

    const nextSaved = !saved;
    setSaved(nextSaved);

    if (onBookmarkToggle) {
      onBookmarkToggle(poem.id, nextSaved);
    }

    if (nextSaved) {
      await SignetsService.add(poem.id, token);
    } else {
      await SignetsService.remove(poem.id, token);
    }
  };

  return (
    <div className={isZenMode ? "fixed inset-0 z-50 overflow-y-auto bg-paper-grain p-4 sm:p-12 flex justify-center items-start animate-fade-in" : ""}>
      
      {/* Conteneur Global de la Feuille de Parchemin Purement CSS avec Animation de Déroulement */}
      <div 
        key={poem.id || poem.slug} 
        className={`max-w-3xl mx-auto my-6 transition-all duration-500 origin-top animate-scroll-unroll ${isZenMode ? 'w-full max-w-4xl' : ''}`}
      >
        
        {/* Rouleau Supérieur CSS (Top Roller Handle) avec Spirale en Bois et Laiton */}
        <div className="relative z-20 flex items-center justify-between h-9 sm:h-12 -mb-3 px-2">
          {/* Spirale Gauche Top */}
          <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-950 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-5 sm:w-7 h-5 sm:h-7 rounded-full border border-amber-600/50 bg-amber-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-950" />
            </div>
          </div>
          {/* Axe du Rouleau Supérieur */}
          <div className="flex-1 h-7 sm:h-9 parchment-roller-head border-y border-amber-900/60 rounded-xs shadow-md mx-[-4px]" />
          {/* Spirale Droite Top */}
          <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-bl from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-950 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-5 sm:w-7 h-5 sm:h-7 rounded-full border border-amber-600/50 bg-amber-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-950" />
            </div>
          </div>
        </div>

        {/* Corps de la Feuille de Parchemin en Pure CSS/JS */}
        <article className="parchment-sheet p-6 sm:p-12 md:p-16 relative shadow-2xl transition-all duration-500">
          
          {/* Ornements d'Époque aux 4 Coins */}
          <div className="absolute top-4 left-4 text-amber-900/35 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute top-4 right-4 text-amber-900/35 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 left-4 text-amber-900/35 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 right-4 text-amber-900/35 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>

          {/* Contenu Poétique avec Apparition Progressif du Texte */}
          <div className="animate-text-unfurl relative z-10">
            
            {/* En-tête & Barre de Contrôles */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-amber-950/15 dark:border-amber-500/20 text-xs">
              
              {/* Thème & Temps de Lecture */}
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-amber-950/10 dark:bg-amber-100/10 text-amber-900 dark:text-amber-200 font-medium tracking-widest uppercase text-[10px] border border-amber-900/20">
                  {poem.theme}
                </span>
                <span className="text-amber-900/70 dark:text-darkpaper-muted font-serif italic text-xs">
                  {poem.readingTime} {t.readTime}
                </span>
              </div>

              {/* Ajustement Taille Police & Mode Zen */}
              <div className="flex items-center gap-2">
                
                {/* Lecteur Audio */}
                {poem.audioUrl && (
                  <>
                    <audio
                      ref={audioRef}
                      src={poem.audioUrl}
                      onEnded={() => setIsPlaying(false)}
                    />
                    <button
                      onClick={toggleAudio}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                        isPlaying
                          ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-xs'
                          : 'bg-amber-950/10 dark:bg-darkpaper-card/60 text-amber-950 dark:text-darkpaper-ink border-amber-900/20 hover:border-amber-700/40'
                      }`}
                      title={isPlaying ? "Mettre la lecture en pause" : t.listenAudio}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="font-medium hidden sm:inline">
                        {isPlaying ? 'Pause' : t.listenAudio}
                      </span>
                    </button>
                  </>
                )}

                {/* Sélecteur Taille de Police */}
                <div className="flex items-center bg-amber-950/10 dark:bg-darkpaper-card/60 p-0.5 rounded-full border border-amber-900/20">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'sm'
                        ? 'bg-amber-950 text-amber-50 dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                        : 'text-amber-900/70 dark:text-paper-muted hover:text-amber-950'
                    }`}
                    title={t.fontSmall}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('md')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'md'
                        ? 'bg-amber-950 text-amber-50 dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                        : 'text-amber-900/70 dark:text-paper-muted hover:text-amber-950'
                    }`}
                    title={t.fontMedium}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'lg'
                        ? 'bg-amber-950 text-amber-50 dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                        : 'text-amber-900/70 dark:text-paper-muted hover:text-amber-950'
                    }`}
                    title={t.fontLarge}
                  >
                    A+
                  </button>
                </div>

                {/* Mode Intime / Zen */}
                <button
                  onClick={() => setIsZenMode(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                    isZenMode
                      ? 'bg-amber-900 text-white border-amber-900 shadow-md'
                      : 'bg-amber-950/10 dark:bg-darkpaper-card/60 text-amber-950 dark:text-darkpaper-ink border-amber-900/20 hover:border-amber-700/40'
                  }`}
                  title={isZenMode ? "Quitter le mode intime" : "Mode Lecteur Intime (Plein Écran)"}
                >
                  {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="font-medium hidden sm:inline">
                    {isZenMode ? "Quitter Zen" : "Mode Intime"}
                  </span>
                </button>

              </div>
            </div>

            {/* Titre du Poème */}
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-amber-950 dark:text-darkpaper-ink leading-tight text-center sm:text-left drop-shadow-xs">
              {poem.titre}
            </h1>

            {/* Date de Publication */}
            <p className="text-xs font-sans text-amber-900/70 dark:text-darkpaper-muted uppercase tracking-widest text-center sm:text-left flex items-center gap-2 mt-2">
              <span className="inline-block w-4 h-[1px] bg-amber-900/40" />
              {t.publishedOn} {poem.datePublication}
            </p>

            {/* Vers du Poème (Sanitizing signature automatiques) */}
            <div className={`font-serif ${getFontSizeClass()} text-amber-950/95 dark:text-darkpaper-ink/95 whitespace-pre-wrap py-6 font-normal tracking-wide space-y-4 leading-relaxed`}>
              {(poem.contenu || '').replace(/(?:\s*|\n*)(?:—|-)*\s*MV\s*\.?$/gi, '').trim()}
            </div>

            {/* Barre d'Interactions Bas de Page */}
            <div className="pt-8 mt-8 border-t border-amber-950/15 dark:border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                {/* Bouton J'aime */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                    isLiked
                      ? 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-xs'
                      : 'bg-amber-950/10 dark:bg-darkpaper-card/70 text-amber-950 dark:text-darkpaper-ink border-amber-900/20 hover:border-rose-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                  <span>{likesCount}</span>
                </button>

                {/* Bouton Signets */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-2.5 rounded-full border text-xs font-medium transition-all ${
                    saved
                      ? 'bg-amber-200/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-800 shadow-xs'
                      : 'bg-amber-950/10 dark:bg-darkpaper-card/70 text-amber-950 dark:text-darkpaper-ink border-amber-900/20 hover:border-amber-400'
                  }`}
                  title={saved ? "Retirer des signets" : "Enregistrer dans mes signets"}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-700' : ''}`} />
                </button>
              </div>

              {/* Boutons Partage & Reseaux */}
              <div className="flex items-center gap-2">
                {onOpenShareModal && (
                  <button
                    onClick={() => onOpenShareModal(poem)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-900/10 text-amber-900 dark:text-amber-200 border border-amber-900/30 text-xs font-medium hover:bg-amber-900 hover:text-white transition-all"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>Aperçu Reseaux</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950 text-amber-50 dark:bg-darkpaper-ink dark:text-darkpaper-bg text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Lien copié !' : 'Partager'}</span>
                </button>
              </div>

            </div>

          </div>

        </article>

        {/* Rouleau Inférieur CSS (Bottom Roller Handle) avec Spirale en Bois et Laiton */}
        <div className="relative z-20 flex items-center justify-between h-9 sm:h-12 -mt-3 px-2">
          {/* Spirale Gauche Bottom */}
          <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-tr from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-950 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-5 sm:w-7 h-5 sm:h-7 rounded-full border border-amber-600/50 bg-amber-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-950" />
            </div>
          </div>
          {/* Axe du Rouleau Inférieur */}
          <div className="flex-1 h-7 sm:h-9 parchment-roller-head border-y border-amber-900/60 rounded-xs shadow-md mx-[-4px]" />
          {/* Spirale Droite Bottom */}
          <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-tl from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-950 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-5 sm:w-7 h-5 sm:h-7 rounded-full border border-amber-600/50 bg-amber-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-950" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
