import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ChevronDown,
  Plus,
  Check,
  User,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { useActiveAccount } from '../context/ActiveAccountContext';
import { getPlatformMeta } from '../lib/platformParser';
import { useToast } from '../context/ToastContext';

interface AccountSwitcherProps {
  onOpenCreateAccount: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  onOpenCreateAccount,
}) => {
  const { activeAccount, accounts, switchAccountById } = useActiveAccount();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (id: string, name: string) => {
    await switchAccountById(id);
    showToast(`Switched active test target to ${name}`, 'info');
    setIsOpen(false);
  };

  const platformMeta = activeAccount
    ? getPlatformMeta(activeAccount.platform)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition shadow-sm"
      >
        {activeAccount ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={activeAccount.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={activeAccount.displayName}
                className="w-5 h-5 rounded-full object-cover border border-zinc-700"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-zinc-900"
                style={{ backgroundColor: platformMeta?.color || '#6366f1' }}
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-white leading-none line-clamp-1 max-w-[110px]">
                {activeAccount.displayName || activeAccount.username}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono leading-none mt-0.5 capitalize">
                {activeAccount.platform} • @{activeAccount.username}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Shield className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">No Account</span>
          </div>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Active Test Identity
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Switches target session for notes & tags
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-1">
            {accounts.map((acc) => {
              const meta = getPlatformMeta(acc.platform);
              const isActive = activeAccount?.id === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelect(acc.id, acc.displayName || acc.username || 'Account')}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left text-xs transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                      : 'hover:bg-zinc-800/70 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={acc.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={acc.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-white leading-tight">
                        {acc.displayName || acc.username}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <span className={`px-1 rounded text-[9px] font-mono border ${meta.badgeBg}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono">@{acc.username}</span>
                      </div>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateAccount();
              }}
              className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add New Test Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
