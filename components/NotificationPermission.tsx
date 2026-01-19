'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';
import { notificationManager } from '@/lib/notifications/manager';
import toast from 'react-hot-toast';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = notificationManager.isSupported();
    setIsSupported(supported);

    if (supported) {
      const currentPermission = notificationManager.getPermission();
      setPermission(currentPermission);

      // Show prompt if never asked before
      if (currentPermission === 'default') {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000); // Show after 5 seconds
      }

      // If granted, schedule routine notifications
      if (currentPermission === 'granted') {
        notificationManager.scheduleRoutineNotifications();
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    const result = await notificationManager.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Notifications enabled! You\'ll get routine reminders.');
      notificationManager.scheduleRoutineNotifications();
      setShowPrompt(false);
    } else if (result === 'denied') {
      toast.error('Notifications denied. Enable in browser settings to get reminders.');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showPrompt && permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 max-w-sm bg-card border border-border rounded-lg shadow-2xl p-4 z-50"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Enable Notifications?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get reminders to stop working at 9pm, no screens at 9:45pm, and wake-up alerts.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestPermission}
                    size="sm"
                    className="flex-1"
                  >
                    Enable
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = notificationManager.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(notificationManager.getPermission());
    }
  }, []);

  const handleToggle = async () => {
    if (permission === 'granted') {
      toast('Disable notifications in your browser settings', {
        icon: '⚙️'
      });
    } else {
      const result = await notificationManager.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notifications enabled!');
        notificationManager.scheduleRoutineNotifications();
      } else if (result === 'denied') {
        toast.error('Notifications denied. Check browser settings.');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleToggle}
      variant={permission === 'granted' ? 'default' : 'outline'}
      size="sm"
    >
      {permission === 'granted' ? (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Notifications On
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}
