"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StreakCard from "@/components/StreakCard";
import AccomplishmentForm from "@/components/AccomplishmentForm";
import AccomplishmentList from "@/components/AccomplishmentList";
import DailyCheckInDialog from "@/components/DailyCheckInDialog";
import WaterTracker from "@/components/WaterTracker";
import StoicQuoteCard from "@/components/StoicQuoteCard";
import HourlyLogger from "@/components/HourlyLogger";
import AccountabilityBuddy from "@/components/AccountabilityBuddy";
import MicrobreakEnforcer from "@/components/MicrobreakEnforcer";
import CrossDeviceMessaging from "@/components/CrossDeviceMessaging";
import OcrNotes from "@/components/OcrNotes";
import { RoutineDashboardWidget } from "@/components/RoutineDashboardWidget";
import { MorningCheckinDialog, type MorningCheckinData } from "@/components/MorningCheckinDialog";
import { NotificationPermission } from "@/components/NotificationPermission";
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
  const [showMorningCheckin, setShowMorningCheckin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkDailyCheckIn();
    checkMorningCheckin();
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

  const checkMorningCheckin = async () => {
    try {
      const now = new Date();
      const isMorning = now.getHours() >= 6 && now.getHours() < 9;

      if (isMorning) {
        const today = now.toISOString().split('T')[0];
        const res = await fetch(`/api/routines/morning-checkin?date=${today}`);
        const data = await res.json();

        if (!data.checkin) {
          setTimeout(() => {
            setShowMorningCheckin(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to check morning check-in:", error);
    }
  };

  const handleMorningCheckinComplete = async (data: MorningCheckinData) => {
    try {
      await fetch('/api/routines/morning-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: new Date().toISOString().split('T')[0]
        })
      });
      setShowMorningCheckin(false);
    } catch (error) {
      console.error("Failed to save morning check-in:", error);
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

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
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
              <h2 className="text-2xl font-bold">Today&apos;s Wins</h2>
            </div>

            <div className="space-y-4">
              <AccomplishmentForm onAdd={loadData} />
              <AccomplishmentList accomplishments={accomplishments} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Second row: Water Tracker and Stoic Quote */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WaterTracker />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StoicQuoteCard />
        </motion.div>
      </div>

      {/* Third row: Routine Manager */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RoutineDashboardWidget />
        </motion.div>
      </div>

      {/* Fourth row: Hourly Logger */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <HourlyLogger />
        </motion.div>
      </div>

      {/* Fifth row: Accountability Buddy */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AccountabilityBuddy />
        </motion.div>
      </div>

      {/* Sixth row: Microbreak Enforcer and Cross-Device Messaging */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <MicrobreakEnforcer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <CrossDeviceMessaging />
        </motion.div>
      </div>

      {/* Seventh row: OCR Notes */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <OcrNotes />
        </motion.div>
      </div>

      {/* Daily check-in dialog */}
      <DailyCheckInDialog
        open={showCheckInDialog}
        onOpenChange={setShowCheckInDialog}
        onComplete={() => {
          loadData();
        }}
      />

      {/* Morning check-in dialog */}
      <MorningCheckinDialog
        isOpen={showMorningCheckin}
        onClose={() => setShowMorningCheckin(false)}
        onComplete={handleMorningCheckinComplete}
      />

      {/* Notification permission prompt */}
      <NotificationPermission />
    </div>
  );
}
