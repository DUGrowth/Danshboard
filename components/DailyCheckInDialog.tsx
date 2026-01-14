"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Zap, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface DailyCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function DailyCheckInDialog({
  open,
  onOpenChange,
  onComplete,
}: DailyCheckInDialogProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!mood || !energy) {
      toast.error("Please select both mood and energy levels");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy, notes: notes.trim() || null }),
      });

      if (res.ok) {
        toast.success("Daily check-in complete! 🎉");
        onComplete();
        onOpenChange(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save check-in");
      }
    } catch (error) {
      toast.error("Failed to save check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Daily Check-In</DialogTitle>
          <DialogDescription>
            How are you feeling today? Let's track your progress!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood selector */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="h-5 w-5 text-pink-500" />
              <label className="text-sm font-medium">Mood</label>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <MoodButton
                  key={level}
                  level={level}
                  selected={mood === level}
                  onClick={() => setMood(level)}
                />
              ))}
            </div>
          </div>

          {/* Energy selector */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <label className="text-sm font-medium">Energy</label>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <EnergyButton
                  key={level}
                  level={level}
                  selected={energy === level}
                  onClick={() => setEnergy(level)}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <label className="text-sm font-medium">Notes (optional)</label>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything on your mind?"
              rows={3}
              className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!mood || !energy || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Complete Check-In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MoodButton({
  level,
  selected,
  onClick,
}: {
  level: number;
  selected: boolean;
  onClick: () => void;
}) {
  const emojis = ["😢", "😕", "😐", "😊", "😄"];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`flex-1 aspect-square rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
        selected
          ? "border-primary bg-primary/20 scale-110"
          : "border-border hover:border-primary/50"
      }`}
    >
      {emojis[level - 1]}
    </motion.button>
  );
}

function EnergyButton({
  level,
  selected,
  onClick,
}: {
  level: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`flex-1 aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
        selected
          ? "border-primary bg-primary/20 scale-110"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex flex-col items-center">
        <Zap
          className={`h-5 w-5 ${
            selected ? "text-yellow-500" : "text-muted-foreground"
          }`}
        />
        <span className="text-xs mt-1">{level}</span>
      </div>
    </motion.button>
  );
}
