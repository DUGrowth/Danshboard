'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Plus, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface HourlyLog {
  id: number;
  hour_block: number;
  accomplishment: string;
  category: string;
  energy_level?: number;
  mood_tag?: string;
}

const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'learning', label: 'Learning', color: 'bg-purple-500' },
  { value: 'health', label: 'Health', color: 'bg-green-500' },
  { value: 'social', label: 'Social', color: 'bg-pink-500' },
  { value: 'creative', label: 'Creative', color: 'bg-yellow-500' },
  { value: 'general', label: 'General', color: 'bg-gray-500' }
];

export default function HourlyLogger() {
  const [logs, setLogs] = useState<HourlyLog[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [accomplishment, setAccomplishment] = useState('');
  const [category, setCategory] = useState('general');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [missingHours, setMissingHours] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/hourly');
      const data = await res.json();
      setLogs(data.logs);
      setMissingHours(data.missingHours);
      setCurrentHour(data.currentHour);
    } catch (error) {
      toast.error('Failed to fetch hourly logs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogHour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplishment.trim() || selectedHour === null) return;

    try {
      const res = await fetch('/api/hourly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hourBlock: selectedHour,
          accomplishment,
          category,
          energyLevel
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (data.shouldCelebrate) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        setSelectedHour(null);
        setAccomplishment('');
        setCategory('general');
        setEnergyLevel(3);
        fetchLogs();
      }
    } catch (error) {
      toast.error('Failed to log hour');
    }
  };

  const getHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${period}`;
  };

  const getLogForHour = (hour: number) => {
    return logs.find(log => log.hour_block === hour);
  };

  const getCategoryColor = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat)?.color || 'bg-gray-500';
  };

  const renderHourBlock = (hour: number) => {
    const log = getLogForHour(hour);
    const isPast = hour <= currentHour;
    const isCurrent = hour === currentHour;
    const isMissing = missingHours.includes(hour) && isPast;

    return (
      <motion.div
        key={hour}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: hour * 0.02 }}
        className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer ${
          isCurrent
            ? 'border-purple-500 bg-purple-500/10'
            : log
            ? 'border-green-500/50 bg-green-500/10'
            : isMissing
            ? 'border-yellow-500/50 bg-yellow-500/5'
            : 'border-border bg-muted/20'
        } ${isPast ? 'hover:border-purple-500/50' : 'opacity-50'}`}
        onClick={() => isPast && setSelectedHour(hour)}
      >
        <div className="text-xs font-medium text-center mb-1">
          {getHourLabel(hour)}
        </div>
        {log ? (
          <div className={`w-full h-1 rounded-full ${getCategoryColor(log.category)}`} />
        ) : isMissing ? (
          <div className="w-full h-1 rounded-full bg-yellow-500/50" />
        ) : (
          <div className="w-full h-1 rounded-full bg-border" />
        )}
        {isCurrent && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Hourly Logger</h2>
            <p className="text-sm text-muted-foreground">
              Track what you accomplish each hour
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-card-foreground">
            {logs.length}/{currentHour + 1}
          </div>
          <div className="text-xs text-muted-foreground">hours logged</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          {[...Array(24)].map((_, i) => renderHourBlock(i))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10 mr-2" />
          Current hour
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded border-2 border-green-500/50 bg-green-500/10 mr-2" />
          Logged
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded border-2 border-yellow-500/50 bg-yellow-500/5 mr-2" />
          Missing
        </div>
      </div>

      {/* Log entry form */}
      <AnimatePresence>
        {selectedHour !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-6"
          >
            <form onSubmit={handleLogHour} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    What did you accomplish at {getHourLabel(selectedHour)}?
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedHour(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  type="text"
                  value={accomplishment}
                  onChange={(e) => setAccomplishment(e.target.value)}
                  placeholder="e.g., Finished project proposal, Had a great workout"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      category === cat.value
                        ? `${cat.color} text-white`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Energy level: {energyLevel}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Log This Hour
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent logs */}
      {logs.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Accomplishments</h3>
          {logs.slice().reverse().map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-3 p-2 rounded-lg bg-muted/30"
            >
              <div className="text-xs font-medium text-muted-foreground w-12 shrink-0 pt-0.5">
                {getHourLabel(log.hour_block)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-card-foreground">{log.accomplishment}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(log.category)}`}>
                    {CATEGORIES.find(c => c.value === log.category)?.label}
                  </span>
                  {log.energy_level && (
                    <span className="text-xs text-muted-foreground">
                      ⚡ {log.energy_level}/5
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
