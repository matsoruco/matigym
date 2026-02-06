import { WorkoutSession, Routine } from '../types';
import { getRestDays } from './storage';

export const calculateStreak = (sessions: WorkoutSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const restDays = getRestDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Obtener todas las fechas únicas de entrenamiento
  const trainedDates = new Set<string>();
  sessions.forEach(s => {
    const date = new Date(s.date);
    date.setHours(0, 0, 0, 0);
    trainedDates.add(date.toISOString().split('T')[0]);
  });
  
  // Agregar días de descanso como "días activos"
  restDays.forEach(restDate => {
    trainedDates.add(restDate);
  });
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Contar hacia atrás desde hoy
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (trainedDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Si hoy no entrenó, verificar si ayer entrenó para empezar el conteo desde ayer
      if (streak === 0 && currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }
  
  return streak;
};

export const calculateWeekProgress = (sessions: WorkoutSession[], routine: Routine | null): { current: number; target: number; percentage: number } => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= startOfWeek;
  });
  
  const current = thisWeekSessions.length;
  const target = routine ? routine.days.length : 0;
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
  
  return { current, target, percentage };
};

export const getNextRecommendedDay = (sessions: WorkoutSession[], routine: Routine | null): { day: number; focus: string } | null => {
  if (!routine || routine.days.length === 0) return null;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Obtener días entrenados esta semana
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= startOfWeek;
  });
  
  const trainedDaysThisWeek = new Set(thisWeekSessions.map(s => s.day));
  
  // Encontrar el primer día de la rutina que no se haya entrenado esta semana
  for (const dayData of routine.days) {
    if (!trainedDaysThisWeek.has(dayData.day)) {
      return { day: dayData.day, focus: dayData.focus };
    }
  }
  
  // Si todos los días fueron entrenados, sugerir el primero
  return { day: routine.days[0].day, focus: routine.days[0].focus };
};

export const calculateWeeklyAverage = (sessions: WorkoutSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);
  fourWeeksAgo.setHours(0, 0, 0, 0);
  
  const recentSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= fourWeeksAgo;
  });
  
  // Calcular número de semanas (mínimo 1)
  const weeks = Math.max(1, Math.ceil((today.getTime() - fourWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  
  return Math.round((recentSessions.length / weeks) * 10) / 10;
};
