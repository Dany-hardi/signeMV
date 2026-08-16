import React from 'react';
import { Logo } from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import { Feather, Compass, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 animate-fade-in space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
          Démarche & Philosophie
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-paper-ink dark:text-darkpaper-ink">
          {t.navAbout} — MV
        </h1>
        <p className="text-sm text-paper-muted dark:text-darkpaper-muted font-serif italic">
          Une écriture de l'intime, ancrée dans la matière, l'éclipse du bruit et la lenteur.
        </p>
      </div>

      {/* Main Narrative Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Author Portrait Card */}
        <div className="md:col-span-5 relative group sticky top-24">
          <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border relative shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-accent-terracotta/40 via-accent-prune/20 to-transparent z-10 mix-blend-multiply" />
            <div className="w-full h-full bg-[#E8DDD1] dark:bg-[#2C2825] flex flex-col items-center justify-center text-center p-8 relative">
              <Logo size="lg" showText={false} />
              <div className="font-serif italic text-2xl text-accent-terracotta mt-4">
                MV
              </div>
              <span className="text-[11px] font-sans text-paper-muted dark:text-darkpaper-muted mt-1 uppercase tracking-widest font-medium">
                Poétesse Contemporaine
              </span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs font-serif italic text-paper-muted leading-relaxed">
            « La poésie comme un geste d'attention porté à ce qui s'éteint et à ce qui renaît. »
          </div>
        </div>

        {/* Deep Narrative Text */}
        <div className="md:col-span-7 space-y-8 font-serif text-paper-ink/90 dark:text-darkpaper-ink/90 leading-relaxed">
          
          {/* Chapter 1 */}
          <div className="paper-sheet p-8 sm:p-10 rounded-2xl border border-paper-border/80 dark:border-darkpaper-border/80 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-paper-border/40 pb-3 text-xs font-sans">
              <Feather className="w-4 h-4 text-accent-terracotta" />
              <span className="uppercase tracking-widest text-accent-terracotta font-semibold">
                I. L'Origine du Regard
              </span>
            </div>

            <p className="text-base">
              Mon écriture a débuté là où le bruit du monde s'interrompt. Dans la solitude des fins de journées, quand la lumière se retire doucement sur les parquets et que chaque objet reprend sa respiration.
            </p>

            <p className="text-sm text-paper-ink/80 dark:text-darkpaper-ink/80">
              J'ai toujours perçu la poésie non comme un apparat ou une démonstration de style, mais comme une nécessité d'ancrage. Écrire, c'est retenir une ombre, fixer la texture d'un souvenir avant qu'il ne se transforme en oubli.
            </p>

            <p className="text-sm italic border-l-2 border-accent-terracotta/50 pl-4 my-3 text-accent-terracotta">
              « Rien de ce qui est ressenti dans la pénombre ne mérite d'être perdu. »
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="paper-sheet p-8 sm:p-10 rounded-2xl border border-paper-border/80 dark:border-darkpaper-border/80 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-paper-border/40 pb-3 text-xs font-sans">
              <Compass className="w-4 h-4 text-accent-prune" />
              <span className="uppercase tracking-widest text-accent-prune font-semibold">
                II. La Poétique des Saisons & des Étreintes
              </span>
            </div>

            <p className="text-sm text-paper-ink/80 dark:text-darkpaper-ink/80">
              Chaque recueil naît d'une géographie intime. Mes vers s'articulent autour de cycles naturels : l'amertume féconde de l'hiver, la clarté retrouvée du printemps, et les fêlures discrètes des étreintes humaines.
            </p>

            <p className="text-sm text-paper-ink/80 dark:text-darkpaper-ink/80">
              Je cherche la simplicité des mots bruts. Ceux qui n'ont pas besoin d'artifice pour toucher juste. Une poésie palpable, faite de grain, d'encre et de retenue.
            </p>
          </div>

          {/* Chapter 3 */}
          <div className="paper-sheet p-8 sm:p-10 rounded-2xl border border-paper-border/80 dark:border-darkpaper-border/80 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-paper-border/40 pb-3 text-xs font-sans">
              <BookOpen className="w-4 h-4 text-accent-sage" />
              <span className="uppercase tracking-widest text-accent-sage font-semibold">
                III. L'Esprit de cet Écrin
              </span>
            </div>

            <p className="text-sm text-paper-ink/80 dark:text-darkpaper-ink/80">
              Ce lieu numérique a été pensé comme un refuge pour l'esprit. Un espace feutré, à l'écart des flux incessants, où vous pouvez parcourir mes poèmes comme vous feuilletteriez un carnet retrouvé au fond d'un tiroir.
            </p>

            <p className="text-sm text-paper-ink/80 dark:text-darkpaper-ink/80">
              Si une strophe résonne avec votre propre histoire ou vous offre quelques minutes de répit, alors ma démarche aura trouvé sa pleine lumière.
            </p>

            <div className="pt-4 flex justify-end font-serif italic text-accent-terracotta font-medium text-lg">
              MV
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
