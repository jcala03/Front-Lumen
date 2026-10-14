# Lumen Frontend

Frontend de Lumen, una plataforma que conecta estudiantes con tutores académicos. Está construido con React, TypeScript, Vite y React Router.

## Requisitos

- Node.js compatible con la versión de Vite incluida en el proyecto (Node.js 20.19+ o 22.12+).
- npm.
- El backend de Lumen ejecutándose localmente en `http://localhost:3000`.

## Instalación y ejecución

Desde esta carpeta:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `.env.local` para apuntar al backend local:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Vite carga esta variable al iniciar. No incluyas secretos ni credenciales PostgreSQL en variables `VITE_*`: se incorporan al código del navegador.

## Funcionalidades integradas

- Registro de estudiantes y tutores.
- Login, validación del JWT mediante el endpoint de perfil y logout en memoria.
- Expiración de sesión basada en la fecha `exp` del JWT.
- Búsqueda manual de direcciones y lugares desde `/ubicaciones`; requiere sesión y consulta el endpoint de mapas existente. Los resultados se atribuyen a OpenStreetMap.
- Página `/tutores` informativa: el backend no expone un endpoint para listar tutores.

## API utilizada

El cliente HTTP central está en `src/services/api/client.ts`.

| Método | Ruta | Uso |
|---|---|---|
| `POST` | `/api/auth/registro` | Crear una cuenta de estudiante o tutor. |
| `POST` | `/api/auth/login` | Iniciar sesión. |
| `GET` | `/api/auth/perfil` | Validar el JWT recibido. Requiere `Authorization: Bearer <token>`. |
| `GET` | `/api/mapas/buscar?q=...` | Buscar lugares. Requiere JWT y devuelve resultados de Nominatim. |
| `GET` | `/` | Comprobar disponibilidad de la API; no se consume desde una pantalla. |

El backend no ofrece actualmente endpoints montados para listar tutores, gestionar tutorías o solicitudes. La interfaz no simula esos datos.

## Verificaciones

```bash
npm run build
npm run lint
```

## Limitaciones

- El token solo se conserva en memoria: recargar la página cierra la sesión.
- La búsqueda es deliberada (al enviar el formulario), requiere conexión y no constituye un mapa interactivo, geolocalización, ruta o reserva.
- La disponibilidad de resultados depende del servicio de búsqueda de OpenStreetMap usado por el backend.
