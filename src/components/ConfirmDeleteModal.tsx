import { useState } from 'react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal = ({ onConfirm, onCancel }: ConfirmDeleteModalProps) => {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText.trim().toUpperCase() === 'CONFIRMO') {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 animate-slide-in border border-green-light">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-green-darkest mb-2">
            ¿Borrar todos los datos?
          </h2>
          <p className="text-sm text-green-mediumLight mb-4">
            Esta acción eliminará toda la rutina y el historial de entrenamientos. Esta acción no se puede deshacer.
          </p>
          <p className="text-xs font-semibold text-green-darkest mb-2">
            Escribe <span className="text-green-medium">CONFIRMO</span> para continuar:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border-2 border-green-light rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-medium focus:border-green-medium"
            placeholder="Escribe CONFIRMO aquí"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && confirmText.trim().toUpperCase() === 'CONFIRMO') {
                handleConfirm();
              }
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white border border-green-light text-green-medium rounded text-sm font-semibold hover:bg-green-lightest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText.trim().toUpperCase() !== 'CONFIRMO'}
            className={`flex-1 px-4 py-2 rounded text-sm font-semibold transition-colors ${
              confirmText.trim().toUpperCase() === 'CONFIRMO'
                ? 'bg-green-medium text-white hover:bg-green-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
};
