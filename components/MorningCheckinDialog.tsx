'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface MorningCheckinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: MorningCheckinData) => void;
}

export interface MorningCheckinData {
  phoneOutsideBedroom: boolean;
  actualBedtime: string;
  actualLightsOut: string;
  sleepQuality: number;
  stoppedWorkBy9pm: boolean;
  notes?: string;
}

export function MorningCheckinDialog({ isOpen, onClose, onComplete }: MorningCheckinDialogProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<MorningCheckinData>>({
    actualBedtime: '22:00',
    actualLightsOut: '22:00',
    sleepQuality: 3
  });

  const handleComplete = async () => {
    if (data.stoppedWorkBy9pm && data.phoneOutsideBedroom && data.sleepQuality && data.sleepQuality >= 4) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    onComplete(data as MorningCheckinData);
    onClose();
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">☀️ Good Morning!</h2>
          <Button onClick={onClose} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-base font-semibold block mb-3">
                  Did you stop working by 9:00 PM last night?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setData({ ...data, stoppedWorkBy9pm: true })}
                    variant={data.stoppedWorkBy9pm === true ? 'default' : 'outline'}
                  >
                    Yes ✅
                  </Button>
                  <Button
                    onClick={() => setData({ ...data, stoppedWorkBy9pm: false })}
                    variant={data.stoppedWorkBy9pm === false ? 'default' : 'outline'}
                  >
                    No ❌
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-base font-semibold block mb-3">
                  Did you charge your phone outside the bedroom?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setData({ ...data, phoneOutsideBedroom: true })}
                    variant={data.phoneOutsideBedroom === true ? 'default' : 'outline'}
                  >
                    Yes 📵
                  </Button>
                  <Button
                    onClick={() => setData({ ...data, phoneOutsideBedroom: false })}
                    variant={data.phoneOutsideBedroom === false ? 'default' : 'outline'}
                  >
                    No 📱
                  </Button>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Next →
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-base font-semibold block mb-2">
                  What time did you actually get in bed?
                </label>
                <input
                  type="time"
                  value={data.actualBedtime || '22:00'}
                  onChange={(e) => setData({ ...data, actualBedtime: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                />
                <p className="text-sm text-muted-foreground mt-1">Target: 10:00 PM</p>
              </div>

              <div>
                <label className="text-base font-semibold block mb-2">
                  What time did lights actually go out?
                </label>
                <input
                  type="time"
                  value={data.actualLightsOut || '22:00'}
                  onChange={(e) => setData({ ...data, actualLightsOut: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Difference = screen time in bed
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  ← Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next →
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-base font-semibold block mb-3">
                  How was your sleep quality?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      onClick={() => setData({ ...data, sleepQuality: rating })}
                      variant={data.sleepQuality === rating ? 'default' : 'outline'}
                      className="text-2xl aspect-square p-2"
                    >
                      {rating === 1 && '😫'}
                      {rating === 2 && '😴'}
                      {rating === 3 && '😐'}
                      {rating === 4 && '😊'}
                      {rating === 5 && '🌟'}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Terrible</span>
                  <span>Amazing</span>
                </div>
              </div>

              <div>
                <label className="text-base font-semibold block mb-2">
                  Any notes about last night? (optional)
                </label>
                <textarea
                  value={data.notes || ''}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="What helped or hurt your sleep?"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  ← Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete ✓
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
