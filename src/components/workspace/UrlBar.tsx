import React, { useState, useEffect, useRef } from 'react';
import {
  Link2,
  ArrowRight,
  Sparkles,
  Clock,
  History,
  ChevronDown,
  X,
  ExternalLink,
  ClipboardPaste,
  ShieldCheck
} from 'lucide-react';
import { ParsedContent, Platform } from '../../types';
import { parseContentUrl, normalizeContentUrl } from '../../platforms/platformRegistry';
import { getRecentContent, addRecentContent } from '../../services/sessionService';

interface UrlBarProps {
  currentUrl: string;
  activeParsed: ParsedContent | null;
  isLoading?: boolean;
  onOpenUrl: (url: string) => void;
  onSelectRecent: (item: ParsedContent) => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({
  currentUrl,
  activeParsed,
  isLoading = false,
  onOpenUrl,
  onSelectRecent
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || '');
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [recentList, setRecentList] = useState<ParsedContent[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputUrl(currentUrl || '');
  }, [currentUrl]);

  useEffect(() => {
    setRecentList(getRecentContent());
  }, [showRecentDropdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) return;

    const parsed = parseContentUrl(clean);
    addRecentContent(parsed);
    setRecentList(getRecentContent());
    setShowRecentDropdown(false);
    onOpenUrl(clean);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        const parsed = parseContentUrl(text);
        addRecentContent(parsed);
        onOpenUrl(text);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const getPlatformColor = (platform?: Platform) => {
    switch (platform) {
      case 'youtube':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'instagram':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'facebook':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'telegram':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Browser Bar Frame */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-inner focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 transition duration-150"
      >
        {/* URL Icon / Secure Lock Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
          <Link2 className="w-4 h-4 text-zinc-400" />
        </div>

        {/* URL Text Input */}
        <input
          id="workspace-url-bar-input"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste YouTube, Instagram, Facebook, or Telegram URL..."
          className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 font-mono placeholder:text-zinc-500 placeholder:font-sans focus:outline-none min-w-0"
        />

        {/* Clear Button */}
        {inputUrl && (
          <button
            type="button"
            onClick={() => setInputUrl('')}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition shrink-0"
            title="Clear URL"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Paste Button */}
        <button
          type="button"
          onClick={handlePaste}
          className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0 border border-zinc-700/50"
          title="Paste from clipboard"
        >
          <ClipboardPaste className="w-3 h-3 text-indigo-400" />
          <span>Paste</span>
        </button>

        {/* Recent Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setShowRecentDropdown(!showRecentDropdown)}
          className={`p-1.5 rounded-lg border transition shrink-0 ${
            showRecentDropdown
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
              : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700/60'
          }`}
          title="Recently opened content"
        >
          <History className="w-3.5 h-3.5" />
        </button>

        {/* Submit / Open Button */}
        <button
          type="submit"
          disabled={isLoading || !inputUrl.trim()}
          className="px-3 sm:px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition flex items-center gap-1.5 shrink-0 shadow-sm shadow-indigo-600/30 active:scale-95"
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>OPEN</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {/* Detected Platform Pill Sub-Bar */}
      {activeParsed && (
        <div className="flex items-center justify-between gap-2 mt-1.5 px-1 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded border capitalize font-semibold ${getPlatformColor(
                activeParsed.platform
              )}`}
            >
              {activeParsed.platform} • {activeParsed.type.replace('_', ' ')}
            </span>

            {activeParsed.creatorHandle && (
              <span className="text-zinc-400 truncate max-w-[200px]">
                {activeParsed.creatorHandle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            {activeParsed.canEmbed ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Embed Active
              </span>
            ) : (
              <span className="text-amber-400/90 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Preview Mode (CSP Protected)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recently Opened Dropdown */}
      {showRecentDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-800/80 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-indigo-400" />
              Recently Opened Content
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {recentList.length} items
            </span>
          </div>

          {recentList.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              No recent URLs opened yet
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1">
              {recentList.map((item, idx) => (
                <button
                  key={`${item.normalizedUrl || item.url}-${idx}`}
                  onClick={() => {
                    onSelectRecent(item);
                    setShowRecentDropdown(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-800/80 transition flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border capitalize ${getPlatformColor(
                          item.platform
                        )}`}
                      >
                        {item.platform} • {item.type}
                      </span>
                      <span className="text-xs font-medium text-zinc-200 truncate group-hover:text-indigo-300 transition">
                        {item.title || item.creatorHandle || 'Social Media Content'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                      {item.normalizedUrl || item.url}
                    </p>
                  </div>

                  <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition shrink-0 font-medium">
                    Load →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
