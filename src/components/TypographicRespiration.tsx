import React from 'react';

export const TypographicRespiration: React.FC = () => {
  return (
    <section className="relative my-16 py-20 px-4 overflow-hidden border-y border-paper-border/60 dark:border-darkpaper-border/60 sand-card">
      
      {/* Background Soft Parallax Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-terracotta/5 via-accent-prune/5 to-accent-sage/5 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        
        {/* Plume Divider Top */}
        <div className="flex items-center justify-center gap-4 text-accent-terracotta/60">
          <div className="h-[1px] w-12 bg-accent-terracotta/40" />
          <span className="font-serif italic text-xs tracking-widest uppercase">Parenthèse Poétique</span>
          <div className="h-[1px] w-12 bg-accent-terracotta/40" />
        </div>

        {/* Large Typographic Banner Quote */}
        <blockquote className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal italic tracking-tight text-paper-ink dark:text-darkpaper-ink leading-tight max-w-3xl mx-auto">
          « Écrire, c'est écouter ce que les mots disent quand personne ne parle. »
        </blockquote>

        <div className="font-sans text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
          — MV, Carnet d'Ombre & de Lumière
        </div>

      </div>
    </section>
  );
};
