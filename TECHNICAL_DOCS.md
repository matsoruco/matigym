# Documentación Técnica - Gym Tracker

## 1. Arquitectura del Código

### 1.1 Estructura de Componentes

#### `Home.tsx` - Pantalla Principal
**Responsabilidades:**
- Mostrar logo y título
- Manejar importación de CSV
- Mostrar lista de días disponibles
- Redirigir a WorkoutView al seleccionar día

**Estado:**
- `routine`: Rutina actual cargada (null si no hay)
- `fileInputRef`: Referencia al input de archivo

**Flujos:**
1. `useEffect`: Carga rutina desde localStorage al montar
2. `handleFileUpload`: Procesa CSV, parsea, guarda y actualiza estado

#### `WorkoutView.tsx` - Vista de Entrenamiento
**Responsabilidades:**
- Mostrar ejercicio/grupo actual
- Manejar navegación entre grupos
- Gestionar temporizador de descanso
- Calcular y mostrar progreso

**Estado:**
- `routine`: Rutina completa
- `exerciseGroups`: Grupos de ejercicios agrupados
- `currentGroupIndex`: Índice del grupo actual
- `showRestTimer`: Si el temporizador de descanso está visible

**Funciones Clave:**
- `groupExercises()`: Agrupa ejercicios consecutivos del mismo tipo
- `handleNextGroup()`: Avanza al siguiente grupo y marca actual como completado
- `handlePreviousExercise()`: Retrocede al grupo anterior
- `handleToggleSetComplete()`: Marca/desmarca serie individual
- `handleUpdateSetWeight()`: Actualiza peso de una serie

**Lógica de Agrupación:**
```typescript
// Ejemplo de agrupación:
Ejercicios: [Strength, Circuit, Circuit, Circuit, Strength]
Resultado: [
  [Strength],           // Grupo 0
  [Circuit, Circuit, Circuit],  // Grupo 1
  [Strength]           // Grupo 2
]
```

#### `ExerciseCard.tsx` - Tarjeta de Ejercicio
**Responsabilidades:**
- Mostrar información del ejercicio
- Mostrar series con checkboxes
- Permitir entrada de pesos por serie
- Mostrar temporizadores si aplica
- Botones de navegación

**Props:**
- `exercise`: Datos del ejercicio
- `exerciseIndex`: Índice dentro del grupo actual
- `onToggleSetComplete`: Callback para marcar serie
- `onUpdateSetWeight`: Callback para actualizar peso
- `onPrevious/onNext`: Callbacks de navegación

**Estado Interno:**
- `showTimer`: Si mostrar temporizador simple
- `showTabata`: Si mostrar temporizador Tabata
- `notesInput`: Notas del usuario

### 1.2 Hooks Personalizados

#### `useTimer.ts`
**Propósito:** Temporizador simple con cuenta regresiva

**API:**
```typescript
const {
  seconds,        // Segundos restantes
  isRunning,      // Si está corriendo
  isComplete,     // Si completó
  start,          // Iniciar
  pause,          // Pausar
  reset,          // Reiniciar
  formatTime      // Formatear tiempo (MM:SS)
} = useTimer(initialSeconds, onComplete);
```

**Implementación:**
- Usa `setInterval` para contar cada segundo
- Limpia intervalo al desmontar o cambiar estado
- Llama `onComplete` cuando llega a 0

#### `useTabata.ts`
**Propósito:** Temporizador Tabata con rondas trabajo/descanso

**API:**
```typescript
const {
  currentRound,   // Ronda actual (1-8)
  totalRounds,    // Total de rondas
  seconds,        // Segundos restantes
  isWorking,      // Si está en fase de trabajo
  isRunning,      // Si está corriendo
  isComplete,     // Si completó todas las rondas
  start,          // Iniciar
  pause,          // Pausar
  reset,          // Reiniciar
  formatTime      // Formatear tiempo (SS)
} = useTabata(workSeconds, restSeconds, rounds);
```

**Lógica:**
1. Inicia en fase de trabajo
2. Al llegar a 0, cambia a descanso
3. Al terminar descanso, avanza ronda
4. Repite hasta completar todas las rondas

