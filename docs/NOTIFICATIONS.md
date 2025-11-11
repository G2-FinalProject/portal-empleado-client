# Sistema de Notificaciones Toast

## 📋 Descripción

Sistema de notificaciones toast implementado en toda la aplicación para proporcionar feedback visual inmediato de las acciones del usuario. Utiliza `react-hot-toast` con una capa de abstracción personalizada que garantiza consistencia y facilita el mantenimiento.

## ✅ Estado

**Completado** - Todos los criterios de aceptación han sido implementados.

## 🏗️ Arquitectura

El sistema está estructurado en tres capas:

```
┌─────────────────────────────────────┐
│   Componentes/Páginas/Stores       │
│   (Uso de notificaciones)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   src/utils/notifications.js        │
│   (API pública simplificada)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   src/services/toast.js            │
│   (Wrapper de react-hot-toast)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   react-hot-toast                   │
│   (Librería base)                   │
└─────────────────────────────────────┘
```

## 📦 Instalación y Configuración

### Dependencia

El sistema utiliza `react-hot-toast` v2.6.0, ya incluido en `package.json`:

```json
{
  "dependencies": {
    "react-hot-toast": "^2.6.0"
  }
}
```

### Configuración en `src/main.jsx`

El componente `Toaster` está configurado globalmente con estilos personalizados de la paleta Cohispania:

```jsx
import { Toaster } from 'react-hot-toast'

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
  </StrictMode>
)
```

**Configuración aplicada:**
- ✅ Posición: `top-right`
- ✅ Duración: `3000ms` (3 segundos) - configurado en `src/services/toast.js`
- ✅ Estilos personalizados con colores de la paleta Cohispania
- ✅ Accesibilidad: `aria-live` incluido por defecto en react-hot-toast

## 🔧 API de Notificaciones

### Archivo: `src/utils/notifications.js`

Este archivo expone una API simplificada y consistente para toda la aplicación:

```javascript
import { showSuccess, showError, showInfo, showLoading, dismiss } from '../../utils/notifications';
```

### Funciones Disponibles

#### `showSuccess(message, options?)`
Muestra un toast de éxito (verde).

```javascript
showSuccess('¡Empleado creado exitosamente!');
```

#### `showError(message, options?)`
Muestra un toast de error (rojo).

```javascript
showError('Error al guardar los cambios');
```

#### `showInfo(message, options?)`
Muestra un toast informativo (azul).

```javascript
showInfo('Los cambios se guardarán automáticamente');
```

#### `showLoading(message, options?)`
Muestra un toast de carga y devuelve su ID para poder cerrarlo después.

```javascript
const loadingId = showLoading('Guardando...');
// ... operación asíncrona ...
dismiss(loadingId);
showSuccess('Guardado exitosamente');
```

#### `dismiss(id)`
Cierra un toast específico por su ID.

```javascript
dismiss(loadingId);
```

## 📝 Ejemplos de Uso

### En Páginas de Autenticación

```javascript
// src/pages/auth/LoginPage.jsx
import { showSuccess, showError } from '../../utils/notifications';

const handleLogin = async (credentials) => {
  try {
    await login(credentials);
    showSuccess('¡Bienvenido de vuelta!');
    navigate('/myportal');
  } catch (error) {
    showError(error.response?.data?.message || 'Email o contraseña incorrectos');
  }
};
```

### En Operaciones CRUD

```javascript
// src/pages/employeeManagement/CreateEmployeePage.jsx
import { showSuccess, showError } from '../../utils/notificaciones';

const handleSubmit = async (data) => {
  try {
    await createEmployee(data);
    showSuccess('Empleado creado exitosamente');
    navigate('/employees');
  } catch (error) {
    showError('Error al crear el empleado. Por favor, intenta de nuevo.');
  }
};
```

### Con Estados de Carga

```javascript
import { showLoading, dismiss, showSuccess, showError } from '../../utils/notifications';

const handleAsyncOperation = async () => {
  const loadingId = showLoading('Procesando solicitud...');
  
  try {
    await processRequest();
    dismiss(loadingId);
    showSuccess('Solicitud procesada correctamente');
  } catch (error) {
    dismiss(loadingId);
    showError('Error al procesar la solicitud');
  }
};
```

### En Stores (Zustand)

```javascript
// src/stores/useVacationStore.js
import { showSuccess, showError } from '../utils/notifications';

const useVacationStore = create((set, get) => ({
  createRequest: async (data) => {
    try {
      const response = await vacationApi.createRequest(data);
      showSuccess('Solicitud de vacaciones creada');
      // ... actualizar estado ...
    } catch (error) {
      showError('Error al crear la solicitud');
      throw error;
    }
  },
}));
```

## 🎨 Personalización

### Duración Personalizada

La duración por defecto es de 3 segundos. Puedes personalizarla:

```javascript
showSuccess('Mensaje', { duration: 5000 }); // 5 segundos
showError('Error crítico', { duration: 0 }); // No se cierra automáticamente
```

### Opciones Adicionales

Todas las funciones aceptan opciones adicionales de `react-hot-toast`:

```javascript
showSuccess('Mensaje', {
  duration: 4000,
  position: 'top-center',
  style: {
    fontSize: '16px',
  },
});
```

## ✅ Criterios de Aceptación

| Criterio | Estado | Implementación |
|----------|--------|----------------|
| Errores muestran toast rojo con mensaje descriptivo | ✅ | `showError()` con estilo `var(--color-red-400)` |
| Éxitos muestran toast verde | ✅ | `showSuccess()` con estilo `var(--color-light-green-800)` |
| Toasts consistentes en toda la app | ✅ | API centralizada en `src/utils/notifications.js` |
| Toasts desaparecen automáticamente tras 3 segundos | ✅ | Configurado en `src/services/toast.js` con `duration: 3000` |
| Toasts accesibles (aria-live) | ✅ | Incluido por defecto en `react-hot-toast` |

## 📍 Ubicaciones de Archivos

```
src/
├── main.jsx                    # Configuración del Toaster
├── services/
│   └── toast.js               # Wrapper de react-hot-toast
└── utils/
    └── notifications.js       # API pública de notificaciones
```

## 🔍 Archivos que Utilizan Notificaciones

El sistema está integrado en:

- ✅ `src/pages/auth/LoginPage.jsx` - Login exitoso/error
- ✅ `src/pages/employeeManagement/` - CRUD de empleados
- ✅ `src/pages/locationHolidays/` - CRUD de ubicaciones
- ✅ `src/pages/requests/RequestsPage.jsx` - Gestión de solicitudes
- ✅ `src/pages/users/UserPage.jsx` - Gestión de usuarios
- ✅ `src/components/vacation/VacationRequestCalendar.jsx` - Solicitudes de vacaciones
- ✅ Stores (Zustand) - Operaciones asíncronas

## 🚀 Mejoras Futuras (Opcional)

- [ ] Agregar notificaciones de advertencia (`showWarning`)
- [ ] Implementar notificaciones persistentes para errores críticos
- [ ] Agregar acciones en los toasts (ej: "Deshacer")
- [ ] Implementar notificaciones agrupadas para múltiples eventos

## 📚 Referencias

- [Documentación de react-hot-toast](https://react-hot-toast.com/)
- [Guía de accesibilidad de notificaciones](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Portal Empleado

