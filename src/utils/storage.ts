import { Routine, WorkoutSession } from '../types';

const ROUTINE_KEY = 'gym_routine';
const SESSIONS_KEY = 'gym_sessions';
const REST_DAYS_KEY = 'gym_rest_days';

export const saveRoutine = (routine: Routine): void => {
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
};

export const loadRoutine = (): Routine | null => {
  const stored = localStorage.getItem(ROUTINE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveSession = (session: WorkoutSession): void => {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const getSessions = (): WorkoutSession[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPreviousWeight = (day: number, exerciseId: string): string | undefined => {
  const sessions = getSessions();
  // Buscar la sesión más reciente del mismo día
  const daySessions = sessions
    .filter(s => s.day === day)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (daySessions.length === 0) return undefined;
  
  const lastSession = daySessions[0];
  const exercise = lastSession.exercises.find(e => e.exerciseId === exerciseId);
  return exercise?.weight;
};

export const getPreviousWeights = (day: number, exerciseId: string): string[] | undefined => {
  const routine = loadRoutine();
  if (!routine) return undefined;
  
  const dayData = routine.days.find(d => d.day === day);
  if (!dayData) return undefined;
  
  const exercise = dayData.exercises.find(e => e.id === exerciseId);
  if (!exercise || !exercise.sets) return undefined;
  
  // Buscar en sesiones anteriores
  const sessions = getSessions();
  const daySessions = sessions
    .filter(s => s.day === day)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (daySessions.length === 0) return undefined;
  
  // Buscar el ejercicio en la última sesión y extraer pesos por serie
  const lastSession = daySessions[0];
  const lastExercise = lastSession.exercises.find(e => e.exerciseId === exerciseId);
  
  if (lastExercise?.weight) {
    // Si el peso contiene comas, es un array de pesos
    if (lastExercise.weight.includes(',')) {
      return lastExercise.weight.split(',').map(w => w.trim());
    }
    // Si no, devolver un array con un solo peso
    return [lastExercise.weight];
  }
  
  return undefined;
};

export const resetDay = (day: number): void => {
  const routine = loadRoutine();
  if (!routine) return;
  
  const dayData = routine.days.find(d => d.day === day);
  if (!dayData) return;
  
  dayData.exercises.forEach(ex => {
    ex.completed = false;
    ex.weight = undefined;
    ex.notes = undefined;
    if (ex.sets) {
      ex.sets.forEach(set => {
        set.completed = false;
        set.weight = undefined;
      });
    }
  });
  
  saveRoutine(routine);
};

export const saveDaySession = (day: number, routine: Routine): void => {
  const dayData = routine.days.find(d => d.day === day);
  if (!dayData) return;

  const session = {
    day,
    date: new Date().toISOString(),
    exercises: dayData.exercises
      .filter(ex => ex.completed)
      .map(ex => {
        // Si tiene sets con pesos, guardar como string separado por comas
        let weightStr = ex.weight || '';
        if (ex.sets && ex.sets.length > 0 && ex.sets.some(s => s.weight)) {
          weightStr = ex.sets.map(s => s.weight || '').join(',');
        }
        
        return {
          exerciseId: ex.id,
          weight: weightStr,
          notes: ex.notes,
          completed: ex.completed,
        };
      }),
  };

  if (session.exercises.length > 0) {
    saveSession(session);
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(ROUTINE_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(REST_DAYS_KEY);
};

export const exportAllData = (): string => {
  const routine = loadRoutine();
  const sessions = getSessions();
  const restDays = getRestDays();
  
  const allData = {
    routine,
    sessions,
    restDays,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(allData, null, 2);
};

export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.routine) {
      localStorage.setItem(ROUTINE_KEY, JSON.stringify(data.routine));
    }
    
    if (data.sessions) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.sessions));
    }
    
    if (data.restDays) {
      localStorage.setItem(REST_DAYS_KEY, JSON.stringify(data.restDays));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const markDayAsTrained = (day: number, date: Date): void => {
  const routine = loadRoutine();
  if (!routine) return;
  
  const dayData = routine.days.find(d => d.day === day);
  if (!dayData) return;
  
  // Crear una sesión vacía para marcar el día como entrenado
  const session: WorkoutSession = {
    day,
    date: date.toISOString(),
    exercises: dayData.exercises.map(ex => ({
      exerciseId: ex.id,
      completed: true,
    })),
  };
  
  saveSession(session);
};

export const markDayAsRest = (date: Date): void => {
  const restDays = getRestDays();
  const dateStr = date.toISOString().split('T')[0];
  if (!restDays.includes(dateStr)) {
    restDays.push(dateStr);
    localStorage.setItem(REST_DAYS_KEY, JSON.stringify(restDays));
  }
};

export const getRestDays = (): string[] => {
  const stored = localStorage.getItem(REST_DAYS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const removeRestDay = (date: Date): void => {
  const restDays = getRestDays();
  const dateStr = date.toISOString().split('T')[0];
  const filtered = restDays.filter(d => d !== dateStr);
  localStorage.setItem(REST_DAYS_KEY, JSON.stringify(filtered));
};

export const isRestDay = (date: Date): boolean => {
  const restDays = getRestDays();
  const dateStr = date.toISOString().split('T')[0];
  return restDays.includes(dateStr);
};
