'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Trophy, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface BuddyCheckin {
  id: number;
  scheduled_time: string;
  check_in_type: string;
  message: string;
  status: string;
  streak_count: number;
}

interface BuddyStats {
  stats: {
    completed: number;
    missed: number;
    best_streak: number;
    responseRate: number;
    totalCheckins: number;
  };
  message: string;
}

export default function AccountabilityBuddy() {
  const [pending, setPending] = useState<BuddyCheckin[]>([]);
  const [stats, setStats] = useState<BuddyStats | null>(null);
  const [selectedCheckin, setSelectedCheckin] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckins();
    fetchStats();
  }, []);

  const fetchCheckins = async () => {
    try {
      const res = await fetch('/api/buddy');
      const data = await res.json();
      setPending(data.pending);
    } catch (error) {
      toast.error('Failed to fetch check-ins');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/buddy/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleGenerateCheckin = async () => {
    try {
      const res = await fetch('/api/buddy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchCheckins();
      }
    } catch (error) {
      toast.error('Failed to generate check-in');
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || selectedCheckin === null) return;

    try {
      const res = await fetch('/api/buddy/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCheckin, response })
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
        setSelectedCheckin(null);
        setResponse('');
        fetchCheckins();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to respond to check-in');
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const scheduled = new Date(timestamp);
    const diffMs = now.getTime() - scheduled.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'morning': return '☀️';
      case 'midday': return '🌤️';
      case 'afternoon': return '🌅';
      case 'evening': return '🌙';
      default: return '💪';
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
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <MessageCircle className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Accountability Buddy</h2>
            <p className="text-sm text-muted-foreground">Your virtual check-in companion</p>
          </div>
        </div>
        <Button
          onClick={handleGenerateCheckin}
          size="sm"
          variant="outline"
        >
          Generate Check-in
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.stats.completed || 0}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.stats.missed || 0}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.stats.responseRate}%</div>
            <div className="text-xs text-muted-foreground">Response Rate</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.stats.best_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
        </div>
      )}

      {/* Pending check-ins */}
      <div className="space-y-4">
        {pending.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending check-ins!</p>
            <p className="text-sm">Generate one to stay accountable</p>
          </div>
        ) : (
          pending.map((checkin) => (
            <motion.div
              key={checkin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/30 rounded-lg"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="text-2xl">{getTypeIcon(checkin.check_in_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-pink-500 uppercase">
                      {checkin.check_in_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getTimeSince(checkin.scheduled_time)}
                    </span>
                  </div>
                  <p className="text-card-foreground font-medium mb-3">{checkin.message}</p>

                  {selectedCheckin === checkin.id ? (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleRespond}
                      className="space-y-3"
                    >
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm">
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCheckin(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <Button
                      onClick={() => setSelectedCheckin(checkin.id)}
                      size="sm"
                      variant="outline"
                    >
                      Respond
                    </Button>
                  )}
                </div>
              </div>

              {checkin.streak_count > 0 && (
                <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-border">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {checkin.streak_count} day streak!
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Encouragement message */}
      {stats && stats.message && (
        <div className="mt-6 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
          <p className="text-sm text-gray-400">{stats.message}</p>
        </div>
      )}
    </div>
  );
}