### 1.3 Utilidades

#### `storage.ts` - Gestión de Persistencia

**Funciones Principales:**

```typescript
// Guardar/Cargar rutina
saveRoutine(routine: Routine): void
loadRoutine(): Routine | null

// Gestión de sesiones
saveSession(session: WorkoutSession): void
getSessions(): WorkoutSession[]

// Historial de pesos
getPreviousWeights(day: number, exerciseId: string): string[] | undefined

// Reset
resetDay(day: number): void

// Guardar sesión del día
saveDaySession(day: number, routine: Routine): void
```

**Formato de Almacenamiento:**

**Rutina (`gym_routine`):**
```json
{
  "routine_id": "rutina_4_dias_csv",
  "days": [
    {
      "day": 1,
      "focus": "Pierna / Core",
      "exercises": [
        {
          "id": "d1-e1",
          "name": "Back Squat",
          "sets_reps": "1x10, 1x8, 1x6, 1x4",
          "sets": [
            {"reps": 10, "weight": "20", "completed": false},
            {"reps": 8, "weight": "30", "completed": false},
            ...
          ],
          "type": "Strength",
          "timer": null,
          "completed": false
        }
      ]
    }
  ]
}
```

**Sesiones (`gym_sessions`):**
```json
[
  {
    "day": 1,
    "date": "2026-02-06T10:30:00.000Z",
    "exercises": [
      {
        "exerciseId": "d1-e1",
        "weight": "20kg, 30kg, 40kg, 50kg",
        "notes": "Buen entrenamiento",
        "completed": true
      }
    ]
  }
]
```

#### `csvParser.ts` - Parser de CSV

**Función Principal:**
```typescript
parseCSV(csvContent: string): Routine
```

**Proceso de Parsing:**

1. **Dividir líneas:** Split por `\n`, filtrar vacías
2. **Parsear cada línea:**
   - Manejar comillas (CSV puede tener comillas)
   - Extraer: Día, Ejercicio, Series/Reps
3. **Detectar tipo:** Por nombre del ejercicio
4. **Parsear series:**
   - `"1x10"` → 1 set de 10 reps
   - `"3x30\""` → 3 sets con timer de 30s
   - `"8 rondas"` → 8 sets para Tabata
   - `"3x Fallo"` → 3 sets sin reps
5. **Extraer timer:** Buscar patrones `30"` o `1'`
6. **Crear estructura:** Agrupar por día, crear Routine

**Ejemplo de Parsing:**
```csv
Día 1,Back Squat,"1x10, 1x8, 1x6, 1x4",
```
Resultado:
```typescript
{
  id: "d1-e1",
  name: "Back Squat",
  sets_reps: "1x10, 1x8, 1x6, 1x4",
  sets: [
    {reps: 10, completed: false},
    {reps: 8, completed: false},
    {reps: 6, completed: false},
    {reps: 4, completed: false}
  ],
  type: "Strength",
  timer: null
}
```

---

## 2. Flujos de Datos

### 2.1 Flujo de Importación CSV

```
Usuario selecciona archivo
    ↓
handleFileUpload (Home.tsx)
    ↓
file.text() → Obtiene contenido
    ↓
parseCSV(csvContent) → Parsea a Routine
    ↓
saveRoutine(parsedRoutine) → Guarda en localStorage
    ↓
setRoutine(parsedRoutine) → Actualiza estado
    ↓
UI se actualiza → Muestra días disponibles
```

### 2.2 Flujo de Completado de Serie

```
Usuario hace click en checkbox
    ↓
onToggleSetComplete (ExerciseCard)
    ↓
handleToggleSetComplete (WorkoutView)
    ↓
Actualiza exercise.sets[index].completed
    ↓
Verifica si todas las series completadas
    ↓
Si todas completadas → Marca ejercicio como completado
    ↓
saveRoutine(updatedRoutine) → Guarda en localStorage
    ↓
setRoutine(updatedRoutine) → Actualiza estado
    ↓
UI se actualiza → Checkbox marcado, ejercicio completado
```

