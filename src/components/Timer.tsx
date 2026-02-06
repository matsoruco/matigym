import { useTimer } from '../hooks/useTimer';

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  size?: 'small' | 'large';
}

export const Timer = ({ initialSeconds, onComplete, size = 'small' }: TimerProps) => {
  const { seconds, isRunning, isComplete, start, pause, reset, formatTime } = useTimer(
    initialSeconds,
    onComplete
  );

  const sizeClasses = size === 'large' ? 'text-5xl font-light font-mono' : 'text-2xl font-light font-mono';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses} ${isComplete ? 'text-green-medium' : 'text-green-darkest'}`}>
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-medium text-white rounded-lg text-sm font-medium active:bg-green-dark hover:bg-green-dark transition-colors"
          >
            Iniciar
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
              className="px-4 py-2 bg-green-light text-white rounded-lg text-sm font-medium active:bg-green-mediumLight hover:bg-green-mediumLight transition-colors"
          >
            Pausar
          </button>
        )}
        {(isComplete || seconds < initialSeconds) && (
          <button
            onClick={() => reset()}
              className="px-4 py-2 bg-green-lightest text-green-medium rounded-lg text-sm font-medium active:bg-green-light hover:bg-green-light transition-colors border border-green-light"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
