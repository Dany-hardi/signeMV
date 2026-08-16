import React, { useState, useEffect } from 'react';
import { Poem, OracleCard } from '../types';
import { OracleCardsService } from '../services/oracleCardsService';
import { Sparkles, RefreshCw, ArrowRight, Feather } from 'lucide-react';

interface PoeticOracleProps {
  poems: Poem[];
  onSelectPoem: (poem: Poem) => void;
}

export const PoeticOracle: React.FC<PoeticOracleProps> = ({ poems, onSelectPoem }) => {
  const [cards, setCards] = useState<OracleCard[]>([]);
  const [currentCard, setCurrentCard] = useState<OracleCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loadOracleCards = async () => {
      const activeCards = await OracleCardsService.getActive();
      setCards(activeCards);
    };
    loadOracleCards();
  }, []);

  const drawRandomCard = () => {
    if (isAnimating || cards.length === 0) return;
    setIsAnimating(true);

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * cards.length);
        setCurrentCard(cards[randomIndex]);
        setIsFlipped(true);
        setIsAnimating(false);
      }, 400);
    } else {
      const randomIndex = Math.floor(Math.random() * cards.length);
      setCurrentCard(cards[randomIndex]);
      setIsFlipped(true);
      setIsAnimating(false);
    }
  };

  const matchedPoem = currentCard?.poemeId 
    ? poems.find(p => p.id === currentCard.poemeId)
    : poems.find(p => p.titre.toLowerCase() === currentCard?.texte.toLowerCase() || p.extrait.includes(currentCard?.texte || '___'));

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs uppercase tracking-widest text-accent-terracotta font-semibold">
          Oracle d'Encre & Méditation
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-paper-ink dark:text-darkpaper-ink">
          Tirer un vers au sort
        </h2>
        <p className="text-xs font-serif italic text-paper-muted dark:text-darkpaper-muted max-w-md mx-auto">
          Laissez le hasard poétique choisir l'empreinte de vers guidant votre journée.
        </p>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 max-w-xl mx-auto h-[320px] cursor-pointer" onClick={drawRandomCard}>
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Card Face (Deck) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl paper-sheet border-2 border-accent-terracotta/30 p-8 flex flex-col items-center justify-center text-center shadow-xl hover:border-accent-terracotta transition-all group">
            <div className="w-16 h-16 rounded-full bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Feather className="w-7 h-7" />
            </div>
            
            <h3 className="font-serif text-2xl font-medium text-paper-ink dark:text-darkpaper-ink mb-2">
              L'Oracle des Vers
            </h3>
            
            <p className="text-xs font-serif italic text-paper-muted dark:text-darkpaper-muted max-w-xs mb-6">
              Cliquez sur la carte pour révéler une strophe scellée par MV.
            </p>

            <span className="px-5 py-2 rounded-full bg-accent-terracotta text-white font-sans text-xs font-semibold uppercase tracking-wider shadow-sm group-hover:bg-accent-terracotta/90 transition-all flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tirer au sort</span>
            </span>
          </div>

          {/* Back Card Face (Revealed Custom Verse Written by MV) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl paper-sheet border border-paper-border dark:border-darkpaper-border p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-paper-border/50 pb-3 mb-4">
                <span className="text-[10px] uppercase font-semibold text-accent-terracotta tracking-widest">
                  {currentCard?.theme || 'Pensée Intime'}
                </span>
                <span className="text-[10px] text-paper-muted font-sans">
                  Carte Poétique de MV
                </span>
              </div>

              <blockquote className="font-serif italic text-base sm:text-lg text-paper-ink dark:text-darkpaper-ink leading-relaxed line-clamp-4 text-center my-2">
                « {currentCard?.texte || "Le silence est le verset le plus intime."} »
              </blockquote>
            </div>

            <div className="pt-4 border-t border-paper-border/50 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  drawRandomCard();
                }}
                className="flex items-center gap-1.5 text-xs text-paper-muted hover:text-accent-terracotta transition-colors font-medium"
                title="Tirer une autre carte"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nouveau tirage</span>
              </button>

              {matchedPoem ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPoem(matchedPoem);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all shadow-xs"
                >
                  <span>Lire le poème lié</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] font-serif italic text-accent-terracotta">
                  — MV
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
