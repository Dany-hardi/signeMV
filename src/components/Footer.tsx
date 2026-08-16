import React from 'react';
import { Logo } from './Logo';
import { ActivePage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Info } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onOpenNewsletter: () => void;
  onOpenAdminAuth?: () => void;
  onOpenNewsletterInfo?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActivePage,
  onOpenNewsletter,
  onOpenAdminAuth,
  onOpenNewsletterInfo
}) => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-paper-border/60 dark:border-darkpaper-border/60 bg-paper-bg dark:bg-darkpaper-bg transition-colors duration-500 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <Logo size="md" />
          <p className="font-serif italic text-xs text-paper-muted dark:text-darkpaper-muted max-w-sm">
            « Écrin numérique de poésie introspective et contemporaine. »
          </p>
        </div>

        {/* Center Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-sans text-paper-ink/80 dark:text-darkpaper-ink/80 font-medium">
          <button onClick={() => setActivePage('home')} className="hover:text-accent-terracotta transition-colors">
            {t.navHome}
          </button>
          <button onClick={() => setActivePage('poems')} className="hover:text-accent-terracotta transition-colors">
            {t.navPoems}
          </button>
          <button onClick={() => setActivePage('about')} className="hover:text-accent-terracotta transition-colors">
            {t.navAbout}
          </button>
          <button onClick={() => setActivePage('contact')} className="hover:text-accent-terracotta transition-colors">
            {t.navContact}
          </button>
          
          <div className="flex items-center gap-1">
            <button onClick={onOpenNewsletter} className="text-accent-terracotta font-semibold hover:underline">
              {t.newsletterTitle}
            </button>
            {onOpenNewsletterInfo && (
              <button
                onClick={onOpenNewsletterInfo}
                className="p-1 rounded-full text-paper-muted hover:text-accent-terracotta hover:bg-paper-card transition-colors"
                title="Qu'est-ce que Les Lettres du Silence ?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Copyright & Discrete Admin Link */}
        <div className="flex flex-col items-center md:items-end text-xs text-paper-muted dark:text-darkpaper-muted space-y-1">
          <span className="flex items-center gap-1">
            Signé avec soin par <span className="font-serif font-semibold text-accent-terracotta">MV</span>
          </span>
          <div className="flex items-center gap-3 text-[10px] opacity-70 mt-1">
            <span>© 2026 MV Poésie — Tous droits réservés.</span>
            
            {/* Discreet Admin Login Trigger */}
            {onOpenAdminAuth && (
              <button
                onClick={onOpenAdminAuth}
                className="hover:text-paper-ink dark:hover:text-white transition-colors flex items-center gap-1 text-[9px] uppercase tracking-wider opacity-40 hover:opacity-100"
                title="Accès réservé administration"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Édition</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
