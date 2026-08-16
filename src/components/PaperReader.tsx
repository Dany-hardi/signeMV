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
      
      {/* Conteneur Global du Rouleau de Parchemin Antique avec Animation de Déroulement */}
      <div 
        key={poem.id || poem.slug} 
        className={`max-w-3xl mx-auto my-6 transition-all duration-500 origin-top animate-scroll-unroll ${isZenMode ? 'w-full max-w-4xl' : ''}`}
      >
        
        {/* Rouleau Supérieur Papier Enroulé (Top Roll) avec Spirales d'Enroulement */}
        <div className="relative z-20 flex items-center justify-between h-10 sm:h-14 -mb-3">
          
          {/* Spirale d'Enroulement Gauche Top */}
          <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-900 shadow-xl flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-amber-600/60 bg-gradient-to-tr from-amber-900 to-amber-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-500/40" />
            </div>
          </div>

          {/* Corps de Papier Enroulé Top */}
          <div className="flex-1 h-8 sm:h-11 parchment-roller-head border-y-2 border-amber-900/60 flex items-center justify-center relative overflow-hidden rounded-xs shadow-lg mx-[-6px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/35 pointer-events-none" />
            <div className="w-32 h-[1px] bg-amber-200/40 rounded-full" />
          </div>

          {/* Spirale d'Enroulement Droite Top */}
          <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gradient-to-bl from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-900 shadow-xl flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-amber-600/60 bg-gradient-to-tl from-amber-900 to-amber-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-500/40" />
            </div>
          </div>
        </div>

        {/* Corps du Parchemin Antique avec Encoches Frangées Découpées sur les Côtés */}
        <article className="parchment-scroll p-6 sm:p-12 md:p-16 relative shadow-2xl transition-all duration-500 border-t-2 border-b-2 border-amber-900/40">
          
          {/* Encoches Frangées / Découpures du Parchemin Antique (Gauche et Droit) */}
          <div className="absolute top-12 -left-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">◀</div>
          <div className="absolute top-1/3 -left-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">◀</div>
          <div className="absolute top-2/3 -left-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">◀</div>
          
          <div className="absolute top-12 -right-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">▶</div>
          <div className="absolute top-1/3 -right-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">▶</div>
          <div className="absolute top-2/3 -right-2 text-amber-900/30 font-serif text-sm select-none pointer-events-none">▶</div>

          {/* Ornementations d'Époque des 4 Coins */}
          <div className="absolute top-4 left-4 text-amber-900/40 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute top-4 right-4 text-amber-900/40 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 left-4 text-amber-900/40 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>
          <div className="absolute bottom-4 right-4 text-amber-900/40 dark:text-amber-300/30 select-none pointer-events-none font-serif text-xl sm:text-2xl">
            ❦
          </div>

          {/* Dynamic Background Monogram Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[200px] font-serif font-bold text-amber-950/[0.04] dark:text-amber-100/[0.03] pointer-events-none select-none">
            MV
          </div>

          {/* Text Content with Progressive Unfurl Fade */}
          <div className="animate-text-unfurl relative z-10">
            
            {/* Header Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-amber-900/25 dark:border-amber-500/20 text-xs">
              
              {/* Collection & Time Tag */}
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-amber-950/10 dark:bg-amber-100/10 text-amber-900 dark:text-amber-200 font-medium tracking-widest uppercase text-[10px] border border-amber-900/20">
                  {poem.theme}
                </span>
                <span className="text-amber-900/70 dark:text-darkpaper-muted font-serif italic text-xs">
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
                          ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-xs'
                          : 'bg-amber-950/10 text-amber-950 dark:text-amber-100 border-amber-900/20 hover:border-amber-700/40'
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

                {/* Mode Intime / Zen Toggle */}
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

            {/* Poem Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-amber-950 dark:text-darkpaper-ink leading-tight text-center sm:text-left drop-shadow-xs">
              {poem.titre}
            </h1>

            {/* Publication Date */}
            <p className="text-xs font-sans text-amber-900/70 dark:text-darkpaper-muted uppercase tracking-widest text-center sm:text-left flex items-center gap-2 mt-2">
              <span className="inline-block w-4 h-[1px] bg-amber-900/40" />
              {t.publishedOn} {poem.datePublication}
            </p>

            {/* Strophes / Vers (Font-serif Cormorant Garamond) */}
            <div className={`font-serif ${getFontSizeClass()} text-amber-950/95 dark:text-darkpaper-ink/95 whitespace-pre-wrap py-6 font-normal tracking-wide space-y-4 leading-relaxed`}>
              {poem.contenu}
            </div>

            {/* Footer Interactions Bar */}
            <div className="pt-8 mt-8 border-t border-amber-900/25 dark:border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                {/* Like Button */}
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

                {/* Bookmark Button */}
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

              {/* Share Button */}
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

        {/* Rouleau Inférieur Papier Enroulé (Bottom Roll) avec Spirales d'Enroulement */}
        <div className="relative z-20 flex items-center justify-between h-10 sm:h-14 -mt-3">
          
          {/* Spirale d'Enroulement Gauche Bottom */}
          <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gradient-to-tr from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-900 shadow-xl flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-amber-600/60 bg-gradient-to-br from-amber-900 to-amber-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-500/40" />
            </div>
          </div>

          {/* Corps de Papier Enroulé Bottom */}
          <div className="flex-1 h-8 sm:h-11 parchment-roller-head border-y-2 border-amber-900/60 flex items-center justify-center relative overflow-hidden rounded-xs shadow-lg mx-[-6px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/35 pointer-events-none" />
            <div className="w-32 h-[1px] bg-amber-200/40 rounded-full" />
          </div>

          {/* Spirale d'Enroulement Droite Bottom */}
          <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gradient-to-tl from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-900 shadow-xl flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-amber-600/60 bg-gradient-to-bl from-amber-900 to-amber-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-500/40" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
