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
      <div className="bg-whitebg-gray-800 rounded-xl shadow-2xl border-2 border-green-mediumborder-green-light p-4 min-w-[220px]">
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-2 font-mono ${
            isRunning ? 'text-green-mediumtext-green-light' : 'text-green-mediumLighttext-green-mediumLight'
          }`}>
            {formatTime(remaining)}
          </div>
          <div className="text-xs font-bold text-green-mediumtext-green-light uppercase tracking-wider bg-green-lightestbg-green-dark px-3 py-1 rounded-full inline-block">
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
              className="w-full px-4 py-2.5 bg-green-lightbg-green-medium text-white rounded-lg text-sm font-semibold active:bg-green-mediumLightactive:bg-green-medium hover:bg-green-mediumLighthover:bg-green-medium transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-mediumborder-green-light"
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
              className="flex-1 px-3 py-2 bg-green-lightestbg-green-dark text-green-mediumtext-green-light rounded-lg text-xs font-semibold active:bg-green-lightactive:bg-gray-700 hover:bg-green-lighthover:bg-gray-600 transition-all border border-green-lightborder-green-medium hover:border-green-mediumhover:border-green-light"
            >
              ↻ Reset
            </button>
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-whitebg-gray-700 border-2 border-green-mediumLightborder-green-medium text-green-mediumtext-green-light rounded-lg text-xs font-semibold active:bg-green-paleactive:bg-gray-600 hover:bg-green-palehover:bg-gray-600 transition-all hover:border-green-mediumhover:border-green-light"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
