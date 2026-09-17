export const theme = {
  background: '#09090b', // zinc-950
  surface: '#18181b', // zinc-900
  surfaceElevated: '#27272a', // zinc-800
  surfaceHover: '#3f3f46', // zinc-700
  border: '#27272a', // zinc-800
  borderSubtle: '#18181b', // zinc-900
  borderFocus: '#6366f1', // indigo-500
  textPrimary: '#fafafa', // zinc-50
  textSecondary: '#a1a1aa', // zinc-400
  textMuted: '#71717a', // zinc-500
  accent: '#6366f1', // indigo-500
  accentHover: '#4f46e5', // indigo-600
  accentBg: 'rgba(99, 102, 241, 0.1)',
  danger: '#ef4444', // red-500
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  success: '#10b981', // emerald-500
  successBg: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b', // amber-500
  warningBg: 'rgba(245, 158, 11, 0.1)',
};

export const themeClasses = {
  card: 'bg-zinc-900 border border-zinc-800 rounded-2xl',
  cardElevated: 'bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-xl',
  buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20',
  buttonSecondary: 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-200 border border-zinc-700/60 font-medium rounded-xl px-4 py-2 transition disabled:opacity-50',
  buttonDanger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-3 py-1.5 transition font-medium',
  buttonGhost: 'hover:bg-zinc-800/80 text-zinc-300 hover:text-white rounded-xl px-3 py-1.5 transition',
  input: 'bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 text-sm outline-none transition focus:ring-1 focus:ring-indigo-500/50',
  textarea: 'bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-zinc-100 placeholder:text-zinc-600 text-sm outline-none transition focus:ring-1 focus:ring-indigo-500/50 resize-y',
  badge: 'px-2 py-0.5 rounded-md text-xs font-medium border font-mono',
};
