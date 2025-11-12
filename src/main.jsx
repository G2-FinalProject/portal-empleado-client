import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { RouterProvider } from 'react-router-dom'
import routerPortal from './routes/Router.jsx'
import { Toaster } from 'react-hot-toast'

/* MAIN.JSX =
- Conectar React con el DOM (el HTML)
- Envolver la app con configuraciones globales
- Mantenerse lo más simple posible */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routerPortal} />
     <Toaster position="top-right" />
  </StrictMode>,
)
