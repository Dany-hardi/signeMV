import { useState, useEffect } from 'react';
import { INITIAL_POEMS } from './data/poems';
import { Poem, ActivePage } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PoemsPage } from './pages/PoemsPage';
import { PoemDetailPage } from './pages/PoemDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OpenGraphPreviewModal } from './components/OpenGraphPreviewModal';
import { NewsletterModal } from './components/NewsletterModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NewsletterInfoModal } from './components/NewsletterInfoModal';
import { WelcomeModal } from './components/WelcomeModal';
import { PoemesService, SignetsService, getLecteurToken } from './services/db';
import { mapPoemeToPoem, mapStatutToDb } from './utils/mapper';
import { initGoogleAnalytics, trackPageView } from './utils/analytics';

export function App() {
  const [poems, setPoems] = useState<Poem[]>(INITIAL_POEMS);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedPoem, setSelectedPoem] = useState<Poem>(INITIAL_POEMS[0]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [ogModalPoem, setOgModalPoem] = useState<Poem | null>(null);
  
  // Modals & Drawers state
  const [isNewsletterOpen, setIsNewsletterOpen] = useState<boolean>(false);
  const [isNewsletterInfoOpen, setIsNewsletterInfoOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('signemv_admin_session') === 'true';
  });
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(false);

  // Saved / Bookmarked & Liked poems state
  const [savedPoemIds, setSavedPoemIds] = useState<string[]>([]);

  // Initialiser Google Analytics au chargement
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  // Suivi du changement de page dans Google Analytics
  useEffect(() => {
    trackPageView(activePage === 'poem-detail' ? `/poeme/${selectedPoem?.slug || ''}` : `/${activePage}`);
  }, [activePage, selectedPoem]);

  // Show Welcome modal on initial visit
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('signemv_welcome_seen');
    if (!hasVisited) {
      setIsWelcomeOpen(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    sessionStorage.setItem('signemv_welcome_seen', 'true');
    setIsWelcomeOpen(false);
  };

  // Charger les poèmes depuis Supabase
  const loadPoems = async () => {
    try {
      const dbPoemes = await PoemesService.getPublies();
      if (dbPoemes && dbPoemes.length > 0) {
        const mapped = dbPoemes.map(mapPoemeToPoem);
        setPoems(mapped);

        // Détection automatique d'un poème partagé via URL ?poeme=slug
        const params = new URLSearchParams(window.location.search);
        const targetSlug = params.get('poeme') || params.get('p');
        if (targetSlug) {
          const targetPoem = mapped.find(p => p.slug === targetSlug || p.id === targetSlug);
          if (targetPoem) {
            setSelectedPoem(targetPoem);
            setActivePage('poem-detail');
            return;
          }
        }
        setSelectedPoem(mapped[0]);
      }
    } catch (err) {
      console.warn('Fallback sur INITIAL_POEMS local:', err);
    }
  };

  // Charger les signets enregistrés par le lecteur
  const loadBookmarks = async () => {
    try {
      const token = getLecteurToken();
      const dbSignets = await SignetsService.getByToken(token);
      if (dbSignets && dbSignets.length > 0) {
        const ids = dbSignets.map((s: { poeme_id: string }) => s.poeme_id);
        setSavedPoemIds(ids);
      }
    } catch (err) {
      console.warn('Erreur chargement des signets:', err);
    }
  };

  useEffect(() => {
    loadPoems();
    loadBookmarks();
  }, []);

  // Sync Tailwind dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to top on page navigation
  const handlePageChange = (page: ActivePage) => {
    if (page === 'admin' && !isAdminAuthenticated) {
      setIsAdminAuthOpen(true);
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPoem = (poem: Poem) => {
    setSelectedPoem(poem);
    setActivePage('poem-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPoem = async (newPoem: Poem) => {
    setPoems(prev => [newPoem, ...prev]);
    try {
      const dbStatut = mapStatutToDb(newPoem.statut);
      await PoemesService.create({
        slug: newPoem.slug,
        titre: newPoem.titre,
        contenu: newPoem.contenu,
        extrait: newPoem.extrait,
        statut: dbStatut,
        publie_le: new Date().toISOString(),
        date_programmation: newPoem.dateProgrammation,
        audio_url: newPoem.audioUrl,
        illustration_url: newPoem.illustration
      } as any);
      loadPoems();
    } catch (err) {
      console.warn('Erreur synchro création Supabase:', err);
    }
  };

  const handleUpdatePoem = async (updatedPoem: Poem) => {
    setPoems(prev => prev.map(p => p.id === updatedPoem.id ? updatedPoem : p));
    try {
      const dbStatut = mapStatutToDb(updatedPoem.statut);
      await PoemesService.update(updatedPoem.id, {
        slug: updatedPoem.slug,
        titre: updatedPoem.titre,
        contenu: updatedPoem.contenu,
        extrait: updatedPoem.extrait,
        statut: dbStatut,
        publie_le: new Date().toISOString(),
        date_programmation: updatedPoem.dateProgrammation,
        audio_url: updatedPoem.audioUrl,
        illustration_url: updatedPoem.illustration
      } as any);
      loadPoems();
    } catch (err) {
      console.warn('Erreur synchro mise à jour Supabase:', err);
    }
  };

  const handleDeletePoem = async (id: string) => {
    // Suppression immédiate côté client React
    setPoems(prev => prev.filter(p => p.id !== id));
    // Suppression définitive dans la base Supabase
    try {
      await PoemesService.delete(id);
    } catch (err) {
      console.warn('Erreur suppression Supabase:', err);
    }
  };

  const handlePreviewFromAdmin = (poem: Poem) => {
    setSelectedPoem(poem);
    setActivePage('poem-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminAuthSuccess = () => {
    localStorage.setItem('signemv_admin_session', 'true');
    setIsAdminAuthenticated(true);
    setIsAdminAuthOpen(false);
    setActivePage('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('signemv_admin_session');
    setIsAdminAuthenticated(false);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Instant real-time handler for bookmarks (signets)
  const handleBookmarkToggle = (poemId: string, isSaved: boolean) => {
    setSavedPoemIds(prev => {
      if (isSaved) {
        return prev.includes(poemId) ? prev : [...prev, poemId];
      } else {
        return prev.filter(id => id !== poemId);
      }
    });
  };

  // Instant real-time handler for likes
  const handleLikeToggle = (poemId: string, isLiked: boolean) => {
    setSavedPoemIds(prev => {
      if (isLiked) {
        return prev.includes(poemId) ? prev : [...prev, poemId];
      }
      return prev;
    });
  };

  // Quick bookmark toggle on PoemCard
  const handleQuickBookmarkToggle = async (e: React.MouseEvent, poem: Poem) => {
    e.stopPropagation();
    const token = getLecteurToken();
    const isCurrentlySaved = savedPoemIds.includes(poem.id);

    if (isCurrentlySaved) {
      setSavedPoemIds(prev => prev.filter(id => id !== poem.id));
      await SignetsService.remove(poem.id, token);
    } else {
      setSavedPoemIds(prev => [...prev, poem.id]);
      await SignetsService.add(poem.id, token);
    }
  };

  const handleRemoveBookmark = async (poemId: string) => {
    setSavedPoemIds(prev => prev.filter(id => id !== poemId));
    try {
      const token = getLecteurToken();
      await SignetsService.remove(poemId, token);
    } catch (err) {
      console.error('Erreur retrait signet:', err);
    }
  };

  // Poèmes visibles par les lecteurs (exclut les brouillons, archivés et programmés dans le futur)
  const publicPoems = poems.filter(p => {
    if (p.statut === 'publié') return true;
    if (p.statut === 'programmé' && p.dateProgrammation) {
      return new Date(p.dateProgrammation) <= new Date();
    }
    return false;
  });

  const savedPoems = poems.filter(p => savedPoemIds.includes(p.id));

  return (
    <div className="bg-paper-grain min-h-screen flex flex-col font-sans transition-colors duration-500 text-paper-ink dark:text-darkpaper-ink">
      
      {/* Navigation Header */}
      <Header
        activePage={activePage}
        setActivePage={handlePageChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        savedCount={savedPoems.length}
        onOpenBookmarksDrawer={() => setIsBookmarksOpen(true)}
      />

      {/* Main Page View Switcher */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <HomePage
            poems={publicPoems.length > 0 ? publicPoems : poems}
            onSelectPoem={handleSelectPoem}
            setActivePage={handlePageChange}
            onOpenShareModal={(p) => setOgModalPoem(p)}
            onOpenNewsletter={() => setIsNewsletterOpen(true)}
            savedPoemIds={savedPoemIds}
            onToggleBookmark={handleQuickBookmarkToggle}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
          />
        )}

        {activePage === 'poems' && (
          <PoemsPage
            poems={publicPoems.length > 0 ? publicPoems : poems}
            onSelectPoem={handleSelectPoem}
            onOpenShareModal={(p) => setOgModalPoem(p)}
            savedPoemIds={savedPoemIds}
            onToggleBookmark={handleQuickBookmarkToggle}
          />
        )}

        {activePage === 'poem-detail' && selectedPoem && (
          <PoemDetailPage
            poem={selectedPoem}
            allPoems={publicPoems.length > 0 ? publicPoems : poems}
            onSelectPoem={handleSelectPoem}
            setActivePage={handlePageChange}
            onOpenShareModal={(p) => setOgModalPoem(p)}
            onOpenNewsletter={() => setIsNewsletterOpen(true)}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            savedPoemIds={savedPoemIds}
          />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}

        {activePage === 'contact' && (
          <ContactPage />
        )}

        {activePage === 'admin' && isAdminAuthenticated && (
          <AdminDashboard
            poems={poems}
            onAddPoem={handleAddPoem}
            onUpdatePoem={handleUpdatePoem}
            onDeletePoem={handleDeletePoem}
            onPreviewPoem={handlePreviewFromAdmin}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActivePage={handlePageChange}
        onOpenNewsletter={() => setIsNewsletterOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        onOpenNewsletterInfo={() => setIsNewsletterInfoOpen(true)}
      />

      {/* Modals & Drawers */}
      {ogModalPoem && (
        <OpenGraphPreviewModal
          poem={ogModalPoem}
          onClose={() => setOgModalPoem(null)}
        />
      )}

      {isNewsletterOpen && (
        <NewsletterModal
          onClose={() => setIsNewsletterOpen(false)}
        />
      )}

      {isNewsletterInfoOpen && (
        <NewsletterInfoModal
          isOpen={isNewsletterInfoOpen}
          onClose={() => setIsNewsletterInfoOpen(false)}
        />
      )}

      {isBookmarksOpen && (
        <BookmarksDrawer
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          savedPoems={savedPoems}
          onSelectPoem={handleSelectPoem}
          onRemoveBookmark={handleRemoveBookmark}
        />
      )}

      {isAdminAuthOpen && (
        <AdminAuthModal
          isOpen={isAdminAuthOpen}
          onClose={() => setIsAdminAuthOpen(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      )}

      {isWelcomeOpen && (
        <WelcomeModal
          onClose={handleCloseWelcome}
          onExplore={() => {
            handleCloseWelcome();
            handlePageChange('poems');
          }}
        />
      )}

    </div>
  );
}

export default App;
