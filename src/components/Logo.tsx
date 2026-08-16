import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Logo Officiel SigneMV.
 * Intègre l'image officielle MV (mv.jpeg) avec cadre adaptatif au thème.
 */
export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md' 
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', text: 'text-lg' },
    md: { box: 'w-10 h-10', text: 'text-xl' },
    lg: { box: 'w-14 h-14', text: 'text-3xl' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Nouveau Logo Officiel MV */}
      <div 
        className={`${dimensions.box} rounded-xl overflow-hidden border border-paper-border/80 dark:border-darkpaper-border/80 flex items-center justify-center transition-all duration-300 shadow-sm hover:border-accent-terracotta group shrink-0 bg-paper-card dark:bg-darkpaper-card`}
        title="SigneMV — Portail Poétique"
      >
        <img 
          src="/mv.jpeg" 
          alt="SigneMV Logo" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Marque Textuelle */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif ${dimensions.text} font-semibold tracking-tight text-paper-ink dark:text-darkpaper-ink leading-none`}>
            SigneMV
          </span>
          <span className="font-sans text-[10px] tracking-widest uppercase text-paper-muted dark:text-darkpaper-muted font-medium mt-0.5">
            Poésie & Écrits
          </span>
        </div>
      )}
    </div>
  );
};
