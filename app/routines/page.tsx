'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { MorningCheckinDialog, type MorningCheckinData } from '@/components/MorningCheckinDialog';
import { RoutineDashboardWidget } from '@/components/RoutineDashboardWidget';
import { NotificationToggle } from '@/components/NotificationPermission';
import { Trophy } from 'lucide-react';

interface RoutineStreak {
  streak_type: string;
  current_streak: number;
  longest_streak: number;
}

export default function RoutinesPage() {
  const [showMorningCheckin, setShowMorningCheckin] = useState(false);
  const [streaks, setStreaks] = useState<RoutineStreak[]>([]);

  useEffect(() => {
    const init = async () => {
      // Check if morning routine and haven&apos;t done check-in yet
      const now = new Date();
      const isMorning = now.getHours() >= 6 && now.getHours() < 9;

      if (isMorning) {
        const checkinDone = await checkIfCheckinDone();
        if (!checkinDone) {
          setShowMorningCheckin(true);
        }
      }

      // Load streaks
      fetchStreaks();
    };

    init();
  }, []);

  const checkIfCheckinDone = async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/routines/morning-checkin?date=${today}`);
    const data = await response.json();
    return !!data.checkin;
  };

  const fetchStreaks = async () => {
    const response = await fetch('/api/routines/streaks');
    const data = await response.json();
    setStreaks(data.streaks || []);
  };

  const handleCheckinComplete = async (data: MorningCheckinData) => {
    await fetch('/api/routines/morning-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        date: new Date().toISOString().split('T')[0]
      })
    });

    setShowMorningCheckin(false);
    fetchStreaks();
  };

  const getStreakLabel = (streakType: string) => {
    const labels: Record<string, string> = {
      'stopped_work_by_9pm': 'Stopped Work by 9pm',
      'in_bed_by_10pm': 'In Bed by 10pm',
      'phone_outside_bedroom': 'Phone Outside Bedroom',
      'morning_exercise': 'Morning Exercise',
      'morning_movement': 'Morning Movement',
      'woke_up_on_time': 'Woke Up On Time'
    };
    return labels[streakType] || streakType;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent mb-2">
              Daily Routines
            </h1>
            <p className="text-slate-400">
              Evening and morning routines for consistent ADHD-friendly structure
            </p>
          </div>
          <NotificationToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Current Routine Widget */}
        <RoutineDashboardWidget />

        {/* Routine Streaks */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold">Routine Streaks</h2>
          </div>

          {streaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete routine tasks to build streaks!
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streaks.map((streak) => (
                <div
                  key={streak.streak_type}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="text-sm text-muted-foreground mb-1">
                    {getStreakLabel(streak.streak_type)}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <div className="text-3xl font-bold text-gray-400">
                      {streak.current_streak}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      days
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Best: {streak.longest_streak} days
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MorningCheckinDialog
        isOpen={showMorningCheckin}
        onClose={() => setShowMorningCheckin(false)}
        onComplete={handleCheckinComplete}
      />
    </main>
  );
}
