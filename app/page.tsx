"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StreakCard from "@/components/StreakCard";
import AccomplishmentForm from "@/components/AccomplishmentForm";
import AccomplishmentList from "@/components/AccomplishmentList";
import DailyCheckInDialog from "@/components/DailyCheckInDialog";
import { Sparkles } from "lucide-react";

interface Streak {
  id: number;
  name: string;
  current_count: number;
  best_count: number;
  last_check_in: string | null;
}

interface Accomplishment {
  id: number;
  title: string;
  description: string | null;
  completed_at: string;
}

export default function Home() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkDailyCheckIn();
  }, []);

  const loadData = async () => {
    try {
      const [streaksRes, accomplishmentsRes] = await Promise.all([
        fetch("/api/streaks"),
        fetch("/api/accomplishments/today"),
      ]);

      const streaksData = await streaksRes.json();
      const accomplishmentsData = await accomplishmentsRes.json();

      setStreaks(streaksData);
      setAccomplishments(accomplishmentsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDailyCheckIn = async () => {
    try {
      const res = await fetch("/api/checkin");
      const data = await res.json();

      // If no check-in for today, show dialog after 1 second
      if (!data) {
        setTimeout(() => {
          setShowCheckInDialog(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to check daily check-in:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to Dan-shboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Your ADHD-friendly productivity companion
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left column: Streak */}
        <div className="space-y-6">
          {streaks.length > 0 && (
            <StreakCard
              streak={streaks[0]}
              onUpdate={loadData}
            />
          )}
        </div>

        {/* Right column: Accomplishments */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border bg-card/50 backdrop-blur p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Today's Wins</h2>
            </div>

            <div className="space-y-4">
              <AccomplishmentForm onAdd={loadData} />
              <AccomplishmentList accomplishments={accomplishments} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Daily check-in dialog */}
      <DailyCheckInDialog
        open={showCheckInDialog}
        onOpenChange={setShowCheckInDialog}
        onComplete={() => {
          loadData();
        }}
      />
    </div>
  );
}
