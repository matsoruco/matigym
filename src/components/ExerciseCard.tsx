import { Exercise } from '../types';
import { Timer } from './Timer';
import { TabataTimer } from './TabataTimer';
import { useState } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex?: number;
  totalExercises?: number;
  onToggleComplete: (exerciseId: string) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number) => void;
  onUpdateSetWeight: (exerciseId: string, setIndex: number, weight: string) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLastExercise?: boolean;
  showNextButton?: boolean; // Controlar si mostrar botón siguiente
}

export const ExerciseCard = ({
  exercise,
  exerciseIndex = 0,
  totalExercises = 1,
  onToggleComplete,
  onToggleSetComplete,
  onUpdateSetWeight,
  onUpdateNotes,
  onPrevious,
  onNext,
  isLastExercise = false,
  showNextButton = true,
}: ExerciseCardProps) => {
  const [showTimer, setShowTimer] = useState(false);
  const [showTabata, setShowTabata] = useState(false);
  const [notesInput, setNotesInput] = useState(exercise.notes || '');

  const handleNotesChange = (value: string) => {
    setNotesInput(value);
    onUpdateNotes(exercise.id, value);
  };

  const hasSets = exercise.sets && exercise.sets.length > 0;
  const canGoPrevious = exerciseIndex > 0 || (onPrevious !== undefined);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 shadow-lg border-2 border-green-lightest dark:border-green-dark transition-all hover:shadow-xl">
      {/* Título del ejercicio */}
      <div className="mb-5 pb-4 border-b-2 border-green-lightest dark:border-green-dark">
        <h2 className="text-2xl font-bold text-green-darkest dark:text-white mb-2">{exercise.name}</h2>
        
        {/* Información anterior */}
        <div className="text-sm font-semibold text-green-medium dark:text-green-light mb-2">
          {exercise.sets_reps}
        </div>
        {exercise.previousWeights && exercise.previousWeights.length > 0 && (
          <div className="text-sm font-medium text-green-mediumLight dark:text-green-mediumLight bg-green-lightest dark:bg-green-dark px-3 py-1.5 rounded-lg inline-block border border-green-light dark:border-green-medium">
            Anterior: {exercise.previousWeights.join('kg, ')}kg
          </div>
        )}
      </div>

      {/* Timer para ejercicios con tiempo */}
      {exercise.timer && exercise.type !== 'Tabata' && (
        <div className="mb-4">
          {!showTimer ? (
            <button
              onClick={() => setShowTimer(true)}
              className="w-full px-4 py-3 bg-green-medium text-white rounded-lg text-sm font-semibold active:bg-green-dark hover:bg-green-dark transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-dark"
            >
              ⏱️ Temporizador ({exercise.timer}s)
            </button>
          ) : (
            <div className="bg-green-lightest rounded-lg p-4 border-2 border-green-medium">
              <Timer initialSeconds={exercise.timer} size="large" />
              <button
                onClick={() => setShowTimer(false)}
                className="mt-2 text-xs font-medium text-green-medium hover:text-green-dark transition-colors"
              >
                Ocultar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabata Timer */}
      {exercise.type === 'Tabata' && (
        <div className="mb-4">
          {!showTabata ? (
            <button
              onClick={() => setShowTabata(true)}
              className="w-full px-4 py-3 bg-green-dark text-white rounded-lg text-sm font-semibold active:bg-green-darker hover:bg-green-darker transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-green-darkest"
            >
              ⏱️ Tabata (8 rondas)
            </button>
          ) : (
            <div>
              <TabataTimer workSeconds={exercise.timer || 20} />
              <button
                onClick={() => setShowTabata(false)}
                className="mt-2 text-xs font-medium text-green-medium hover:text-green-dark transition-colors"
              >
                Ocultar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Series con pesos individuales */}
      {hasSets && (
        <div className="space-y-3 mb-4">
          {exercise.sets.map((set, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                set.completed 
                  ? 'border-green-medium dark:border-green-light bg-green-lightest dark:bg-green-dark shadow-sm' 
                  : 'border-green-light dark:border-green-medium bg-green-pale dark:bg-gray-700 hover:border-green-mediumLight dark:hover:border-green-light'
              }`}
            >
              <button
                onClick={() => {
                  onToggleSetComplete(exercise.id, index);
                  if (!set.completed) {
                    // Animación al completar
                    const button = document.activeElement as HTMLElement;
                    if (button) {
                      button.classList.add('animate-bounce-in');
                      setTimeout(() => {
                        button.classList.remove('animate-bounce-in');
                      }, 500);
                    }
                  }
                }}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-bold flex-shrink-0 transition-all shadow-sm ${
                  set.completed
                    ? 'bg-green-medium dark:bg-green-light border-green-dark dark:border-green-medium text-white shadow-md'
                    : 'bg-white dark:bg-gray-600 border-green-mediumLight dark:border-green-medium text-green-mediumLight dark:text-green-light hover:border-green-medium dark:hover:border-green-light hover:text-green-medium dark:hover:text-green-light hover:bg-green-lightest dark:hover:bg-gray-500 hover:scale-105'
                } active:scale-95`}
              >
                {set.completed ? '✓' : index + 1}
              </button>
              
              <div className="flex-1">
                {set.reps > 0 ? (
                  <>
                    <div className="text-lg font-bold text-green-darkest dark:text-white">{set.reps} reps</div>
                    <div className="text-xs font-medium text-green-mediumLight dark:text-green-mediumLight uppercase tracking-wide">Serie {index + 1}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-green-medium dark:text-green-light">
                      {exercise.type === 'Tabata' ? 'Ronda' : 'Serie ' + (index + 1)}
                    </div>
                    {exercise.sets_reps && (exercise.sets_reps.includes('min') || exercise.sets_reps.includes('"')) && (
                      <div className="text-xs text-green-mediumLight dark:text-green-mediumLight">{exercise.sets_reps}</div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-1">
                  <input
                    type="tel"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    placeholder="kg"
                    value={set.weight || ''}
                    onChange={(e) => {
                      // Solo permitir números y punto decimal
                      let value = e.target.value.replace(/[^0-9.]/g, '');
                      // Evitar múltiples puntos decimales
                      const parts = value.split('.');
                      if (parts.length > 2) {
                        value = parts[0] + '.' + parts.slice(1).join('');
                      }
                      // Limitar a 2 decimales
                      if (parts.length === 2 && parts[1].length > 2) {
                        value = parts[0] + '.' + parts[1].substring(0, 2);
                      }
                      onUpdateSetWeight(exercise.id, index, value);
                    }}
                    className={`w-20 px-3 py-2.5 rounded-lg text-base text-center font-bold transition-all ${
                      set.weight 
                        ? 'bg-green-medium dark:bg-green-light text-white border-2 border-green-dark dark:border-green-medium shadow-md' 
                        : 'bg-white dark:bg-gray-600 text-green-medium dark:text-green-light border-2 border-green-mediumLight dark:border-green-medium hover:border-green-medium dark:hover:border-green-light focus:border-green-medium dark:focus:border-green-light focus:bg-green-lightest dark:focus:bg-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-medium dark:focus:ring-green-light focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campo de notas */}
      <div className="mb-4">
        <textarea
          placeholder="Agregar notas..."
          value={notesInput}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-light dark:border-green-medium rounded-lg text-sm font-medium text-green-darkest dark:text-white placeholder-green-mediumLight dark:placeholder-green-mediumLight focus:outline-none focus:ring-2 focus:ring-green-medium dark:focus:ring-green-light focus:border-green-medium dark:focus:border-green-light focus:bg-green-lightest dark:focus:bg-gray-700 resize-none bg-white dark:bg-gray-700 transition-all"
          rows={2}
        />
      </div>

      {/* Botones Anterior y Siguiente - Solo mostrar si es el último ejercicio del grupo */}
      {showNextButton && (
        <div className="flex gap-3">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            canGoPrevious
              ? 'bg-white dark:bg-gray-700 border-2 border-green-mediumLight dark:border-green-medium text-green-medium dark:text-green-light hover:bg-green-lightest dark:hover:bg-gray-600 hover:border-green-medium dark:hover:border-green-light active:bg-green-light dark:active:bg-gray-500 active:scale-95'
              : 'bg-green-lightest dark:bg-gray-800 border-2 border-green-light dark:border-green-dark text-green-mediumLight dark:text-green-mediumLight cursor-not-allowed'
          }`}
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-4 py-3 bg-green-medium dark:bg-green-dark text-white rounded-lg text-sm font-semibold active:bg-green-dark dark:active:bg-green-darkest hover:bg-green-dark dark:hover:bg-green-darkest transition-all shadow-md hover:shadow-lg active:scale-95 hover:scale-105"
          >
            {isLastExercise ? '✓ Completar Día' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  );
};
