export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, number> = new Map();

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        await this.registerServiceWorker();
      }

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async showNotification(
    title: string,
    options: {
      body: string;
      tag?: string;
      requireInteraction?: boolean;
      url?: string;
      icon?: string;
    }
  ): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          badge: '/badge-72.png',
          tag: options.tag || 'dan-shboard',
          requireInteraction: options.requireInteraction || false,
          vibrate: [200, 100, 200] as any,
          data: { url: options.url || '/' }
        } as NotificationOptions);
      } else {
        // Fallback to local notification
        const notification = new Notification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          tag: options.tag || 'dan-shboard',
          requireInteraction: options.requireInteraction || false
        });

        if (options.url) {
          const url = options.url;
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
            notification.close();
          };
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  scheduleNotification(
    id: string,
    time: Date,
    title: string,
    body: string,
    options?: {
      requireInteraction?: boolean;
      url?: string;
    }
  ): void {
    const now = new Date();
    const msUntilNotification = time.getTime() - now.getTime();

    if (msUntilNotification <= 0) {
      console.warn('Cannot schedule notification in the past');
      return;
    }

    // Cancel existing notification with same ID
    this.cancelNotification(id);

    const timeoutId = window.setTimeout(() => {
      this.showNotification(title, {
        body,
        tag: id,
        requireInteraction: options?.requireInteraction,
        url: options?.url
      });
      this.scheduledNotifications.delete(id);
    }, msUntilNotification);

    this.scheduledNotifications.set(id, timeoutId);
  }

  cancelNotification(id: string): void {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  cancelAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  // Routine-specific notifications
  scheduleRoutineNotifications(): void {
    this.cancelAllNotifications();

    const now = new Date();
    const today = new Date(now);

    // Evening notifications
    this.scheduleTimeBasedNotification(
      'evening_stop_working',
      today,
      21,
      0,
      '🛑 Time to Stop Working',
      'Close your laptop and start your evening routine.',
      { requireInteraction: false, url: '/routines' }
    );

    this.scheduleTimeBasedNotification(
      'evening_no_screens',
      today,
      21,
      45,
      '📵 No Screens Time',
      'Put your phone away. Charge it outside the bedroom.',
      { requireInteraction: true, url: '/routines' }
    );

    this.scheduleTimeBasedNotification(
      'evening_lights_out',
      today,
      22,
      0,
      '😴 Lights Out',
      'Time for bed. Get your 8 hours.',
      { requireInteraction: true, url: '/routines' }
    );

    // Morning wake-up (tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's a kid day (Tue/Thu/weekends)
    const dayOfWeek = tomorrow.getDay();
    const isKidDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 0 || dayOfWeek === 6;

    const wakeHour = isKidDay ? 6 : 5;
    const wakeMinute = isKidDay ? 0 : 30;

    this.scheduleTimeBasedNotification(
      'morning_wake_up',
      tomorrow,
      wakeHour,
      wakeMinute,
      '⏰ Time to Wake Up',
      isKidDay ? 'Kid day - get moving!' : 'Gym day - let\'s go!',
      { requireInteraction: true, url: '/routines' }
    );
  }

  private scheduleTimeBasedNotification(
    id: string,
    date: Date,
    hour: number,
    minute: number,
    title: string,
    body: string,
    options?: {
      requireInteraction?: boolean;
      url?: string;
    }
  ): void {
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has already passed today, schedule for tomorrow
    const now = new Date();
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification(id, scheduledTime, title, body, options);
  }

  // Microbreak notifications
  scheduleMicrobreakReminder(minutes: number): void {
    const time = new Date();
    time.setMinutes(time.getMinutes() + minutes);

    this.scheduleNotification(
      'microbreak_reminder',
      time,
      '☕ Microbreak Time',
      'Take a break! Your brain needs rest.',
      { requireInteraction: false, url: '/' }
    );
  }

  // Hourly logger reminder
  scheduleHourlyLogReminder(): void {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    this.scheduleNotification(
      'hourly_log_reminder',
      nextHour,
      '📝 Hourly Log Reminder',
      'What did you accomplish this hour?',
      { requireInteraction: false, url: '/' }
    );
  }

  // Water reminder
  scheduleWaterReminder(intervalMinutes: number = 90): void {
    const time = new Date();
    time.setMinutes(time.getMinutes() + intervalMinutes);

    this.scheduleNotification(
      'water_reminder',
      time,
      '💧 Hydration Reminder',
      'Time to drink some water!',
      { requireInteraction: false, url: '/' }
    );

    // Schedule next reminder
    setTimeout(() => {
      this.scheduleWaterReminder(intervalMinutes);
    }, intervalMinutes * 60 * 1000);
  }

  // Hyperfocus check-in
  scheduleHyperfocusCheckin(intervalMinutes: number = 90): void {
    const time = new Date();
    time.setMinutes(time.getMinutes() + intervalMinutes);

    this.scheduleNotification(
      'hyperfocus_checkin',
      time,
      '⚡ Hyperfocus Check-in',
      'You\'ve been focused for 90 minutes. Time for a break?',
      { requireInteraction: false, url: '/' }
    );

    // Schedule next check-in
    setTimeout(() => {
      this.scheduleHyperfocusCheckin(intervalMinutes);
    }, intervalMinutes * 60 * 1000);
  }

  // Movement break
  scheduleMovementBreak(intervalMinutes: number = 120): void {
    const time = new Date();
    time.setMinutes(time.getMinutes() + intervalMinutes);

    this.scheduleNotification(
      'movement_break',
      time,
      '🏃 Movement Break',
      'Stand up and stretch for 2 minutes!',
      { requireInteraction: false, url: '/' }
    );

    // Schedule next break
    setTimeout(() => {
      this.scheduleMovementBreak(intervalMinutes);
    }, intervalMinutes * 60 * 1000);
  }

  // Meal reminders
  scheduleMealReminders(): void {
    const today = new Date();

    // Lunch reminder
    this.scheduleTimeBasedNotification(
      'meal_lunch',
      today,
      12,
      0,
      '🍽️ Lunch Time',
      'Have you eaten? ADHD brains need fuel.',
      { requireInteraction: false, url: '/' }
    );

    // Dinner reminder
    this.scheduleTimeBasedNotification(
      'meal_dinner',
      today,
      18,
      0,
      '🍽️ Dinner Time',
      'Time to eat dinner. Don\'t skip meals!',
      { requireInteraction: false, url: '/' }
    );
  }

  // Medication reminder
  scheduleMedicationReminder(time: string): void {
    const [hour, minute] = time.split(':').map(Number);
    const today = new Date();

    this.scheduleTimeBasedNotification(
      'medication_reminder',
      today,
      hour,
      minute,
      '💊 Medication Reminder',
      'Time to take your medication.',
      { requireInteraction: true, url: '/' }
    );
  }

  // Morning motivation
  scheduleMorningMotivation(): void {
    const today = new Date();

    this.scheduleTimeBasedNotification(
      'morning_motivation',
      today,
      7,
      0,
      '🎯 Good Morning!',
      'Tasks are waiting. Which one will you tackle first?',
      { requireInteraction: false, url: '/tasks' }
    );
  }

  // End of day reflection
  scheduleEndOfDayReflection(): void {
    const today = new Date();

    this.scheduleTimeBasedNotification(
      'end_of_day_reflection',
      today,
      20,
      0,
      '✨ End-of-Day Reflection',
      'Log your wins for today before shutdown.',
      { requireInteraction: false, url: '/' }
    );
  }

  // Energy check
  scheduleEnergyCheck(): void {
    const today = new Date();

    this.scheduleTimeBasedNotification(
      'energy_check_afternoon',
      today,
      14,
      0,
      '⚡ Energy Check',
      'How\'s your energy? Take a quick mood check-in.',
      { requireInteraction: false, url: '/' }
    );

    this.scheduleTimeBasedNotification(
      'energy_check_evening',
      today,
      19,
      0,
      '⚡ Energy Check',
      'Evening energy check. How are you feeling?',
      { requireInteraction: false, url: '/' }
    );
  }

  // Buddy check-in reminder
  async scheduleBuddyCheckinReminder(): Promise<void> {
    // Check for pending check-ins
    try {
      const response = await fetch('/api/buddy-checkins?status=pending');
      const data = await response.json();

      if (data.pending && data.pending.length > 0) {
        this.showNotification(
          '👥 Accountability Buddy',
          {
            body: `${data.pending.length} check-in${data.pending.length > 1 ? 's' : ''} waiting for response!`,
            tag: 'buddy_checkin_reminder',
            requireInteraction: false,
            url: '/'
          }
        );
      }
    } catch (error) {
      console.error('Failed to check buddy checkins:', error);
    }
  }

  // Streak alert
  async scheduleStreakAlert(): Promise<void> {
    // Check for streaks at risk
    try {
      const response = await fetch('/api/streaks');
      const data = await response.json();

      // Check if user hasn't checked in today
      const today = new Date().toISOString().split('T')[0];
      const lastCheckin = data.streaks?.[0]?.last_check_in;

      if (lastCheckin !== today) {
        const streak = data.streaks?.[0]?.current_count || 0;
        if (streak > 0) {
          this.showNotification(
            '🔥 Streak Alert!',
            {
              body: `Don't break your ${streak}-day streak! Check in now.`,
              tag: 'streak_alert',
              requireInteraction: false,
              url: '/'
            }
          );
        }
      }
    } catch (error) {
      console.error('Failed to check streaks:', error);
    }
  }

  // Task completion celebration
  celebrateTaskCompletion(tasksCompleted: number): void {
    const messages = [
      '🎉 Great job! That\'s progress!',
      '✨ You\'re on fire today!',
      '🚀 Momentum building!',
      '💪 Keep crushing it!',
      '⭐ You\'re doing amazing!'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    this.showNotification(
      'Task Complete!',
      {
        body: `${message} (${tasksCompleted} tasks today)`,
        tag: 'task_celebration',
        requireInteraction: false
      }
    );
  }

  // Abandoned project nudge
  async scheduleAbandonedProjectNudge(): Promise<void> {
    try {
      const response = await fetch('/api/abandoned-projects');
      const data = await response.json();

      const abandoned = data.projects?.filter((p: any) => p.days_abandoned > 14);

      if (abandoned && abandoned.length > 0) {
        const project = abandoned[0];
        this.showNotification(
          '🚀 Abandoned Project',
          {
            body: `"${project.name}" hasn't been touched in ${project.days_abandoned} days. Revive it?`,
            tag: 'abandoned_project_nudge',
            requireInteraction: false,
            url: '/projects'
          }
        );
      }
    } catch (error) {
      console.error('Failed to check abandoned projects:', error);
    }
  }

  // Quick win opportunity
  async scheduleQuickWinOpportunity(): Promise<void> {
    // Suggest a quick task when user has free time
    this.showNotification(
      '⚡ Quick Win Opportunity',
      {
        body: 'You have 15 minutes free - grab a quick task?',
        tag: 'quick_win',
        requireInteraction: false,
        url: '/tasks'
      }
    );
  }

  // Schedule all notifications based on preferences
  async scheduleAllNotifications(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      const prefs: Record<string, any> = {};
      data.preferences.forEach((pref: any) => {
        prefs[pref.notification_type] = pref;
      });

      // Schedule each type if enabled
      if (prefs['routine_stop_work']?.enabled) {
        this.scheduleRoutineNotifications();
      }

      if (prefs['water_reminder']?.enabled) {
        const interval = prefs['water_reminder'].interval_minutes || 90;
        this.scheduleWaterReminder(interval);
      }

      if (prefs['hourly_log']?.enabled) {
        this.scheduleHourlyLogReminder();
      }

      if (prefs['microbreak_reminder']?.enabled) {
        const interval = prefs['microbreak_reminder'].interval_minutes || 120;
        this.scheduleMicrobreakReminder(interval);
      }

      if (prefs['hyperfocus_checkin']?.enabled) {
        const interval = prefs['hyperfocus_checkin'].interval_minutes || 90;
        this.scheduleHyperfocusCheckin(interval);
      }

      if (prefs['movement_break']?.enabled) {
        const interval = prefs['movement_break'].interval_minutes || 120;
        this.scheduleMovementBreak(interval);
      }

      if (prefs['meal_reminder']?.enabled) {
        this.scheduleMealReminders();
      }

      if (prefs['medication_reminder']?.enabled && prefs['medication_reminder'].custom_time) {
        this.scheduleMedicationReminder(prefs['medication_reminder'].custom_time);
      }

      if (prefs['morning_motivation']?.enabled) {
        this.scheduleMorningMotivation();
      }

      if (prefs['end_of_day_reflection']?.enabled) {
        this.scheduleEndOfDayReflection();
      }

      if (prefs['energy_check']?.enabled) {
        this.scheduleEnergyCheck();
      }

      if (prefs['buddy_checkin_reminder']?.enabled) {
        // Check every hour for pending buddy checkins
        setInterval(() => this.scheduleBuddyCheckinReminder(), 60 * 60 * 1000);
      }

      if (prefs['streak_alert']?.enabled) {
        // Check for streak risks every 4 hours
        setInterval(() => this.scheduleStreakAlert(), 4 * 60 * 60 * 1000);
      }

      if (prefs['abandoned_project_nudge']?.enabled) {
        // Check weekly
        setInterval(() => this.scheduleAbandonedProjectNudge(), 7 * 24 * 60 * 60 * 1000);
      }

    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationManager = NotificationManager.getInstance();
