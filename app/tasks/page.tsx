"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TaskDispenser from "@/components/TaskDispenser";
import MoodCheckIn from "@/components/MoodCheckIn";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function TasksPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: "",
    estimatedTime: 30,
    context: "personal"
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.description.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      toast.success("Task added!");
      setNewTask({ description: "", estimatedTime: 30, context: "personal" });
      setShowAddTask(false);
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Task Dispenser
        </h1>
        <p className="text-muted-foreground">
          No decision paralysis. Just click a time, get a task, and go.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Main task dispenser */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur"
          >
            <TaskDispenser />
          </motion.div>

          {/* Quick add task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            {!showAddTask ? (
              <Button
                onClick={() => setShowAddTask(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            ) : (
              <form onSubmit={handleAddTask} className="p-4 rounded-lg border border-border bg-card space-y-4">
                <h3 className="font-semibold">Quick Add Task</h3>

                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Estimated Time</label>
                    <select
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2+ hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Context</label>
                    <select
                      value={newTask.context}
                      onChange={(e) => setNewTask({ ...newTask, context: e.target.value })}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Add Task</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MoodCheckIn compact />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-lg border border-border bg-card/50 text-sm text-muted-foreground"
          >
            <h4 className="font-semibold text-foreground mb-2">💡 How it works</h4>
            <ul className="space-y-2">
              <li>• Click your available time</li>
              <li>• Get one perfect task</li>
              <li>• Mark it done or skip</li>
              <li>• No overthinking required</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
