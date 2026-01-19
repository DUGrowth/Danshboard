'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Save, Settings, Droplet, Clock, Heart, Zap, Target, Coffee, Moon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationPreference {
  id?: number;
  notification_type: string;
  enabled: boolean;
  custom_time?: string;
  interval_minutes?: number;
  settings?: any;
}

interface NotificationConfig {
  type: string;
  label: string;
  description: string;
  icon: any;
  category: string;
  defaultEnabled: boolean;
  hasTime?: boolean;
  hasInterval?: boolean;
  defaultTime?: string;
  defaultInterval?: number;
}

const NOTIFICATION_CONFIGS: NotificationConfig[] = [
  // Evening Routine (already implemented)
  { type: 'routine_stop_work', label: 'Stop Working (9pm)', description: 'Gentle reminder to wind down', icon: Moon, category: 'Routines', defaultEnabled: true, hasTime: true, defaultTime: '21:00' },
  { type: 'routine_no_screens', label: 'No Screens (9:45pm)', description: 'Firm reminder to put devices away', icon: Moon, category: 'Routines', defaultEnabled: true, hasTime: true, defaultTime: '21:45' },
  { type: 'routine_lights_out', label: 'Lights Out (10pm)', description: 'Final bedtime reminder', icon: Moon, category: 'Routines', defaultEnabled: true, hasTime: true, defaultTime: '22:00' },
  { type: 'routine_wakeup', label: 'Wake Up', description: 'Morning wake-up alert (5:30am or 6am)', icon: Moon, category: 'Routines', defaultEnabled: true, hasTime: true, defaultTime: '06:00' },

  // Water Reminders
  { type: 'water_reminder', label: 'Water Reminder', description: 'Hydration check-ins', icon: Droplet, category: 'Health', defaultEnabled: true, hasInterval: true, defaultInterval: 90 },

  // Hourly Logger
  { type: 'hourly_log', label: 'Hourly Log Reminder', description: 'Remind to log accomplishments on the hour', icon: Clock, category: 'Time Tracking', defaultEnabled: true },

  // Microbreaks
  { type: 'microbreak_reminder', label: 'Microbreak Reminder', description: 'Suggest breaks every 2 hours', icon: Coffee, category: 'Health', defaultEnabled: true, hasInterval: true, defaultInterval: 120 },

  // Focus & Time Awareness
  { type: 'hyperfocus_checkin', label: 'Hyperfocus Check-in', description: 'Break hyperfocus every 90 minutes', icon: Zap, category: 'Focus', defaultEnabled: false, hasInterval: true, defaultInterval: 90 },
  { type: 'task_timer_warning', label: 'Task Timer Warning', description: '5 min warning before task ends', icon: Clock, category: 'Focus', defaultEnabled: false },

  // Health & Self-Care
  { type: 'movement_break', label: 'Movement Break', description: 'Stand and stretch reminder', icon: Heart, category: 'Health', defaultEnabled: false, hasInterval: true, defaultInterval: 120 },
  { type: 'meal_reminder', label: 'Meal Reminders', description: 'Lunch and dinner reminders', icon: Heart, category: 'Health', defaultEnabled: false, hasTime: true, defaultTime: '12:00' },
  { type: 'medication_reminder', label: 'Medication Reminder', description: 'Custom medication times', icon: Heart, category: 'Health', defaultEnabled: false, hasTime: true, defaultTime: '09:00' },

  // Accountability & Momentum
  { type: 'morning_motivation', label: 'Morning Motivation', description: 'Start day with task suggestion (7am)', icon: Target, category: 'Motivation', defaultEnabled: false, hasTime: true, defaultTime: '07:00' },
  { type: 'end_of_day_reflection', label: 'End-of-Day Reflection', description: 'Log wins before shutdown (8pm)', icon: Target, category: 'Motivation', defaultEnabled: false, hasTime: true, defaultTime: '20:00' },
  { type: 'streak_alert', label: 'Streak Risk Alert', description: 'Warn when streak at risk', icon: Target, category: 'Motivation', defaultEnabled: true },
  { type: 'buddy_checkin_reminder', label: 'Buddy Check-in Reminder', description: 'Pending accountability responses', icon: Target, category: 'Motivation', defaultEnabled: true },

  // Energy Management
  { type: 'energy_check', label: 'Energy Check', description: 'Afternoon energy dip check-ins', icon: Zap, category: 'Health', defaultEnabled: false, hasTime: true, defaultTime: '14:00' },

  // Project Management
  { type: 'abandoned_project_nudge', label: 'Abandoned Project Nudge', description: 'Weekly reminder for neglected projects', icon: Target, category: 'Projects', defaultEnabled: false },
  { type: 'quick_win_opportunity', label: 'Quick Win Opportunity', description: 'Suggest quick tasks when free', icon: Target, category: 'Projects', defaultEnabled: false },
  { type: 'task_completion_celebration', label: 'Task Completion Celebration', description: 'Celebrate completed tasks', icon: Target, category: 'Projects', defaultEnabled: true },
];

