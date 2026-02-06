# PRD: Gym Tracker - Rutina de Entrenamiento

## 1. Visión General

**Gym Tracker** es una aplicación web progresiva (PWA) diseñada para reemplazar el uso de archivos CSV/Excel en el seguimiento de entrenamientos en gimnasio. La app permite gestionar rutinas estructuradas, registrar pesos por serie, cronometrar descansos y visualizar el progreso histórico.

### Objetivos Principales
- Facilitar el seguimiento de entrenamiento en tiempo real dentro del gimnasio
- Reemplazar archivos CSV/Excel con una interfaz móvil-friendly
- Permitir registro de pesos por serie individual
- Proporcionar herramientas de temporización (descansos, Tabatas, ejercicios con tiempo)
- Funcionar completamente offline

---

## 2. Arquitectura de la Aplicación

### 2.1 Stack Tecnológico
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Routing**: React Router v6
- **Persistencia**: localStorage (IndexedDB implícito)
- **PWA**: Vite Plugin PWA

### 2.2 Estructura de Carpetas
```
src/
├── components/        # Componentes reutilizables
│   ├── ExerciseCard.tsx
│   ├── Timer.tsx
│   ├── TabataTimer.tsx
│   └── RestTimer.tsx
├── pages/            # Vistas principales
│   ├── Home.tsx
│   └── WorkoutView.tsx
├── hooks/            # Custom hooks
│   ├── useTimer.ts
│   └── useTabata.ts
├── utils/            # Utilidades
│   ├── storage.ts
│   └── csvParser.ts
├── types/            # Definiciones TypeScript
│   └── index.ts
└── data/             # Datos por defecto
    └── routine.ts
```

---

## 3. Modelo de Datos

### 3.1 Estructura Principal

```typescript
// Tipos de ejercicio
type ExerciseType = 'Strength' | 'Circuit' | 'Cardio' | 'Tabata' | 'Biserie' | 'Superserie';

// Serie individual con peso
interface Set {
  reps: number;              // Repeticiones (0 para Tabata/Cardio)
  weight?: string;            // Peso en kg para esta serie específica
  completed: boolean;         // Si la serie está completada
}

// Ejercicio completo
interface Exercise {
  id: string;                // ID único (ej: "d1-e1")
  name: string;              // Nombre del ejercicio
  sets_reps: string;         // Formato original (ej: "1x10, 1x8, 1x6, 1x4")
  sets: Set[];               // Array de series individuales
  type: ExerciseType;        // Tipo de ejercicio
  timer: number | null;      // Segundos para temporizador (null si no aplica)
  completed: boolean;        // Si el ejercicio está completado
  weight?: string;           // Peso general (legacy, para compatibilidad)
  notes?: string;            // Notas del usuario
  previousWeights?: string[]; // Pesos de la sesión anterior por serie
}

// Día de entrenamiento
interface Day {
  day: number;              // Número del día (1-4)
  focus: string;            // Enfoque del día (ej: "Pierna / Core")
  exercises: Exercise[];    // Lista de ejercicios
}

// Rutina completa
interface Routine {
  routine_id: string;        // ID de la rutina
  days: Day[];               // Array de días
}

// Sesión de entrenamiento (historial)
interface WorkoutSession {
  day: number;              // Día entrenado
  date: string;             // ISO timestamp
  exercises: {
    exerciseId: string;
    weight?: string;         // Pesos separados por comas
    notes?: string;
    completed: boolean;
  }[];
}
```

### 3.2 Almacenamiento

**localStorage Keys:**
- `gym_routine`: Rutina actual completa
- `gym_sessions`: Array de sesiones históricas

**Estructura de almacenamiento:**
```json
{
  "gym_routine": {
    "routine_id": "rutina_4_dias_csv",
    "days": [...]
  },
  "gym_sessions": [
    {
      "day": 1,
      "date": "2026-02-06T10:30:00.000Z",
      "exercises": [...]
    }
  ]
}
```

