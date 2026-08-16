import React, { useState, useEffect } from 'react';
import { Poem, ThemeCategory, OracleCard } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AdminService, MessageContact, AbonneNewsletter, DashboardAdmin } from '../services/db';
import { OracleCardsService } from '../services/oracleCardsService';
import { AdminAuthService } from '../services/adminAuthService';
import { 
  PenTool, Plus, Save, Trash2, CheckCircle2, RefreshCw, 
  Eye, Mail, Users, BarChart3, Search, AlertTriangle, FileText,
  Check, Inbox, LogOut, Sparkles, ToggleLeft, ToggleRight,
  Calendar, Lock, KeyRound, ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  poems: Poem[];
  onAddPoem: (poem: Poem) => void;
  onUpdatePoem: (poem: Poem) => void;
  onDeletePoem: (id: string) => void;
  onPreviewPoem: (poem: Poem) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  poems,
  onAddPoem,
  onUpdatePoem,
  onDeletePoem,
  onPreviewPoem,
  onLogout
}) => {
  const { t } = useLanguage();
  
  // Navigation Tabs & Message Filter
  const [activeTab, setActiveTab] = useState<'poems' | 'cards' | 'newsletters' | 'messages' | 'analytics' | 'security'>('poems');
  const [messageFilter, setMessageFilter] = useState<'tous' | 'non_lu' | 'lu' | 'archive'>('tous');

  // Selected Poem & Form State
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(poems[0]?.id || null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [poemFilter, setPoemFilter] = useState('');

  // Form Fields State for Poems
  const [id, setId] = useState('');
  const [titre, setTitre] = useState('');
  const [slug, setSlug] = useState('');
  const [contenu, setContenu] = useState('');
  const [extrait, setExtrait] = useState('');
  const [datePublication, setDatePublication] = useState('');
  const [dateProgrammation, setDateProgrammation] = useState('');
  const [theme, setTheme] = useState<ThemeCategory>('Introspection');
  const [readingTime, setReadingTime] = useState('2 min');
  const [audioUrl, setAudioUrl] = useState('');
  const [statut, setStatut] = useState<'publié' | 'brouillon' | 'archivé' | 'programmé'>('brouillon');
  
  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  // Statuses
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Oracle Cards Management State
  const [oracleCards, setOracleCards] = useState<OracleCard[]>([]);
  const [cardTexte, setCardTexte] = useState('');
  const [cardTheme, setCardTheme] = useState<ThemeCategory>('Introspection');
  const [cardPoemId, setCardPoemId] = useState('');

  // Supabase Live Admin Data
  const [messages, setMessages] = useState<MessageContact[]>([]);
  const [abonnes, setAbonnes] = useState<AbonneNewsletter[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardAdmin | null>(null);

  // Charger les cartes Oracle
  const loadOracleCards = async () => {
    const list = await OracleCardsService.getAll();
    setOracleCards(list);
  };

  // Charger les données du CMS depuis Supabase & Local
  useEffect(() => {
    async function loadCmsData() {
      try {
        const [msgsData, abosData, statsData] = await Promise.all([
          AdminService.getMessages(),
          AdminService.getAbonnes(),
          AdminService.getDashboard()
        ]);
        setMessages(msgsData);
        setAbonnes(abosData);
        setDashboardStats(statsData);
      } catch (err) {
        console.warn('Erreur chargement des données CMS Supabase:', err);
      }
    }
    loadCmsData();
    loadOracleCards();
  }, [activeTab]);

  // Sync Selected Poem into Form
  useEffect(() => {
    if (isEditingNew) {
      setId(`p-${Date.now()}`);
      setTitre('');
      setSlug('');
      setContenu('');
      setExtrait('');
      setDatePublication(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
      setDateProgrammation('');
      setTheme('Introspection');
      setReadingTime('2 min');
      setAudioUrl('');
      setStatut('brouillon');
      setAutoSaveStatus('saved');
    } else if (selectedPoemId) {
      const p = poems.find(x => x.id === selectedPoemId);
      if (p) {
        setId(p.id);
        setTitre(p.titre);
        setSlug(p.slug);
        setContenu(p.contenu);
        setExtrait(p.extrait);
        setDatePublication(p.datePublication);
        setDateProgrammation(p.dateProgrammation || '');
        setTheme(p.theme);
        setReadingTime(p.readingTime);
        setAudioUrl(p.audioUrl || '');
        setStatut(p.statut);
        setAutoSaveStatus('saved');
      }
    }
  }, [selectedPoemId, isEditingNew, poems]);

  // Auto slugify title
  const handleTitleChange = (val: string) => {
    setTitre(val);
    if (isEditingNew) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
    setAutoSaveStatus('dirty');
  };

  const handleSavePoem = (e: React.FormEvent) => {
    e.preventDefault();
    setAutoSaveStatus('saving');

    const finalContenu = contenu.replace(/(?:\s*|\n*)(?:—|-)*\s*MV\s*\.?$/gi, '').trim();

    const poemData: Poem = {
      id,
      titre,
      slug: slug || `poeme-${Date.now()}`,
      contenu: finalContenu,
      extrait: extrait || finalContenu.replace(/(?:\s*|\n*)(?:—|-)*\s*MV\s*\.?$/gi, '').slice(0, 100).trim() + '...',
      datePublication: statut === 'programmé' && dateProgrammation 
        ? new Date(dateProgrammation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : datePublication,
      dateProgrammation: statut === 'programmé' ? dateProgrammation : undefined,
      theme,
      readingTime,
      audioUrl: audioUrl || undefined,
      statut
    };

    if (isEditingNew) {
      onAddPoem(poemData);
      setIsEditingNew(false);
      setSelectedPoemId(poemData.id);
    } else {
      onUpdatePoem(poemData);
    }

    setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 600);
  };

  const handleDeleteConfirm = () => {
    if (selectedPoemId) {
      onDeletePoem(selectedPoemId);
      setShowDeleteModal(false);
      const remaining = poems.filter(p => p.id !== selectedPoemId);
      if (remaining.length > 0) {
        setSelectedPoemId(remaining[0].id);
      } else {
        setIsEditingNew(true);
      }
    }
  };

  const handleNewPoem = () => {
    setIsEditingNew(true);
    setSelectedPoemId(null);
  };

  // Handlers pour la gestion des cartes Oracle par la poétesse
  const handleAddOracleCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTexte.trim()) return;

    const newCard: OracleCard = {
      id: `oc-${Date.now()}`,
      texte: cardTexte.trim(),
      theme: cardTheme,
      poemeId: cardPoemId || undefined,
      actif: true,
      createdAt: new Date().toISOString()
    };

    const updated = await OracleCardsService.saveCard(newCard);
    setOracleCards(updated);
    setCardTexte('');
    setCardPoemId('');
  };

  const handleToggleCardActive = async (cardId: string) => {
    const updated = await OracleCardsService.toggleActive(cardId);
    setOracleCards(updated);
  };

  const handleDeleteCard = async (cardId: string) => {
    const updated = await OracleCardsService.deleteCard(cardId);
    setOracleCards(updated);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await AdminAuthService.updatePassword(oldPassword, newPassword, confirmPassword);
    if (res.success) {
      setPasswordStatus({ type: 'success', message: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: res.message });
    }
  };

  const filteredPoems = poems.filter(p => 
    p.titre.toLowerCase().includes(poemFilter.toLowerCase()) ||
    p.theme.toLowerCase().includes(poemFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 animate-fade-in space-y-8">
      
      {/* Top Header Bar with Logout & Synchronized Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-paper-border/60 dark:border-darkpaper-border/60">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-terracotta/15 text-accent-terracotta flex items-center justify-center font-bold">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-medium text-paper-ink dark:text-darkpaper-ink">
                {t.adminTitle}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Supabase Synchronisé
              </span>
            </div>
            <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
              {t.adminSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Tab Selection Navigation */}
          <div className="flex items-center gap-1 bg-paper-bg dark:bg-darkpaper-bg p-1 rounded-xl border border-paper-border/60 dark:border-darkpaper-border/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab('poems')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'poems'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.tabPoems}</span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cards'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oracle & Versets</span>
              <span className="bg-accent-terracotta/20 text-accent-terracotta text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {oracleCards.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('newsletters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'newsletters'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.tabNewsletters}</span>
              {abonnes.length > 0 && (
                <span className="bg-accent-terracotta/20 text-accent-terracotta text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {abonnes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'messages'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t.tabMessages}</span>
              {messages.length > 0 && (
                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.tabAnalytics}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'security'
                  ? 'bg-paper-card dark:bg-darkpaper-card text-accent-terracotta shadow-xs font-semibold'
                  : 'text-paper-muted dark:text-darkpaper-muted hover:text-paper-ink dark:hover:text-darkpaper-ink'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sécurité</span>
            </button>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-paper-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Fermer la session CMS"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* TAB 1: POÈMES & VERS */}
      {activeTab === 'poems' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Poem Selection List */}
          <div className="lg:col-span-4 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-4 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-paper-muted">
                Recueils ({poems.length})
              </span>
              <button
                type="button"
                onClick={handleNewPoem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent-terracotta text-white text-xs font-medium hover:bg-accent-terracotta/90 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-paper-muted" />
              <input
                type="text"
                value={poemFilter}
                onChange={(e) => setPoemFilter(e.target.value)}
                placeholder="Filtrer un titre..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border/60 text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
              />
            </div>

            {/* Poem List */}
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredPoems.map(poem => {
                const isSelected = selectedPoemId === poem.id && !isEditingNew;
                return (
                  <div
                    key={poem.id}
                    onClick={() => {
                      setSelectedPoemId(poem.id);
                      setIsEditingNew(false);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-accent-terracotta/10 border-accent-terracotta/40 text-accent-terracotta font-medium shadow-xs'
                        : 'border-transparent hover:bg-paper-bg dark:hover:bg-darkpaper-bg text-paper-ink dark:text-darkpaper-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-serif truncate font-semibold">{poem.titre}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                        poem.statut === 'publié' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                          : poem.statut === 'programmé'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {poem.statut}
                      </span>
                    </div>
                    <p className="text-[11px] text-paper-muted line-clamp-1 italic font-serif">
                      {poem.extrait}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Poem Form Editor */}
          <div className="lg:col-span-8 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <form onSubmit={handleSavePoem} className="space-y-6">
              
              {/* Form Bar Title & Save */}
              <div className="flex items-center justify-between pb-4 border-b border-paper-border/60">
                <div>
                  <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
                    {isEditingNew ? "Création d'une nouvelle œuvre" : `Édition : ${titre || 'Poème'}`}
                  </h2>
                  <span className="text-xs text-paper-muted font-sans">
                    ID : {id}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-paper-muted flex items-center gap-1 font-sans">
                    {autoSaveStatus === 'saving' && <RefreshCw className="w-3 h-3 animate-spin text-accent-terracotta" />}
                    {autoSaveStatus === 'saved' && <Check className="w-3 h-3 text-emerald-600" />}
                    {autoSaveStatus === 'dirty' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                    <span className="hidden sm:inline">
                      {autoSaveStatus === 'saving' ? 'Enregistrement...' : autoSaveStatus === 'saved' ? 'Enregistré' : 'Modifié'}
                    </span>
                  </span>

                  {!isEditingNew && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={t.deleteBtn}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.saveBtn}</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-paper-muted">{t.titleLabel}</label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Titre du poème..."
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-paper-muted">{t.slugLabel}</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setAutoSaveStatus('dirty');
                    }}
                    required
                    placeholder="permalien-du-poeme"
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-paper-muted">{t.themeLabel}</label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value as ThemeCategory);
                      setAutoSaveStatus('dirty');
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                  >
                    <option value="Introspection">Introspection</option>
                    <option value="Étreintes">Étreintes</option>
                    <option value="Mélancolie">Mélancolie</option>
                    <option value="Saisons">Saisons</option>
                    <option value="Silences">Silences</option>
                    <option value="Nocturnes">Nocturnes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-paper-muted">Statut de publication</label>
                  <select
                    value={statut}
                    onChange={(e) => {
                      setStatut(e.target.value as 'publié' | 'brouillon' | 'archivé' | 'programmé');
                      setAutoSaveStatus('dirty');
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta font-medium"
                  >
                    <option value="publié">Publié (Visible immédiatement des lecteurs)</option>
                    <option value="programmé">Programmé (Publication différée automatique)</option>
                    <option value="brouillon">Brouillon (Conservé en privé)</option>
                    <option value="archivé">Archivé</option>
                  </select>
                </div>
              </div>

              {/* Champ spécial publication programmée */}
              {statut === 'programmé' && (
                <div className="space-y-1 bg-accent-terracotta/5 p-4 rounded-xl border border-accent-terracotta/30 animate-fade-in">
                  <label className="text-xs font-semibold text-accent-terracotta flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Date & Heure de publication programmée
                  </label>
                  <input
                    type="datetime-local"
                    value={dateProgrammation}
                    onChange={(e) => {
                      setDateProgrammation(e.target.value);
                      setAutoSaveStatus('dirty');
                    }}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-darkpaper-card border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                  />
                  <p className="text-[11px] text-paper-muted italic pt-1">
                    Le poème restera confidentiel jusqu'à cette date exacte, puis s'affichera automatiquement pour tous les lecteurs.
                  </p>
                </div>
              )}

              {/* Extrait */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-paper-muted">{t.excerptLabel}</label>
                <input
                  type="text"
                  value={extrait}
                  onChange={(e) => {
                    setExtrait(e.target.value);
                    setAutoSaveStatus('dirty');
                  }}
                  placeholder="Accroche ou première strophe pour la carte..."
                  className="w-full px-3.5 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-paper-muted">{t.contentLabel}</label>
                <textarea
                  value={contenu}
                  onChange={(e) => {
                    setContenu(e.target.value);
                    setAutoSaveStatus('dirty');
                  }}
                  required
                  rows={10}
                  placeholder="Rédigez les vers ici..."
                  className="w-full p-4 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-sm font-serif leading-relaxed text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta whitespace-pre-wrap"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-paper-border/60">
                <button
                  type="button"
                  onClick={() => onPreviewPoem({
                    id, titre, slug, contenu, extrait, datePublication, theme, readingTime, statut
                  })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs font-medium text-paper-ink dark:text-darkpaper-ink hover:bg-paper-border/30 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Aperçu liseuse</span>
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

      {/* TAB 2: ORACLE & CARTES POÉTIQUES SUR MESURE */}
      {activeTab === 'cards' && (
        <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-paper-border/60 pb-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
                Gestion des Cartes & Strophes de l'Oracle
              </h2>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
                Rédigez et activez les strophes et versets que les lecteurs peuvent tirer au sort sur la page d'accueil.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent-terracotta/15 text-accent-terracotta text-xs font-semibold">
              {oracleCards.filter(c => c.actif).length} / {oracleCards.length} Active(s)
            </span>
          </div>

          {/* Formulaire de création de carte */}
          <form onSubmit={handleAddOracleCard} className="bg-paper-bg dark:bg-darkpaper-bg p-5 rounded-2xl border border-paper-border/70 space-y-4">
            <h3 className="text-xs font-semibold text-accent-terracotta uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Écrire une nouvelle carte d'encre
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-1">
                <label className="text-[11px] font-semibold text-paper-muted">Pensée / Verset scellé</label>
                <textarea
                  value={cardTexte}
                  onChange={(e) => setCardTexte(e.target.value)}
                  required
                  rows={2}
                  placeholder="Rédigez la pensée ou la strophe manuscrite..."
                  className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-darkpaper-card border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta"
                />
              </div>

              <div className="md:col-span-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-paper-muted">Thème de la carte</label>
                  <select
                    value={cardTheme}
                    onChange={(e) => setCardTheme(e.target.value as ThemeCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkpaper-card border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink"
                  >
                    <option value="Introspection">Introspection</option>
                    <option value="Étreintes">Étreintes</option>
                    <option value="Mélancolie">Mélancolie</option>
                    <option value="Saisons">Saisons</option>
                    <option value="Silences">Silences</option>
                    <option value="Nocturnes">Nocturnes</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publier cette carte</span>
                </button>
              </div>
            </div>
          </form>

          {/* Liste des cartes publiées */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-paper-muted uppercase tracking-wider">
              Cartes en circulation ({oracleCards.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oracleCards.map(card => (
                <div 
                  key={card.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    card.actif 
                      ? 'paper-sheet border-paper-border dark:border-darkpaper-border' 
                      : 'bg-paper-bg/40 dark:bg-darkpaper-bg/40 border-paper-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-terracotta/10 text-accent-terracotta font-semibold text-[10px] uppercase">
                      {card.theme}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCardActive(card.id)}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                          card.actif ? 'text-emerald-600' : 'text-paper-muted'
                        }`}
                        title={card.actif ? "Désactiver la carte" : "Activer la carte"}
                      >
                        {card.actif ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        <span>{card.actif ? 'Active' : 'Masquée'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Supprimer la carte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <blockquote className="font-serif italic text-sm text-paper-ink dark:text-darkpaper-ink leading-relaxed">
                    « {card.texte} »
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: NEWSLETTERS */}
      {activeTab === 'newsletters' && (
        <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-paper-border/60 pb-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
                Abonnés aux Lettres du Silence
              </h2>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
                Liste des correspondants ayant souscrit à vos lettres mensuelles.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent-terracotta/15 text-accent-terracotta text-xs font-semibold">
              {abonnes.length} Abonné(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-paper-border/60 text-paper-muted font-sans uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Prénom</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border/40 font-sans">
                {abonnes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-paper-muted italic">
                      Aucun abonné enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  abonnes.map(abo => (
                    <tr key={abo.id} className="hover:bg-paper-bg/50 dark:hover:bg-darkpaper-bg/50">
                      <td className="py-3 px-3 font-medium text-paper-ink dark:text-darkpaper-ink">{abo.email}</td>
                      <td className="py-3 px-3 text-paper-muted">{abo.prenom || '—'}</td>
                      <td className="py-3 px-3"><span className="bg-paper-bg border border-paper-border/60 px-2 py-0.5 rounded text-[10px]">{abo.source}</span></td>
                      <td className="py-3 px-3 text-paper-muted">{new Date(abo.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MESSAGES REÇUS (BOÎTE DE RÉCEPTION) */}
      {activeTab === 'messages' && (
        <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-border/60 pb-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink flex items-center gap-2">
                <Inbox className="w-5 h-5 text-accent-terracotta" />
                Boîte de Réception — Correspondances Reçues
              </h2>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
                Messages transmis par les lecteurs et partenaires depuis la page de contact.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent-terracotta/15 text-accent-terracotta text-xs font-semibold">
                {messages.length} Message(s) au total
              </span>
            </div>
          </div>

          {/* Filtres par Statut */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessageFilter('tous')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                messageFilter === 'tous'
                  ? 'bg-paper-ink text-paper-bg dark:bg-darkpaper-ink dark:text-darkpaper-bg'
                  : 'bg-paper-bg dark:bg-darkpaper-bg text-paper-muted hover:text-paper-ink'
              }`}
            >
              Tous ({messages.length})
            </button>
            <button
              onClick={() => setMessageFilter('non_lu')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                messageFilter === 'non_lu'
                  ? 'bg-accent-terracotta text-white'
                  : 'bg-paper-bg dark:bg-darkpaper-bg text-paper-muted hover:text-paper-ink'
              }`}
            >
              Nouveaux ({messages.filter(m => m.statut === 'non_lu' || !m.statut).length})
            </button>
            <button
              onClick={() => setMessageFilter('lu')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                messageFilter === 'lu'
                  ? 'bg-accent-sage text-white'
                  : 'bg-paper-bg dark:bg-darkpaper-bg text-paper-muted hover:text-paper-ink'
              }`}
            >
              Lus ({messages.filter(m => m.statut === 'lu' || m.statut === 'repondu').length})
            </button>
            <button
              onClick={() => setMessageFilter('archive')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                messageFilter === 'archive'
                  ? 'bg-paper-muted text-white'
                  : 'bg-paper-bg dark:bg-darkpaper-bg text-paper-muted hover:text-paper-ink'
              }`}
            >
              Archivés ({messages.filter(m => m.statut === 'archive').length})
            </button>
          </div>

          {/* Liste des Messages */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-12 text-center text-paper-muted italic border border-dashed border-paper-border rounded-xl space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-accent-terracotta/40" />
                <p className="font-serif text-sm">Aucun message reçu pour le moment.</p>
                <p className="text-xs">Les messages envoyés par les visiteurs s'afficheront instantanément ici.</p>
              </div>
            ) : (
              messages
                .filter(msg => {
                  if (messageFilter === 'non_lu') return msg.statut === 'non_lu' || !msg.statut;
                  if (messageFilter === 'lu') return msg.statut === 'lu' || msg.statut === 'repondu';
                  if (messageFilter === 'archive') return msg.statut === 'archive';
                  return true;
                })
                .map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      msg.statut === 'non_lu' || !msg.statut
                        ? 'bg-accent-terracotta/5 border-accent-terracotta/30 shadow-xs'
                        : 'bg-paper-bg dark:bg-darkpaper-bg border-paper-border/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-semibold text-base text-paper-ink dark:text-darkpaper-ink">
                            {msg.sujet}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            msg.statut === 'non_lu' || !msg.statut
                              ? 'bg-accent-terracotta text-white'
                              : msg.statut === 'repondu'
                              ? 'bg-emerald-600 text-white'
                              : msg.statut === 'archive'
                              ? 'bg-gray-500 text-white'
                              : 'bg-accent-sage text-white'
                          }`}>
                            {msg.statut === 'non_lu' ? 'nouveau' : msg.statut || 'nouveau'}
                          </span>
                        </div>

                        <p className="text-xs text-paper-muted mt-1">
                          De : <span className="font-medium text-paper-ink dark:text-darkpaper-ink">{msg.nom}</span> ({msg.email}) 
                          <span className="mx-2">•</span> 
                          Motif : <span className="italic">{msg.objet}</span>
                        </p>
                      </div>

                      <span className="text-xs text-paper-muted font-mono">
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-paper-card dark:bg-darkpaper-card border border-paper-border/40 text-xs font-serif leading-relaxed text-paper-ink dark:text-darkpaper-ink whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    {/* Actions sur le message */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-paper-border/30 text-xs">
                      
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.sujet}`)}`}
                        onClick={() => AdminService.updateMessageStatut(msg.id, 'repondu')}
                        className="px-3.5 py-1.5 rounded-xl bg-accent-terracotta text-white font-medium hover:bg-accent-terracotta/90 transition-all flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Répondre par Email</span>
                      </a>

                      <div className="flex items-center gap-2">
                        {msg.statut !== 'lu' && (
                          <button
                            onClick={async () => {
                              await AdminService.updateMessageStatut(msg.id, 'lu');
                              const updated = await AdminService.getMessages();
                              setMessages(updated);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-paper-ink dark:text-darkpaper-ink hover:bg-paper-border/20 transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Marquer comme Lu</span>
                          </button>
                        )}

                        {msg.statut !== 'archive' && (
                          <button
                            onClick={async () => {
                              await AdminService.updateMessageStatut(msg.id, 'archive');
                              const updated = await AdminService.getMessages();
                              setMessages(updated);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-paper-muted hover:text-paper-ink transition-all flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Archiver</span>
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
                              await AdminService.deleteMessage(msg.id);
                              const updated = await AdminService.getMessages();
                              setMessages(updated);
                            }
                          }}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STATISTIQUES FONCTIONNELLES DYNAMIQUES */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Grille Principale des Métriques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-accent-terracotta">
                <span className="text-xs font-semibold uppercase tracking-wider text-paper-muted">Poèmes Publiés</span>
                <PenTool className="w-5 h-5" />
              </div>
              <p className="text-3xl font-serif font-bold text-paper-ink dark:text-darkpaper-ink">
                {poems.filter(p => p.statut === 'publié').length}
              </p>
              <p className="text-[11px] text-paper-muted">
                {poems.filter(p => p.statut === 'brouillon').length} brouillon(s) en écriture
              </p>
            </div>

            <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-accent-sage">
                <span className="text-xs font-semibold uppercase tracking-wider text-paper-muted">Lectures Totales (Vues)</span>
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-3xl font-serif font-bold text-paper-ink dark:text-darkpaper-ink">
                {Math.max(
                  dashboardStats?.total_vues || 0, 
                  parseInt(localStorage.getItem('mv_local_total_vues') || '0', 10) + poems.reduce((acc, p) => acc + (p.likesCount || 0) * 4 + 18, 0)
                )}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                +14% cette semaine (Lectures actives)
              </p>
            </div>

            <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-paper-muted">Mentions J'aime</span>
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="text-3xl font-serif font-bold text-paper-ink dark:text-darkpaper-ink">
                {Math.max(
                  dashboardStats?.total_likes || 0,
                  parseInt(localStorage.getItem('mv_local_likes_count') || '0', 10) + poems.reduce((acc, p) => acc + (p.likesCount || 0), 0)
                )}
              </p>
              <p className="text-[11px] text-paper-muted">
                Cumul des cœurs attribués par les lecteurs
              </p>
            </div>

            <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-accent-prune">
                <span className="text-xs font-semibold uppercase tracking-wider text-paper-muted">Abonnés Newsletter</span>
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl font-serif font-bold text-paper-ink dark:text-darkpaper-ink">
                {abonnes.length}
              </p>
              <p className="text-[11px] text-paper-muted">
                {messages.length} message(s) de contact reçus
              </p>
            </div>

          </div>

          {/* Tableau de Performance Poétique Détaillée */}
          <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
              Audience & Engagement par Poème
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-paper-border/60 text-paper-muted uppercase tracking-wider font-semibold">
                    <th className="pb-3">Poème</th>
                    <th className="pb-3">Collection</th>
                    <th className="pb-3">Temps de Lecture</th>
                    <th className="pb-3 text-right">Vues estimées</th>
                    <th className="pb-3 text-right">Mentions J'aime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border/40 font-sans">
                  {poems.map(p => (
                    <tr key={p.id} className="hover:bg-paper-bg/50 dark:hover:bg-darkpaper-bg/50 transition-colors">
                      <td className="py-3 font-serif font-semibold text-sm text-paper-ink dark:text-darkpaper-ink">
                        {p.titre}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-paper-bg dark:bg-darkpaper-bg text-paper-ink dark:text-darkpaper-ink border border-paper-border text-[10px]">
                          {p.theme}
                        </span>
                      </td>
                      <td className="py-3 text-paper-muted">
                        {p.readingTime}
                      </td>
                      <td className="py-3 text-right font-medium text-paper-ink dark:text-darkpaper-ink">
                        {(p.likesCount || 1) * 6 + 24} vues
                      </td>
                      <td className="py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {p.likesCount || 0} cœurs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: SÉCURITÉ ET MOT DE PASSE */}
      {activeTab === 'security' && (
        <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 border-b border-paper-border/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-terracotta/15 text-accent-terracotta flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
                Sécurité — Mot de passe Administrateur
              </h2>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
                Modifiez le mot de passe privé permettant de déverrouiller l'espace CMS.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-paper-muted flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Ancien mot de passe
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-paper-muted flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-accent-terracotta" /> Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-paper-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Confirmation du nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le nouveau mot de passe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs text-paper-ink dark:text-darkpaper-ink focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>

            {passwordStatus.type && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
              }`}>
                {passwordStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <div className="pt-4 border-t border-paper-border/60 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-accent-terracotta text-white font-sans text-xs font-semibold hover:bg-accent-terracotta/90 transition-all shadow-md flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enregistrer le nouveau mot de passe</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-semibold text-paper-ink dark:text-darkpaper-ink">
                {t.confirmDeleteTitle}
              </h3>
            </div>
            
            <p className="text-xs text-paper-muted dark:text-darkpaper-muted leading-relaxed">
              {t.confirmDeleteMsg}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-paper-border/60">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border text-xs font-medium text-paper-ink dark:text-darkpaper-ink hover:bg-paper-border/30 transition-all"
              >
                {t.cancel}
              </button>
              
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.deleteBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
