# Lumen Frontend

Frontend de Lumen, una plataforma que conecta estudiantes con tutores académicos. Construido con React 19, TypeScript, Vite y React Router.

## Requisitos

- Node.js compatible con Vite (Node.js 20+ o 22+).
- npm o pnpm.
- El backend de Lumen ejecutándose (localmente en `http://localhost:3000` o en Render).

## Instalación y ejecución

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `.env.local` con la URL base del backend:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Para producción en Render, define la variable de entorno `VITE_API_BASE_URL` en el dashboard apuntando al URL de tu servicio web backend.

## Funcionalidades integradas

- **Autenticación completa:**
  - Registro con rol diferenciado (`estudiante` y `tutor`).
  - Inicio de sesión con JWT y cierre de sesión.
  - Decodificación y validación de claims (`exp`, `rol`, etc.) en memoria con manejo de expiración de sesión.
- **Solicitudes de tutoría (`/solicitudes`):**
  - **Estudiante:** Creación de solicitudes con materia, modalidad (presencial/virtual), duración, tema específico, descripción y geolocalización opcional.
  - **Estudiante:** Detalle de solicitud (`/solicitudes/:id`) con lista de ofertas recibidas de tutores y opción de aceptar oferta.
  - **Tutor:** Exploración de solicitudes abiertas creadas por estudiantes con formulario en línea para enviar ofertas de precio y mensaje.
- **Tutorías confirmadas (`/tutorias`):**
  - Lista de sesiones confirmadas para el usuario autenticado (estudiante o tutor).
  - **Tutor:** Configuración y edición del enlace de sala virtual (Meet, Zoom, Teams, etc.).
  - **Tutor y Estudiante:** Actualización del estado de la tutoría (`programada`, `en_curso`, `finalizada`, `cancelada`).
- **Exploración de tutores y búsqueda por ubicación (`/tutores` y `/ubicaciones`):**
  - Búsqueda radial basada en geolocalización real (Haversine) mediante el endpoint `/api/mapas/buscar`.
  - Filtro por radio de búsqueda en kilómetros y rol (`tutor` / `estudiante`).
  - Visualización de perfiles con distancia calculada, tarifas y calificaciones.

## Endpoints de la API integrados

| Método | Ruta | Rol / Auth | Uso |
|---|---|---|---|
| `POST` | `/api/auth/registro` | Público | Registro de estudiante o tutor. |
| `POST` | `/api/auth/login` | Público | Inicio de sesión, devuelve token JWT. |
| `GET` | `/api/solicitudes` | Tutor | Listar solicitudes abiertas disponibles. |
| `GET` | `/api/solicitudes/mis-solicitudes` | Estudiante | Listar solicitudes propias del estudiante. |
| `POST` | `/api/solicitudes` | Estudiante | Crear una nueva solicitud de tutoría. |
| `GET` | `/api/solicitudes/:id/ofertas` | Estudiante | Ver ofertas recibidas para una solicitud. |
| `POST` | `/api/ofertas` | Tutor | Enviar una oferta de precio y mensaje a una solicitud. |
| `PATCH` | `/api/ofertas/:id/aceptar` | Estudiante | Aceptar una oferta de tutoría. |
| `GET` | `/api/ofertas/tutor/mis-ofertas` | Tutor | Listar ofertas enviadas por el tutor. |
| `GET` | `/api/tutorias/mis-tutorias` | Autenticado | Listar tutorías confirmadas del usuario. |
| `PATCH` | `/api/tutorias/:id/enlace` | Tutor | Actualizar enlace de sala virtual de la tutoría. |
| `PATCH` | `/api/tutorias/:id/estado` | Autenticado | Actualizar estado de la sesión de tutoría. |
| `GET` | `/api/mapas/buscar?lat=...&lng=...&radio=...&rol=...` | Autenticado | Buscar tutores o estudiantes por proximidad geográfica. |

## Despliegue en Render

Este proyecto está configurado como **Static Site** en Render:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Rewrite Rule:** `/*` → `/index.html` (para soportar navegación SPA con React Router)
- **Environment Variable:** `VITE_API_BASE_URL` = URL de tu backend desplegado en Render (ej. `https://lumen-backend.onrender.com`)

## Verificaciones

```bash
npm run lint
npm run build
```
