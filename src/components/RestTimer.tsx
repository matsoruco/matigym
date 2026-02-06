import { useTimer } from '../hooks/useTimer';

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  onClose: () => void;
}

export const RestTimer = ({ seconds, onComplete, onClose }: RestTimerProps) => {
  const { seconds: remaining, isRunning, isComplete, start, pause, reset, formatTime } = useTimer(
    seconds,
    onComplete
  );

  if (isComplete) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-slide-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-green-medium dark:border-green-light p-4 min-w-[220px]">
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-2 font-mono ${
            isRunning ? 'text-green-medium dark:text-green-light' : 'text-green-mediumLight dark:text-green-mediumLight'
          }`}>
            {formatTime(remaining)}
          </div>
          <div className="text-xs font-bold text-green-medium dark:text-green-light uppercase tracking-wider bg-green-lightest dark:bg-green-dark px-3 py-1 rounded-full inline-block">
            Descanso
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {!isRunning && remaining === seconds && (
            <button
              onClick={start}
              className="w-full px-4 py-2.5 bg-green-medium text-white rounded-lg text-sm font-semibold active:bg-green-dark hover:bg-green-dark transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-dark"
            >
              ▶ Iniciar
            </button>
          )}
          
          {isRunning && (
            <button
              onClick={pause}
              className="w-full px-4 py-2.5 bg-green-light dark:bg-green-medium text-white rounded-lg text-sm font-semibold active:bg-green-mediumLight dark:active:bg-green-medium hover:bg-green-mediumLight dark:hover:bg-green-medium transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-medium dark:border-green-light"
            >
              ⏸ Pausar
            </button>
          )}
          
          {!isRunning && remaining < seconds && (
            <button
              onClick={start}
              className="w-full px-4 py-2.5 bg-green-medium text-white rounded-lg text-sm font-semibold active:bg-green-dark hover:bg-green-dark transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-dark"
            >
              ▶ Reanudar
            </button>
          )}
          
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                reset();
                onComplete();
              }}
              className="flex-1 px-3 py-2 bg-green-lightest dark:bg-green-dark text-green-medium dark:text-green-light rounded-lg text-xs font-semibold active:bg-green-light dark:active:bg-gray-700 hover:bg-green-light dark:hover:bg-gray-600 transition-all border border-green-light dark:border-green-medium hover:border-green-medium dark:hover:border-green-light"
            >
              ↻ Reset
            </button>
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border-2 border-green-mediumLight dark:border-green-medium text-green-medium dark:text-green-light rounded-lg text-xs font-semibold active:bg-green-pale dark:active:bg-gray-600 hover:bg-green-pale dark:hover:bg-gray-600 transition-all hover:border-green-medium dark:hover:border-green-light"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
