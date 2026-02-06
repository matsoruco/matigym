import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Routine, Exercise } from '../types';
import { loadRoutine, saveRoutine, getPreviousWeights, resetDay, saveDaySession } from '../utils/storage';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimer } from '../components/RestTimer';
import { Confetti } from '../components/Confetti';
import { ExportModal } from '../components/ExportModal';
import { useTheme } from '../contexts/ThemeContext';

const REST_SECONDS = 90; // 1.5 minutos de descanso por defecto

// Función para agrupar ejercicios consecutivos del mismo tipo (Circuit, Biserie, Superserie)
const groupExercises = (exercises: Exercise[]): Exercise[][] => {
  const groups: Exercise[][] = [];
  let currentGroup: Exercise[] = [];
  let currentGroupType: string | null = null;

  exercises.forEach((exercise) => {
    const isGroupedType = exercise.type === 'Circuit' || exercise.type === 'Biserie' || exercise.type === 'Superserie';
    
    if (isGroupedType && (currentGroupType === null || currentGroupType === exercise.type)) {
      // Continuar el grupo actual
      currentGroup.push(exercise);
      currentGroupType = exercise.type;
    } else {
      // Finalizar grupo anterior si existe
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
      
      if (isGroupedType) {
        // Iniciar nuevo grupo
        currentGroup = [exercise];
        currentGroupType = exercise.type;
      } else {
        // Ejercicio individual
        groups.push([exercise]);
        currentGroupType = null;
      }
    }
  });

  // Agregar el último grupo si existe
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};

