import React, { useState, useRef, useEffect } from 'react';
import { Poem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Share2, Play, Pause, Bookmark, Heart, Check, Maximize2, Minimize2 } from 'lucide-react';
import { LikesService, SignetsService, VisitesService, getLecteurToken } from '../services/db';

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
  onOpenNewsletter,
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

        // Track page visit
        VisitesService.track(`poeme/${poem.slug}`, poem.id);

        // Check bookmark state
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
    const shareUrl = `${window.location.origin}/poemes/${poem.slug}`;
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
      <article className={`paper-sheet max-w-3xl mx-auto rounded-3xl border border-paper-border/80 dark:border-darkpaper-border/80 p-6 sm:p-12 md:p-16 relative shadow-xl transition-all duration-500 my-4 ${isZenMode ? 'w-full shadow-2xl border-accent-terracotta/40' : ''}`}>
        
        {/* Dynamic Background Watermark */}
        <div className="absolute top-8 right-8 text-[120px] font-serif font-bold text-paper-ink/[0.02] dark:text-darkpaper-ink/[0.02] pointer-events-none select-none">
          MV
        </div>

      {/* Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-paper-border/60 dark:border-darkpaper-border/60 text-xs">
        
        {/* Collection & Time Tag */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-accent-terracotta/10 text-accent-terracotta font-medium tracking-wide uppercase text-[10px]">
            {poem.theme}
          </span>
          <span className="text-paper-muted dark:text-darkpaper-muted">
            {poem.readingTime} {t.readTime}
          </span>
        </div>

        {/* Font Size & Utility Controls */}
        <div className="flex items-center gap-2">
          
          {/* Audio Player if available */}
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
                    : 'bg-paper-card dark:bg-darkpaper-card text-paper-ink dark:text-darkpaper-ink border-paper-border/70 hover:border-accent-terracotta/40'
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

          {/* Font Size Toggle Pill */}
          <div className="flex items-center bg-paper-card/80 dark:bg-darkpaper-card/80 p-0.5 rounded-full border border-paper-border/60">
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
                : 'bg-paper-card/80 dark:bg-darkpaper-card/80 text-paper-ink dark:text-darkpaper-ink border-paper-border/60 hover:border-accent-terracotta/40'
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
      <div className="space-y-6">
        
        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-paper-ink dark:text-darkpaper-ink leading-tight text-center sm:text-left">
          {poem.titre}
        </h1>

        {/* Publication Date */}
        <p className="text-xs font-sans text-paper-muted dark:text-darkpaper-muted uppercase tracking-widest text-center sm:text-left">
          {t.publishedOn} {poem.datePublication} — Par MV
        </p>

        {/* Strophes / Vers (Font-serif Cormorant Garamond) */}
        <div className={`font-serif ${getFontSizeClass()} text-paper-ink/90 dark:text-darkpaper-ink/90 whitespace-pre-wrap py-8 font-normal tracking-wide space-y-4`}>
          {poem.contenu}
        </div>

        {/* Signature Textuelle MV Automatique */}
        {!poem.contenu.trim().endsWith('MV') && (
          <div className="pt-4 pb-2 text-right font-serif italic text-base sm:text-lg text-accent-terracotta select-none">
            — MV
          </div>
        )}

      </div>

      {/* Footer Interactions Bar */}
      <div className="pt-8 mt-8 border-t border-paper-border/60 dark:border-darkpaper-border/60 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-900 shadow-xs'
                : 'bg-paper-card dark:bg-darkpaper-card text-paper-ink dark:text-darkpaper-ink border-paper-border/70 hover:border-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2.5 rounded-full border text-xs font-medium transition-all ${
              saved
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-900 shadow-xs'
                : 'bg-paper-card dark:bg-darkpaper-card text-paper-ink dark:text-darkpaper-ink border-paper-border/70 hover:border-amber-300'
            }`}
            title={t.bookmarkPoem}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-500' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={() => onOpenShareModal ? onOpenShareModal(poem) : handleShare()}
            className="p-2.5 rounded-full bg-paper-card dark:bg-darkpaper-card border border-paper-border/70 text-paper-ink dark:text-darkpaper-ink hover:border-accent-terracotta/40 transition-all"
            title={t.sharePoem}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {copied && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 animate-fade-in flex items-center gap-1">
              <Check className="w-3 h-3" />
              {t.copySuccess}
            </span>
          )}
        </div>

        {/* Open Newsletter Invitation */}
        {onOpenNewsletter && (
          <button
            onClick={onOpenNewsletter}
            className="text-xs font-sans text-accent-terracotta hover:underline font-semibold"
          >
            {t.newsletterTitle}
          </button>
        )}

      </div>

    </article>
  </div>
);
};
