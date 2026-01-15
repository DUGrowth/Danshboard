'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, Plus, TrendingUp, Calendar, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface Project {
  id: number;
  name: string;
  description?: string;
  days_abandoned: number;
  revival_attempts: number;
  status: string;
  completion_percentage: number;
  energy_required: string;
  tags?: string;
}

const ENERGY_COLORS = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500'
};

const ENERGY_ICONS = {
  low: '⚡',
  medium: '⚡⚡',
  high: '⚡⚡⚡'
};

export default function AbandonedProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    energyRequired: 'medium'
  });
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          energyRequired: newProject.energyRequired,
          originalStartDate: new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        toast.success('Project added!');
        setNewProject({ name: '', description: '', energyRequired: 'medium' });
        setShowAddForm(false);
        fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to add project');
    }
  };

  const handleRevive = async (projectId: number) => {
    try {
      const res = await fetch('/api/projects/revive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to revive project');
    }
  };

  const handleUpdateProgress = async (projectId: number) => {
    try {
      const res = await fetch('/api/projects/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, completionPercentage: progressValue })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (data.shouldCelebrate) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
        }
        setSelectedProject(null);
        setProgressValue(0);
        fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Rocket className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Abandoned Projects</h2>
            <p className="text-sm text-muted-foreground">Revive and complete your side quests</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddProject}
            className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3"
          >
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              autoFocus
            />
            <textarea
              placeholder="What was this project about?"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">Energy needed:</label>
              <select
                value={newProject.energyRequired}
                onChange={(e) => setNewProject({ ...newProject, energyRequired: e.target.value })}
                className="px-3 py-1 bg-background border border-border rounded-md text-sm"
              >
                <option value="low">Low ⚡</option>
                <option value="medium">Medium ⚡⚡</option>
                <option value="high">High ⚡⚡⚡</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" size="sm">Add Project</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No abandoned projects yet!</p>
            <p className="text-sm">Add one to start tracking your side quests</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/30 border border-border rounded-lg hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-card-foreground">{project.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {ENERGY_ICONS[project.energy_required as keyof typeof ENERGY_ICONS]}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.days_abandoned} days abandoned
                    </span>
                    {project.revival_attempts > 0 && (
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {project.revival_attempts} revival{project.revival_attempts > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{project.completion_percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.completion_percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full ${ENERGY_COLORS[project.energy_required as keyof typeof ENERGY_COLORS]}`}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                {project.status === 'abandoned' && (
                  <Button
                    onClick={() => handleRevive(project.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Rocket className="h-3 w-3 mr-1" />
                    Revive
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedProject(project.id);
                    setProgressValue(project.completion_percentage);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Update Progress
                </Button>
              </div>

              {/* Progress update modal */}
              <AnimatePresence>
                {selectedProject === project.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-background rounded-lg border border-border"
                  >
                    <label className="block text-sm font-medium mb-2">
                      Set completion: {progressValue}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressValue}
                      onChange={(e) => setProgressValue(parseInt(e.target.value))}
                      className="w-full mb-3"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleUpdateProgress(project.id)}
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setSelectedProject(null)}
                        size="sm"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
