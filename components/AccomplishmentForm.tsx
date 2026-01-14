"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface AccomplishmentFormProps {
  onAdd: () => void;
}

export default function AccomplishmentForm({ onAdd }: AccomplishmentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/accomplishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category: "general",
          points: 1,
        }),
      });

      if (res.ok) {
        toast.success("🎉 Accomplishment logged!");
        setTitle("");
        setDescription("");
        setIsOpen(false);
        onAdd();
      }
    } catch (error) {
      toast.error("Failed to log accomplishment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full"
          size="lg"
          variant="success"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Accomplishment
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded-lg border border-border bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">New Accomplishment</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What did you accomplish?"
        className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
        autoFocus
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details (optional)"
        rows={3}
        className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />

      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
