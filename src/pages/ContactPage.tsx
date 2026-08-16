import React, { useState } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ContactService } from '../services/db';
import type { ObjetContact } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Lecture publique / Rencontre');
  const [objet, setObjet] = useState<ObjetContact>('lecture_publique');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await ContactService.send({
        nom: name,
        email,
        sujet: subject,
        objet,
        message,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 animate-fade-in space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
          {t.contactTitle}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-paper-ink dark:text-darkpaper-ink">
          {t.contactTitle} — MV
        </h1>
        <p className="text-sm text-paper-muted dark:text-darkpaper-muted font-serif italic max-w-md mx-auto">
          {t.contactSubtitle}
        </p>
      </div>

      <div className="paper-sheet p-8 sm:p-12 rounded-2xl border border-paper-border/80 dark:border-darkpaper-border/80 shadow-lg">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Élise Moreau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder="elise@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
                {t.objectLabel}
              </label>
              <select
                value={objet}
                onChange={(e) => {
                  const val = e.target.value as ObjetContact;
                  setObjet(val);
                  const selectedText = e.target.options[e.target.selectedIndex].text;
                  setSubject(selectedText);
                }}
                className="w-full px-4 py-3 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-all"
              >
                <option value="lecture_publique">Lecture publique / Rencontre poétique</option>
                <option value="collaboration">Collaboration artistique / Édition</option>
                <option value="tirage">Commande de recueil / Tirage limité</option>
                <option value="mot_lecteur">Mot de lecteur / Impression</option>
                <option value="presse">Demande presse / Média</option>
                <option value="autre">Autre sujet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
                {t.messageLabel}
              </label>
              <textarea
                rows={6}
                required
                placeholder="Votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-paper-card dark:bg-darkpaper-bg border border-paper-border dark:border-darkpaper-border text-sm font-serif text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta transition-all"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.sendingMsg}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.sendBtn}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-paper-ink dark:text-darkpaper-ink">
              Message Transmis
            </h3>
            <p className="text-xs font-serif italic text-paper-muted dark:text-darkpaper-muted max-w-sm mx-auto">
              {t.contactSuccess}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="mt-4 px-6 py-2 rounded-full border border-paper-border text-xs font-medium hover:bg-paper-card transition-all"
            >
              Écrire un autre message
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
