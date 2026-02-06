import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Routine } from '../types';
import { loadRoutine, getSessions, markDayAsTrained, markDayAsRest, getRestDays, removeRestDay } from '../utils/storage';
import { Popup } from '../components/Popup';
import { getRelativeTime } from '../utils/timeUtils';

export const MyWorkout = () => {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
  const [showRecentHistory, setShowRecentHistory] = useState(true);

  useEffect(() => {
    const stored = loadRoutine();
    if (!stored) {
      navigate('/');
      return;
    }
    setRoutine(stored);
  }, [navigate]);

  const sessions = getSessions();
  const restDays = getRestDays();
  
  // Agrupar sesiones por fecha
  const sessionsByDate = new Map<string, number[]>();
  sessions.forEach(session => {
    const date = new Date(session.date).toISOString().split('T')[0];
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session.day);
  });

  // Calcular métricas
  const totalWorkouts = sessions.length;
  
  const lastWorkout = sessions.length > 0 
    ? sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  
  const lastWorkoutRelative = lastWorkout 
    ? getRelativeTime(new Date(lastWorkout.date))
    : 'Nunca';
  

  // Calcular días faltantes de entrenar esta semana
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= startOfWeek;
  });

  const thisWeekDays = new Set(thisWeekSessions.map(s => s.day));
  const routineDays = routine ? routine.days.map(d => d.day) : [];
  const missingDays = routineDays.filter(d => !thisWeekDays.has(d));

  // Generar calendario del mes
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const sessionsOnDate = sessionsByDate.get(dateStr);
    const isRest = restDays.includes(dateStr);
    
    if (sessionsOnDate && sessionsOnDate.length > 0) {
      return {
        trained: true,
        rest: false,
        days: sessionsOnDate
      };
    }
    if (isRest) {
      return {
        trained: false,
        rest: true,
        days: []
      };
    }
    return { trained: false, rest: false, days: [] };
  };

  const goToPreviousMonth = () => {
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setSelectedMonth(new Date());
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const sessionsOnDate = sessionsByDate.get(dateStr);
    const isRest = restDays.includes(dateStr);
    
    if (sessionsOnDate && sessionsOnDate.length > 0) {
      // Ya está entrenado, no hacer nada
      return;
    }
    
    if (isRest) {
      // Si es descanso, permitir quitar el descanso
      removeRestDay(date);
      setPopupMessage('Día de descanso eliminado');
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }
    
    // Abrir selector de día
    setSelectedDate(date);
    setShowDaySelector(true);
  };

  const handleMarkDay = (dayNumber: number) => {
    if (!selectedDate) return;
    
    markDayAsTrained(dayNumber, selectedDate);
    setShowDaySelector(false);
    setSelectedDate(null);
    setShowPopup(true);
    setPopupMessage(`Día ${dayNumber} marcado como entrenado`);
    setPopupType('success');
    
    // Recargar página para actualizar métricas
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleMarkRest = () => {
    if (!selectedDate) return;
    
    markDayAsRest(selectedDate);
    setShowDaySelector(false);
    setSelectedDate(null);
    setShowPopup(true);
    setPopupMessage('Día marcado como descanso');
    setPopupType('success');
    
    // Recargar página para actualizar métricas
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (!routine) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupType === 'success' ? 'Éxito' : 'Información'}
        type={popupType}
      >
        {popupMessage}
      </Popup>

      {/* Selector de día para marcar */}
      {showDaySelector && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-in border-2 border-green-light">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-darkest">
                Marcar día entrenado
              </h2>
              <button
                onClick={() => {
                  setShowDaySelector(false);
                  setSelectedDate(null);
                }}
                className="text-green-mediumLight hover:text-green-medium transition-colors p-1 hover:bg-green-lightest rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-green-darkest mb-3">
                Fecha: {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-green-mediumLight mb-3">Selecciona el día de la rutina o descanso:</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {routine.days.map(day => (
                  <button
                    key={day.day}
                    onClick={() => handleMarkDay(day.day)}
                    className="p-3 bg-green-lightest border border-green-light rounded-lg hover:bg-green-light hover:border-green-medium transition-all text-left"
                  >
                    <div className="text-sm font-bold text-green-darkest">Día {day.day}</div>
                    <div className="text-xs text-green-mediumLight">{day.focus}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleMarkRest}
                className="w-full p-3 bg-blue-50 border-2 border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-bold text-blue-700">Descanso</div>
                    <div className="text-xs text-blue-600">Día de descanso activo</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-green-light sticky top-0 z-40 shadow-sm">
        <div className="mx-auto px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-green-medium font-semibold text-xs active:opacity-70 hover:text-green-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-sm font-bold text-green-darkest">Mi Entrenamiento</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="mx-auto px-3 py-4 max-w-2xl">
        {/* Métricas principales mejoradas */}
        {sessions.length > 0 && (
          <div className="mb-6">
            {/* Grid de métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green-lightest to-green-pale rounded-xl p-4 border border-green-light shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-medium rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-green-mediumLight uppercase tracking-wide">Total entrenamientos</div>
                </div>
                <div className="text-2xl font-bold text-green-darkest">{totalWorkouts}</div>
              </div>
              <div className="bg-gradient-to-br from-green-lightest to-green-pale rounded-xl p-4 border border-green-light shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-medium rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-green-mediumLight uppercase tracking-wide">Último entrenamiento</div>
                </div>
                <div className="text-sm font-bold text-green-darkest leading-tight">{lastWorkoutRelative}</div>
              </div>
            </div>
          </div>
        )}

        {/* Días faltantes esta semana */}
        {missingDays.length > 0 && (
          <div className="mb-6 bg-green-lightest rounded-xl p-4 border border-green-light">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-sm font-bold text-green-darkest">Días pendientes esta semana</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingDays.map(day => {
                const dayData = routine.days.find(d => d.day === day);
                return (
                  <div key={day} className="bg-white px-3 py-1.5 rounded-lg border border-green-medium text-xs font-semibold text-green-darkest">
                    Día {day}: {dayData?.focus || ''}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendario */}
        <div className="bg-white rounded-xl border border-green-light shadow-sm p-4 mb-6">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-green-lightest rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-green-darkest">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="text-xs text-green-medium hover:text-green-dark px-2 py-1 rounded hover:bg-green-lightest transition-colors"
              >
                Hoy
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-green-lightest rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-green-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-green-mediumLight py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            
            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isToday = date.toDateString() === new Date().toDateString();
              const status = getDayStatus(day);
              const isPastOrToday = date <= new Date();
              
              return (
                <button
                  key={day}
                  onClick={() => isPastOrToday && !status.trained && handleDayClick(day)}
                  disabled={!isPastOrToday || status.trained}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                    status.trained
                      ? 'bg-green-medium text-white cursor-default'
                      : status.rest
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-700 cursor-pointer hover:bg-blue-200 active:scale-95'
                      : isToday
                      ? 'bg-green-lightest border-2 border-green-medium text-green-darkest hover:bg-green-light'
                      : isPastOrToday
                      ? 'bg-green-pale text-green-mediumLight hover:bg-green-lightest cursor-pointer active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{day}</span>
                  {status.trained && status.days.length > 0 && (
                    <span className="text-[8px] mt-0.5 opacity-90">
                      {status.days.length > 1 ? `${status.days.length}x` : '✓'}
                    </span>
                  )}
                  {status.rest && (
                    <span className="text-[8px] mt-0.5 text-blue-600">💤</span>
                  )}
                  {!status.trained && !status.rest && isPastOrToday && (
                    <span className="text-[8px] mt-0.5 text-green-mediumLight">+</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 pt-4 border-t border-green-lightest flex items-center justify-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-medium rounded"></div>
              <span className="text-green-mediumLight">Entrenado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-green-mediumLight">Descanso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-lightest border-2 border-green-medium rounded"></div>
              <span className="text-green-mediumLight">Hoy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-pale rounded"></div>
              <span className="text-green-mediumLight">Sin entrenar</span>
            </div>
          </div>
        </div>

        {/* Historial reciente mejorado */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-xl border border-green-light shadow-sm p-4">
            <button
              onClick={() => setShowRecentHistory(!showRecentHistory)}
              className="flex items-center justify-between w-full mb-4 hover:opacity-80 transition-opacity"
            >
              <h3 className="text-sm font-bold text-green-darkest">Historial reciente</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-mediumLight">{sessions.length} sesiones totales</div>
                <svg 
                  className={`w-4 h-4 text-green-medium transition-transform ${showRecentHistory ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {showRecentHistory && (
              <div className="space-y-2">
                {sessions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((session, idx) => {
                    const date = new Date(session.date);
                    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                    const relativeTime = getRelativeTime(date);
                    const dayData = routine.days.find(d => d.day === session.day);
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-lightest rounded-lg hover:bg-green-light transition-colors border border-green-light">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-medium rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{session.day}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-green-darkest">
                              {dayData?.focus || `Día ${session.day}`}
                            </div>
                            <div className="text-xs text-green-mediumLight">{dateStr} • {relativeTime}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-green-medium">
                            {session.exercises.length}
                          </div>
                          <div className="text-[10px] text-green-mediumLight">ejercicios</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
