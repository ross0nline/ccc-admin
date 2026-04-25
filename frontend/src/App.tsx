import { useEffect, useState } from 'react';
import type { Project, ActivityEvent } from './types';
import { fetchProjects, fetchActivity } from './api/client';
import { ProjectCard } from './components/ProjectCard';
import { ActivityFeed } from './components/ActivityFeed';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'activity'>('projects');

  useEffect(() => {
    Promise.all([fetchProjects(), fetchActivity(30)])
      .then(([p, a]) => { setProjects(p); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  const total = projects.length;
  const active = projects.filter(p => p.status === 'Active').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-sm text-zinc-400">CCC Admin</span>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-xs text-zinc-600">Autonomous Compliance Intelligence System</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-600">
          <span>{total} project{total !== 1 ? 's' : ''}</span>
          <span>{active} active</span>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="border-b border-zinc-800 px-6 flex gap-1 pt-1">
        {(['projects', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-mono capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
            {tab === 'activity' && activity.length > 0 && (
              <span className="ml-1.5 bg-zinc-800 text-zinc-400 text-xs px-1.5 py-0.5 rounded-full">
                {activity.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-600 text-sm">
            <div className="w-3 h-3 border border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
            Loading…
          </div>
        ) : activeTab === 'projects' ? (
          <div className="space-y-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <ActivityFeed events={activity} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-3 text-xs font-mono text-zinc-700 flex gap-4">
        <span>Worker: ccc-admin.rossonlineservices.workers.dev</span>
        <span>·</span>
        <span>D1: ccc-admin-db</span>
      </footer>
    </div>
  );
}

export default App;