### 2.3 Flujo de Guardado de Peso

```
Usuario escribe en campo de peso
    ↓
onChange → onUpdateSetWeight (ExerciseCard)
    ↓
handleUpdateSetWeight (WorkoutView)
    ↓
Actualiza exercise.sets[index].weight
    ↓
saveRoutine(updatedRoutine) → Guarda inmediatamente
    ↓
setRoutine(updatedRoutine) → Actualiza estado
    ↓
UI muestra peso ingresado
```

### 2.4 Flujo de Avance entre Grupos

```
Usuario presiona "Siguiente"
    ↓
handleNextGroup (WorkoutView)
    ↓
Marca todos los ejercicios del grupo como completados
    ↓
Marca todas las series como completadas
    ↓
saveRoutine(updatedRoutine) → Guarda estado
    ↓
saveDaySession(day, updatedRoutine) → Guarda en historial
    ↓
groupExercises() → Reagrupa (por si cambió algo)
    ↓
setCurrentGroupIndex(index + 1) → Avanza índice
    ↓
Si es último grupo → Redirige a Home después de 500ms
    ↓
UI muestra siguiente grupo
```

---

## 3. Decisiones de Diseño

### 3.1 ¿Por qué localStorage y no IndexedDB?

**Decisión:** Usar localStorage para simplicidad

**Razones:**
- Datos pequeños (< 1MB típicamente)
- Operaciones síncronas más simples
- No requiere manejo de promesas
- Suficiente para MVP

**Limitaciones:**
- ~5-10MB máximo
- Solo strings (JSON.stringify/parse)
- Síncrono (puede bloquear UI con datos grandes)

**Futuro:** Migrar a IndexedDB si se necesita más capacidad

### 3.2 ¿Por qué agrupar ejercicios?

**Decisión:** Agrupar Circuitos, Biseries y Superseries

**Razones:**
- UX mejor: Usuario ve todos los ejercicios relacionados juntos
- Lógica de negocio: Se completan juntos
- Menos navegación: No necesita avanzar múltiples veces

**Implementación:**
- Función `groupExercises()` itera una vez
- Crea grupos dinámicamente según tipo consecutivo
- Cada grupo se muestra completo en pantalla

### 3.3 ¿Por qué pesos por serie y no peso general?

**Decisión:** Permitir peso diferente por serie

**Razones:**
- Realidad del entrenamiento: Pesos progresivos (ej: 20kg, 30kg, 40kg)
- Mejor tracking: Permite ver progresión exacta
- Historial más útil: Puede comparar serie por serie

**Implementación:**
- Cada `Set` tiene su propio campo `weight`
- Se guarda como string separado por comas en historial
- Se parsea al cargar para mostrar por serie

### 3.4 ¿Por qué PWA y no app nativa?

**Decisión:** PWA para MVP

**Razones:**
- Desarrollo más rápido
- Un solo código para web y móvil
- Instalable sin app stores
- Funciona offline

**Limitaciones:**
- Menos acceso a hardware (cámara, sensores)
- Performance ligeramente inferior a nativa
- Limitaciones de iOS (menos soporte PWA)

---

## 4. Manejo de Errores

### 4.1 Errores de Parsing CSV

**Escenarios:**
- CSV mal formateado
- Columnas faltantes
- Formato de series/reps inválido

**Manejo:**
```typescript
try {
  const parsedRoutine = parseCSV(text);
  // ... guardar
} catch (error) {
  alert('Error al importar el archivo CSV. Verifica el formato.');
  console.error('Error al importar CSV:', error);
}
```

### 4.2 Errores de localStorage

**Escenarios:**
- QuotaExceededError (muy poco probable)
- Datos corruptos

**Manejo:**
- Try-catch en funciones de storage
- Validación de datos al cargar
- Fallback a rutina vacía si datos inválidos

### 4.3 Errores de Navegación

**Escenarios:**
- Día no existe
- Rutina no cargada

**Manejo:**
```typescript
if (!stored) {
  navigate('/'); // Redirige a Home
  return;
}

if (!dayData) {
  navigate('/'); // Redirige a Home
  return;
}
```

