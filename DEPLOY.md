# Guía de Deployment a Vercel

## Opción 1: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <tu-repo-url>
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Click en "Add New Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente que es un proyecto Vite
   - Click en "Deploy"

3. **Configuración automática:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Opción 2: Deploy desde CLI

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Para producción:**
   ```bash
   vercel --prod
   ```

## Configuración

El archivo `vercel.json` ya está configurado con:
- Build command correcto
- Output directory (`dist`)
- Rewrites para SPA routing (React Router)

## Variables de Entorno

No se requieren variables de entorno para esta aplicación (usa localStorage).

## Notas Importantes

- ✅ La app funciona completamente offline (PWA)
- ✅ No requiere backend ni base de datos
- ✅ Todas las rutas funcionan gracias a los rewrites configurados
- ✅ El build genera archivos estáticos optimizados

## Troubleshooting

Si tienes problemas con las rutas:
- Verifica que `vercel.json` tiene los rewrites configurados
- Asegúrate de que el build se completa correctamente
- Revisa los logs de build en Vercel dashboard
