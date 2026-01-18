'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { getCurrentRoutine, getCurrentTask, getUpcomingTasks, checkCalendarForKids } from '@/lib/routines/detector';
import type { Routine, RoutineTask } from '@/lib/routines/definitions';
import toast from 'react-hot-toast';

export function RoutineDashboardWidget() {
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [currentTask, setCurrentTask] = useState<RoutineTask | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<RoutineTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [hasKidsToday, setHasKidsToday] = useState(false);

  useEffect(() => {
    const updateRoutine = () => {
      const now = new Date();
      const kidsToday = checkCalendarForKids(now);
      setHasKidsToday(kidsToday);

      const routine = getCurrentRoutine(now, kidsToday);
      setCurrentRoutine(routine);

      if (routine) {
        const task = getCurrentTask(routine, now);
        setCurrentTask(task);

        const upcoming = getUpcomingTasks(routine, now, 2);
        setUpcomingTasks(upcoming);

        loadCompletedTasks(routine.type);
      }
    };

    updateRoutine();
    const interval = setInterval(updateRoutine, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadCompletedTasks = async (routineType: string) => {
    try {
      const response = await fetch(`/api/routines/completions?type=${routineType}&date=${new Date().toISOString().split('T')[0]}`);
      const data = await response.json();
      setCompletedTasks(data.completedTaskIds || []);
    } catch (error) {
      console.error('Failed to load completed tasks');
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await fetch('/api/routines/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          routineType: currentRoutine?.type,
          date: new Date().toISOString().split('T')[0]
        })
      });

      setCompletedTasks([...completedTasks, taskId]);
      toast.success('Task completed! 🎉');
    } catch (error) {
      toast.error('Failed to mark task complete');
    }
  };

  if (!currentRoutine) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">No Active Routine</h3>
        <p className="text-sm text-muted-foreground">
          Your next routine starts at {hasKidsToday ? '6:00 AM' : '5:30 AM'} tomorrow morning.
        </p>
      </div>
    );
  }

  const completionPercentage = (completedTasks.length / currentRoutine.tasks.length) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{currentRoutine.name}</h3>
        <span className="text-sm text-muted-foreground">
          {completedTasks.length}/{currentRoutine.tasks.length}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          className="h-full bg-purple-500 rounded-full"
        />
      </div>

      {currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border-2 border-purple-500 bg-purple-500/10 mb-4"
        >
          <div className="text-sm text-muted-foreground mb-1">Current Task</div>
          <div className="text-lg font-semibold mb-1">
            {currentTask.emoji} {currentTask.description}
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            {currentTask.timeBlock}
            {currentTask.timeBlockEnd && ` - ${currentTask.timeBlockEnd}`}
            {' '}({currentTask.estimatedMinutes} min)
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleTaskComplete(currentTask.id)}
              className="flex-1"
              disabled={completedTasks.includes(currentTask.id)}
              size="sm"
            >
              <Check className="mr-1 h-4 w-4" />
              Done
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <X className="mr-1 h-4 w-4" />
              Skip
            </Button>
          </div>
        </motion.div>
      )}

      {upcomingTasks.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 flex items-center text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Coming Up
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center text-sm p-2 rounded bg-muted/30"
              >
                <span className="mr-2">{task.emoji}</span>
                <span className="flex-1 text-card-foreground">{task.description}</span>
                <span className="text-xs text-muted-foreground">{task.timeBlock}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
