"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type MoodType = 'scattered' | 'sharp' | 'frustrated' | 'tired' | 'anxious' | 'motivated';

interface MoodOption {
  mood: MoodType;
  emoji: string;
  label: string;
  color: string;
}

interface MoodCheckInProps {
  onMoodSelected?: (mood: MoodType, energy: number) => void;
  compact?: boolean;
}

export default function MoodCheckIn({ onMoodSelected, compact = false }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [energy, setEnergy] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions: MoodOption[] = [
    { mood: 'scattered', emoji: '🌪️', label: 'Scattered', color: 'from-yellow-500 to-orange-500' },
    { mood: 'sharp', emoji: '🎯', label: 'Sharp', color: 'from-blue-500 to-purple-500' },
    { mood: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'from-red-500 to-pink-500' },
    { mood: 'tired', emoji: '😴', label: 'Tired', color: 'from-indigo-500 to-blue-500' },
    { mood: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-purple-500 to-pink-500' },
    { mood: 'motivated', emoji: '🚀', label: 'Motivated', color: 'from-green-500 to-teal-500' },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, energyLevel: energy }),
      });

      toast.success("Mood logged!");
      onMoodSelected?.(selectedMood, energy);
    } catch (error) {
      toast.error("Failed to log mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={compact ? "" : "p-6 rounded-lg border border-border bg-card"}
    >
      <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {moodOptions.map((option) => (
          <motion.button
            key={option.mood}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMood(option.mood)}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${selectedMood === option.mood
                ? `border-primary bg-gradient-to-br ${option.color} text-white`
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <div className="text-2xl mb-1">{option.emoji}</div>
            <div className="text-xs font-medium">{option.label}</div>
          </motion.button>
        ))}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium mb-2 block">
              Energy Level: {energy}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Logging..." : "Log Mood"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