---

## 4. Flujos de Usuario

### 4.1 Flujo Principal: Importar y Entrenar

```
1. Usuario abre la app
   ↓
2. Pantalla Home (sin rutina cargada)
   - Muestra logo y título
   - Botón "Importar Rutina CSV"
   ↓
3. Usuario importa CSV
   - Selecciona archivo CSV
   - Parser procesa el CSV
   - Rutina se guarda en localStorage
   - Se muestran tarjetas de días
   ↓
4. Usuario selecciona un día
   - Navega a /workout/{dayNumber}
   - Se carga la rutina desde localStorage
   - Se agrupan ejercicios (Circuitos, Biseries, Superseries)
   - Se muestran pesos anteriores si existen
   ↓
5. Usuario entrena
   - Ve un ejercicio/grupo a la vez
   - Marca series como completadas
   - Ingresa pesos por serie
   - Puede iniciar temporizadores
   - Presiona "Siguiente" para avanzar
   ↓
6. Al completar último ejercicio
   - Botón cambia a "Completar Día"
   - Al presionar, marca todo como completado
   - Guarda sesión en historial
   - Redirige a Home
```

### 4.2 Flujo de Agrupación de Ejercicios

**Lógica de Agrupación:**
Los ejercicios consecutivos del mismo tipo se agrupan automáticamente:
- **Circuit**: Ejercicios con tipo "Circuit" consecutivos
- **Biserie**: Ejercicios con tipo "Biserie" consecutivos  
- **Superserie**: Ejercicios con tipo "Superserie" consecutivos

**Ejemplo:**
```
Ejercicio 1: Strength (individual)
Ejercicio 2: Circuit (grupo inicio)
Ejercicio 3: Circuit (grupo continúa)
Ejercicio 4: Circuit (grupo continúa)
Ejercicio 5: Strength (individual)
```

Resultado: Se muestran 3 grupos en pantalla (Strength, Circuit x3, Strength)

---

## 5. Funcionalidades Detalladas

### 5.1 Importación de CSV

**Formato CSV Esperado:**
```csv
Día,Ejercicio,Series x Reps,Peso (kg) / Notas
Día 1,Back Squat,"1x10, 1x8, 1x6, 1x4",
Día 1,CIRCUITO: Plancha con disco,"3x30""",
```

**Parser Logic (`csvParser.ts`):**
1. Lee archivo línea por línea
2. Extrae: Día, Nombre, Series/Reps
3. Detecta tipo de ejercicio por nombre:
   - Contiene "TABATA" → Tabata
   - Contiene "CARDIO" → Cardio
   - Contiene "CIRCUITO" → Circuit
   - Contiene "BISERIE" → Biserie
   - Contiene "SUPERSERIE" → Superserie
   - Por defecto → Strength
4. Parsea series/reps:
   - `"1x10, 1x8"` → Crea 2 sets con 10 y 8 reps
   - `"3x30\""` → Crea 3 sets con timer de 30s
   - `"8 rondas"` → Crea 8 sets para Tabata
   - `"3x Fallo"` → Crea 3 sets sin reps específicas
5. Extrae timer si existe (formato `30"` o `1'`)
6. Crea estructura de rutina con días ordenados

### 5.2 Visualización de Ejercicios

**Pantalla WorkoutView:**
- Muestra un grupo de ejercicios a la vez
- Si el grupo tiene múltiples ejercicios, muestra banner indicador
- Cada ejercicio muestra:
  - Nombre y series/reps originales
  - Pesos anteriores (si existen)
  - Lista de series con checkboxes
  - Campo de peso por serie
  - Campo de notas

**Navegación:**
- Botón "Anterior": Vuelve al grupo anterior (deshabilitado si es el primero)
- Botón "Siguiente": Avanza al siguiente grupo
- En último ejercicio: Botón cambia a "Completar Día"

