import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { HomePage } from '../features/home/HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { LocationsPage } from '../features/maps/LocationsPage'
import { SolicitudesPage } from '../features/solicitudes/SolicitudesPage'
import { NuevaSolicitudPage } from '../features/solicitudes/NuevaSolicitudPage'
import { DetalleSolicitudPage } from '../features/solicitudes/DetalleSolicitudPage'
import { MisOfertasPage } from '../features/solicitudes/MisOfertasPage'
import { MisTutoriasPage } from '../features/tutorias/MisTutoriasPage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/ubicaciones', element: <LocationsPage /> },
      { path: '/tutores', element: <Navigate to="/solicitudes" replace /> },
      { path: '/solicitudes', element: <SolicitudesPage /> },
      { path: '/solicitudes/nueva', element: <NuevaSolicitudPage /> },
      { path: '/solicitudes/:id', element: <DetalleSolicitudPage /> },
      { path: '/ofertas', element: <MisOfertasPage /> },
      { path: '/tutorias', element: <MisTutoriasPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
