import React from 'react';
import {
  FlaskConical,
  Users,
  Film,
  FileText,
  BarChart3,
  Settings,
  Plus,
  ShieldCheck,
  Globe,
  Radio,
  Sparkles,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';
import { Platform, TestAccount } from '../types';
import { getPlatformConfig } from '../utils/platform';

export type NavView =
  | 'workspace'
  | 'dashboard'
  | 'experiments'
  | 'accounts'
  | 'content'
  | 'notes'
  | 'analytics'
  | 'settings';

interface NavigationProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  activeAccount: TestAccount | undefined;
  onOpenNewExperiment: () => void;
  onOpenAddAccount: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  activeAccount,
  onOpenNewExperiment,
  onOpenAddAccount,
}) => {
  const navItems: Array<{ id: NavView; label: string; icon: React.ReactNode }> = [
    { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Radio className="w-4 h-4" /> },
    { id: 'experiments', label: 'Library', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'accounts', label: 'Test Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'content', label: 'Content Feeds', icon: <Film className="w-4 h-4" /> },
    { id: 'notes', label: 'Research Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const mobileNavItems: Array<{ id: NavView; label: string; icon: React.ReactNode }> = [
    { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'experiments', label: 'Library', icon: <FlaskConical className="w-5 h-5" /> },
    { id: 'accounts', label: 'Accounts', icon: <Users className="w-5 h-5" /> },
    { id: 'notes', label: 'Research', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const activePlatformConfig = activeAccount
    ? getPlatformConfig(activeAccount.platform)
    : null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-zinc-900/80 border-r border-zinc-800/80 backdrop-blur-xl h-screen sticky top-0 p-4 justify-between z-30 select-none">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="px-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-1.5">
                  Content Test Lab
                </h1>
                <p className="text-[11px] font-mono text-zinc-400">RESEARCH WORKSPACE</p>
              </div>
            </div>
          </div>

          {/* Active Test Account Card */}
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Test Account
              </span>
              <button
                onClick={() => onSelectView('accounts')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Switch
              </button>
            </div>

            {activeAccount ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={activeAccount.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={activeAccount.displayName}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-700/80 ring-1 ring-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {activeAccount.displayName}
                    </p>
                    {activePlatformConfig && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activePlatformConfig.tagColor}`}>
                        {activePlatformConfig.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    @{activeAccount.username}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-zinc-400 mb-2">No active test account</p>
                <button
                  onClick={onOpenAddAccount}
                  className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
                >
                  Connect Test Account
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-400' : 'text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Quick Actions & Status */}
        <div className="space-y-3 pt-4 border-t border-zinc-800/60">
          <button
            onClick={onOpenNewExperiment}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Experiment</span>
          </button>

          <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Isolated Sandbox
              </span>
              <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Personal feeds strictly protected from test activity.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 leading-tight">Content Test Lab</h1>
            {activeAccount ? (
              <button
                type="button"
                onClick={() => onSelectView('accounts')}
                className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>@{activeAccount.username} ({activeAccount.platform})</span>
                <span className="text-zinc-500">▼</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectView('accounts')}
                className="text-[10px] font-mono text-amber-400 hover:underline"
              >
                Select Account ▼
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onOpenNewExperiment}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar (Clean 5 tabs) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/90 px-3 py-1.5 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition min-w-[56px] min-h-[44px] ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="p-0.5">{item.icon}</div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
