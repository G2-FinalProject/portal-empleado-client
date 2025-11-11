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
     <Toaster
       position="top-right"
       toastOptions={{
         style: {
           background: 'var(--color-cohispania-blue)',
           color: '#fff',
           border: '1px solid var(--color-blue-stroke)',
         },
         success: {
           style: {
             background: 'var(--color-light-green-800)',
             border: '1px solid var(--color-light-green-600)',
           },
           iconTheme: {
             primary: '#fff',
             secondary: 'var(--color-light-green-800)',
           },
         },
         error: {
           style: {
             background: 'var(--color-red-400)',
             border: '1px solid var(--color-red-400)',
           },
           iconTheme: {
             primary: '#fff',
             secondary: 'var(--color-red-400)',
           },
         },
       }}
     />
  </StrictMode>,
)
