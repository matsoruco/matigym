import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routine, Exercise, Set } from '../types';
import { loadRoutine, saveRoutine } from '../utils/storage';
import { exportRoutineCSV } from '../utils/exportRoutine';

type TimeUnit = 'reps' | 'minutes' | 'seconds';

interface EditableExercise extends Exercise {
  timeUnit: TimeUnit;
  timeValue: number; // valor numérico para minutos/segundos
}

export const EditRoutine = () => {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadRoutine();
    if (!stored) {
      alert('No hay rutina cargada');
      navigate('/');
      return;
    }
    setRoutine(stored);
  }, [navigate]);

  const updateExercise = (dayIndex: number, exerciseIndex: number, updates: Partial<EditableExercise>) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const exercise = updatedRoutine.days[dayIndex].exercises[exerciseIndex];
    
    // Aplicar actualizaciones básicas
    if (updates.name !== undefined) exercise.name = updates.name;
    if (updates.type !== undefined) exercise.type = updates.type;
    if (updates.sets_reps !== undefined) exercise.sets_reps = updates.sets_reps;
    
    // Si cambió sets_reps o timeUnit, recalcular sets y timer
    if (updates.sets_reps !== undefined || updates.timeUnit !== undefined || updates.timeValue !== undefined) {
      const timeUnit = (updates.timeUnit !== undefined ? updates.timeUnit : getTimeUnit(exercise)) as TimeUnit;
      const setsReps = updates.sets_reps !== undefined ? updates.sets_reps : exercise.sets_reps;
      
      if (timeUnit === 'reps') {
        // Parsear como reps usando el parser CSV
        const sets = parseSetsRepsForReps(setsReps);
        exercise.sets = sets;
        exercise.timer = null;
      } else {
        // Es tiempo (minutos o segundos)
        let timeValue: number;
        if (updates.timeValue !== undefined) {
          timeValue = updates.timeValue;
        } else {
          // Intentar extraer del sets_reps o usar el valor actual
          const extracted = extractTime(setsReps);
          timeValue = extracted > 0 ? extracted : (exercise.timer ? (exercise.timer >= 60 ? exercise.timer / 60 : exercise.timer) : 1);
        }
        
        const sets = parseSetsRepsForTime(setsReps);
        exercise.sets = sets;
        
        if (timeUnit === 'minutes') {
          exercise.timer = timeValue * 60;
        } else {
          exercise.timer = timeValue;
        }
      }
    }
    
    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const parseSetsRepsForReps = (setsReps: string): Set[] => {
    // Usar lógica similar al parser CSV pero solo para reps
    const sets: Set[] = [];
    const parts = setsReps.split(',').map(s => s.trim());
    
    for (const part of parts) {
      const match = part.match(/(\d+)x(\d+)/);
      if (match) {
        const numSets = parseInt(match[1], 10);
        const reps = parseInt(match[2], 10);
        for (let i = 0; i < numSets; i++) {
          sets.push({ reps, completed: false });
        }
      }
    }
    
    return sets.length > 0 ? sets : [{ reps: 0, completed: false }];
  };

  const parseSetsRepsForTime = (setsReps: string): Set[] => {
    // Extraer número de series para ejercicios con tiempo
    const seriesMatch = setsReps.match(/^(\d+)x/);
    const numSeries = seriesMatch ? parseInt(seriesMatch[1], 10) : 1;
    
    return Array(numSeries).fill(0).map(() => ({
      reps: 0,
      completed: false
    }));
  };

  const extractTime = (setsReps: string): number => {
    // Buscar números en el string
    const numbers = setsReps.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;
    
    // Si hay formato "4x45", tomar el segundo número (45)
    const match = setsReps.match(/(\d+)x(\d+)/);
    if (match) {
      return parseInt(match[2], 10);
    }
    
    // Si no, tomar el primer número encontrado
    return parseInt(numbers[0], 10);
  };

  const getTimeUnit = (exercise: Exercise): TimeUnit => {
    const setsReps = exercise.sets_reps.toLowerCase();
    if (setsReps.includes('min') || setsReps.includes('minuto')) return 'minutes';
    if (setsReps.includes('sec') || setsReps.includes('segundo') || setsReps.includes('"')) return 'seconds';
    if (exercise.timer && exercise.timer > 0) {
      return exercise.timer >= 60 ? 'minutes' : 'seconds';
    }
    return 'reps';
  };

  const getTimeValue = (exercise: Exercise): number => {
    if (exercise.timer) {
      return exercise.timer >= 60 ? exercise.timer / 60 : exercise.timer;
    }
    return extractTime(exercise.sets_reps);
  };

  const updateDayFocus = (dayIndex: number, focus: string) => {
    if (!routine) return;
    const updatedRoutine = { ...routine };
    updatedRoutine.days[dayIndex].focus = focus;
    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const handleExport = () => {
    if (!routine) return;
    exportRoutineCSV(routine);
  };

  if (!routine) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-white border-b border-green-light sticky top-0 z-40 shadow-sm">
        <div className="mx-auto px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-green-medium font-semibold text-xs active:opacity-70 hover:text-green-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-sm font-bold text-green-darkest">Editar Rutina</h1>
          <button
            onClick={handleExport}
            className="text-green-medium font-semibold text-xs active:opacity-70 hover:text-green-dark transition-colors"
          >
            Exportar
          </button>
        </div>
      </div>

      <div className="mx-auto px-3 py-3 max-w-2xl">
        {routine.days.map((day, dayIndex) => (
          <div key={day.day} className="mb-3 bg-white rounded-lg border border-green-light shadow-sm">
            {/* Header del día */}
            <div
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-8 h-8 bg-green-medium rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {day.day}
                  </span>
                  <input
                    type="text"
                    value={day.focus}
                    onChange={(e) => updateDayFocus(dayIndex, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-bold text-green-darkest border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-green-medium rounded px-1"
                    placeholder="Enfoque del día"
                  />
                </div>
                <div className="text-xs text-green-mediumLight ml-10">
                  {day.exercises.length} ejercicios
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-green-medium transition-transform ${
                  expandedDay === day.day ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Ejercicios del día */}
            {expandedDay === day.day && (
              <div className="border-t border-green-lightest">
                {day.exercises.map((exercise, exerciseIndex) => {
                  const timeUnit = getTimeUnit(exercise);
                  const timeValue = getTimeValue(exercise);
                  const isExpanded = expandedExercise === exercise.id;

                  return (
                    <div key={exercise.id} className="border-b border-green-lightest last:border-b-0">
                      <div
                        className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-green-lightest transition-colors"
                        onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-green-darkest truncate">
                            {exercise.name}
                          </div>
                          <div className="text-xs text-green-mediumLight mt-0.5">
                            {exercise.sets_reps} • {exercise.type}
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-green-medium transition-transform flex-shrink-0 ml-2 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isExpanded && (
                        <div className="p-3 bg-green-lightest space-y-2">
                          {/* Nombre del ejercicio */}
                          <div>
                            <label className="text-xs font-medium text-green-darkest block mb-1">
                              Nombre del ejercicio
                            </label>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, { name: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-green-light rounded focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium"
                            />
                          </div>

                          {/* Tipo de ejercicio */}
                          <div>
                            <label className="text-xs font-medium text-green-darkest block mb-1">
                              Tipo
                            </label>
                            <select
                              value={exercise.type}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, { type: e.target.value as Exercise['type'] })}
                              className="w-full px-2 py-1.5 text-sm border border-green-light rounded focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium bg-white"
                            >
                              <option value="Strength">Strength</option>
                              <option value="Circuit">Circuit</option>
                              <option value="Cardio">Cardio</option>
                              <option value="Tabata">Tabata</option>
                              <option value="Biserie">Biserie</option>
                              <option value="Superserie">Superserie</option>
                            </select>
                          </div>

                          {/* Sets/Reps o Tiempo */}
                          <div>
                            <label className="text-xs font-medium text-green-darkest block mb-1">
                              Series y Repeticiones / Tiempo
                            </label>
                            <input
                              type="text"
                              value={exercise.sets_reps}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, { sets_reps: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-green-light rounded focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium mb-2"
                              placeholder="Ej: 3x10, 4x45, 10 min"
                            />
                          </div>

                          {/* Unidad de tiempo */}
                          <div>
                            <label className="text-xs font-medium text-green-darkest block mb-1">
                              Unidad
                            </label>
                            <select
                              value={timeUnit}
                              onChange={(e) => {
                                const newUnit = e.target.value as TimeUnit;
                                const currentValue = timeValue || 1;
                                updateExercise(dayIndex, exerciseIndex, {
                                  timeUnit: newUnit,
                                  timeValue: currentValue
                                });
                              }}
                              className="w-full px-2 py-1.5 text-sm border border-green-light rounded focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium bg-white"
                            >
                              <option value="reps">Repeticiones</option>
                              <option value="minutes">Minutos</option>
                              <option value="seconds">Segundos</option>
                            </select>
                          </div>

                          {/* Valor de tiempo (si no es reps) */}
                          {timeUnit !== 'reps' && (
                            <div>
                              <label className="text-xs font-medium text-green-darkest block mb-1">
                                {timeUnit === 'minutes' ? 'Minutos' : 'Segundos'} por serie
                              </label>
                              <input
                                type="number"
                                value={timeValue || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateExercise(dayIndex, exerciseIndex, {
                                    timeValue: val,
                                    timeUnit: timeUnit
                                  });
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-green-light rounded focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium"
                                min="1"
                                placeholder={timeUnit === 'minutes' ? 'Ej: 1' : 'Ej: 30'}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
