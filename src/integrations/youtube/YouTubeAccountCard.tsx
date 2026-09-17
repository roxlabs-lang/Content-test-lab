import React, { useState } from 'react';
import {
  Youtube,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { YouTubeAccount, YouTubeConfig } from './youtubeTypes';
import { initiateYouTubeOAuth } from './youtubeOAuth';
import { disconnectYouTubeAccount } from './youtubeApi';
import { openPlatformUrl } from '../../platforms/browser/openPlatform';

interface YouTubeAccountCardProps {
  account: YouTubeAccount | null;
  config: YouTubeConfig | null;
  isLoading: boolean;
  onAccountUpdated: (account: YouTubeAccount | null) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

export const YouTubeAccountCard: React.FC<YouTubeAccountCardProps> = ({
  account,
  config,
  isLoading,
  onAccountUpdated,
  onShowToast,
  onOpenSettings,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isConnected = Boolean(account && account.connected);

  const handleConnect = async () => {
    setIsConnecting(true);
    await initiateYouTubeOAuth(
      (newAccount) => {
        setIsConnecting(false);
        onAccountUpdated(newAccount);
        onShowToast(`Connected YouTube: ${newAccount.channelTitle || 'Google Account'}`, 'success');
      },
      (errorMsg) => {
        setIsConnecting(false);
        onShowToast(errorMsg, 'error');
      }
    );
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectYouTubeAccount();
      onAccountUpdated(null);
      onShowToast('YouTube account disconnected', 'info');
    } catch (e: any) {
      onShowToast(e.message || 'Failed to disconnect YouTube account', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Identity info */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {isConnected && account?.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt={account.channelTitle || 'YouTube Avatar'}
                className="w-9 h-9 rounded-xl object-cover border border-zinc-700 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Youtube className="w-4 h-4" />
              </div>
            )}
            {isConnected && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-zinc-900 rounded-full" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube Testing Integration</span>
              </span>

              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  API Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/50">
                  Manual Browser Mode Active
                </span>
              )}
            </div>

            {isConnected ? (
              <div className="text-xs text-zinc-300 font-medium flex items-center gap-2">
                <span>{account?.channelTitle}</span>
                {account?.channelHandle && (
                  <span className="text-zinc-500 font-mono">
                    {account.channelHandle.startsWith('@') ? account.channelHandle : `@${account.channelHandle}`}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400">
                Interact natively via browser tabs with automatic confirmation, or optionally connect API.
              </p>
            )}
          </div>
        </div>

        {/* Right: Connect or Disconnect */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition flex items-center gap-1"
                title="Reconnect with updated permissions"
              >
                <RefreshCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
                <span>Reconnect</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-300 text-xs font-medium transition flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openPlatformUrl('https://youtube.com')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                <span>Open YouTube</span>
              </button>

              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>{isConnecting ? 'Connecting...' : 'Connect API (Optional)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
