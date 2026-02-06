# Gym Tracker - Rutina 4 Días

Aplicación web progresiva (PWA) para seguimiento de entrenamiento en gimnasio. Diseñada para funcionar offline y con interfaz optimizada para uso móvil durante el entrenamiento.

## Características

- ✅ Visualización de rutina por días (4 días)
- ✅ Checklist de progreso por ejercicio
- ✅ Temporizadores para ejercicios con tiempo (Planchas, etc.)
- ✅ Cronómetro de descanso automático
- ✅ Contador de rondas Tabata (8 rondas)
- ✅ Registro histórico de pesos por ejercicio
- ✅ Notas por ejercicio
- ✅ Código de colores por tipo de ejercicio
- ✅ Modo offline (PWA)
- ✅ Interfaz optimizada para móvil (botones grandes)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy a Vercel

### Opción 1: Desde GitHub (Recomendado)
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Conecta tu repositorio
4. Vercel detectará automáticamente Vite y desplegará

### Opción 2: Desde CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

Ver `DEPLOY.md` para más detalles.

## Estructura de Datos

Los datos se almacenan en localStorage con la siguiente estructura:

```typescript
{
  routine_id: string;
  days: [
    {
      day: number;
      focus: string;
      exercises: [
        {
          id: string;
          name: string;
          sets_reps: string;
          type: 'Strength' | 'Circuit' | 'Cardio' | 'Tabata';
          timer: number | null;
          completed: boolean;
          weight?: string;
          notes?: string;
          previousWeight?: string;
        }
      ]
    }
  ]
}
```

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- PWA (Vite Plugin PWA)
