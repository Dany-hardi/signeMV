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
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'poems' | 'cards' | 'newsletters' | 'messages' | 'analytics' | 'security'>('poems');

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

    const finalContenu = contenu.trim();

    const poemData: Poem = {
      id,
      titre,
      slug: slug || `poeme-${Date.now()}`,
      contenu: finalContenu,
      extrait: extrait || finalContenu.replace('— MV', '').slice(0, 100).trim() + '...',
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

      {/* TAB 4: MESSAGES REÇUS */}
      {activeTab === 'messages' && (
        <div className="bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium text-paper-ink dark:text-darkpaper-ink">
                Boîte de Réception — Correspondances
              </h2>
              <p className="text-xs text-paper-muted dark:text-darkpaper-muted">
                Messages transmis par les lecteurs depuis la page de contact.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent-terracotta/15 text-accent-terracotta text-xs font-semibold">
              {messages.length} Message(s)
            </span>
          </div>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-paper-muted italic border border-dashed border-paper-border rounded-xl">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Aucun message reçu pour le moment.
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl bg-paper-bg dark:bg-darkpaper-bg border border-paper-border/60 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-semibold text-sm text-paper-ink dark:text-darkpaper-ink">
                        {msg.sujet}
                      </h3>
                      <p className="text-xs text-paper-muted">
                        De : <span className="font-medium text-paper-ink dark:text-darkpaper-ink">{msg.nom}</span> ({msg.email}) — Motif : {msg.objet}
                      </p>
                    </div>
                    <span className="text-[10px] text-paper-muted">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-paper-ink/90 dark:text-darkpaper-ink/90 whitespace-pre-wrap pt-2 border-t border-paper-border/40">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STATISTIQUES */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border rounded-2xl">
            <h3 className="text-xs text-paper-muted font-medium mb-1">Poèmes Publiés</h3>
            <p className="text-3xl font-serif font-bold text-accent-terracotta">
              {dashboardStats?.poemes_publies ?? poems.filter(p => p.statut === 'publié').length}
            </p>
          </div>

          <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border rounded-2xl">
            <h3 className="text-xs text-paper-muted font-medium mb-1">Lectures Totales (Vues)</h3>
            <p className="text-3xl font-serif font-bold text-accent-sage">
              {dashboardStats?.total_vues ?? 0}
            </p>
          </div>

          <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border rounded-2xl">
            <h3 className="text-xs text-paper-muted font-medium mb-1">Mentions J'aime</h3>
            <p className="text-3xl font-serif font-bold text-rose-600 dark:text-rose-400">
              {dashboardStats?.total_likes ?? 0}
            </p>
          </div>

          <div className="p-6 bg-paper-card dark:bg-darkpaper-card border border-paper-border rounded-2xl">
            <h3 className="text-xs text-paper-muted font-medium mb-1">Abonnés Newsletter</h3>
            <p className="text-3xl font-serif font-bold text-accent-prune">
              {abonnes.length}
            </p>
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
