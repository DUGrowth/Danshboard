"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface Task {
  id: number;
  description: string;
  estimated_time: number;
  project?: string;
  context: string;
  times_skipped: number;
}

interface TaskDispenserProps {
  onTaskComplete?: () => void;
}

export default function TaskDispenser({ onTaskComplete }: TaskDispenserProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timeOptions = [
    { duration: 5, label: "5 min", emoji: "⚡", color: "from-gray-300 to-gray-400" },
    { duration: 15, label: "15 min", emoji: "🚀", color: "from-gray-400 to-gray-500" },
    { duration: 30, label: "30 min", emoji: "💪", color: "from-gray-500 to-gray-600" },
    { duration: 60, label: "1 hour", emoji: "🎯", color: "from-gray-600 to-gray-700" },
    { duration: 120, label: "2+ hours", emoji: "🏔️", color: "from-gray-700 to-gray-800" },
  ];

  const dispenseTask = async (timeAvailable: number) => {
    setSelectedTime(timeAvailable);
    setIsLoading(true);
    setCurrentTask(null);

    try {
      const res = await fetch(`/api/tasks/dispense?timeAvailable=${timeAvailable}`);
      const task = await res.json();

      if (task) {
        setCurrentTask(task);
      } else {
        toast.error("No tasks available for this time slot!");
      }
    } catch (error) {
      toast.error("Failed to get task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentTask) return;

    try {
      await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: currentTask.id, title: currentTask.description }),
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      toast.success("Task completed! 🎉");
      setCurrentTask(null);
      setSelectedTime(null);
      onTaskComplete?.();
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const handleSkip = async () => {
    if (!currentTask) return;

    try {
      const res = await fetch("/api/tasks/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: currentTask.id }),
      });

      const data = await res.json();

      if (data.task.times_skipped >= 3) {
        toast(data.message, { icon: "⚠️", duration: 5000 });
      }

      // Get next task
      dispenseTask(selectedTime!);
    } catch (error) {
      toast.error("Failed to skip task");
    }
  };

  return (
    <div className="space-y-6">
      {/* Time selection */}
      {!currentTask && (
        <div>
          <h3 className="text-lg font-semibold mb-4">How much time do you have?</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {timeOptions.map((option) => (
              <motion.button
                key={option.duration}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispenseTask(option.duration)}
                disabled={isLoading}
                className={`
                  p-4 rounded-lg border-2 border-border
                  bg-gradient-to-br ${option.color}
                  text-white font-semibold
                  transition-all duration-200
                  hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <div className="text-sm">{option.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4"
          >
            🎲
          </motion.div>
          <p className="text-muted-foreground">Finding the perfect task...</p>
        </motion.div>
      )}

      {/* Task display */}
      <AnimatePresence mode="wait">
        {currentTask && !isLoading && (
          <motion.div
            key={currentTask.id}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative p-8 rounded-lg border-2 border-primary bg-gradient-to-br from-card to-card/50 shadow-xl"
          >
            <button
              onClick={() => {
                setCurrentTask(null);
                setSelectedTime(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start space-x-3 mb-6">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">
                  {currentTask.estimated_time} minutes • {currentTask.context}
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentTask.description}</h2>
                {currentTask.project && (
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                    {currentTask.project}
                  </div>
                )}
              </div>
            </div>

            {currentTask.times_skipped > 0 && (
              <div className="mb-4 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
                ⚠️ You&apos;ve skipped this {currentTask.times_skipped} time{currentTask.times_skipped > 1 ? 's' : ''}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleComplete}
                className="flex-1"
                size="lg"
                variant="default"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Done!
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                size="lg"
              >
                Skip
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
