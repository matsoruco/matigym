import { ReactNode } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export const Popup = ({ isOpen, onClose, title, children, type = 'info' }: PopupProps) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: 'border-green-medium bg-green-lightest',
    success: 'border-green-medium bg-green-lightest',
    error: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
  };

  const iconColors = {
    info: 'text-green-medium',
    success: 'text-green-medium',
    error: 'text-red-500',
    warning: 'text-yellow-500',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-in border-2 ${typeStyles[type]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {type === 'success' && (
              <svg className={`w-6 h-6 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'error' && (
              <svg className={`w-6 h-6 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'warning' && (
              <svg className={`w-6 h-6 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === 'info' && (
              <svg className={`w-6 h-6 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h2 className="text-xl font-bold text-green-darkest">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-green-mediumLight hover:text-green-medium transition-colors p-1 hover:bg-green-lightest rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-green-darkest mb-4">
          {children}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-medium text-white rounded-lg text-sm font-semibold hover:bg-green-dark transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