export const WorkoutView = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const day = parseInt(dayNumber || '1', 10);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [exerciseGroups, setExerciseGroups] = useState<Exercise[][]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const stored = loadRoutine();
    if (!stored) {
      // Si no hay rutina cargada, redirigir a Home
      navigate('/');
      return;
    }

    // Cargar pesos anteriores
    const dayData = stored.days.find((d) => d.day === day);
    if (!dayData) {
      // Si el día no existe, redirigir a Home
      navigate('/');
      return;
    }

    dayData.exercises.forEach((ex) => {
      const prevWeights = getPreviousWeights(day, ex.id);
      if (prevWeights) {
        ex.previousWeights = prevWeights;
      }
    });

    // Agrupar ejercicios
    const groups = groupExercises(dayData.exercises);
    setExerciseGroups(groups);
    
    // Encontrar el primer grupo no completado
    const firstIncomplete = groups.findIndex(group => 
      !group.every(ex => ex.completed)
    );
    if (firstIncomplete !== -1) {
      setCurrentGroupIndex(firstIncomplete);
    }

    setRoutine(stored);
  }, [day, navigate]);


  const handleToggleSetComplete = (exerciseId: string, setIndex: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const dayData = updatedRoutine.days.find((d) => d.day === day);
    if (!dayData) return;

    const exercise = dayData.exercises.find((e) => e.id === exerciseId);
    if (exercise && exercise.sets && exercise.sets[setIndex]) {
      exercise.sets[setIndex].completed = !exercise.sets[setIndex].completed;
      
      // Si todas las series están completas, marcar ejercicio como completado
      if (exercise.sets.every(s => s.completed) && !exercise.completed) {
        exercise.completed = true;
      } else if (!exercise.sets.every(s => s.completed)) {
        exercise.completed = false;
      }
      
      saveRoutine(updatedRoutine);
      setRoutine(updatedRoutine);
      
      // Actualizar grupos
      const groups = groupExercises(dayData.exercises);
      setExerciseGroups(groups);
    }
  };

  const handleUpdateSetWeight = (exerciseId: string, setIndex: number, weight: string) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const dayData = updatedRoutine.days.find((d) => d.day === day);
    if (!dayData) return;

    const exercise = dayData.exercises.find((e) => e.id === exerciseId);
    if (exercise && exercise.sets && exercise.sets[setIndex]) {
      exercise.sets[setIndex].weight = weight;
      saveRoutine(updatedRoutine);
      setRoutine(updatedRoutine);
    }
  };

  const handleUpdateNotes = (exerciseId: string, notes: string) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const dayData = updatedRoutine.days.find((d) => d.day === day);
    if (!dayData) return;

    const exercise = dayData.exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      exercise.notes = notes;
      saveRoutine(updatedRoutine);
      setRoutine(updatedRoutine);
    }
  };

  const handleStartRest = () => {
    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
  };

  const handleCloseRestTimer = () => {
    setShowRestTimer(false);
  };

  const handlePreviousExercise = (exerciseIndex: number) => {
    if (exerciseIndex > 0) {
      // Si no es el primer ejercicio del grupo, no hacemos nada (se maneja dentro del card)
      return;
    }
    // Si es el primer ejercicio, ir al grupo anterior
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  const handleResetDay = () => {
    if (window.confirm('¿Resetear todos los ejercicios de este día?')) {
      resetDay(day);
      const updated = loadRoutine();
      if (updated) {
        setRoutine(updated);
        const dayData = updated.days.find((d) => d.day === day);
        if (dayData) {
          const groups = groupExercises(dayData.exercises);
          setExerciseGroups(groups);
          setCurrentGroupIndex(0);
        }
      }
    }
  };

  const handleNextGroup = () => {
    if (!routine) return;
    const dayData = routine.days.find((d) => d.day === day);
    if (!dayData) return;
    
    const currentGroup = exerciseGroups[currentGroupIndex];
    
    // Marcar todos los ejercicios del grupo actual como completados
    const updatedRoutine = { ...routine };
    const updatedDayData = updatedRoutine.days.find((d) => d.day === day);
    if (updatedDayData) {
      currentGroup.forEach(ex => {
        const exercise = updatedDayData.exercises.find(e => e.id === ex.id);
        if (exercise) {
          exercise.completed = true;
          // Si tiene sets, marcar todas las series como completadas
          if (exercise.sets) {
            exercise.sets.forEach(set => {
              set.completed = true;
            });
          }
        }
      });
      
      saveRoutine(updatedRoutine);
      saveDaySession(day, updatedRoutine);
      setRoutine(updatedRoutine);
      
      // Actualizar grupos
      const groups = groupExercises(updatedDayData.exercises);
      setExerciseGroups(groups);
    }
    
    // Avanzar al siguiente grupo o completar día
    if (currentGroupIndex < exerciseGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      // Es el último grupo - día completado
      // Mostrar confetti
      setShowConfetti(true);
      
      // Mostrar modal de exportación después de un breve delay
      setTimeout(() => {
        setShowConfetti(false);
        setShowExportModal(true);
      }, 2000);
    }
  };

  if (!routine) {
    return <div className="p-4">Cargando...</div>;
  }

  const dayData = routine.days.find((d) => d.day === day);
  if (!dayData) {
    return <div className="p-4">Día no encontrado</div>;
  }

  const currentGroup = exerciseGroups[currentGroupIndex] || [];
  const completedCount = dayData.exercises.filter((e) => e.completed).length;
  const totalCount = dayData.exercises.length;
  const isLastGroup = currentGroupIndex >= exerciseGroups.length - 1;
  
  // Calcular series completadas y totales
  const totalSets = dayData.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = dayData.exercises.reduce((acc, ex) => {
    return acc + (ex.sets?.filter(s => s.completed).length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-green-pale dark:bg-gray-900 pb-32 transition-colors">
      {showConfetti && <Confetti />}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-green-light dark:border-green-dark sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-green-medium font-semibold text-sm active:opacity-70 hover:text-green-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Inicio
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-green-darkest">Dia {day}</h1>
            <p className="text-xs font-medium text-green-mediumLight uppercase tracking-wide">{dayData.focus}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="text-green-mediumLight text-sm active:opacity-70 hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleResetDay}
              className="text-green-mediumLight text-sm active:opacity-70 hover:text-green-medium transition-colors p-2 hover:bg-green-lightest rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="flex gap-8 justify-center text-sm">
            <div className="bg-green-lightest dark:bg-green-dark px-4 py-2 rounded-lg border border-green-light dark:border-green-medium animate-fade-in">
              <span className="text-green-medium dark:text-green-light font-bold text-base">{completedCount}</span>
              <span className="text-green-mediumLight dark:text-green-mediumLight font-medium">/{totalCount} ejercicios</span>
            </div>
            <div className="bg-green-lightest dark:bg-green-dark px-4 py-2 rounded-lg border border-green-light dark:border-green-medium animate-fade-in">
              <span className="text-green-medium dark:text-green-light font-bold text-base">{completedSets}</span>
              <span className="text-green-mediumLight dark:text-green-mediumLight font-medium">/{totalSets} series</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {currentGroup.length > 0 && (
          <>
            {currentGroup.length > 1 && (
              <div className="mb-4 px-4 py-3 bg-green-medium dark:bg-green-dark border-2 border-green-dark dark:border-green-darkest rounded-lg shadow-md animate-slide-in">
                <p className="text-sm font-bold text-white uppercase tracking-wide">
                  {currentGroup[0].type === 'Circuit' && 'CIRCUITO'}
                  {currentGroup[0].type === 'Biserie' && 'BISERIE'}
                  {currentGroup[0].type === 'Superserie' && 'SUPERSERIE'}
                  {' • '}
                  {currentGroup.length} ejercicios
                </p>
              </div>
            )}
            {currentGroup.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="animate-slide-in" style={{ animationDelay: `${exerciseIndex * 0.1}s` }}>
                <ExerciseCard
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  onToggleSetComplete={handleToggleSetComplete}
                  onUpdateSetWeight={handleUpdateSetWeight}
                  onUpdateNotes={handleUpdateNotes}
                  onPrevious={() => handlePreviousExercise(exerciseIndex)}
                  onNext={handleNextGroup}
                  isLastExercise={exerciseIndex === currentGroup.length - 1 && isLastGroup}
                  showNextButton={exerciseIndex === currentGroup.length - 1}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Botón flotante Descanso */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={handleStartRest}
          className="px-6 py-3.5 bg-green-medium dark:bg-green-dark text-white rounded-xl font-semibold text-sm shadow-xl active:bg-green-dark dark:active:bg-green-darkest hover:bg-green-dark dark:hover:bg-green-darkest transition-all hover:shadow-2xl active:scale-95 flex items-center gap-2 border-2 border-green-dark dark:border-green-darkest hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Descanso
        </button>
      </div>

      {showRestTimer && (
        <RestTimer 
          seconds={REST_SECONDS} 
          onComplete={handleRestComplete}
          onClose={handleCloseRestTimer}
        />
      )}

      {showExportModal && routine && (
        <ExportModal
          day={day}
          routine={routine}
          onClose={() => {
            setShowExportModal(false);
            setTimeout(() => {
              alert(`¡Día ${day} completado! 🎉`);
              navigate('/');
            }, 300);
          }}
        />
      )}
    </div>
  );
};