### 5.3 Registro de Pesos

**Por Serie:**
- Cada serie tiene su propio campo de peso
- Se guarda inmediatamente al escribir
- Se muestra peso anterior entre paréntesis si existe

**Historial:**
- Al completar un ejercicio, se guarda sesión
- Pesos se almacenan como string separado por comas: `"20kg, 30kg, 40kg"`
- Al cargar día, se recuperan pesos anteriores y se muestran por serie

**Lógica de Guardado (`storage.ts`):**
```typescript
// Al completar ejercicio
const weights = exercise.sets.map(s => s.weight || '').join(',');
exercise.weight = weights; // Para compatibilidad
saveDaySession(day, routine);

// Al cargar día
const prevWeights = getPreviousWeights(day, exerciseId);
if (prevWeights) {
  exercise.previousWeights = prevWeights.split(',').map(w => w.trim());
}
```

### 5.4 Temporizadores

**Timer Simple (`Timer.tsx`):**
- Para ejercicios con tiempo fijo (ej: Plancha 30s)
- Botón "Iniciar Temporizador"
- Muestra cuenta regresiva grande
- Botones: Iniciar, Pausar, Reiniciar

**Tabata Timer (`TabataTimer.tsx`):**
- Para ejercicios tipo Tabata
- Configuración: 8 rondas por defecto
- Alterna entre trabajo (20s) y descanso (10s)
- Muestra ronda actual y tiempo restante
- Color rojo durante trabajo, verde durante descanso

**Rest Timer (`RestTimer.tsx`):**
- Cronómetro de descanso entre ejercicios
- Se activa manualmente desde botón flotante
- Widget pequeño en esquina inferior derecha
- 90 segundos por defecto
- Botones: Iniciar, Pausar, Reiniciar, Cerrar

### 5.5 Completado de Ejercicios

**Marcado de Series:**
- Click en checkbox marca serie como completada
- Si todas las series están completas → ejercicio se marca como completado automáticamente

**Marcado de Grupo:**
- Al presionar "Siguiente":
  1. Marca todos los ejercicios del grupo actual como completados
  2. Marca todas las series de cada ejercicio como completadas
  3. Guarda sesión en historial
  4. Avanza al siguiente grupo

**Completado de Día:**
- En último ejercicio, botón muestra "Completar Día"
- Al presionar:
  1. Marca último grupo como completado
  2. Guarda sesión completa
  3. Redirige a Home después de 500ms

---

## 6. Lógica de Negocio

### 6.1 Agrupación de Ejercicios

**Función `groupExercises()`:**
```typescript
// Agrupa ejercicios consecutivos del mismo tipo
// Tipos agrupables: Circuit, Biserie, Superserie
// Tipos individuales: Strength, Cardio, Tabata

Algoritmo:
1. Iterar sobre ejercicios
2. Si es tipo agrupable:
   - Si es mismo tipo que grupo actual → agregar al grupo
   - Si es diferente tipo → cerrar grupo anterior, iniciar nuevo
3. Si es tipo individual → cerrar grupo si existe, crear grupo individual
4. Retornar array de grupos (cada grupo es array de ejercicios)
```

### 6.2 Persistencia de Datos

**Guardado:**
- Cada cambio se guarda inmediatamente en localStorage
- No hay "modo edición" o "guardar manualmente"
- Operaciones síncronas (localStorage es síncrono)

**Carga:**
- Al iniciar WorkoutView, carga rutina desde localStorage
- Si no existe rutina → redirige a Home
- Carga pesos anteriores y los asigna a `previousWeights`

**Historial:**
- Se guarda sesión al completar ejercicio/grupo
- Formato: `{ day, date, exercises: [{ exerciseId, weight, notes, completed }] }`
- Se ordena por fecha descendente para obtener última sesión

### 6.3 Reset de Día

