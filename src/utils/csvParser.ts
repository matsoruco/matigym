import { Routine, Day, Exercise, Set, ExerciseType } from '../types';

const parseSetsReps = (setsReps: string): Set[] => {
  const sets: Set[] = [];
  
  // Dividir por comas
  const parts = setsReps.split(',').map(s => s.trim());
  
  for (const part of parts) {
    // Limpiar el texto (quitar "x lado", etc.)
    const cleanPart = part.replace(/\s*x\s*lado/i, '').trim();
    
    // Formato: "1x10", "3x12", "4x15", "3x30\"", "8 rondas", "3x12 x lado", "4x10-12", "3x Fallo"
    const falloMatch = cleanPart.match(/(\d+)x\s*Fallo/i);
    const match = cleanPart.match(/(\d+)x(\d+)/);
    
    if (falloMatch) {
      // "3x Fallo" -> crear 3 series sin reps específicas
      const numSets = parseInt(falloMatch[1], 10);
      for (let i = 0; i < numSets; i++) {
        sets.push({
          reps: 0,
          completed: false,
        });
      }
    } else if (match) {
      const numSets = parseInt(match[1], 10);
      const repsStr = match[2];
      // Manejar rangos como "10-12" -> tomar el máximo
      const reps = repsStr.includes('-') 
        ? parseInt(repsStr.split('-')[1], 10)
        : parseInt(repsStr, 10);
      
      // Crear una serie por cada repetición indicada
      for (let i = 0; i < numSets; i++) {
        sets.push({
          reps,
          completed: false,
        });
      }
    } else if (part.includes('rondas')) {
      // Tabata: 8 rondas
      const matchRondas = part.match(/(\d+)\s*rondas/);
      if (matchRondas) {
        const rondas = parseInt(matchRondas[1], 10);
        for (let i = 0; i < rondas; i++) {
          sets.push({
            reps: 0, // Tabata no tiene reps específicas
            completed: false,
          });
        }
      }
    } else if (part.includes('min')) {
      // Cardio: 10 min (sin "x") - NO son reps, es tiempo
      const minMatch = part.match(/(\d+)\s*min/i);
      if (minMatch) {
        sets.push({
          reps: 0, // No son reps, es tiempo
          completed: false,
        });
      } else {
        sets.push({
          reps: 0,
          completed: false,
        });
      }
    } else if (part.match(/\d+""/)) {
      // Ejercicios con tiempo: "3x30\"" - NO son reps, es tiempo
      const timeMatch = part.match(/(\d+)x(\d+)""/);
      if (timeMatch) {
        const numSets = parseInt(timeMatch[1], 10);
        // No guardamos los segundos como reps, son 0
        for (let i = 0; i < numSets; i++) {
          sets.push({
            reps: 0, // No son reps, es tiempo
            completed: false,
          });
        }
      }
    } else if (part.match(/\d+'/)) {
      // Ejercicios con tiempo en minutos: "3x1'" - NO son reps, es tiempo
      const timeMatch = part.match(/(\d+)x(\d+)'/);
      if (timeMatch) {
        const numSets = parseInt(timeMatch[1], 10);
        // No guardamos los minutos como reps, son 0
        for (let i = 0; i < numSets; i++) {
          sets.push({
            reps: 0, // No son reps, es tiempo
            completed: false,
          });
        }
      }
    }
  }
  
  // Si no se encontraron sets, crear uno por defecto
  if (sets.length === 0) {
    sets.push({
      reps: 0,
      completed: false,
    });
  }
  
  return sets;
};

const detectExerciseType = (name: string): ExerciseType => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('tabata')) return 'Tabata';
  if (nameLower.includes('cardio')) return 'Cardio';
  if (nameLower.includes('circuito')) return 'Circuit';
  if (nameLower.includes('biserie')) return 'Biserie';
  if (nameLower.includes('superserie')) return 'Superserie';
  
  return 'Strength';
};

const extractTimer = (setsReps: string): number | null => {
  // Buscar tiempos como "30\"", "45\"", "1'", "40\""
  const secondsMatch = setsReps.match(/(\d+)""/);
  if (secondsMatch) {
    return parseInt(secondsMatch[1], 10);
  }
  
  const minutesMatch = setsReps.match(/(\d+)'/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10) * 60;
  }
  
  return null;
};

export const parseCSV = (csvContent: string): Routine => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const header = lines[0];
  
  if (!header.includes('Día') || !header.includes('Ejercicio')) {
    throw new Error('Formato CSV inválido. Debe contener columnas: Día, Ejercicio, Series x Reps');
  }
  
  const exercisesByDay: { [key: number]: Exercise[] } = {};
  
  let exerciseIdCounter = 1;
  
  // Procesar cada línea (saltar header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parsear CSV (manejar comillas)
    const columns: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim()); // última columna
    
    if (columns.length < 3) continue;
    
    const dayStr = columns[0].trim();
    const exerciseName = columns[1].trim();
    const setsReps = columns[2].trim();
    
    // Extraer número de día
    const dayMatch = dayStr.match(/Día\s*(\d+)/i);
    if (!dayMatch) continue;
    
    const day = parseInt(dayMatch[1], 10);
    
    if (!exercisesByDay[day]) {
      exercisesByDay[day] = [];
    }
    
    const type = detectExerciseType(exerciseName);
    const timer = extractTimer(setsReps);
    const sets = parseSetsReps(setsReps);
    
    const exercise: Exercise = {
      id: `d${day}-e${exerciseIdCounter++}`,
      name: exerciseName,
      sets_reps: setsReps,
      sets,
      type,
      timer,
      completed: false,
    };
    
    exercisesByDay[day].push(exercise);
  }
  
  // Crear estructura de rutina
  const days: Day[] = [];
  const dayFocuses: { [key: number]: string } = {
    1: 'Pierna / Core',
    2: 'Empuje Superior',
    3: 'Tirón Superior',
    4: 'Full Body / Cardio',
  };
  
  for (let day = 1; day <= 4; day++) {
    if (exercisesByDay[day]) {
      days.push({
        day,
        focus: dayFocuses[day] || `Día ${day}`,
        exercises: exercisesByDay[day],
      });
    }
  }
  
  return {
    routine_id: 'rutina_4_dias_csv',
    days,
  };
};
