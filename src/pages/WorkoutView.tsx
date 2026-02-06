import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Routine, Exercise } from '../types';
import { loadRoutine, saveRoutine, getPreviousWeights, resetDay, saveDaySession } from '../utils/storage';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimer } from '../components/RestTimer';
import { Confetti } from '../components/Confetti';
import { ExportModal } from '../components/ExportModal';

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
    <div className="min-h-screen bg-white pb-24">
      {showConfetti && <Confetti />}
      <div className="bg-white border-b border-green-light sticky top-0 z-40 shadow-sm">
        <div className="mx-auto px-3 py-1.5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-green-medium font-semibold text-[11px] active:opacity-70 hover:text-green-dark transition-colors flex items-center gap-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Inicio</span>
          </button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-sm font-bold text-green-darkest">Dia {day}</h1>
            <p className="text-[9px] font-medium text-green-mediumLight uppercase tracking-wide leading-tight">{dayData.focus}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartRest}
              className="text-green-mediumLight text-[10px] active:opacity-70 hover:text-green-medium transition-colors p-1 hover:bg-green-lightest rounded"
              aria-label="Descanso"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={handleResetDay}
              className="text-green-mediumLight text-[10px] active:opacity-70 hover:text-green-medium transition-colors p-1 hover:bg-green-lightest rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mx-auto px-3 pb-1.5">
          <div className="flex gap-2 justify-center text-[10px]">
            <div className="bg-green-lightest px-2 py-1 rounded border border-green-light">
              <span className="text-green-medium font-bold text-xs">{completedCount}</span>
              <span className="text-green-mediumLight font-medium">/{totalCount}</span>
            </div>
            <div className="bg-green-lightest px-2 py-1 rounded border border-green-light">
              <span className="text-green-medium font-bold text-xs">{completedSets}</span>
              <span className="text-green-mediumLight font-medium">/{totalSets}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-3 py-3">
        {currentGroup.length > 0 && (
          <>
            {currentGroup.length > 1 && (
              <div className="mb-2 px-2.5 py-1.5 bg-green-medium border border-green-dark rounded animate-slide-in">
                <p className="text-xs font-bold text-white uppercase tracking-wide">
                  {currentGroup[0].type === 'Circuit' && 'CIRCUITO'}
                  {currentGroup[0].type === 'Biserie' && 'BISERIE'}
                  {currentGroup[0].type === 'Superserie' && 'SUPERSERIE'}
                  {' • '}
                  {currentGroup.length} ejercicios
                </p>
              </div>
            )}
            {currentGroup.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="animate-slide-in" style={{ animationDelay: `${exerciseIndex * 0.05}s` }}>
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
