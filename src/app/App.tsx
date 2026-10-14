import { RouterProvider } from 'react-router-dom'
import { SessionProvider } from '../features/auth/SessionContext'
import { router } from './router'

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
}
