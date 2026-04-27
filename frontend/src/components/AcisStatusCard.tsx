import { useEffect, useState } from 'react';

interface AcisStatus {
  system: string;
  timestamp: string;
  url: string;
  heartbeat: { overall: string; last_run: string; summary: string } | null;
  modules: {
    regulatory_events: number;
    attestation: { total: number; overdue: number };
    vendors: { total: number; high_risk: number };
    incidents: { total: number; open: number };
  };
  agents: Record<string, boolean>;
}

const ACIS_STATUS_URL = 'https://acis.rossonlineservices.workers.dev/api/status';

function heartbeatColor(overall: string | undefined) {
  if (overall === 'Green') return 'bg-emerald-400';
  if (overall === 'Yellow') return 'bg-amber-400';
  if (overall === 'Red') return 'bg-red-400';
  return 'bg-zinc-600';
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function AcisStatusCard() {
  const [status, setStatus] = useState<AcisStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(ACIS_STATUS_URL)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setError(true));
  }, []);

  const hb = status?.heartbeat;
  const agentCount = status ? Object.values(status.agents).filter(Boolean).length : 0;
  const totalAgents = status ? Object.keys(status.agents).length : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-4">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : hb ? heartbeatColor(hb.overall) : 'bg-zinc-600'} ${!error && hb ? 'animate-pulse' : ''}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">ACIS</span>
              <span className="text-zinc-600 text-xs font-mono">Autonomous Compliance Intelligence</span>
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              {error ? 'Status unavailable' : hb ? hb.summary : 'Loading…'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hb && (
            <span className="text-zinc-600 text-xs font-mono">
              {timeAgo(hb.last_run)}
            </span>
          )}
          <a
            href={status?.url ?? 'https://acis.rossonlineservices.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
          >
            Live ↗
          </a>
        </div>
      </div>

      {status && (
        <div className="border-t border-zinc-800 px-5 py-3 grid grid-cols-4 gap-4">
          <div>
            <p className="text-zinc-600 text-xs font-mono mb-0.5">Regulatory</p>
            <p className="text-white text-sm font-semibold">{status.modules.regulatory_events}</p>
            <p className="text-zinc-600 text-xs">events</p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs font-mono mb-0.5">Attestation</p>
            <p className="text-white text-sm font-semibold">{status.modules.attestation.total}</p>
            {status.modules.attestation.overdue > 0 && (
              <p className="text-amber-400 text-xs">{status.modules.attestation.overdue} overdue</p>
            )}
            {status.modules.attestation.overdue === 0 && (
              <p className="text-zinc-600 text-xs">all current</p>
            )}
          </div>
          <div>
            <p className="text-zinc-600 text-xs font-mono mb-0.5">Vendors</p>
            <p className="text-white text-sm font-semibold">{status.modules.vendors.total}</p>
            {status.modules.vendors.high_risk > 0 && (
              <p className="text-red-400 text-xs">{status.modules.vendors.high_risk} high risk</p>
            )}
            {status.modules.vendors.high_risk === 0 && (
              <p className="text-zinc-600 text-xs">all clear</p>
            )}
          </div>
          <div>
            <p className="text-zinc-600 text-xs font-mono mb-0.5">Incidents</p>
            <p className="text-white text-sm font-semibold">{status.modules.incidents.total}</p>
            {status.modules.incidents.open > 0 && (
              <p className="text-amber-400 text-xs">{status.modules.incidents.open} open</p>
            )}
            {status.modules.incidents.open === 0 && (
              <p className="text-zinc-600 text-xs">none open</p>
            )}
          </div>
        </div>
      )}

      {status && (
        <div className="border-t border-zinc-800 px-5 py-2 flex flex-wrap items-center gap-1.5">
          <span className="text-zinc-600 text-xs font-mono">{agentCount}/{totalAgents} agents</span>
          <span className="text-zinc-700">·</span>
          {Object.entries(status.agents).map(([key, active]) => (
            <span
              key={key}
              className={`text-xs font-mono px-1.5 py-0.5 rounded ${active ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}
            >
              {key.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
