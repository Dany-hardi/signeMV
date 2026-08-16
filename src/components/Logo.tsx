import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Logo Monochrome SigneMV.
 * Représente une plume délicate écrivant sur un chemin poétique courbe.
 * Le fond dynamique s'harmonise avec le background de l'application.
 */
export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md' 
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 32, text: 'text-lg' },
    md: { box: 'w-10 h-10', icon: 40, text: 'text-xl' },
    lg: { box: 'w-14 h-14', icon: 56, text: 'text-3xl' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Svg Logo Monochrome (Plume sur Chemin Poétique) */}
      <div 
        className={`${dimensions.box} rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border/80 dark:border-darkpaper-border/80 flex items-center justify-center p-1.5 transition-all duration-300 shadow-sm hover:border-paper-ink/30 dark:hover:border-darkpaper-ink/30 group`}
        title="SigneMV — Portail Poétique"
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-paper-ink dark:text-darkpaper-ink transition-transform duration-500 group-hover:scale-105"
        >
          {/* Chemin poétique sinueux en fond */}
          <path 
            d="M 6 38 C 14 38, 16 30, 24 30 C 32 30, 34 22, 42 22" 
            stroke="currentColor" 
            strokeWidth="1.75" 
            strokeLinecap="round"
            strokeDasharray="1 3"
            opacity="0.4"
          />
          
          {/* Trait d'encre continu principal */}
          <path 
            d="M 6 38 C 12 38, 16 34, 22 34 C 28 34, 30 26, 36 24" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          {/* Plume d'écriture (Quill) monochrome */}
          <g transform="translate(18, 6) rotate(12)">
            {/* Corps supérieur de la plume */}
            <path 
              d="M 12 2 C 16 6, 18 12, 16 18 C 14 24, 10 26, 6 28 C 4 29, 2 29.5, 0 30 C 1 27, 2 24, 4 20 C 6 16, 8 8, 12 2 Z" 
              fill="currentColor" 
              fillOpacity="0.85"
            />
            {/* Rainures de la plume */}
            <path 
              d="M 12 2 Q 6 16 0 30" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="round"
            />
            <path d="M 10 8 L 14 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            <path d="M 8 13 L 12 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            <path d="M 6 18 L 10 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            
            {/* Goutte d'encre sur le fil */}
            <circle cx="0" cy="30" r="1.5" fill="currentColor"/>
          </g>
        </svg>
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
