import React, { useState } from 'react';
import { X, Feather, Check, BookOpen } from 'lucide-react';
import { Logo } from './Logo';
import { NewsletterService } from '../services/db';

interface WelcomeModalProps {
  onClose: () => void;
  onExplore: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onClose,
  onExplore
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await NewsletterService.subscribe(email, 'homepage');
      setSubscribed(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-bg dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Wave Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent-terracotta via-accent-prune to-accent-sage" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          
          {/* Header Monogram & Subtitle */}
          <div className="flex flex-col items-center gap-3">
            <Logo size="lg" showText={false} />
            <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
              Bienvenue dans le Sanctuaire Poétique de MV
            </span>
          </div>

          {/* Main Welcome Message */}
          <h2 className="font-serif text-2xl sm:text-4xl font-medium text-paper-ink dark:text-darkpaper-ink leading-tight">
            Des vers sculptés dans le silence du papier.
          </h2>

          <p className="font-serif text-sm sm:text-base text-paper-muted dark:text-darkpaper-muted leading-relaxed max-w-md mx-auto italic">
            « Entrez dans un espace de quiétude numérique où chaque poème est une invitation à suspendre le temps et écouter les échos intimes de l'existence. »
          </p>

          {/* Form Inscription Newsletter */}
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Votre adresse email personnelle..."
                  className="flex-1 px-4 py-3.5 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-accent-terracotta/90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 shrink-0"
                >
                  <Feather className="w-4 h-4" />
                  <span>{loading ? 'Inscription...' : 'Rejoindre l\'Intime'}</span>
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg text-left">
                  {errorMsg}
                </p>
              )}

              <p className="text-[10px] text-paper-muted">
                Aucun spam. Recevez les poèmes inédits et lettres manuscrites de MV.
              </p>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-serif flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Votre adresse a été enregistrée avec soin. Bienvenue dans la correspondance.</span>
            </div>
          )}

          {/* Secondary Action CTA */}
          <div className="pt-4 border-t border-paper-border/60 flex items-center justify-between">
            <button
              onClick={() => {
                onExplore();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-paper-border text-xs font-medium text-paper-ink dark:text-darkpaper-ink hover:bg-paper-card transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-accent-terracotta" />
              <span>Entrer directement et explorer la liseuse</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
