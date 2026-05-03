Despliegue en Neon (Postgres) y Render (API + Web)

Resumen de pasos:

1. Crear base de datos en Neon
   - Ir a https://neon.tech y crear un nuevo proyecto (gratuito disponible).
   - Crear una branch o base de datos; copiar la cadena de conexión (connection string) en "Connection -> URI".
   - La cadena será similar a: `postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require`

2. Configurar variables de entorno localmente (opcional)
   - Copiar `.env.example` a `apps/api/.env` para pruebas locales. Actualizar `DATABASE_URL`.
   - Ejecutar migraciones y seed localmente:

```bash
# desde proyecto/apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

3. Subir el repo a GitHub
   - Crea un repositorio y empuja tu código a la rama `main`.

4. Crear servicios en Render
   - Ir a https://render.com
   - Crear un nuevo "Web Service" para la API
     - Conecta con tu repo de GitHub
     - Selecciona la rama `main`
     - Environment: `Docker`
     - Dockerfile path: `apps/api/Dockerfile`
     - Start Command: `npx prisma migrate deploy && node dist/main.js`
     - Agrega secretos/env vars en la sección "Environment" (DATABASE_URL, SHADOW_DATABASE_URL, JWT_SECRET, REDIS_URL)
   - Crear otro "Web Service" para la Web (Next.js)
     - Dockerfile path: `apps/web/Dockerfile`
     - Start Command: `npm start`
     - Agrega `NEXT_PUBLIC_API_URL` apuntando a la URL pública del servicio API que creó Render.

5. Neon + Render notas importantes
   - Neon usa SSL; las cadenas de conexión ya incluyen `?sslmode=require` o parámetros equivalentes.
   - Para Prisma en producción, Render ejecutará `npx prisma migrate deploy` en el comando de inicio. Asegúrate que `prisma` no esté estrictamente en `devDependencies` sin estar instalado en la imagen (los Dockerfiles actuales instalan dependencias sin `NODE_ENV=production`, por lo que funciona).

6. Ejecutar migraciones/seed en Render
   - Al desplegar, `npx prisma migrate deploy` aplicará migraciones. Para ejecutar el `seed`, puedes añadir un deploy hook o un comando en `startCommand` que ejecute `node prisma/seed.js` después de las migraciones.

7. Verificar
   - Revisa los logs en Render para ambos servicios.
   - Abre la URL del frontend y prueba flujos (login, listar ofertas, etc.).

Si quieres, hago lo siguiente ahora:
- A: Te guío paso a paso mientras creas el proyecto en Neon y me pegas la `DATABASE_URL` para completar la configuración y secretos en Render.
- B: Preparo y subo automáticamente los archivos de configuración en el repo (ya añadí `.render.yaml` y `.env.example`) y te doy la lista de comandos concretos a ejecutar.

Dime cuál opción prefieres y sigo con el detalle exacto.
