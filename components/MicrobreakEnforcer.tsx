'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coffee, Play, CheckCircle, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface Microbreak {
  id: number;
  started_at: string;
  duration_minutes: number;
  break_type: string;
  status: string;
}

const BREAK_TYPES = [
  { value: 'stretch', label: 'Stretch Break', duration: 5, icon: '🧘' },
  { value: 'eyes', label: 'Eye Rest', duration: 2, icon: '👀' },
  { value: 'walk', label: 'Quick Walk', duration: 10, icon: '🚶' },
  { value: 'hydrate', label: 'Hydration', duration: 3, icon: '💧' },
  { value: 'breathe', label: 'Deep Breathing', duration: 5, icon: '🫁' }
];

const MINI_GAMES = ['breathing', 'colors', 'math', 'memory'];

export default function MicrobreakEnforcer() {
  const [activeBreak, setActiveBreak] = useState<Microbreak | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreakStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeBreak && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleBreakComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeBreak, timeRemaining]);

  const fetchBreakStatus = async () => {
    try {
      const res = await fetch('/api/microbreaks');
      const data = await res.json();

      if (data.activeBreak) {
        setActiveBreak(data.activeBreak);
        const startedAt = new Date(data.activeBreak.started_at);
        const durationMs = data.activeBreak.duration_minutes * 60 * 1000;
        const elapsed = Date.now() - startedAt.getTime();
        const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
        setTimeRemaining(remaining);
      }
    } catch (error) {
      console.error('Failed to fetch break status');
    } finally {
      setLoading(false);
    }
  };

  const startBreak = async (breakType: string, duration: number) => {
    try {
      const res = await fetch('/api/microbreaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, breakType })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setActiveBreak(data.microbreak);
        setTimeRemaining(duration * 60);
        setShowGamePicker(true);
      }
    } catch (error) {
      toast.error('Failed to start break');
    }
  };

  const handleBreakComplete = async () => {
    if (!activeBreak) return;

    try {
      const res = await fetch('/api/microbreaks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBreak.id,
          gamePlayed: currentGame,
          gameScore,
          notes: 'Completed via enforcer'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (data.shouldCelebrate) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
        }
        setActiveBreak(null);
        setCurrentGame(null);
        setGameScore(0);
        setShowGamePicker(false);
      }
    } catch (error) {
      toast.error('Failed to complete break');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Coffee className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Microbreak Enforcer</h2>
            <p className="text-sm text-muted-foreground">Take breaks to stay fresh</p>
          </div>
        </div>
      </div>

      {!activeBreak ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose a break type to start your microbreak:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BREAK_TYPES.map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startBreak(type.value, type.duration)}
                className="p-4 bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-all"
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-card-foreground">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.duration} min</div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timer */}
          <div className="text-center">
            <div className="text-6xl font-bold text-orange-500 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {activeBreak.break_type} Break
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{
                width: `${(timeRemaining / (activeBreak.duration_minutes * 60)) * 100}%`
              }}
              className="h-full bg-gradient-to-r from-orange-500 to-purple-500"
            />
          </div>

          {/* Game picker or active game */}
          <AnimatePresence mode="wait">
            {showGamePicker && !currentGame ? (
              <motion.div
                key="game-picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-muted/30 rounded-lg"
              >
                <p className="text-sm font-medium mb-3">Want to play a mini-game?</p>
                <div className="grid grid-cols-2 gap-2">
                  {MINI_GAMES.map((game) => (
                    <Button
                      key={game}
                      onClick={() => {
                        setCurrentGame(game);
                        setShowGamePicker(false);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {game.charAt(0).toUpperCase() + game.slice(1)}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setShowGamePicker(false)}
                    size="sm"
                    variant="ghost"
                    className="col-span-2"
                  >
                    Skip Games
                  </Button>
                </div>
              </motion.div>
            ) : currentGame ? (
              <motion.div
                key="game"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MiniGame
                  game={currentGame}
                  onComplete={(score) => {
                    setGameScore(score);
                    toast.success(`Game complete! Score: ${score}`);
                  }}
                  onClose={() => setCurrentGame(null)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Complete button */}
          <Button
            onClick={handleBreakComplete}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Break
          </Button>
        </div>
      )}
    </div>
  );
}

// Mini Game Component
function MiniGame({
  game,
  onComplete,
  onClose
}: {
  game: string;
  onComplete: (score: number) => void;
  onClose: () => void;
}) {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    // Initialize game state based on game type
    if (game === 'breathing') {
      setGameState({ phase: 'inhale', count: 0, maxCount: 4 });
    } else if (game === 'colors') {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
      setGameState({
        targetColor: colors[Math.floor(Math.random() * colors.length)],
        colors,
        attempts: 0
      });
    } else if (game === 'math') {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setGameState({ num1, num2, answer: '', correct: 0, total: 0 });
    }
  }, [game]);

  const handleBreathingComplete = () => {
    const completionScore = Math.min(100, (gameState.count / gameState.maxCount) * 100);
    setScore(completionScore);
    onComplete(completionScore);
  };

  if (game === 'breathing' && gameState) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-4">Breathing Exercise</h3>
        <motion.div
          animate={{
            scale: gameState.phase === 'inhale' ? 1.5 : 1,
          }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-500/30"
        />
        <p className="text-2xl font-bold mb-2 capitalize">{gameState.phase}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Cycles: {gameState.count}/{gameState.maxCount}
        </p>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              const newCount = gameState.count + 1;
              setGameState({ ...gameState, count: newCount });
              if (newCount >= gameState.maxCount) {
                handleBreathingComplete();
              }
            }}
            className="flex-1"
          >
            Complete Cycle
          </Button>
          <Button onClick={onClose} variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (game === 'colors' && gameState) {
    return (
      <div className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Color Match</h3>
        <p className="text-center mb-4">Click the <span className="font-bold">{gameState.targetColor}</span> box!</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {gameState.colors.map((color: string) => (
            <button
              key={color}
              onClick={() => {
                const isCorrect = color === gameState.targetColor;
                const newScore = isCorrect ? 100 : 50;
                setScore(newScore);
                onComplete(newScore);
              }}
              className="h-16 rounded-lg border-2 border-border hover:border-primary transition-all"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Button onClick={onClose} variant="ghost" className="w-full">
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-muted/30 rounded-lg text-center">
      <p>Game: {game}</p>
      <Button onClick={() => onComplete(75)} className="mt-4">
        Complete
      </Button>
    </div>
  );
}
