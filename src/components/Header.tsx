import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { ActivePage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Feather, BookOpen, User, Mail, Bookmark, Menu, X } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  savedCount?: number;
  onOpenBookmarksDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  darkMode,
  setDarkMode,
  savedCount = 0,
  onOpenBookmarksDrawer,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home' as ActivePage, label: t.navHome, icon: Feather },
    { id: 'poems' as ActivePage, label: t.navPoems, icon: BookOpen },
    { id: 'about' as ActivePage, label: t.navAbout, icon: User },
    { id: 'contact' as ActivePage, label: t.navContact, icon: Mail },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-paper-bg/90 dark:bg-darkpaper-bg/90 backdrop-blur-md border-b border-paper-border/60 dark:border-darkpaper-border/60 shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <button 
          onClick={() => setActivePage('home')}
          className="text-left focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 rounded-xl"
        >
          <Logo />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-paper-card/70 dark:bg-darkpaper-card/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-paper-border/50 dark:border-darkpaper-border/50 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'poems' && activePage === 'poem-detail');
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg shadow-sm'
                    : 'text-paper-ink/75 dark:text-darkpaper-ink/75 hover:text-accent-terracotta hover:bg-paper-border/30 dark:hover:bg-darkpaper-border/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Carnet de Lecture / Bookmarks Button */}
          {onOpenBookmarksDrawer && (
            <button
              onClick={onOpenBookmarksDrawer}
              title="Ouvrir mon Carnet de Lecture"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-paper-card dark:bg-darkpaper-card border border-paper-border/60 dark:border-darkpaper-border/60 hover:border-accent-terracotta text-paper-ink dark:text-darkpaper-ink relative"
            >
              <Bookmark className="w-3.5 h-3.5 text-accent-terracotta" />
              <span className="hidden sm:inline font-serif">Mes Favoris</span>
              {savedCount > 0 && (
                <span className="bg-accent-terracotta text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Language Toggle FR | EN */}
          <div className="flex items-center bg-paper-card/80 dark:bg-darkpaper-card/80 rounded-full border border-paper-border/60 dark:border-darkpaper-border/60 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'fr'
                  ? 'bg-accent-terracotta text-white shadow-xs'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
              title="Version française"
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'en'
                  ? 'bg-accent-terracotta text-white shadow-xs'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
              title="English version"
            >
              EN
            </button>
          </div>

          {/* Dark / Warm Paper Mode Switcher */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            aria-label="Changer le mode de lecture"
            title={darkMode ? "Mode Écru Papier" : "Mode Nocturne Intime"}
            className="p-2 rounded-full text-paper-ink dark:text-darkpaper-ink hover:bg-paper-card dark:hover:bg-darkpaper-card border border-paper-border/50 dark:border-darkpaper-border/50 transition-all"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-accent-prune" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-paper-ink dark:text-darkpaper-ink"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper-bg dark:bg-darkpaper-bg border-b border-paper-border dark:border-darkpaper-border px-6 py-4 animate-fade-in shadow-xl">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-terracotta/10 text-accent-terracotta'
                      : 'text-paper-ink dark:text-darkpaper-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {onOpenBookmarksDrawer && (
              <button
                onClick={() => {
                  onOpenBookmarksDrawer();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-accent-terracotta/10 text-accent-terracotta font-serif mt-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>Mes Favoris ({savedCount})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
