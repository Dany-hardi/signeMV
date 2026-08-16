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
      
      {/* Conteneur Global du Parchemin Antique avec Animation de Déroulement */}
      <div 
        key={poem.id || poem.slug} 
        className={`max-w-3xl mx-auto my-4 transition-all duration-500 origin-top animate-scroll-unroll ${isZenMode ? 'w-full max-w-4xl' : ''}`}
      >
        
        {/* L'Image Parchemin Officielle EST la Liseuse Principale - Le Texte s'inscrit au centre du papier */}
        <article className="parchment-real-image relative min-h-[720px] sm:min-h-[860px] pt-28 sm:pt-36 pb-28 sm:pb-36 px-16 sm:px-28 md:px-32 flex flex-col justify-between transition-all duration-500">
          
          {/* Monogramme MV filigrané d'époque gravé sur le papier */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[200px] font-serif font-bold text-amber-950/[0.04] pointer-events-none select-none">
            MV
          </div>

          {/* Contenu Poétique Gravé Directement sur le Parchemin */}
          <div className="animate-text-unfurl relative z-10">
            
            {/* En-tête & Barre de Contrôles */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-amber-950/20 text-xs">
              
              {/* Thème & Temps de Lecture */}
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-amber-950/10 text-amber-950 font-medium tracking-widest uppercase text-[10px] border border-amber-950/20">
                  {poem.theme}
                </span>
                <span className="text-amber-950/70 font-serif italic text-xs">
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
                          ? 'bg-amber-950 text-amber-50 border-amber-950 shadow-xs'
                          : 'bg-amber-950/10 text-amber-950 border-amber-950/20 hover:border-amber-950/40'
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
                <div className="flex items-center bg-amber-950/10 p-0.5 rounded-full border border-amber-950/20">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'sm'
                        ? 'bg-amber-950 text-amber-50'
                        : 'text-amber-950/70 hover:text-amber-950'
                    }`}
                    title={t.fontSmall}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('md')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'md'
                        ? 'bg-amber-950 text-amber-50'
                        : 'text-amber-950/70 hover:text-amber-950'
                    }`}
                    title={t.fontMedium}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      fontSize === 'lg'
                        ? 'bg-amber-950 text-amber-50'
                        : 'text-amber-950/70 hover:text-amber-950'
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
                      ? 'bg-amber-950 text-white border-amber-950 shadow-md'
                      : 'bg-amber-950/10 text-amber-950 border-amber-950/20 hover:border-amber-950/40'
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

            {/* Titre du Poème Gravé */}
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-amber-950 leading-tight text-center sm:text-left drop-shadow-xs">
              {poem.titre}
            </h1>

            {/* Date de Publication */}
            <p className="text-xs font-sans text-amber-950/70 uppercase tracking-widest text-center sm:text-left flex items-center gap-2 mt-2">
              <span className="inline-block w-4 h-[1px] bg-amber-950/40" />
              {t.publishedOn} {poem.datePublication}
            </p>

            {/* Vers du Poème gravés à l'encre ancienne directement sur la surface du parchemin */}
            <div className={`font-serif ${getFontSizeClass()} text-amber-950 whitespace-pre-wrap py-6 font-medium tracking-wide space-y-4 leading-relaxed`}>
              {poem.contenu}
            </div>

            {/* Barre d'Interactions Bas de Page */}
            <div className="pt-8 mt-8 border-t border-amber-950/20 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                {/* Bouton J'aime */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                    isLiked
                      ? 'bg-rose-950 text-rose-100 border-rose-950 shadow-xs'
                      : 'bg-amber-950/10 text-amber-950 border-amber-950/20 hover:border-rose-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                  <span>{likesCount}</span>
                </button>

                {/* Bouton Signets */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-2.5 rounded-full border text-xs font-medium transition-all ${
                    saved
                      ? 'bg-amber-950 text-amber-100 border-amber-950 shadow-xs'
                      : 'bg-amber-950/10 text-amber-950 border-amber-950/20 hover:border-amber-950/40'
                  }`}
                  title={saved ? "Retirer des signets" : "Enregistrer dans mes signets"}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-300' : ''}`} />
                </button>
              </div>

              {/* Boutons Partage & Reseaux */}
              <div className="flex items-center gap-2">
                {onOpenShareModal && (
                  <button
                    onClick={() => onOpenShareModal(poem)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950/10 text-amber-950 border border-amber-950/30 text-xs font-medium hover:bg-amber-950 hover:text-white transition-all"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>Aperçu Reseaux</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950 text-amber-50 text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Lien copié !' : 'Partager'}</span>
                </button>
              </div>

            </div>

          </div>

        </article>

      </div>

    </div>
  );
};
