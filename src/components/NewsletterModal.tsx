import React, { useState } from 'react';
import { X, Send, Check, Mail, Eye, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsletterService } from '../services/db';

interface NewsletterModalProps {
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await NewsletterService.subscribe(email, 'footer');
      setSubscribed(true);
    } catch (err: any) {
      console.error('Erreur inscription newsletter:', err);
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-paper-bg dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!subscribed ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-paper-ink dark:text-darkpaper-ink font-medium">
                {t.newsletterTitle}
              </h3>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted mt-2 max-w-sm mx-auto leading-relaxed">
                {t.newsletterSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-1.5">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-sans">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-accent-terracotta hover:bg-accent-terracotta/90 disabled:opacity-50 text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{loading ? t.subscribingMsg : t.subscribeBtn}</span>
              </button>
            </form>

            {/* Toggle React Email Design Preview */}
            <div className="mt-6 pt-4 border-t border-paper-border/60 dark:border-darkpaper-border/60 text-center">
              <button
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="text-xs text-paper-muted hover:text-accent-terracotta inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showEmailPreview ? "Masquer l'aperçu du template" : "Voir un exemple d'e-mail envoyé"}</span>
              </button>
            </div>

            {/* React Email simulated preview */}
            {showEmailPreview && (
              <div className="mt-4 p-5 rounded-xl bg-[#F7F4EE] text-[#2C2A29] border border-[#E2DDD3] text-center font-serif animate-fade-in shadow-inner text-xs">
                <div className="text-accent-terracotta font-serif italic text-lg font-bold">MV</div>
                <div className="w-8 h-0.5 bg-[#8C5A4C]/40 mx-auto my-3" />
                <h4 className="font-medium text-sm mb-2">« Les Heures Feutrées »</h4>
                <p className="italic opacity-80 mb-4 text-[11px] leading-relaxed">
                  "Il existe une lueur entre le jour qui s’éteint et la nuit qui prend soin..."
                </p>
                <div className="inline-block px-4 py-2 bg-[#2C2A29] text-[#F7F4EE] rounded text-[10px] uppercase tracking-wider font-sans font-semibold">
                  Lire le poème complet sur le site
                </div>
                <div className="mt-4 text-[9px] text-[#6C6864] font-sans">
                  {t.privacyNotice}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-paper-ink dark:text-darkpaper-ink font-medium">
              Bienvenue dans l'intime
            </h3>
            <p className="text-xs text-paper-muted dark:text-darkpaper-muted mt-2 max-w-sm mx-auto leading-relaxed">
              {t.newsletterSuccess} (<span className="font-semibold text-accent-terracotta">{email}</span>)
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg text-xs font-semibold"
            >
              {t.close}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
