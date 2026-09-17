import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
  DashboardView,
  TestAccountManager,
  ContentWorkspace,
  ContentViewer,
  ExperimentListV2,
  ExperimentView,
  UrlIngestionBar,
  AccountSwitcher,
  AccountCreationModal,
  ResearchNotesView,
  AnalyticsView,
  SettingsView,
  NewExperimentModal
} from './components';
import { Workspace } from './pages/Workspace';
import { ActiveAccountProvider, useActiveAccount } from './context/ActiveAccountContext';
import { ToastProvider, useToast } from './context/ToastContext';
import {
  getExperiments,
  saveExperiment,
  deleteExperiment,
  createExperimentFromUrl
} from './services/experimentService';
import { Experiment, TestAccount, Platform, ContentType } from './types';
import { getPlatformConfig } from './utils/platform';
import { ShieldCheck, Plus, Radio, Users, Film, FlaskConical, FileText, BarChart3, Settings } from 'lucide-react';

export type AppView =
  | 'workspace'
  | 'dashboard'
  | 'accounts'
  | 'content'
  | 'experiments'
  | 'notes'
  | 'analytics'
  | 'settings'
  | 'viewer';

function getInitialView(): AppView {
  try {
    const path = window.location.pathname.toLowerCase().replace(/^\//, '');
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');
    const route = path || hash;
    if (route === 'workspace') return 'workspace';
    if (route === 'library' || route === 'experiments') return 'experiments';
    if (route === 'accounts') return 'accounts';
    if (route === 'analytics') return 'analytics';
    if (route === 'notes') return 'notes';
    if (route === 'dashboard') return 'dashboard';
    if (route === 'settings') return 'settings';
    if (route === 'content') return 'content';
  } catch (e) {
    // fallback
  }
  return 'workspace';
}

function AppInner() {
  const [activeView, setActiveView] = useState<AppView>(getInitialView);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [isNewExperimentModalOpen, setIsNewExperimentModalOpen] = useState(false);
  const [isAccountCreationModalOpen, setIsAccountCreationModalOpen] = useState(false);

  const { activeAccount, accounts, refreshAccounts, switchAccountById, saveAccount, deleteAccount } = useActiveAccount();
  const { showToast } = useToast();

  const handleSelectView = useCallback((view: AppView) => {
    setActiveView(view);
    if (view !== 'viewer') setCurrentExperiment(null);
    try {
      const route = view === 'experiments' ? 'library' : view;
      window.history.pushState(null, '', `/${route}`);
    } catch {
      // ignore
    }
  }, []);

  // Listen to popstate
  useEffect(() => {
    const onPopState = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load experiments
  const loadExperiments = useCallback(async () => {
    try {
      const data = await getExperiments();
      setExperiments(data);
      if (currentExperiment) {
        const found = data.find((e) => e.id === currentExperiment.id);
        if (found) setCurrentExperiment(found);
      }
    } catch (err) {
      console.error('Failed to load experiments:', err);
    }
  }, [currentExperiment]);

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  // Global Keyboard Shortcuts (Requirement 22)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Escape to close modals or exit viewer
      if (e.key === 'Escape') {
        if (isNewExperimentModalOpen) {
          setIsNewExperimentModalOpen(false);
          return;
        }
        if (isAccountCreationModalOpen) {
          setIsAccountCreationModalOpen(false);
          return;
        }
        if (activeView === 'viewer') {
          setActiveView('experiments');
          setCurrentExperiment(null);
          return;
        }
      }

      if (isInput) return;

      // 'N' for new experiment
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNewExperimentModalOpen(true);
      }

      // '/' to focus global search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        } else {
          setActiveView('experiments');
          setTimeout(() => {
            document.getElementById('global-search-input')?.focus();
          }, 100);
        }
      }

      // 'E' for notes
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setActiveView('notes');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewExperimentModalOpen, isAccountCreationModalOpen, activeView]);

  const handleOpenExperiment = (exp: Experiment) => {
    setCurrentExperiment(exp);
    handleSelectView('workspace');
  };

  const handleUpdateExperiment = async (updated: Experiment) => {
    try {
      await saveExperiment(updated);
      setCurrentExperiment(updated);
      setExperiments((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    } catch (err) {
      console.error('Failed to update experiment:', err);
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    try {
      await deleteExperiment(id);
      await loadExperiments();
      if (currentExperiment?.id === id) {
        setCurrentExperiment(null);
        setActiveView('experiments');
      }
      showToast('Experiment removed', 'info');
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  const handleCreateFromUrl = async (url: string) => {
    try {
      const created = await createExperimentFromUrl(url, activeAccount?.id);
      await loadExperiments();
      showToast('New experiment created from URL!', 'success');
      handleOpenExperiment(created);
    } catch (err) {
      showToast('Failed to create experiment from URL.', 'error');
    }
  };

  const handleCreateNewModal = async (data: {
    url: string;
    platform: Platform;
    contentType: ContentType;
    title: string;
    creator: string;
    creatorHandle: string;
    tags: string[];
    thumbnailUrl?: string;
  }) => {
    try {
      const created = await createExperimentFromUrl(data.url, activeAccount?.id);
      created.content.title = data.title;
      created.content.creator = data.creator;
      created.content.creatorHandle = data.creatorHandle;
      created.tags = data.tags;
      if (data.thumbnailUrl) created.content.thumbnailUrl = data.thumbnailUrl;
      await saveExperiment(created);
      await loadExperiments();
      setIsNewExperimentModalOpen(false);
      showToast('Experiment created successfully!', 'success');
      handleOpenExperiment(created);
    } catch (err) {
      showToast('Failed to save new experiment.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Desktop Sidebar Navigation & Mobile Bottom Bar */}
      <Navigation
        currentView={activeView === 'viewer' ? 'workspace' : activeView}
        onSelectView={handleSelectView}
        activeAccount={activeAccount || undefined}
        onOpenNewExperiment={() => setIsNewExperimentModalOpen(true)}
        onOpenAddAccount={() => setIsAccountCreationModalOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-8">
        {/* Top Sticky App Bar with Ingestion & Account Switcher */}
        <header className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Content Test Lab
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hidden sm:inline-block">
              V2.0 • Personal Sandbox Workspace
            </span>
          </div>

          {/* Quick Account Switcher Header Pill */}
          <div className="flex items-center gap-2">
            <AccountSwitcher onAddAccountClick={() => setIsAccountCreationModalOpen(true)} />
          </div>
        </header>

        {/* Global URL Ingestion Bar on Top (when in dashboard or content) */}
        {(activeView === 'dashboard' || activeView === 'content') && (
          <div className="px-4 sm:px-6 md:px-8 pt-6 max-w-7xl w-full mx-auto">
            <UrlIngestionBar
              onExperimentCreated={(exp) => {
                loadExperiments();
                handleOpenExperiment(exp);
              }}
            />
          </div>
        )}

        {/* Dynamic View Body Container */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'workspace' && (
            <Workspace
              initialExperimentId={currentExperiment?.id}
              onNavigateToExperiments={() => handleSelectView('experiments')}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              activeAccount={activeAccount || undefined}
              experiments={experiments}
              accounts={accounts}
              onOpenExperiment={handleOpenExperiment}
              onNavigate={handleSelectView}
              onOpenNewExperiment={() => setIsNewExperimentModalOpen(true)}
              onOpenAddAccount={() => setIsAccountCreationModalOpen(true)}
              onOpenUrlInput={() => handleSelectView('workspace')}
            />
          )}

          {activeView === 'experiments' && (
            <ExperimentListV2
              experiments={experiments}
              onSelectExperiment={handleOpenExperiment}
              onRefresh={loadExperiments}
              onNewExperimentClick={() => setIsNewExperimentModalOpen(true)}
            />
          )}

          {activeView === 'accounts' && (
            <TestAccountManager
              accounts={accounts}
              activeAccountId={activeAccount?.id}
              onSelectActiveAccount={switchAccountById}
              onSaveAccount={async (acc) => {
                await saveAccount(acc);
                await refreshAccounts();
                showToast('Test account saved ✓', 'success');
              }}
              onDeleteAccount={async (id) => {
                await deleteAccount(id);
                await refreshAccounts();
                showToast('Test account deleted', 'info');
              }}
            />
          )}

          {activeView === 'content' && (
            <ContentWorkspace
              experiments={experiments}
              activeAccount={activeAccount || undefined}
              onOpenExperiment={handleOpenExperiment}
              onCreateExperimentFromUrl={(detected, customTitle) => {
                handleCreateFromUrl(detected.url);
              }}
            />
          )}

          {activeView === 'viewer' && currentExperiment && (
            <ExperimentView
              experiment={currentExperiment}
              onUpdate={handleUpdateExperiment}
              onBack={() => handleSelectView('experiments')}
              onOpenInWorkspace={(id) => handleSelectView('workspace')}
            />
          )}

          {activeView === 'notes' && (
            <ResearchNotesView
              experiments={experiments}
              onOpenExperiment={handleOpenExperiment}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              experiments={experiments}
              accounts={accounts}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              accounts={accounts}
              experiments={experiments}
              onDataResetOrImport={async () => {
                await refreshAccounts();
                await loadExperiments();
              }}
            />
          )}
        </div>
      </main>

      {/* Account Creation Modal (5-Step Interactive Setup) */}
      <AccountCreationModal
        isOpen={isAccountCreationModalOpen}
        onClose={() => setIsAccountCreationModalOpen(false)}
        onAccountCreated={() => {
          refreshAccounts();
          showToast('New test account connected successfully!', 'success');
        }}
      />

      {/* New Experiment Modal */}
      <NewExperimentModal
        isOpen={isNewExperimentModalOpen}
        onClose={() => setIsNewExperimentModalOpen(false)}
        onCreate={handleCreateNewModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ActiveAccountProvider>
        <AppInner />
      </ActiveAccountProvider>
    </ToastProvider>
  );
}
