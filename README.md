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

- El registro crea la cuenta y dirige a inicio de sesión. El JWT se conserva en memoria y la sesión se cierra cuando expira.
- Los estudiantes publican solicitudes inmediatas o programadas y seleccionan la materia por nombre del catálogo del backend. También indican nivel educativo, modalidad y duración, con tema, presupuesto por hora y ciudad opcionales.
- Los tutores consultan solicitudes activas, envían propuestas por hora y revisan su estado en **Mis ofertas**.
- Los estudiantes consultan las ofertas de sus solicitudes. Al aceptar una oferta, el backend crea la tutoría y esta aparece en **Mis tutorías**.
- Ambos roles pueden consultar sus tutorías y actualizar su estado (`confirmada`, `en_curso`, `finalizada`, `cancelada`). El tutor puede asignar el enlace de sala virtual.
- **Ubicaciones** permite buscar direcciones por texto y abrirlas en OpenStreetMap.

## Endpoints de la API integrados

| Método | Ruta | Rol / Auth | Uso |
|---|---|---|---|
| `POST` | `/api/auth/registro` | Público | Registro de estudiante o tutor. |
| `POST` | `/api/auth/login` | Público | Inicio de sesión, devuelve token JWT. |
| `GET` | `/api/materias` | Autenticado | Cargar el catálogo de materias para el formulario. |
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
| `GET` | `/api/mapas/buscar?q=...` | Autenticado | Buscar direcciones en OpenStreetMap. |

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
