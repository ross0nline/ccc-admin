const colours: Record<string, string> = {
  Uninitiated: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  Pending:     'bg-amber-900/40 text-amber-300 border border-amber-700',
  Implemented: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700',
  Updated:     'bg-blue-900/40 text-blue-300 border border-blue-700',
  Deprecated:  'bg-red-900/40 text-red-400 border border-red-700',
  Active:      'bg-emerald-900/40 text-emerald-300 border border-emerald-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${colours[status] ?? 'bg-zinc-800 text-zinc-400'}`}>
      {status}
    </span>
  );
}
