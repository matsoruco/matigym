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
      <div className={`${sizeClasses} ${isComplete ? 'text-green-mediumtext-green-light' : 'text-green-darkesttext-white'}`}>
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-mediumbg-green-dark text-white rounded-lg text-sm font-medium active:bg-green-darkactive:bg-green-darkest hover:bg-green-darkhover:bg-green-darkest transition-colors"
          >
            Iniciar
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
              className="px-4 py-2 bg-green-lightbg-green-medium text-white rounded-lg text-sm font-medium active:bg-green-mediumLightactive:bg-green-medium hover:bg-green-mediumLighthover:bg-green-medium transition-colors"
          >
            Pausar
          </button>
        )}
        {(isComplete || seconds < initialSeconds) && (
          <button
            onClick={() => reset()}
              className="px-4 py-2 bg-green-lightestbg-gray-700 text-green-mediumtext-green-light rounded-lg text-sm font-medium active:bg-green-lightactive:bg-gray-600 hover:bg-green-lighthover:bg-gray-600 transition-colors border border-green-lightborder-green-medium"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
