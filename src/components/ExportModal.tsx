import { Routine } from '../types';
import { exportWorkoutJSON, exportWorkoutCSV, exportWorkoutMessage, shareWorkout } from '../utils/export';

interface ExportModalProps {
  day: number;
  routine: Routine;
  onClose: () => void;
}

export const ExportModal = ({ day, routine, onClose }: ExportModalProps) => {
  const handleExportMessage = () => {
    exportWorkoutMessage(day, routine);
    onClose();
  };

  const handleShare = async () => {
    const shared = await shareWorkout(day, routine);
    if (shared) {
      onClose();
    }
  };

  const handleExportJSON = () => {
    exportWorkoutJSON(day, routine);
    onClose();
  };

  const handleExportCSV = () => {
    exportWorkoutCSV(day, routine);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in border-2 border-green-light">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-darkest">
            Exportar Entrenamiento
          </h2>
          <button
            onClick={onClose}
            className="text-green-mediumLight hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Exportar como mensaje */}
          <button
            onClick={handleExportMessage}
            className="w-full px-6 py-4 bg-green-lightest border-2 border-green-light rounded-xl hover:bg-green-light hover:border-green-medium transition-all active:scale-[0.98] flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-green-medium rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-dark transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-green-darkest text-lg">
                Copiar al Portapapeles
              </div>
              <div className="text-sm text-green-mediumLight">
                Mensaje formateado listo para pegar
              </div>
            </div>
            <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Compartir */}
          <button
            onClick={handleShare}
            className="w-full px-6 py-4 bg-green-lightest border-2 border-green-light rounded-xl hover:bg-green-light hover:border-green-medium transition-all active:scale-[0.98] flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-green-medium rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-dark transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-green-darkest text-lg">
                Compartir
              </div>
              <div className="text-sm text-green-mediumLight">
                Compartir con otras apps
              </div>
            </div>
            <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Exportar JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full px-6 py-4 bg-green-lightest border-2 border-green-light rounded-xl hover:bg-green-light hover:border-green-medium transition-all active:scale-[0.98] flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-green-medium rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-dark transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-green-darkest text-lg">
                Exportar como JSON
              </div>
              <div className="text-sm text-green-mediumLight">
                Archivo JSON con todos los datos
              </div>
            </div>
            <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="w-full px-6 py-4 bg-green-lightest border-2 border-green-light rounded-xl hover:bg-green-light hover:border-green-medium transition-all active:scale-[0.98] flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-green-medium rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-dark transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-green-darkest text-lg">
                Exportar como CSV
              </div>
              <div className="text-sm text-green-mediumLight">
                Archivo CSV compatible con Excel
              </div>
            </div>
            <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
