import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles.css'
import routerPortal from './routes/Router.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routerPortal} />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#FFFFFF',
          color: '#1F2A44',
          border: '1px solid #E0E4EA',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#22C55E',
            secondary: '#FFFFFF',
          },

          style: {
            borderLeft: '4px solid #22C55E',
          },
        },
        error: {
          iconTheme: {
            primary: '#EC5B59',
            secondary: '#FFFFFF',
          },
          style: {
            borderLeft: '4px solid #EC5B59',
          },
        },
        loading: {
          iconTheme: {
            primary: '#F68D2E',
            secondary: '#FFFFFF',
          },
          style: {
            borderLeft: '4px solid #F68D2E',
          },
        },
      }}
    />
  </StrictMode>,
)
