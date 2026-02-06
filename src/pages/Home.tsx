import { Link, useNavigate } from 'react-router-dom';
import { Routine } from '../types';
import { loadRoutine, saveRoutine, clearAllData, exportAllData, importAllData } from '../utils/storage';
import { useEffect, useState, useRef } from 'react';
import { parseCSV } from '../utils/csvParser';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { Popup } from '../components/Popup';

export const Home = () => {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = loadRoutine();
    if (stored) {
      setRoutine(stored);
    }
  }, []);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedRoutine = parseCSV(text);
      
      parsedRoutine.days.forEach(day => {
        day.exercises.forEach(ex => {
          if (!ex.sets || ex.sets.length === 0) {
            ex.sets = [{ reps: 0, completed: false }];
          }
        });
      });
      
      saveRoutine(parsedRoutine);
      setRoutine(parsedRoutine);
      setPopupMessage('Rutina importada correctamente');
      setPopupType('success');
      setShowPopup(true);
    } catch (error) {
      console.error('Error al importar CSV:', error);
      setPopupMessage('Error al importar el archivo CSV. Verifica el formato.');
      setPopupType('error');
      setShowPopup(true);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const numDays = routine?.days.length || 0;

  const handleDeleteData = () => {
    clearAllData();
    setRoutine(null);
    setShowDeleteModal(false);
    setPopupMessage('Todos los datos han sido borrados');
    setPopupType('success');
    setShowPopup(true);
  };

  const handleExportData = () => {
    const jsonData = exportAllData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    link.download = `mati-gym-backup-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setPopupMessage('Datos exportados correctamente');
    setPopupType('success');
    setShowPopup(true);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importAllData(text);
      
      if (success) {
        const stored = loadRoutine();
        setRoutine(stored);
        setPopupMessage('Datos importados correctamente');
        setPopupType('success');
        setShowPopup(true);
      } else {
        setPopupMessage('Error al importar el archivo JSON. Verifica el formato.');
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error al importar JSON:', error);
      setPopupMessage('Error al importar el archivo JSON. Verifica el formato.');
      setPopupType('error');
      setShowPopup(true);
    }
    
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupType === 'success' ? 'Éxito' : popupType === 'error' ? 'Error' : 'Información'}
        type={popupType}
      >
        {popupMessage}
      </Popup>

      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteData}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Logo y título */}
        <div className="text-center mb-6 relative">
          {/* Botones de acción - esquina superior derecha */}
          <div className="absolute top-0 right-0 flex items-center gap-1">
            {/* Botón de importar/exportar JSON */}
            <div className="relative group">
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="json-import"
              />
              <button
                onClick={handleExportData}
                className="text-green-mediumLight hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg relative"
                aria-label="Exportar datos"
                title="Exportar backup JSON"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => document.getElementById('json-import')?.click()}
                className="text-green-mediumLight hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg"
                aria-label="Importar datos"
                title="Importar backup JSON"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>
            {/* Botón de borrar datos */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-green-mediumLight hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg"
              aria-label="Borrar datos"
              title="Borrar todos los datos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-medium to-green-dark rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          {/* Título */}
          <h1 className="text-3xl font-bold text-green-darkest mb-1">Mati Gym</h1>
          {routine && numDays > 0 && (
            <h2 className="text-base font-semibold text-green-medium">Rutina</h2>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mb-6 space-y-3">
          {/* Botón de importar - solo visible cuando no hay rutina */}
          {(!routine || !routine.days || routine.days.length === 0) && (
            <label className="block w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full px-6 py-4 border-2 border-dashed border-green-medium rounded-xl text-center cursor-pointer hover:bg-green-lightest hover:border-green-dark transition-all active:scale-[0.98] shadow-sm hover:shadow-md">
                <div className="flex items-center justify-center gap-2 text-green-medium font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Importar Rutina CSV</span>
                </div>
              </div>
            </label>
          )}

          {/* Botones cuando hay rutina */}
          {routine && routine.days.length > 0 && (
            <>
              <button
                onClick={() => navigate('/my-workout')}
                className="w-full px-6 py-4 bg-green-medium text-white rounded-xl text-center cursor-pointer hover:bg-green-dark transition-all active:scale-[0.98] font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Mi Entrenamiento</span>
              </button>
              <button
                onClick={() => navigate('/edit-routine')}
                className="w-full px-6 py-4 bg-white border-2 border-green-medium text-green-medium rounded-xl text-center cursor-pointer hover:bg-green-lightest transition-all active:scale-[0.98] font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar Rutina</span>
              </button>
            </>
          )}
        </div>

        {/* Lista de días */}
        {routine && routine.days.length > 0 && (
          <div className="space-y-3">
            {routine.days.map((day) => (
              <Link
                key={day.day}
                to={`/workout/${day.day}`}
                className="block bg-white rounded-xl p-4 hover:bg-green-lightest transition-all active:scale-[0.98] border-2 border-green-light hover:border-green-medium shadow-sm hover:shadow-lg animate-slide-in"
                style={{ animationDelay: `${(day.day - 1) * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Badge circular mejorado */}
                  <div className="w-14 h-14 bg-gradient-to-br from-green-medium to-green-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-xl">{day.day}</span>
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="font-bold text-green-darkest mb-1 text-lg">Dia {day.day}</div>
                    <div className="text-sm font-medium text-green-medium mb-2">{day.focus}</div>
                    <div className="flex items-center gap-1 text-xs font-medium text-green-mediumLight bg-green-lightest px-2.5 py-1 rounded-full inline-flex">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{day.exercises.length} ejercicios</span>
                    </div>
                  </div>
                  
                  {/* Flecha */}
                  <div className="text-green-medium">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
