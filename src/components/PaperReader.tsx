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
      
      {/* Conteneur Global du Rouleau de Parchemin Antique */}
      <div className={`max-w-3xl mx-auto my-6 transition-all duration-500 ${isZenMode ? 'w-full max-w-4xl' : ''}`}>
        
        {/* Rouleau Supérieur en Bois Sculpté & Embouts Laiton */}
        <div className="relative z-20 flex items-center justify-between px-2 -mb-2">
          {/* Embout Laiton Gauche */}
          <div className="w-6 sm:w-8 h-7 sm:h-9 rounded-l-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 shadow-md border-y border-amber-300/60 flex items-center justify-center">
            <div className="w-1.5 h-full bg-amber-900/40 rounded-full" />
          </div>

          {/* Rouleau Bois Principal Top */}
          <div className="flex-1 h-6 sm:h-8 parchment-roller-top rounded-xs border-y border-amber-900/60 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 pointer-events-none" />
            <div className="w-24 h-[1px] bg-amber-200/30 rounded-full" />
          </div>

          {/* Embout Laiton Droit */}
          <div className="w-6 sm:w-8 h-7 sm:h-9 rounded-r-full bg-gradient-to-l from-amber-600 via-yellow-500 to-amber-700 shadow-md border-y border-amber-300/60 flex items-center justify-center">
            <div className="w-1.5 h-full bg-amber-900/40 rounded-full" />
          </div>
        </div>

        {/* Corps de Parchemin Antique */}
        <article className="parchment-scroll rounded-sm p-6 sm:p-12 md:p-16 relative shadow-2xl transition-all duration-500 border-t-2 border-b-2 border-amber-900/30">
          
          {/* Filigrane d'Encre & Ornementations des 4 Coins */}
          <div className="absolute top-4 left-4 text-accent-terracotta/20 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute top-4 right-4 text-accent-terracotta/20 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 left-4 text-accent-terracotta/20 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 right-4 text-accent-terracotta/20 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>

          {/* Dynamic Background Monogram Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[200px] font-serif font-bold text-accent-terracotta/[0.03] dark:text-amber-200/[0.03] pointer-events-none select-none">
            MV
          </div>

          {/* Header Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-amber-900/20 dark:border-amber-500/20 text-xs relative z-10">
            
            {/* Collection & Time Tag */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-amber-950/10 dark:bg-amber-100/10 text-accent-terracotta dark:text-amber-200 font-medium tracking-widest uppercase text-[10px] border border-amber-900/20">
                {poem.theme}
              </span>
              <span className="text-paper-muted dark:text-darkpaper-muted font-serif italic text-xs">
                {poem.readingTime} {t.readTime}
              </span>
            </div>

            {/* Font Size & Utility Controls */}
            <div className="flex items-center gap-2">
              
              {/* Audio Player */}
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
                        ? 'bg-accent-terracotta text-white border-accent-terracotta shadow-xs'
                        : 'bg-paper-card/80 dark:bg-darkpaper-card/80 text-paper-ink dark:text-darkpaper-ink border-amber-900/20 hover:border-accent-terracotta/40'
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

              {/* Font Size Selector */}
              <div className="flex items-center bg-paper-card/60 dark:bg-darkpaper-card/60 p-0.5 rounded-full border border-amber-900/20">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    fontSize === 'sm'
                      ? 'bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                      : 'text-paper-muted hover:text-paper-ink'
                  }`}
                  title={t.fontSmall}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    fontSize === 'md'
                      ? 'bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                      : 'text-paper-muted hover:text-paper-ink'
                  }`}
                  title={t.fontMedium}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    fontSize === 'lg'
                      ? 'bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                      : 'text-paper-muted hover:text-paper-ink'
                  }`}
                  title={t.fontLarge}
                >
                  A+
                </button>
              </div>

              {/* Mode Intime / Zen Toggle */}
              <button
                onClick={() => setIsZenMode(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                  isZenMode
                    ? 'bg-accent-terracotta text-white border-accent-terracotta shadow-md'
                    : 'bg-paper-card/60 dark:bg-darkpaper-card/60 text-paper-ink dark:text-darkpaper-ink border-amber-900/20 hover:border-accent-terracotta/40'
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

          {/* Poem Content Area */}
          <div className="space-y-6 relative z-10">
            
            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-paper-ink dark:text-darkpaper-ink leading-tight text-center sm:text-left drop-shadow-xs">
              {poem.titre}
            </h1>

            {/* Publication Date */}
            <p className="text-xs font-sans text-paper-muted dark:text-darkpaper-muted uppercase tracking-widest text-center sm:text-left flex items-center gap-2">
              <span className="inline-block w-4 h-[1px] bg-accent-terracotta/40" />
              {t.publishedOn} {poem.datePublication}
            </p>

            {/* Strophes / Vers (Font-serif Cormorant Garamond) */}
            <div className={`font-serif ${getFontSizeClass()} text-paper-ink/95 dark:text-darkpaper-ink/95 whitespace-pre-wrap py-6 font-normal tracking-wide space-y-4 leading-relaxed`}>
              {poem.contenu}
            </div>

          </div>

          {/* Footer Interactions Bar */}
          <div className="pt-8 mt-8 border-t border-amber-900/20 dark:border-amber-500/20 flex flex-wrap items-center justify-between gap-4 relative z-10">
            
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                  isLiked
                    ? 'bg-rose-100/60 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-xs'
                    : 'bg-paper-card/70 dark:bg-darkpaper-card/70 text-paper-ink dark:text-darkpaper-ink border-amber-900/20 hover:border-rose-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                <span>{likesCount}</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmarkToggle}
                className={`p-2.5 rounded-full border text-xs font-medium transition-all ${
                  saved
                    ? 'bg-amber-100/60 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs'
                    : 'bg-paper-card/70 dark:bg-darkpaper-card/70 text-paper-ink dark:text-darkpaper-ink border-amber-900/20 hover:border-amber-400'
                }`}
                title={saved ? "Retirer des signets" : "Enregistrer dans mes signets"}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-600' : ''}`} />
              </button>
            </div>

            {/* Share Button */}
            <div className="flex items-center gap-2">
              {onOpenShareModal && (
                <button
                  onClick={() => onOpenShareModal(poem)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-terracotta/10 text-accent-terracotta border border-accent-terracotta/30 text-xs font-medium hover:bg-accent-terracotta hover:text-white transition-all"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Aperçu Reseaux</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg text-xs font-medium hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Lien copié !' : 'Partager'}</span>
              </button>
            </div>

          </div>

        </article>

        {/* Rouleau Inférieur en Bois Sculpté & Embouts Laiton */}
        <div className="relative z-20 flex items-center justify-between px-2 -mt-2">
          {/* Embout Laiton Gauche */}
          <div className="w-6 sm:w-8 h-7 sm:h-9 rounded-l-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 shadow-md border-y border-amber-300/60 flex items-center justify-center">
            <div className="w-1.5 h-full bg-amber-900/40 rounded-full" />
          </div>

          {/* Rouleau Bois Principal Bottom */}
          <div className="flex-1 h-6 sm:h-8 parchment-roller-bottom rounded-xs border-y border-amber-900/60 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 pointer-events-none" />
            <div className="w-24 h-[1px] bg-amber-200/30 rounded-full" />
          </div>

          {/* Embout Laiton Droit */}
          <div className="w-6 sm:w-8 h-7 sm:h-9 rounded-r-full bg-gradient-to-l from-amber-600 via-yellow-500 to-amber-700 shadow-md border-y border-amber-300/60 flex items-center justify-center">
            <div className="w-1.5 h-full bg-amber-900/40 rounded-full" />
          </div>
        </div>

      </div>

    </div>
  );
};
