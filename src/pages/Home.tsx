import { Link, useNavigate } from 'react-router-dom';
import { Routine } from '../types';
import { loadRoutine, saveRoutine } from '../utils/storage';
import { useEffect, useState, useRef } from 'react';
import { parseCSV } from '../utils/csvParser';

export const Home = () => {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('Rutina importada correctamente');
    } catch (error) {
      console.error('Error al importar CSV:', error);
      alert('Error al importar el archivo CSV. Verifica el formato.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const numDays = routine?.days.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-medium rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-darkest mb-2">Mati Gym</h1>
          {routine && numDays > 0 && (
            <h2 className="text-base font-semibold text-green-medium">Rutina</h2>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mb-8 space-y-3">
          <label className="block w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-full px-6 py-4 border-2 border-dashed border-green-medium rounded-lg text-center cursor-pointer hover:bg-green-lightest hover:border-green-dark transition-all active:scale-[0.98]">
              <div className="flex items-center justify-center gap-2 text-green-medium font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Importar Rutina CSV</span>
              </div>
            </div>
          </label>

          {routine && routine.days.length > 0 && (
            <button
              onClick={() => navigate('/edit-routine')}
              className="w-full px-6 py-4 bg-green-medium text-white rounded-lg text-center cursor-pointer hover:bg-green-dark transition-all active:scale-[0.98] font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar Rutina</span>
            </button>
          )}
        </div>

        {/* Lista de días */}
        {routine && routine.days.length > 0 && (
          <div className="space-y-3">
            {routine.days.map((day) => (
              <Link
                key={day.day}
                to={`/workout/${day.day}`}
                className="block bg-white rounded-lg p-4 hover:bg-green-lightest transition-all active:scale-[0.98] border-2 border-green-light hover:border-green-medium shadow-sm hover:shadow-md animate-slide-in"
                style={{ animationDelay: `${(day.day - 1) * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Badge circular */}
                  <div className="w-12 h-12 bg-green-medium rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-xl">{day.day}</span>
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="font-bold text-green-darkest mb-1 text-lg">Dia {day.day}</div>
                    <div className="text-sm font-medium text-green-medium mb-2">{day.focus}</div>
                    <div className="flex items-center gap-1 text-xs font-medium text-green-mediumLight bg-green-lightest px-2 py-1 rounded-full inline-flex">
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

        {/* Mensaje si no hay rutina */}
        {!routine && (
          <div className="text-center text-green-mediumLight mt-12">
            <p className="text-sm font-medium">Importa un archivo CSV para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};
