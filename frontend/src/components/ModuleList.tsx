import type { Module } from '../types';
import { StatusBadge } from './StatusBadge';

export function ModuleList({ modules }: { modules: Module[] }) {
  if (modules.length === 0) {
    return <p className="text-zinc-600 text-sm italic">No modules registered yet.</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Modules</p>
      {modules.map(mod => (
        <div key={mod.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
          <div>
            <span className="text-zinc-200 text-sm">{mod.name}</span>
            {mod.category && (
              <span className="ml-2 text-zinc-600 text-xs font-mono">{mod.category}</span>
            )}
          </div>
          <StatusBadge status={mod.current_status} />
        </div>
      ))}
    </div>
  );
}
