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
    <div className="flex flex-col items-center gap-3 p-4 bg-green-lightest rounded-lg border border-green-light">
      <div className="text-xs font-medium text-green-mediumLight uppercase tracking-wide">
        Ronda {currentRound} / {totalRounds}
      </div>
      <div
        className={`text-5xl font-light font-mono ${
          isWorking ? 'text-green-dark' : 'text-green-medium'
        } ${isComplete ? 'text-green-medium' : ''}`}
      >
        {formatTime(seconds)}
      </div>
      <div className="text-sm font-medium text-green-mediumLight uppercase tracking-wide">
        {isComplete ? 'Completado' : isWorking ? 'Trabajo' : 'Descanso'}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-dark text-white rounded-lg text-sm font-medium active:bg-green-darker hover:bg-green-darker transition-colors"
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
        {(isComplete || currentRound > 1 || seconds < workSeconds) && (
          <button
            onClick={reset}
              className="px-4 py-2 bg-green-lightest text-green-medium rounded-lg text-sm font-medium active:bg-green-light hover:bg-green-light transition-colors border border-green-light"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
