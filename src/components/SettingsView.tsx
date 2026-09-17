import React, { useRef, useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  Key,
  Globe,
  Database,
  Lock
} from 'lucide-react';
import { Experiment, TestAccount } from '../types';
import { exportAllLabData, importLabData, resetToSeedData } from '../services/storage';

interface SettingsViewProps {
  accounts: TestAccount[];
  experiments: Experiment[];
  onDataResetOrImport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  accounts,
  experiments,
  onDataResetOrImport,
}) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const dataStr = exportAllLabData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-test-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup successfully exported to JSON.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importLabData(content);
        if (success) {
          setStatusMessage('Workspace data successfully restored!');
          onDataResetOrImport();
        } else {
          setErrorMessage('Invalid data file format.');
        }
      } catch (err: any) {
        setErrorMessage(`Failed to import data: ${err.message}`);
      }
      setTimeout(() => {
        setStatusMessage('');
        setErrorMessage('');
      }, 4000);
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (window.confirm('Reset Content Test Lab to initial sample data? Current test accounts and experiments will be reset.')) {
      resetToSeedData();
      onDataResetOrImport();
      setStatusMessage('Workspace reset to verified seed baseline.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Lab Workspace Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Manage workspace data, isolated sandbox configurations, and strict security guarantees.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security Architecture Guarantees */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Lab Security & Identity Isolation Guardrails
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="font-semibold text-zinc-200 block">1. Feed Separation</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Personal social-media accounts are never linked to Content Test Lab. Experimental watching, liking, and commenting never contaminates your personal recommendation feeds.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="font-semibold text-zinc-200 block">2. Zero Plaintext Passwords</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Passwords are never stored in plaintext in the database or client storage. Sandboxed session tokens are utilized for active identification.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="font-semibold text-zinc-200 block">3. Ephemeral Verification OTPs</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Authentication OTP codes are held strictly in memory during verification and never permanently stored or logged.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="font-semibold text-zinc-200 block">4. Server-Side AI Secrets</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Gemini API keys and analysis operations run exclusively on the Express backend service, keeping all credentials isolated from the browser.
            </p>
          </div>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-2">
            <Database className="w-4 h-4" />
            Workspace Data Persistence & Portability
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Backup your logged experiments, research notes, and test profiles. Everything is fully portable in open JSON format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import / Restore Backup</span>
          </button>

          <button
            onClick={handleResetSeed}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2 transition ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Baseline Data</span>
          </button>
        </div>

        <div className="pt-2 text-[11px] font-mono text-zinc-500">
          Current State: {accounts.length} Test Accounts • {experiments.length} Experiments Recorded
        </div>
      </div>

      {/* Platform Sandbox Specifications */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          Platform Sandbox Protocols
        </h3>
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <span className="font-semibold text-zinc-200 w-24 shrink-0">YouTube:</span>
            <span>Direct iFrame embed supported for Videos & Shorts. Auto-configured with privacy-enhanced sandbox attributes.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <span className="font-semibold text-zinc-200 w-24 shrink-0">Instagram:</span>
            <span>Meta X-Frame-Options enforce standalone window. Lab launches directly via "Open on Instagram" button while tracking your session in-app.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <span className="font-semibold text-zinc-200 w-24 shrink-0">Facebook:</span>
            <span>Content-Security-Policy disallows embedding. Lab provides targeted deep-linking with dedicated action tracking.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <span className="font-semibold text-zinc-200 w-24 shrink-0">Telegram:</span>
            <span>Deep links open Telegram Web or Telegram Desktop with preserved experiment state.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
