import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
//se añade la importación de AppRouter
import AppRouter from './routes/Router.jsx'
import { RouterProvider } from 'react-router-dom'
import routerPortal from './routes/Router.jsx'
import { Sidebar } from './components/common/SideBar.jsx'
import { Toaster } from 'react-hot-toast'

/* MAIN.JSX =
- Conectar React con el DOM (el HTML)
- Envolver la app con configuraciones globales
- Mantenerse lo más simple posible */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routerPortal} />
    <Sidebar/>
     <Toaster position="top-right" />
  </StrictMode>,
)
