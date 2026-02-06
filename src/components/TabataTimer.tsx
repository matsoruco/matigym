import { useTabata } from '../hooks/useTabata';

interface TabataTimerProps {
  workSeconds: number;
  restSeconds?: number;
  rounds?: number;
}

export const TabataTimer = ({ workSeconds, restSeconds = 10, rounds = 8 }: TabataTimerProps) => {
  const {
    currentRound,
    totalRounds,
    seconds,
    isWorking,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    formatTime,
  } = useTabata(workSeconds, restSeconds, rounds);

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-green-lightest dark:bg-gray-700 rounded-lg border border-green-light dark:border-green-medium">
      <div className="text-xs font-medium text-green-mediumLight dark:text-green-mediumLight uppercase tracking-wide">
        Ronda {currentRound} / {totalRounds}
      </div>
      <div
        className={`text-5xl font-light font-mono ${
          isWorking ? 'text-green-dark dark:text-green-light' : 'text-green-medium dark:text-green-light'
        } ${isComplete ? 'text-green-medium dark:text-green-light' : ''}`}
      >
        {formatTime(seconds)}
      </div>
      <div className="text-sm font-medium text-green-mediumLight dark:text-green-mediumLight uppercase tracking-wide">
        {isComplete ? 'Completado' : isWorking ? 'Trabajo' : 'Descanso'}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-dark dark:bg-green-darkest text-white rounded-lg text-sm font-medium active:bg-green-darker dark:active:bg-green-darkest hover:bg-green-darker dark:hover:bg-green-darkest transition-colors"
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
        {(isComplete || currentRound > 1 || seconds < workSeconds) && (
          <button
            onClick={reset}
              className="px-4 py-2 bg-green-lightest dark:bg-gray-600 text-green-medium dark:text-green-light rounded-lg text-sm font-medium active:bg-green-light dark:active:bg-gray-500 hover:bg-green-light dark:hover:bg-gray-500 transition-colors border border-green-light dark:border-green-medium"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
