'use client';

import { Toaster } from 'react-hot-toast';
import AbandonedProjectTracker from '@/components/AbandonedProjectTracker';

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black p-4 sm:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
          Projects
        </h1>
        <p className="text-slate-400">
          Track, revive, and complete your abandoned side quests
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto">
        <AbandonedProjectTracker />
      </div>
    </main>
  );
}
