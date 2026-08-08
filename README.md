# Frontend Web App - GamerHub (Torneos Multijuego)

Aplicación Web moderna desarrollada con Vite, React y Vanilla CSS estilo eSports Cyberpunk para organizar torneos con amigos.

## 🚀 Despliegue Gratuito en Netlify

Para tener tu página web pública 100% gratis en un dominio tipo `https://tu-torneo.netlify.app`:

1. **Crear Repositorio en GitHub:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   # Vincula a tu nuevo repositorio en GitHub
   git remote add origin https://github.com/TU_USUARIO/tu-frontend.git
   git push -u origin main
   ```

2. **Desplegar en Netlify:**
   - Inicia sesión gratis en [Netlify.com](https://netlify.com).
   - Haz clic en **Add new site** ➔ **Import an existing project**.
   - Conecta tu cuenta de GitHub y selecciona `tu-frontend`.
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
   - (Opcional) En **Site settings ➔ Environment variables**, agrega `VITE_API_URL` con el dominio HTTPS de tu backend en Render.
   - Haz clic en **Deploy site**.

¡Tu sitio estará en línea instantáneamente con SSL gratis!
