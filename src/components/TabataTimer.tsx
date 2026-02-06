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
    <div className="flex flex-col items-center gap-3 p-4 bg-green-lightestbg-gray-700 rounded-lg border border-green-lightborder-green-medium">
      <div className="text-xs font-medium text-green-mediumLighttext-green-mediumLight uppercase tracking-wide">
        Ronda {currentRound} / {totalRounds}
      </div>
      <div
        className={`text-5xl font-light font-mono ${
          isWorking ? 'text-green-darktext-green-light' : 'text-green-mediumtext-green-light'
        } ${isComplete ? 'text-green-mediumtext-green-light' : ''}`}
      >
        {formatTime(seconds)}
      </div>
      <div className="text-sm font-medium text-green-mediumLighttext-green-mediumLight uppercase tracking-wide">
        {isComplete ? 'Completado' : isWorking ? 'Trabajo' : 'Descanso'}
      </div>
      <div className="flex gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
              className="px-4 py-2 bg-green-darkbg-green-darkest text-white rounded-lg text-sm font-medium active:bg-green-darkeractive:bg-green-darkest hover:bg-green-darkerhover:bg-green-darkest transition-colors"
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
        {(isComplete || currentRound > 1 || seconds < workSeconds) && (
          <button
            onClick={reset}
              className="px-4 py-2 bg-green-lightestbg-gray-600 text-green-mediumtext-green-light rounded-lg text-sm font-medium active:bg-green-lightactive:bg-gray-500 hover:bg-green-lighthover:bg-gray-500 transition-colors border border-green-lightborder-green-medium"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};
