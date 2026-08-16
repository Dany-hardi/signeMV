import React from 'react';
import { Poem } from '../types';
import { Bookmark, X, ArrowRight, Trash2, BookOpen } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPoems: Poem[];
  onSelectPoem: (poem: Poem) => void;
  onRemoveBookmark: (poemId: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  savedPoems,
  onSelectPoem,
  onRemoveBookmark
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Sliding Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-paper-bg dark:bg-darkpaper-card border-l border-paper-border dark:border-darkpaper-border shadow-2xl p-6 flex flex-col justify-between transition-transform duration-500 ease-out">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-paper-border/60 dark:border-darkpaper-border/60 mb-6">
              <div className="flex items-center gap-2 text-accent-terracotta">
                <Bookmark className="w-5 h-5 fill-current" />
                <h2 className="font-serif text-xl font-medium text-paper-ink dark:text-darkpaper-ink">
                  Carnet de Lecture ({savedPoems.length})
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-serif italic text-paper-muted dark:text-darkpaper-muted mb-6">
              Retrouvez ici les poèmes que vous avez sauvegardés pour vos moments de quiétude.
            </p>

            {/* List of Saved Poems */}
            <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
              {savedPoems.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-paper-border/80 rounded-2xl bg-paper-card/40 dark:bg-darkpaper-bg/40">
                  <BookOpen className="w-8 h-8 text-paper-muted mx-auto mb-3 opacity-50" />
                  <p className="font-serif italic text-sm text-paper-muted">
                    Votre carnet de lecture est vide.
                  </p>
                  <p className="text-xs text-paper-muted/80 mt-1">
                    Cliquez sur le signet d'un poème pour le conserver ici.
                  </p>
                </div>
              ) : (
                savedPoems.map(poem => (
                  <div
                    key={poem.id}
                    className="group bg-paper-card/80 dark:bg-darkpaper-bg border border-paper-border/70 dark:border-darkpaper-border/70 rounded-2xl p-4 transition-all hover:border-accent-terracotta/40 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent-terracotta/10 text-accent-terracotta text-[10px] uppercase font-semibold">
                        {poem.theme}
                      </span>

                      <button
                        onClick={() => onRemoveBookmark(poem.id)}
                        className="text-paper-muted hover:text-rose-500 transition-colors p-1"
                        title="Retirer de mon carnet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink group-hover:text-accent-terracotta transition-colors">
                      {poem.titre}
                    </h3>

                    <p className="font-serif italic text-xs text-paper-muted dark:text-darkpaper-muted line-clamp-2">
                      « {poem.extrait} »
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-paper-border/40 text-xs">
                      <span className="text-[10px] text-paper-muted">{poem.readingTime}</span>
                      
                      <button
                        onClick={() => {
                          onSelectPoem(poem);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-accent-terracotta font-semibold text-xs hover:underline"
                      >
                        <span>Relire</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-paper-border/60 dark:border-darkpaper-border/60 text-center text-[10px] text-paper-muted">
            Carnet préservé automatiquement sur votre appareil.
          </div>

        </div>
      </div>
    </div>
  );
};
