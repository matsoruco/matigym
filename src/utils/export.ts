import { Routine } from '../types';

// Función auxiliar para obtener datos del entrenamiento
const getWorkoutData = (day: number, routine: Routine) => {
  const dayData = routine.days.find((d) => d.day === day);
  if (!dayData) return null;

  const now = new Date();
  const dayNum = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${dayNum}-${month}-${year}`;

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

  return { exportData, dateStr };
};

// Exportar como mensaje (copiar al portapapeles)
export const exportWorkoutMessage = (day: number, routine: Routine): void => {
  const result = getWorkoutData(day, routine);
  if (!result) return;

  const { exportData } = result;
  
  // Formatear mensaje legible
  let message = `🏋️ ENTRENAMIENTO - DÍA ${exportData.dia}\n`;
  message += `📅 Fecha: ${exportData.fechaFormateada}\n`;
  message += `🎯 Enfoque: ${exportData.enfoque}\n\n`;
  
  message += `📊 RESUMEN:\n`;
  message += `• Ejercicios completados: ${exportData.resumen.ejerciciosCompletados}/${exportData.resumen.totalEjercicios}\n`;
  message += `• Series completadas: ${exportData.resumen.seriesCompletadas}/${exportData.resumen.totalSeries}\n\n`;
  
  message += `💪 EJERCICIOS:\n\n`;
  
  exportData.ejercicios.forEach((ej, idx) => {
    message += `${idx + 1}. ${ej.nombre} (${ej.tipo})\n`;
    message += `   Series/Reps: ${ej.series_reps}\n`;
    
    if (ej.series.length > 0) {
      const seriesConPeso = ej.series
        .filter(s => s.peso)
        .map(s => `Serie ${s.serie}: ${s.peso}kg`)
        .join(', ');
      
      if (seriesConPeso) {
        message += `   Pesos: ${seriesConPeso}\n`;
      }
    }
    
    if (ej.pesoTotal) {
      message += `   Pesos totales: ${ej.pesoTotal}\n`;
    }
    
    if (ej.notas) {
      message += `   Notas: ${ej.notas}\n`;
    }
    
    message += `\n`;
  });

  // Copiar al portapapeles
  navigator.clipboard.writeText(message).then(() => {
    alert('✅ Mensaje copiado al portapapeles');
  }).catch(() => {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = message;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('✅ Mensaje copiado al portapapeles');
    } catch (err) {
      alert('❌ Error al copiar. Por favor, copia manualmente el mensaje.');
    }
    document.body.removeChild(textArea);
  });
};

// Compartir entrenamiento
export const shareWorkout = async (day: number, routine: Routine): Promise<boolean> => {
  const result = getWorkoutData(day, routine);
  if (!result) return false;

  const { exportData } = result;
  
  // Formatear mensaje para compartir
  let shareText = `🏋️ Entrenamiento - Día ${exportData.dia} (${exportData.fechaFormateada})\n`;
  shareText += `🎯 ${exportData.enfoque}\n\n`;
  shareText += `✅ ${exportData.resumen.ejerciciosCompletados}/${exportData.resumen.totalEjercicios} ejercicios\n`;
  shareText += `✅ ${exportData.resumen.seriesCompletadas}/${exportData.resumen.totalSeries} series\n\n`;
  
  shareText += `Ejercicios:\n`;
  exportData.ejercicios.forEach((ej, idx) => {
    shareText += `${idx + 1}. ${ej.nombre} - ${ej.series_reps}`;
    if (ej.pesoTotal) {
      shareText += ` (${ej.pesoTotal})`;
    }
    shareText += `\n`;
  });

  // Intentar usar Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Entrenamiento Día ${exportData.dia}`,
        text: shareText,
      });
      return true;
    } catch (err) {
      // El usuario canceló o hubo un error
      if ((err as Error).name !== 'AbortError') {
        console.error('Error al compartir:', err);
      }
      return false;
    }
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(shareText).then(() => {
      alert('✅ Contenido copiado al portapapeles para compartir');
    }).catch(() => {
      alert('❌ Tu navegador no soporta compartir. Copia manualmente el contenido.');
    });
    return true;
  }
};

// Exportar como JSON
export const exportWorkoutJSON = (day: number, routine: Routine): void => {
  const result = getWorkoutData(day, routine);
  if (!result) return;

  const { exportData, dateStr } = result;
  
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `entrenamiento-dia${day}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Exportar como CSV
export const exportWorkoutCSV = (day: number, routine: Routine): void => {
  const result = getWorkoutData(day, routine);
  if (!result) return;

  const { exportData, dateStr } = result;
  
  // Crear CSV
  let csv = `Entrenamiento Día ${exportData.dia},Fecha: ${exportData.fechaFormateada},Enfoque: ${exportData.enfoque}\n`;
  csv += `\n`;
  csv += `Ejercicio,Tipo,Series/Reps,Pesos,Notas\n`;
  
  exportData.ejercicios.forEach(ej => {
    const nombre = `"${ej.nombre.replace(/"/g, '""')}"`;
    const tipo = `"${ej.tipo}"`;
    const seriesReps = `"${ej.series_reps.replace(/"/g, '""')}"`;
    const pesos = `"${ej.pesoTotal.replace(/"/g, '""')}"`;
    const notas = `"${(ej.notas || '').replace(/"/g, '""')}"`;
    
    csv += `${nombre},${tipo},${seriesReps},${pesos},${notas}\n`;
  });
  
  csv += `\n`;
  csv += `Resumen\n`;
  csv += `Total Ejercicios,${exportData.resumen.totalEjercicios}\n`;
  csv += `Ejercicios Completados,${exportData.resumen.ejerciciosCompletados}\n`;
  csv += `Total Series,${exportData.resumen.totalSeries}\n`;
  csv += `Series Completadas,${exportData.resumen.seriesCompletadas}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `entrenamiento-dia${day}-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Función legacy para compatibilidad (mantener por si acaso)
export const exportWorkout = exportWorkoutJSON;
