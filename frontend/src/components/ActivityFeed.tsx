import type { ActivityEvent } from '../types';

const eventColour: Record<string, string> = {
  ProjectCreated: 'text-emerald-400',
  ModuleCreated:  'text-blue-400',
  StatusChange:   'text-amber-400',
  AgentAction:    'text-purple-400',
  Deployment:     'text-cyan-400',
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600 text-sm">
        No activity yet. Events will appear here as projects and modules are updated.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map(ev => (
        <div key={ev.id} className="flex gap-3 py-2 border-b border-zinc-800/50 last:border-0">
          <div className="w-1 rounded-full shrink-0 mt-1.5 h-4 bg-zinc-700" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-xs font-mono ${eventColour[ev.event_type] ?? 'text-zinc-400'}`}>
                {ev.event_type}
              </span>
              {ev.project_slug && (
                <span className="text-zinc-600 text-xs font-mono">{ev.project_slug}</span>
              )}
              <span className="text-zinc-700 text-xs ml-auto shrink-0">{timeAgo(ev.timestamp)}</span>
            </div>
            {ev.description && (
              <p className="text-zinc-400 text-sm mt-0.5 truncate">{ev.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
