"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export default function WaterTracker() {
  const [totalGlasses, setTotalGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [percentComplete, setPercentComplete] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    try {
      const res = await fetch("/api/water");
      const data = await res.json();
      setTotalGlasses(data.totalGlasses);
      setGoal(data.goal);
      setPercentComplete(data.percentComplete);
    } catch (error) {
      console.error("Failed to load water data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGlass = async () => {
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glassesCount: 1 }),
      });

      const data = await res.json();
      setTotalGlasses(data.totalGlasses);
      setPercentComplete(data.percentComplete);

      if (data.percentComplete >= 100) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#60A5FA", "#3B82F6", "#2563EB"],
        });
      }

      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to log water");
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-card rounded-lg" />;
  }

  const fillHeight = Math.min(100, percentComplete);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-gradient-to-br from-card to-card/50"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Droplet className="h-6 w-6 text-blue-500" />
        <h3 className="text-xl font-bold">Water Tracker</h3>
      </div>

      <div className="flex items-center justify-between mb-6">
        {/* Visual water bottle */}
        <div className="relative w-24 h-40">
          <svg viewBox="0 0 100 200" className="w-full h-full">
            {/* Bottle outline */}
            <path
              d="M 35 20 L 35 10 L 65 10 L 65 20 L 70 30 L 70 190 L 30 190 L 30 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-border"
            />

            {/* Water fill */}
            <motion.rect
              x="33"
              y={33 + (157 * (100 - fillHeight) / 100)}
              width="34"
              height={(157 * fillHeight) / 100}
              fill="url(#waterGradient)"
              initial={{ height: 0 }}
              animate={{ height: (157 * fillHeight) / 100 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Wave effect */}
            {fillHeight > 0 && (
              <motion.path
                d={`M 33 ${33 + (157 * (100 - fillHeight) / 100)} Q 45 ${33 + (157 * (100 - fillHeight) / 100) - 5} 50 ${33 + (157 * (100 - fillHeight) / 100)} T 67 ${33 + (157 * (100 - fillHeight) / 100)}`}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2"
                animate={{
                  d: [
                    `M 33 ${33 + (157 * (100 - fillHeight) / 100)} Q 45 ${33 + (157 * (100 - fillHeight) / 100) - 3} 50 ${33 + (157 * (100 - fillHeight) / 100)} T 67 ${33 + (157 * (100 - fillHeight) / 100)}`,
                    `M 33 ${33 + (157 * (100 - fillHeight) / 100)} Q 45 ${33 + (157 * (100 - fillHeight) / 100) + 3} 50 ${33 + (157 * (100 - fillHeight) / 100)} T 67 ${33 + (157 * (100 - fillHeight) / 100)}`
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            )}
          </svg>
        </div>

        {/* Stats */}
        <div className="flex-1 text-center">
          <motion.div
            key={totalGlasses}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold text-primary mb-2"
          >
            {totalGlasses}
          </motion.div>
          <div className="text-muted-foreground">
            of {goal} glasses
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {percentComplete}%
          </div>
        </div>
      </div>

      <Button
        onClick={handleAddGlass}
        className="w-full"
        size="lg"
        variant={percentComplete >= 100 ? "secondary" : "default"}
      >
        <Droplet className="mr-2 h-5 w-5" />
        {percentComplete >= 100 ? "Log Another Glass" : "Log a Glass"}
      </Button>
    </motion.div>
  );
}
