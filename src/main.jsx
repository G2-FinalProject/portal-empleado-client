import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './app.jsx'

/* MAIN.JSX = 
- Conectar React con el DOM (el HTML)
- Envolver la app con configuraciones globales
- Mantenerse lo más simple posible */

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
