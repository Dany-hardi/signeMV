import React, { useState } from 'react';
import { X, Check, Send, Loader2, Info } from 'lucide-react';
import { NewsletterService } from '../services/db';

interface NewsletterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterInfoModal: React.FC<NewsletterInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await NewsletterService.subscribe(email, 'liseuse');
      setSubscribed(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-bg dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>

          <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold block">
            Concept & Philosophie
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-paper-ink dark:text-darkpaper-ink">
            Que sont « Les Lettres du Silence » ?
          </h2>

          <div className="font-serif text-sm leading-relaxed text-paper-ink/90 dark:text-darkpaper-ink/90 space-y-3 text-left bg-paper-card/70 dark:bg-darkpaper-bg p-5 rounded-2xl border border-paper-border/70">
            <p>
              « Les Lettres du Silence » représentent la correspondance personnelle envoyée par la poétesse MV directement à ses lecteurs privilégiés.
            </p>
            <p>
              Chaque lettre contient un poème manuscrit inédit, des fragments de carnets d'écriture, ainsi que des réflexions intimes sur le temps, les saisons et l'art d'habiter le monde.
            </p>
            <p className="italic text-accent-terracotta border-l-2 border-accent-terracotta/40 pl-3">
              « Aucun algorithme, aucun bruit commercial. Uniquement la poésie transmise avec le soin d'une lettre scellée à la main. »
            </p>
          </div>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Saisissez votre e-mail..."
                  className="flex-1 px-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>S'abonner</span>
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg text-left">
                  {errorMsg}
                </p>
              )}
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-serif flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Vous êtes désormais inscrit aux Lettres du Silence. Merci.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
