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
  scheduleWaterReminder(intervalMinutes: number = 60): void {
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

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationManager = NotificationManager.getInstance();