**Función `resetDay()`:**
- Resetea todos los ejercicios del día:
  - `completed = false`
  - `weight = undefined`
  - `notes = undefined`
  - Todas las series: `completed = false`, `weight = undefined`
- No elimina historial (solo resetea estado actual)

---

## 7. Componentes Técnicos

### 7.1 Hooks Personalizados

**`useTimer.ts`:**
- Hook para temporizador simple
- Estado: `seconds`, `isRunning`, `isComplete`
- Funciones: `start()`, `pause()`, `reset()`, `formatTime()`
- Auto-completa cuando llega a 0 y llama `onComplete`

**`useTabata.ts`:**
- Hook para temporizador Tabata
- Estado: `currentRound`, `seconds`, `isWorking`, `isRunning`, `isComplete`
- Lógica: Alterna entre trabajo y descanso
- Completa cuando termina todas las rondas

### 7.2 Utilidades

**`storage.ts`:**
- `saveRoutine(routine)`: Guarda rutina completa
- `loadRoutine()`: Carga rutina o retorna null
- `saveSession(session)`: Guarda sesión en historial
- `getSessions()`: Obtiene todas las sesiones
- `getPreviousWeights(day, exerciseId)`: Obtiene pesos anteriores
- `resetDay(day)`: Resetea día completo
- `saveDaySession(day, routine)`: Guarda sesión del día actual

**`csvParser.ts`:**
- `parseCSV(csvContent)`: Parsea CSV y retorna Routine
- `parseSetsReps(setsReps)`: Convierte string a array de Sets
- `detectExerciseType(name, setsReps)`: Detecta tipo por nombre
- `extractTimer(setsReps)`: Extrae segundos de formato tiempo

---

## 8. Casos de Uso

### 8.1 Usuario Importa Rutina por Primera Vez
1. Usuario abre app → Ve pantalla Home vacía
2. Click en "Importar Rutina CSV"
3. Selecciona archivo CSV
4. Parser procesa y crea estructura de rutina
5. Se guarda en localStorage
6. Aparecen tarjetas de días
7. Usuario puede comenzar a entrenar

### 8.2 Usuario Entrena Día Completo
1. Click en "Día 1"
2. Ve primer ejercicio/grupo
3. Marca series como completadas
4. Ingresa pesos por serie
5. Presiona "Siguiente" → Avanza al siguiente grupo
6. Repite hasta último ejercicio
7. Presiona "Completar Día"
8. Se guarda sesión completa
9. Vuelve a Home

### 8.3 Usuario Ve Pesos Anteriores
1. Abre día que ya entrenó antes
2. Al cargar, sistema busca última sesión del día
3. Extrae pesos guardados (formato: "20kg, 30kg, 40kg")
4. Los asigna a `previousWeights` de cada ejercicio
5. Se muestran en UI: "Anterior: 20kg, 30kg, 40kg"
6. También se muestran por serie entre paréntesis

### 8.4 Usuario Usa Temporizadores
1. Ve ejercicio con tiempo (ej: Plancha 30s)
2. Click en "Iniciar Temporizador"
3. Se muestra cuenta regresiva grande
4. Puede pausar/reanudar
5. Al completar, muestra "Completado"
6. Puede reiniciar o continuar

### 8.5 Usuario Entrena Circuito
1. Ve banner "CIRCUITO - 3 ejercicios"
2. Ve los 3 ejercicios del circuito en pantalla
3. Completa series de cada ejercicio
4. Presiona "Siguiente"
5. Todo el circuito se marca como completado
6. Avanza al siguiente grupo/ejercicio

---

## 9. Reglas de Negocio

### 9.1 Validaciones
- **CSV**: Debe tener columnas: Día, Ejercicio, Series x Reps
- **Día**: Debe ser número válido (1-4 o más según CSV)
- **Series**: Si no se pueden parsear, se crea set por defecto con reps=0

