"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface Accomplishment {
  id: number;
  title: string;
  description: string | null;
  completed_at: string;
}

interface AccomplishmentListProps {
  accomplishments: Accomplishment[];
}

export default function AccomplishmentList({ accomplishments }: AccomplishmentListProps) {
  if (accomplishments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No accomplishments yet today.</p>
        <p className="text-sm">Log your first win above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accomplishments.map((accomplishment, index) => (
        <motion.div
          key={accomplishment.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {accomplishment.title}
              </h4>
              {accomplishment.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {accomplishment.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(accomplishment.completed_at), "h:mm a")}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