const CATEGORIES = ['Routines', 'Health', 'Focus', 'Time Tracking', 'Motivation', 'Projects'];

export default function NotificationAdmin() {
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      const prefs: Record<string, NotificationPreference> = {};
      data.preferences.forEach((pref: NotificationPreference) => {
        prefs[pref.notification_type] = pref;
      });

      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (type: string, updates: Partial<NotificationPreference>) => {
    const current = preferences[type] || {
      notification_type: type,
      enabled: false
    };

    const updated = { ...current, ...updates };
    setPreferences({ ...preferences, [type]: updated });

    try {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: type,
          enabled: updated.enabled,
          custom_time: updated.custom_time,
          interval_minutes: updated.interval_minutes,
          settings: updated.settings
        })
      });
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update preference');
    }
  };

  const saveAllPreferences = async () => {
    setSaving(true);
    toast.success('All preferences saved!');
    setSaving(false);
  };

  const getPreferenceValue = (type: string, config: NotificationConfig) => {
    return preferences[type] || {
      notification_type: type,
      enabled: config.defaultEnabled,
      custom_time: config.defaultTime,
      interval_minutes: config.defaultInterval
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading notification preferences...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-500/10 rounded-lg">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                  Notification Center
                </h1>
                <p className="text-gray-400 mt-1">
                  Customize your ADHD-optimized notifications
                </p>
              </div>
            </div>
            <Button
              onClick={saveAllPreferences}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save All'}</span>
            </Button>
          </div>
        </div>

        {/* Notification Categories */}
        {CATEGORIES.map((category) => {
          const categoryConfigs = NOTIFICATION_CONFIGS.filter(c => c.category === category);
          if (categoryConfigs.length === 0) return null;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-300 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {category}
              </h2>

              <div className="space-y-3">
                {categoryConfigs.map((config) => {
                  const pref = getPreferenceValue(config.type, config);
                  const Icon = config.icon;

                  return (
                    <div
                      key={config.type}
                      className="bg-card border border-border rounded-lg p-4 hover:border-gray-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Icon className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-card-foreground">
                                {config.label}
                              </h3>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={pref.enabled}
                                  onChange={(e) => updatePreference(config.type, { enabled: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {config.description}
                            </p>

                            {/* Time Input */}
                            {pref.enabled && config.hasTime && (
                              <div className="mt-3">
                                <label className="text-xs text-muted-foreground block mb-1">
                                  Time:
                                </label>
                                <input
                                  type="time"
                                  value={pref.custom_time || config.defaultTime || ''}
                                  onChange={(e) => updatePreference(config.type, { custom_time: e.target.value })}
                                  className="bg-muted border border-border rounded px-3 py-1 text-sm text-foreground"
                                />
                              </div>
                            )}

                            {/* Interval Input */}
                            {pref.enabled && config.hasInterval && (
                              <div className="mt-3">
                                <label className="text-xs text-muted-foreground block mb-1">
                                  Interval (minutes):
                                </label>
                                <input
                                  type="number"
                                  min="5"
                                  max="480"
                                  step="5"
                                  value={pref.interval_minutes || config.defaultInterval || 60}
                                  onChange={(e) => updatePreference(config.type, { interval_minutes: parseInt(e.target.value) })}
                                  className="bg-muted border border-border rounded px-3 py-1 text-sm text-foreground w-24"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
