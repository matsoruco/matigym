export type ExerciseType = 'Strength' | 'Circuit' | 'Cardio' | 'Tabata' | 'Biserie' | 'Superserie';

export interface Set {
  reps: number;
  weight?: string; // peso para esta serie específica
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets_reps: string; // formato original para mostrar
  sets: Set[]; // series individuales con pesos
  type: ExerciseType;
  timer: number | null; // segundos para temporizador
  completed: boolean;
  weight?: string; // peso general o notas (para compatibilidad)
  notes?: string; // notas adicionales
  previousWeights?: string[]; // pesos de la sesión anterior por serie
}

export interface Day {
  day: number;
  focus: string;
  exercises: Exercise[];
}

export interface Routine {
  routine_id: string;
  days: Day[];
}

export interface WorkoutSession {
  day: number;
  date: string;
  exercises: {
    exerciseId: string;
    weight?: string;
    notes?: string;
    completed: boolean;
  }[];
}
