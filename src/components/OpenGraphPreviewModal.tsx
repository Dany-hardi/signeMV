import React, { useState } from 'react';
import { Poem } from '../types';
import { Logo } from './Logo';
import { X, Share2, Check, ExternalLink } from 'lucide-react';
import { getSiteBaseUrl, buildPoemShareUrl } from '../utils/url';

interface OpenGraphPreviewModalProps {
  poem: Poem;
  onClose: () => void;
}

export const OpenGraphPreviewModal: React.FC<OpenGraphPreviewModalProps> = ({ poem, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = buildPoemShareUrl(poem.slug);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-paper-bg dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white hover:bg-paper-card dark:hover:bg-darkpaper-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
            OpenGraph & Visual Share Engine
          </span>
          <h3 className="font-serif text-2xl text-paper-ink dark:text-darkpaper-ink font-medium mt-1">
            Aperçu de la Carte de Partage Reseaux
          </h3>
          <p className="text-xs text-paper-muted dark:text-darkpaper-muted mt-1">
            Générée dynamiquement en temps réel lors du partage du lien sur Instagram, WhatsApp, X ou iMessage.
          </p>
        </div>

        {/* Simulated Generated OG Card (Vercel/OG 1200x630 ratio) */}
        <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden shadow-lg border border-paper-border/80 dark:border-darkpaper-border bg-paper-bg p-8 sm:p-10 flex flex-col justify-between select-none">
          
          {/* Subtle grain texture overlay inside OG */}
          {/* Top Row: Monogram MV + Site Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <Logo size="md" showText={true} />
            <span className="text-[11px] font-sans font-medium tracking-widest text-paper-muted/80 bg-paper-card/80 px-3 py-1 rounded-full border border-paper-border/50 font-mono">
              {getSiteBaseUrl().replace(/^https?:\/\//, '')}
            </span>
          </div>

          {/* Center: Title & Extract */}
          <div className="relative z-10 max-w-lg my-auto">
            <span className="text-xs font-sans font-semibold tracking-wider text-accent-terracotta uppercase">
              {poem.theme} • {poem.datePublication}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-paper-ink mt-2 mb-3 leading-tight">
              « {poem.titre} »
            </h2>
            <p className="font-serif italic text-sm sm:text-base text-paper-ink/80 line-clamp-3 leading-relaxed border-l-2 border-accent-terracotta/40 pl-3">
              {poem.extrait}
            </p>
          </div>

          {/* Bottom Row: Footer CTA */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-paper-ink/10 text-xs font-sans text-paper-muted">
            <span>Lecture immersive (2 min)</span>
            <span className="font-medium text-accent-terracotta flex items-center gap-1">
              Lire l'intégralité <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-paper-border/60 dark:border-darkpaper-border/60">
          <div className="text-xs text-paper-muted dark:text-darkpaper-muted flex items-center gap-1.5 font-mono">
            <span>URL :</span>
            <code className="bg-paper-card dark:bg-darkpaper-bg px-2.5 py-1 rounded text-paper-ink dark:text-darkpaper-ink select-all">
              {shareUrl}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Lien copié !' : 'Copier le lien d\'aperçu'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
