import { Exercise } from '../types';
import { Timer } from './Timer';
import { TabataTimer } from './TabataTimer';
import { useState } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex?: number;
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
    <div className="bg-white rounded-lg p-3 mb-3 shadow-sm border border-green-light transition-all">
      {/* Título del ejercicio */}
      <div className="mb-3 pb-2 border-b border-green-lightest">
        <h2 className="text-lg font-bold text-green-darkest mb-1 leading-tight">{exercise.name}</h2>
        
        {/* Información anterior */}
        <div className="text-xs font-semibold text-green-medium mb-1.5">
          {exercise.sets_reps}
        </div>
        {exercise.previousWeights && exercise.previousWeights.length > 0 && (
          <div className="text-xs font-medium text-green-mediumLight bg-green-lightest px-2 py-1 rounded inline-block border border-green-light">
            Anterior: {exercise.previousWeights.join('kg, ')}kg
          </div>
        )}
      </div>

      {/* Timer para ejercicios con tiempo */}
      {exercise.timer && exercise.type !== 'Tabata' && (
        <div className="mb-3">
          {!showTimer ? (
            <button
              onClick={() => setShowTimer(true)}
              className="w-full px-3 py-2 bg-green-medium text-white rounded text-xs font-semibold active:bg-green-dark hover:bg-green-dark transition-all active:scale-95 border border-green-dark"
            >
              ⏱️ Temporizador ({exercise.timer}s)
            </button>
          ) : (
            <div className="bg-green-lightest rounded p-3 border border-green-medium">
              <Timer initialSeconds={exercise.timer} size="small" />
              <button
                onClick={() => setShowTimer(false)}
                className="mt-1.5 text-[10px] font-medium text-green-medium hover:text-green-dark transition-colors"
              >
                Ocultar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabata Timer */}
      {exercise.type === 'Tabata' && (
        <div className="mb-3">
          {!showTabata ? (
            <button
              onClick={() => setShowTabata(true)}
              className="w-full px-3 py-2 bg-green-dark text-white rounded text-xs font-semibold active:bg-green-darker hover:bg-green-darker transition-all active:scale-95 border border-green-darkest"
            >
              ⏱️ Tabata (8 rondas)
            </button>
          ) : (
            <div>
              <TabataTimer workSeconds={exercise.timer || 20} />
              <button
                onClick={() => setShowTabata(false)}
                className="mt-1.5 text-[10px] font-medium text-green-medium hover:text-green-dark transition-colors"
              >
                Ocultar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Series con pesos individuales */}
      {hasSets && (
        <div className="space-y-2 mb-3">
          {exercise.sets.map((set, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2.5 rounded border transition-all ${
                set.completed 
                  ? 'border-green-medium bg-green-lightest' 
                  : 'border-green-light bg-white hover:border-green-mediumLight'
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
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  set.completed
                    ? 'bg-green-medium border-green-dark text-white'
                    : 'bg-white border-green-mediumLight text-green-mediumLight hover:border-green-medium hover:text-green-medium hover:bg-green-lightest active:scale-95'
                }`}
              >
                {set.completed ? '✓' : index + 1}
              </button>
              
              <div className="flex-1 min-w-0">
                {set.reps > 0 ? (
                  <>
                    <div className="text-sm font-bold text-green-darkest leading-tight">{set.reps} reps</div>
                    <div className="text-[10px] font-medium text-green-mediumLight uppercase">Serie {index + 1}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-medium text-green-medium leading-tight">
                      {exercise.type === 'Tabata' ? 'Ronda' : 'Serie ' + (index + 1)}
                    </div>
                    {exercise.sets_reps && (exercise.sets_reps.includes('min') || exercise.sets_reps.includes('"')) && (
                      <div className="text-[10px] text-green-mediumLight">{exercise.sets_reps}</div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center">
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
                  className={`w-16 px-2 py-1.5 rounded text-sm text-center font-bold transition-all ${
                    set.weight 
                      ? 'bg-green-medium text-white border border-green-dark' 
                      : 'bg-white text-green-medium border border-green-mediumLight hover:border-green-medium focus:border-green-medium focus:bg-green-lightest'
                  } focus:outline-none focus:ring-1 focus:ring-green-medium`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campo de notas */}
      <div className="mb-3">
        <textarea
          placeholder="Agregar notas..."
          value={notesInput}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="w-full px-2.5 py-2 border border-green-light rounded text-xs font-medium text-green-darkest placeholder-green-mediumLight focus:outline-none focus:ring-1 focus:ring-green-medium focus:border-green-medium focus:bg-green-lightest resize-none bg-white transition-all"
          rows={2}
        />
      </div>

      {/* Botones Anterior y Siguiente - Solo mostrar si es el último ejercicio del grupo */}
      {showNextButton && (
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
          className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-all ${
            canGoPrevious
              ? 'bg-white border border-green-mediumLight text-green-medium hover:bg-green-lightest hover:border-green-medium active:bg-green-light active:scale-95'
              : 'bg-green-lightest border border-green-light text-green-mediumLight cursor-not-allowed'
          }`}
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-3 py-2 bg-green-medium text-white rounded text-xs font-semibold active:bg-green-dark hover:bg-green-dark transition-all active:scale-95"
          >
            {isLastExercise ? '✓ Completar' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  );
};
