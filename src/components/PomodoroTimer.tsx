import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/db";

export const PomodoroTimer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getSettings().then(s => {
      setMinutes(s.pomodoroMinutes);
      setStreak(s.writingStreak);
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          if (minutes === 0) {
            setRunning(false);
            return 0;
          }
          setMinutes(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, minutes]);

  const reset = useCallback(() => {
    getSettings().then(s => {
      setMinutes(s.pomodoroMinutes);
      setSeconds(0);
      setRunning(false);
    });
  }, []);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full glass hover:border-primary/30 transition-all z-40"
        title="Focus Timer"
      >
        <Timer size={18} className="text-primary" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 glass rounded-2xl p-5 z-40 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">Focus Timer</span>
        <button onClick={() => setExpanded(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="text-center">
        <p className="text-3xl font-mono font-bold text-foreground">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <button onClick={() => setRunning(!running)} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all">
            {running ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={reset} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all">
            <RotateCcw size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">🔥 {streak} day writing streak</p>
      </div>
    </div>
  );
};
