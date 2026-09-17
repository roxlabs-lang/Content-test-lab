import React, { useState } from 'react';
import {
  X,
  Shield,
  User,
  Mail,
  FileText,
  Image,
  Globe,
  Radio,
  CheckCircle2,
  Youtube,
  Instagram,
  Facebook,
  Send,
} from 'lucide-react';
import { Platform, TestAccount } from '../types';
import { useToast } from '../context/ToastContext';
import { useActiveAccount } from '../context/ActiveAccountContext';

interface AccountCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated?: () => void;
  onSaveAccount?: (account: TestAccount) => Promise<TestAccount>;
}

export const AccountCreationModal: React.FC<AccountCreationModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  onSaveAccount,
}) => {
  const { showToast } = useToast();
  const { saveAccount } = useActiveAccount();

  const [platform, setPlatform] = useState<Platform>('youtube');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'manual' | 'api'>('manual');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const platforms: { id: Platform; label: string; icon: React.ReactNode }[] = [
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4 text-red-500" /> },
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4 text-pink-500" /> },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4 text-blue-500" /> },
    { id: 'telegram', label: 'Telegram', icon: <Send className="w-4 h-4 text-sky-400" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !displayName.trim()) {
      showToast('Please enter a username or display name', 'error');
      return;
    }

    setIsSaving(true);
    const cleanUsername = username.trim().replace(/^@/, '');
    const finalDisplayName = displayName.trim() || cleanUsername || 'Test Account';

    const newAccount: TestAccount = {
      id: `acc_${platform}_${Date.now()}`,
      platform,
      username: cleanUsername ? `@${cleanUsername}` : undefined,
      displayName: finalDisplayName,
      email: email.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      mode,
      isActive: true,
      status: 'connected',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      if (onSaveAccount) {
        await onSaveAccount(newAccount);
      } else {
        await saveAccount(newAccount);
      }

      showToast(`Test account "${finalDisplayName}" created and activated!`, 'success');
      if (onAccountCreated) onAccountCreated();
      onClose();

      // Reset form
      setUsername('');
      setDisplayName('');
      setEmail('');
      setAvatarUrl('');
      setNotes('');
      setMode('manual');
    } catch (err) {
      showToast('Failed to save test account.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Test Account</h3>
              <p className="text-xs text-zinc-400">
                Create a research identity for manual or API testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Platform</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                    platform === p.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow-sm'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Username & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="mytestaccount"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="My Test Account"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Email <span className="text-zinc-500 font-normal">(Optional for test lab notes)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="research_test@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Avatar URL (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Profile Picture URL <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-zinc-300">Testing Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  mode === 'manual'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    mode === 'manual'
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-zinc-500'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-200">● Manual Browser Mode</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Zero API keys needed. Open native platform, interact, and record confirmation.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('api')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  mode === 'api'
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    mode === 'api'
                      ? 'border-indigo-400 bg-indigo-400'
                      : 'border-zinc-500'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-200">○ API Integration Mode</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Requires optional OAuth credentials configured in Settings.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