---

## 5. Optimizaciones

### 5.1 Performance

**Optimizaciones Implementadas:**
- Componentes funcionales (más ligeros que clases)
- Estado local cuando es posible (no prop drilling)
- localStorage síncrono (no hay delays de red)
- Re-renders mínimos (solo cuando cambia estado relevante)

**Posibles Mejoras:**
- Memoización de componentes pesados
- Virtualización si hay muchos ejercicios
- Lazy loading de componentes

### 5.2 UX

**Optimizaciones:**
- Guardado inmediato (no hay "guardar" manual)
- Feedback visual inmediato (checkboxes, colores)
- Botones grandes (touch-friendly)
- Navegación intuitiva (Anterior/Siguiente)

---

## 6. Testing

### 6.1 Casos de Prueba Manuales

**Importación:**
1. CSV válido → Debe crear rutina
2. CSV inválido → Debe mostrar error
3. CSV vacío → Debe manejar gracefully

**Navegación:**
1. Avanzar entre grupos → Debe funcionar
2. Retroceder → Debe funcionar
3. Último ejercicio → Botón debe cambiar

**Persistencia:**
1. Completar serie → Debe guardarse
2. Cerrar y reabrir → Debe mantener estado
3. Reset día → Debe limpiar todo

**Temporizadores:**
1. Timer simple → Debe contar correctamente
2. Tabata → Debe alternar trabajo/descanso
3. Rest timer → Debe funcionar independiente

### 6.2 Tests Unitarios Sugeridos

```typescript
// csvParser.test.ts
describe('parseCSV', () => {
  it('should parse valid CSV correctly')
  it('should handle quoted fields')
  it('should detect exercise types')
  it('should parse sets/reps correctly')
})

// storage.test.ts
describe('storage', () => {
  it('should save and load routine')
  it('should save sessions')
  it('should get previous weights')
  it('should reset day')
})

// groupExercises.test.ts
describe('groupExercises', () => {
  it('should group consecutive circuits')
  it('should keep individual exercises separate')
  it('should handle mixed types')
})
```

---

## 7. Extensibilidad

### 7.1 Agregar Nuevos Tipos de Ejercicio

1. Agregar tipo a `ExerciseType`
2. Actualizar `detectExerciseType()` en csvParser
3. Actualizar `getTypeColor()` en ExerciseCard
4. Agregar lógica específica si es necesario

### 7.2 Agregar Nuevas Funcionalidades

**Ejemplo: Historial de Sesiones**
1. Crear componente `HistoryView.tsx`
2. Agregar ruta en `App.tsx`
3. Usar `getSessions()` para obtener datos
4. Mostrar gráficas o lista

**Ejemplo: Múltiples Rutinas**
1. Cambiar `routine_id` a selección de usuario
2. Agregar selector en Home
3. Guardar múltiples rutinas con diferentes keys
4. Actualizar storage para manejar múltiples rutinas

---

## 8. Troubleshooting

### 8.1 Problemas Comunes

**Rutina no se carga:**
- Verificar localStorage en DevTools
- Verificar formato JSON válido
- Limpiar localStorage y reimportar

**Pesos anteriores no aparecen:**
- Verificar que se completó ejercicio anteriormente
- Verificar formato de pesos en sesión guardada
- Verificar que `getPreviousWeights()` retorna datos

**Temporizadores no funcionan:**
- Verificar que `useTimer`/`useTabata` están montados
- Verificar que no hay múltiples instancias
- Verificar cleanup de intervals

**CSV no se importa:**
- Verificar formato del CSV
- Verificar encoding (debe ser UTF-8)
- Verificar que tiene columnas correctas

---

## 9. Referencias

### 9.1 Librerías Usadas
- React 18: Framework UI
- TypeScript: Tipado estático
- Vite: Build tool
- Tailwind CSS: Estilos
- React Router: Navegación
- Vite PWA: Funcionalidad PWA

### 9.2 Recursos
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite PWA](https://vite-pwa-org.netlify.app)

---

**Versión**: 1.0  
**Última Actualización**: Febrero 2026
