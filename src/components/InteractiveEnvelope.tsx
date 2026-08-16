import React, { useState } from 'react';
import { Feather, Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InteractiveEnvelopeProps {
  onOpenNewsletter: () => void;
}

export const InteractiveEnvelope: React.FC<InteractiveEnvelopeProps> = ({ onOpenNewsletter }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="paper-sheet rounded-3xl border border-paper-border/80 dark:border-darkpaper-border/80 p-8 sm:p-12 shadow-xl relative overflow-hidden">
        
        {/* Ambient Warm Backlight */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-terracotta/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Interactive Envelope Graphic */}
          <div className="md:col-span-5 flex justify-center">
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-64 h-44 bg-[#EFE9DF] dark:bg-[#2A2724] rounded-2xl border-2 border-[#D8D0C5] dark:border-[#3D3833] shadow-lg cursor-pointer group transition-all duration-500 hover:scale-[1.02] flex flex-col justify-between p-4"
            >
              {/* Envelope Flap Animation */}
              <div className={`absolute top-0 left-0 right-0 h-20 bg-[#E5DDD0] dark:bg-[#322E2A] rounded-t-2xl border-b border-[#CFC5B7] dark:border-[#423C36] origin-top transition-transform duration-700 z-10 flex items-center justify-center ${isOpen ? '-rotate-x-180 opacity-0 pointer-events-none' : ''}`}>
                
                {/* Wax Stamp Seal */}
                <div className="w-10 h-10 rounded-full bg-accent-terracotta text-white flex items-center justify-center font-serif font-bold text-xs shadow-md border-2 border-[#F7F4EE]">
                  MV
                </div>
              </div>

              {/* Letter Card Peek Inside */}
              <div className={`transition-all duration-700 bg-[#FDFBF7] dark:bg-[#1E1C1A] rounded-xl p-3 border border-[#E0D7C9] dark:border-[#3B3631] shadow-inner text-center space-y-1 ${isOpen ? '-translate-y-6 scale-105 shadow-md' : 'translate-y-2 opacity-80'}`}>
                <span className="text-[10px] uppercase font-sans text-accent-terracotta font-semibold tracking-widest block">
                  Lettre du Silence
                </span>
                <p className="font-serif italic text-xs text-paper-ink dark:text-darkpaper-ink">
                  « Le silence est le verset le plus intime. »
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-paper-muted dark:text-darkpaper-muted">
                <span>Correspondance Mensuelle</span>
                <span className="text-accent-terracotta font-medium group-hover:underline">
                  {isOpen ? "Fermer l'enveloppe" : "Déplier la lettre"}
                </span>
              </div>
            </div>
          </div>

          {/* Text Content & Subscription Trigger */}
          <div className="md:col-span-7 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Feather className="w-4 h-4 text-accent-terracotta" />
              <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
                Correspondance Privilégiée
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-paper-ink dark:text-darkpaper-ink">
              {t.newsletterTitle}
            </h3>

            <p className="font-serif text-sm text-paper-muted dark:text-darkpaper-muted leading-relaxed">
              {t.newsletterSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <button
                onClick={onOpenNewsletter}
                className="px-6 py-3 rounded-full bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all shadow-md flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Rejoindre la correspondance</span>
              </button>

              <span className="text-[11px] text-paper-muted font-sans flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-terracotta" />
                Désinscription en 1 clic
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
