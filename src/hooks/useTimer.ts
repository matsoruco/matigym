import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds: number | null, onComplete?: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete]);

  const start = () => {
    if (seconds > 0) {
      setIsRunning(true);
      setIsComplete(false);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = (newSeconds?: number) => {
    setIsRunning(false);
    setIsComplete(false);
    setSeconds(newSeconds !== undefined ? newSeconds : (initialSeconds || 0));
  };

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    formatTime,
  };
};
