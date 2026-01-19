"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Accomplishment {
  id: number;
  title: string;
  description: string | null;
  category: string;
  points: number;
  completed_at: string;
}

export default function AchievementsPage() {
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccomplishments();
  }, []);

  const loadAccomplishments = async () => {
    try {
      const res = await fetch("/api/accomplishments");
      const data = await res.json();
      setAccomplishments(data);
    } catch (error) {
      console.error("Failed to load accomplishments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPoints = accomplishments.reduce((sum, acc) => sum + acc.points, 0);

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-gray-400 bg-clip-text text-transparent">
          Your Achievements
        </h1>
        <p className="text-muted-foreground">
          All the amazing things you&apos;ve accomplished
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="h-6 w-6 text-yellow-500" />}
          label="Total Accomplishments"
          value={accomplishments.length}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          label="Total Points"
          value={totalPoints}
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          label="Keep Going!"
          value="🎯"
        />
      </div>

      {/* Accomplishments list */}
      <div className="max-w-3xl mx-auto space-y-4">
        {accomplishments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No accomplishments yet.</p>
            <p>Start logging your wins on the dashboard!</p>
          </div>
        ) : (
          accomplishments.map((accomplishment, index) => (
            <motion.div
              key={accomplishment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{accomplishment.title}</h3>
                  {accomplishment.description && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {accomplishment.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>{format(new Date(accomplishment.completed_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {accomplishment.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    +{accomplishment.points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur"
    >
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </motion.div>
  );
}
