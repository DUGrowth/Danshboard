"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

interface StreakCardProps {
  streak: {
    id: number;
    name: string;
    current_count: number;
    best_count: number;
    last_check_in: string | null;
  };
  onUpdate: () => void;
}

export default function StreakCard({ streak, onUpdate }: StreakCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [count, setCount] = useState(streak.current_count);

  const handleCheckIn = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/streaks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streakId: streak.id }),
      });

      const data = await res.json();

      if (data.alreadyCheckedIn) {
        toast.error("Already checked in today!");
      } else {
        setCount(data.streak.current_count);

        if (data.celebration) {
          // Fire confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#a855f7", "#8b5cf6", "#7c3aed"],
          });
          toast.success(data.message, { duration: 5000 });
        } else {
          toast.success(data.message);
        }

        onUpdate();
      }
    } catch (error) {
      toast.error("Failed to update streak");
    } finally {
      setIsUpdating(false);
    }
  };

  const isCheckedInToday = () => {
    if (!streak.last_check_in) return false;
    const today = new Date().toISOString().split("T")[0];
    return streak.last_check_in === today;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h3 className="text-xl font-bold">{streak.name}</h3>
          </div>
          {isCheckedInToday() && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium"
            >
              ✓ Checked in
            </motion.div>
          )}
        </div>

        {/* Streak counter */}
        <div className="flex items-baseline space-x-4 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
            >
              {count}
            </motion.div>
          </AnimatePresence>
          <div className="text-muted-foreground">
            <div className="text-sm">day{count !== 1 ? "s" : ""}</div>
            <div className="flex items-center text-xs space-x-1">
              <Trophy className="h-3 w-3" />
              <span>Best: {streak.best_count}</span>
            </div>
          </div>
        </div>

        {/* Check-in button */}
        <Button
          onClick={handleCheckIn}
          disabled={isUpdating || isCheckedInToday()}
          variant={isCheckedInToday() ? "secondary" : "default"}
          className="w-full"
          size="lg"
        >
          {isUpdating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.div>
          ) : isCheckedInToday() ? (
            "Come back tomorrow!"
          ) : (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Check In</span>
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
