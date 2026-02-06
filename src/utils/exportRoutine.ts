import { Routine } from '../types';

export const exportRoutineCSV = (routine: Routine): void => {
  // Crear CSV con formato: Día,Enfoque,Ejercicio,Tipo,Series/Reps
  let csv = 'Día,Enfoque,Ejercicio,Tipo,Series/Reps\n';
  
  routine.days.forEach(day => {
    day.exercises.forEach(exercise => {
      const dayNum = day.day;
      const focus = `"${day.focus.replace(/"/g, '""')}"`;
      const name = `"${exercise.name.replace(/"/g, '""')}"`;
      const type = exercise.type;
      const setsReps = `"${exercise.sets_reps.replace(/"/g, '""')}"`;
      
      csv += `${dayNum},${focus},${name},${type},${setsReps}\n`;
    });
  });

  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Nombre del archivo con fecha
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  link.download = `rutina-corregida-${dateStr}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
