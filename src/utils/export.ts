import { Routine, Day } from '../types';

export const exportWorkout = (day: number, routine: Routine): void => {
  const dayData = routine.days.find((d) => d.day === day);
  if (!dayData) return;

  // Formatear fecha: DD-MM-YYYY
  const now = new Date();
  const dayNum = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${dayNum}-${month}-${year}`;

  // Preparar datos para exportar
  const exportData = {
    dia: day,
    fecha: now.toISOString(),
    fechaFormateada: dateStr,
    enfoque: dayData.focus,
    ejercicios: dayData.exercises
      .filter(ex => ex.completed)
      .map(ex => ({
        nombre: ex.name,
        series_reps: ex.sets_reps,
        tipo: ex.type,
        series: ex.sets?.map((set, index) => ({
          serie: index + 1,
          reps: set.reps,
          peso: set.weight || '',
          completada: set.completed,
        })) || [],
        pesoTotal: ex.sets?.map(s => s.weight).filter(w => w).join(', ') || '',
        notas: ex.notes || '',
      })),
    resumen: {
      totalEjercicios: dayData.exercises.length,
      ejerciciosCompletados: dayData.exercises.filter(e => e.completed).length,
      totalSeries: dayData.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0),
      seriesCompletadas: dayData.exercises.reduce((acc, ex) => 
        acc + (ex.sets?.filter(s => s.completed).length || 0), 0
      ),
    },
  };

  // Convertir a JSON
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Crear link de descarga
  const link = document.createElement('a');
  link.href = url;
  link.download = `entrenamiento-dia${day}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpiar URL
  URL.revokeObjectURL(url);
};
