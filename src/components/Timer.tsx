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
      <div className={`${sizeClasses} ${isComplete ? 'text-green-medium dark:text-green-light' : 'text-green-darkest dark:text-white'}`}>
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-medium dark:bg-green-dark text-white rounded-lg text-sm font-medium active:bg-green-dark dark:active:bg-green-darkest hover:bg-green-dark dark:hover:bg-green-darkest transition-colors"
          >
            Iniciar
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
              className="px-4 py-2 bg-green-light dark:bg-green-medium text-white rounded-lg text-sm font-medium active:bg-green-mediumLight dark:active:bg-green-medium hover:bg-green-mediumLight dark:hover:bg-green-medium transition-colors"
          >
            Pausar
          </button>
        )}
        {(isComplete || seconds < initialSeconds) && (
          <button
            onClick={() => reset()}
              className="px-4 py-2 bg-green-lightest dark:bg-gray-700 text-green-medium dark:text-green-light rounded-lg text-sm font-medium active:bg-green-light dark:active:bg-gray-600 hover:bg-green-light dark:hover:bg-gray-600 transition-colors border border-green-light dark:border-green-medium"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
