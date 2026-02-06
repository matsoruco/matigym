import { useState, useEffect, useRef } from 'react';

export const useTabata = (workSeconds: number, restSeconds: number = 10, rounds: number = 8) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [seconds, setSeconds] = useState(workSeconds);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            // Cambiar entre trabajo y descanso
            if (isWorking) {
              setIsWorking(false);
              setSeconds(restSeconds);
            } else {
              // Terminar ronda
              setCurrentRound((round) => {
                if (round >= rounds) {
                  setIsRunning(false);
                  setIsComplete(true);
                  return rounds;
                }
                setIsWorking(true);
                setSeconds(workSeconds);
                return round + 1;
              });
            }
            return prev - 1;
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
  }, [isRunning, seconds, isWorking, workSeconds, restSeconds, rounds]);

  const start = () => {
    setIsRunning(true);
    setIsComplete(false);
    setIsWorking(true);
    setCurrentRound(1);
    setSeconds(workSeconds);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setIsWorking(true);
    setCurrentRound(1);
    setSeconds(workSeconds);
  };

  const formatTime = (secs: number): string => {
    return secs.toString().padStart(2, '0');
  };

  return {
    currentRound,
    totalRounds: rounds,
    seconds,
    isWorking,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    formatTime,
  };
};
