import React from 'react';
import { Poem } from '../types';
import { Clock, Volume2, ArrowRight, Share2, Bookmark } from 'lucide-react';

interface PoemCardProps {
  poem: Poem;
  onClick: () => void;
  onOpenShareModal?: (poem: Poem) => void;
  isSaved?: boolean;
  onToggleBookmark?: (e: React.MouseEvent, poem: Poem) => void;
}

export const PoemCard: React.FC<PoemCardProps> = ({
  poem,
  onClick,
  onOpenShareModal,
  isSaved = false,
  onToggleBookmark
}) => {
  
  const getThemeBadge = (theme: string) => {
    switch (theme) {
      case 'Introspection':
        return 'bg-accent-terracotta/10 text-accent-terracotta border-accent-terracotta/20';
      case 'Étreintes':
        return 'bg-accent-prune/10 text-accent-prune border-accent-prune/20';
      case 'Saisons':
        return 'bg-accent-sage/10 text-accent-sage border-accent-sage/20';
      default:
        return 'bg-paper-ink/10 text-paper-ink dark:text-darkpaper-ink border-paper-ink/20';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group relative bg-paper-card/70 dark:bg-darkpaper-card border border-paper-border/70 dark:border-darkpaper-border/70 hover:border-accent-terracotta/40 dark:hover:border-accent-terracotta/40 rounded-2xl p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-paper-hover flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Header metadata */}
        <div className="flex items-center justify-between gap-2 mb-4 text-xs font-sans">
          <span className={`px-3 py-1 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${getThemeBadge(poem.theme)}`}>
            {poem.theme}
          </span>
          <div className="flex items-center gap-2 text-paper-muted dark:text-darkpaper-muted text-[11px]">
            {poem.audioUrl && (
              <span className="flex items-center gap-1 text-accent-sage font-medium bg-accent-sage/10 px-2 py-0.5 rounded-full" title="Audio disponible">
                <Volume2 className="w-3 h-3" />
                <span>Audio</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {poem.readingTime}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="font-serif text-xl sm:text-2xl font-medium text-paper-ink dark:text-darkpaper-ink group-hover:text-accent-terracotta transition-colors duration-300 mb-3 leading-snug"
        >
          {poem.titre}
        </h3>

        {/* Excerpt */}
        <p className="font-serif italic text-sm text-paper-muted dark:text-darkpaper-muted line-clamp-3 leading-relaxed mb-6">
          « {poem.extrait} »
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 border-t border-paper-border/40 dark:border-darkpaper-border/40 flex items-center justify-between text-xs font-sans">
        <span className="text-paper-muted/70 dark:text-darkpaper-muted/70 text-[11px]">
          {poem.datePublication}
        </span>

        <div className="flex items-center gap-2">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(e, poem);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isSaved 
                  ? 'text-accent-terracotta bg-accent-terracotta/10' 
                  : 'text-paper-muted hover:text-accent-terracotta hover:bg-paper-bg dark:hover:bg-darkpaper-bg'
              }`}
              title={isSaved ? "Conservé dans vos favoris" : "Ajouter aux favoris"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {onOpenShareModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenShareModal(poem);
              }}
              className="p-1.5 rounded-full text-paper-muted hover:text-accent-terracotta hover:bg-paper-bg dark:hover:bg-darkpaper-bg transition-colors"
              title="Aperçu carte de partage"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-paper-bg dark:bg-darkpaper-bg text-paper-ink dark:text-darkpaper-ink border border-paper-border dark:border-darkpaper-border group-hover:bg-accent-terracotta group-hover:text-white group-hover:border-accent-terracotta transition-all duration-300 font-medium"
          >
            <span>Lire</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