### 9.2 Comportamientos Automáticos
- Al completar todas las series → ejercicio se marca como completado
- Al presionar "Siguiente" → grupo actual se marca como completado
- Al completar día → se guarda sesión automáticamente
- Pesos se guardan inmediatamente al escribir

### 9.3 Restricciones
- No se puede avanzar sin completar grupo actual (botón siempre disponible pero marca como completado)
- No se puede editar ejercicios completados (solo resetear día)
- Historial no se puede editar (solo se agrega)

---

## 10. Interfaz de Usuario

### 10.1 Diseño Visual
- **Estilo**: Minimalista, limpio
- **Paleta**: Verde (#586e26, #778c43, etc.) para elementos activos
- **Fondo**: Blanco (#ffffff)
- **Tipografía**: Sistema (San Francisco, Segoe UI, etc.)
- **Espaciado**: Generoso, fácil de tocar en móvil

### 10.2 Componentes UI

**Home:**
- Logo verde circular arriba
- Título grande "Gym Tracker"
- Botón importar con borde punteado
- Lista de días con badges circulares

**WorkoutView:**
- Header fijo con navegación
- Indicadores de progreso (ejercicios/series)
- Card blanco con ejercicio
- Botones de navegación dentro del card
- Botón flotante "Descanso" abajo

**ExerciseCard:**
- Título del ejercicio
- Info anterior
- Lista de series con checkboxes
- Campos de peso por serie
- Campo de notas
- Botones Anterior/Siguiente

---

## 11. PWA (Progressive Web App)

### 11.1 Configuración
- **Manifest**: Configurado en `vite.config.ts`
- **Service Worker**: Generado automáticamente por Vite PWA
- **Offline**: Funciona completamente offline después de primera carga
- **Instalable**: Se puede instalar en dispositivo móvil

### 11.2 Caché
- Todos los assets estáticos se cachean
- Rutina y sesiones en localStorage (persisten offline)
- No requiere conexión para funcionar

---

## 12. Consideraciones Técnicas

### 12.1 Performance
- Carga inicial rápida (< 2 segundos objetivo)
- Operaciones síncronas (localStorage)
- Sin llamadas a API (100% cliente)

### 12.2 Compatibilidad
- Navegadores modernos (Chrome, Safari, Firefox, Edge)
- Mobile-first design
- Touch-friendly (botones grandes)

### 12.3 Limitaciones
- localStorage limitado (~5-10MB)
- No hay sincronización en la nube (MVP)
- No hay backup automático

---

## 13. Próximas Mejoras (Fuera del MVP)

### Fase 2
- Modo oscuro
- Gráficas de progreso
- Exportar datos a CSV/PDF

### Fase 3
- Sincronización en la nube
- Múltiples rutinas
- Compartir rutinas

---

## 14. Testing

### Casos de Prueba Críticos
1. Importar CSV válido → Debe crear rutina correctamente
2. Importar CSV inválido → Debe mostrar error
3. Completar serie → Debe marcar checkbox y actualizar estado
4. Completar ejercicio → Debe marcar ejercicio y avanzar
5. Completar día → Debe guardar sesión y redirigir
6. Cargar día con historial → Debe mostrar pesos anteriores
7. Reset día → Debe limpiar todos los estados
8. Temporizadores → Deben funcionar correctamente

---

## 15. Glosario

- **Serie**: Una repetición de un ejercicio (ej: 1x10 = 1 serie de 10 reps)
- **Set**: Objeto que representa una serie con su peso y estado
- **Grupo**: Conjunto de ejercicios agrupados (Circuitos, Biseries, Superseries)
- **Sesión**: Registro de un entrenamiento completo de un día
- **Rutina**: Estructura completa con todos los días y ejercicios
- **PWA**: Progressive Web App (app web instalable)

---

**Versión del Documento**: 1.0  
**Última Actualización**: Febrero 2026  
**Autor**: Equipo de Desarrollo Gym Tracker
