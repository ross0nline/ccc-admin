import { useState } from 'react';
import type { Project, Module } from '../types';
import { StatusBadge } from './StatusBadge';
import { ModuleList } from './ModuleList';
import { fetchProject } from '../api/client';

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<{ modules: Module[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded && !detail) {
      setLoading(true);
      const data = await fetchProject(project.slug);
      setDetail(data);
      setLoading(false);
    }
    setExpanded(v => !v);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold">{project.name}</span>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-zinc-500 text-sm truncate">{project.description ?? '—'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
            >
              GitHub ↗
            </a>
          )}
          {project.pages_url && (
            <a
              href={project.pages_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
            >
              Live ↗
            </a>
          )}
          <span className="text-zinc-600 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4">
          {loading ? (
            <p className="text-zinc-600 text-sm">Loading…</p>
          ) : (
            <ModuleList modules={detail?.modules ?? []} />
          )}
        </div>
      )}
    </div>
  );
}
