import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdminAuthService } from '../services/adminAuthService';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const isValid = await AdminAuthService.verifyPassword(password);
      if (isValid) {
        onSuccess();
        setPassword('');
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Erreur vérification mot de passe:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-bg dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-paper-muted hover:text-paper-ink dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          
          <h2 className="font-serif text-2xl font-medium text-paper-ink dark:text-darkpaper-ink">
            Accès Espace Édition CMS
          </h2>
          
          <p className="text-xs font-serif italic text-paper-muted dark:text-darkpaper-muted max-w-xs mx-auto">
            Zone d'administration réservée à la poétesse. Saisissez votre mot de passe de session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
              Mot de passe administrateur
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-muted" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-colors font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-sans border border-rose-200 dark:border-rose-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Mot de passe incorrect. Accès refusé.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold tracking-wider uppercase hover:bg-accent-terracotta/90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Vérification...' : 'Déverrouiller la session'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-paper-border/60 text-center text-[10px] text-paper-muted">
          Session temporaire non permanente. Déconnexion automatique en fin d'activité.
        </div>

      </div>
    </div>
  );
};
