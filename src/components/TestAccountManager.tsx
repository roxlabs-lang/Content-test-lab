import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  ExternalLink,
  Upload,
  Edit2,
  Trash2,
  Check,
  Youtube,
  Instagram,
  Facebook,
  Send,
  Globe,
} from 'lucide-react';
import { TestAccount, Platform } from '../types';
import { openPlatformUrl } from '../platforms/browser/openPlatform';
import { useToast } from '../context/ToastContext';

interface TestAccountManagerProps {
  accounts: TestAccount[];
  activeAccountId?: string;
  onSelectActiveAccount: (id: string) => void;
  onSaveAccount: (account: TestAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const TestAccountManager: React.FC<TestAccountManagerProps> = ({
  accounts,
  activeAccountId,
  onSelectActiveAccount,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TestAccount | null>(null);

  // Form State
  const [formPlatform, setFormPlatform] = useState<Platform>('youtube');
  const [formUsername, setFormUsername] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formMode, setFormMode] = useState<'manual' | 'api'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getPlatformBaseUrl = (platform: Platform): string => {
    switch (platform) {
      case 'youtube':
        return 'https://youtube.com';
      case 'instagram':
        return 'https://instagram.com';
      case 'facebook':
        return 'https://facebook.com';
      case 'telegram':
        return 'https://web.telegram.org';
      default:
        return 'https://google.com';
    }
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormPlatform('youtube');
    setFormUsername('');
    setFormDisplayName('');
    setFormEmail('');
    setFormBio('');
    setFormNotes('');
    setFormAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
    setFormMode('manual');
    setShowModal(true);
  };

  const handleOpenEdit = (acc: TestAccount) => {
    setEditingAccount(acc);
    setFormPlatform(acc.platform);
    setFormUsername(acc.username || '');
    setFormDisplayName(acc.displayName || '');
    setFormEmail(acc.email || '');
    setFormBio(acc.bio || '');
    setFormNotes(acc.notes || '');
    setFormAvatarUrl(acc.avatarUrl || acc.profilePicture || '');
    setFormMode(acc.mode || 'manual');
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() && !formDisplayName.trim()) {
      showToast('Please enter a username or display name', 'error');
      return;
    }

    const cleanUsername = formUsername.trim().replace(/^@/, '');
    const finalDisplayName = formDisplayName.trim() || cleanUsername || 'Test Account';

    const account: TestAccount = {
      id: editingAccount ? editingAccount.id : `acc_${formPlatform}_${Date.now()}`,
      platform: formPlatform,
      username: cleanUsername ? `@${cleanUsername}` : undefined,
      displayName: finalDisplayName,
      email: formEmail.trim() || undefined,
      avatarUrl: formAvatarUrl.trim() || undefined,
      profilePicture: formAvatarUrl.trim() || undefined,
      bio: formBio.trim() || undefined,
      notes: formNotes.trim() || undefined,
      mode: formMode,
      status: 'connected',
      isActive: editingAccount ? editingAccount.isActive : accounts.length === 0,
      createdAt: editingAccount ? editingAccount.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveAccount(account);
    showToast(`Test account "${finalDisplayName}" saved!`, 'success');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Test Account Profiles
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage research identities for testing. One active account is used to attribute actions and observations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Test Account</span>
        </button>
      </div>

      {/* Mode Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Manual Browser Mode by Default: </span>
          <span>
            Test accounts do not require passwords or API keys. Simply open the native platform, perform actions in your browser, and confirm.
          </span>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => {
          const isActive = account.id === activeAccountId || account.isActive;
          const isManual = (account.mode || 'manual') === 'manual';

          return (
            <div
              key={account.id}
              className={`rounded-2xl border p-5 transition duration-150 relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-zinc-900/90 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/5'
                  : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-[11px] font-semibold text-zinc-200 capitalize">
                      {getPlatformIcon(account.platform)}
                      {account.platform}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        isManual
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {isManual ? 'Manual Browser Mode' : 'API Connected'}
                    </span>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectActiveAccount(account.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      Set Active
                    </button>
                  )}
                </div>

                {/* Identity Preview Card */}
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 mb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        account.avatarUrl ||
                        account.profilePicture ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
                      }
                      alt={account.displayName || 'Avatar'}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-700 ring-2 ring-zinc-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate">
                        {account.displayName || account.username}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {account.username || '@unnamed'}
                      </p>
                      {account.bio && (
                        <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{account.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details / Notes */}
                {account.notes && (
                  <p className="text-[11px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50 mb-3">
                    <strong className="text-zinc-300">Notes:</strong> {account.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPlatformUrl(getPlatformBaseUrl(account.platform))}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Open {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(account)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {accounts.length > 1 && (
                    <button
                      onClick={() => onDeleteAccount(account.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!isActive && (
                  <button
                    onClick={() => onSelectActiveAccount(account.id)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg font-medium transition"
                  >
                    Use this
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingAccount ? 'Edit Test Account' : 'Add Test Account'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Platform Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['youtube', 'instagram', 'facebook', 'telegram'] as Platform[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setFormPlatform(p)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition ${
                        formPlatform === p
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {getPlatformIcon(p)}
                      <span className="capitalize">{p}</span>
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
                      placeholder="mytestaccount"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Display Name</label>
                  <input
                    type="text"
                    placeholder="My Test Account"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Email <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="testaccount@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Testing Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormMode('manual')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      formMode === 'manual'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30 font-semibold'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    ● Manual Browser Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('api')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      formMode === 'api'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/30 font-semibold'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    ○ API Mode
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Research Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Used for fitness content and retention benchmarking..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Save Test Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
