# Portal del Empleado - Cliente

Sistema de gestión de vacaciones para empleados

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📁 Estructura de carpetas

```
src/
├── api/           # Cliente HTTP (Axios) con interceptores
│   └── client.js  # Configuración de Axios y manejo global de errores
├── assets/        # Imágenes, íconos y archivos estáticos
├── components/    # Componentes reutilizables
│   ├── common/    # Componentes comunes (SideBar, etc.)
│   ├── form/      # Componentes de formularios (EmployeeForm, etc.)
│   ├── ui/        # Componentes UI base (Button, Card, Modal, Input, Badge, Tabs)
│   └── vacation/  # Componentes específicos de vacaciones
├── hooks/         # Custom hooks de React
├── layout/        # Componentes de layout (MainLayout, SideBar)
├── pages/         # Páginas de la aplicación
│   ├── auth/      # Páginas de autenticación
│   ├── employeeManagement/  # Gestión de empleados
│   ├── locationHolidays/    # Gestión de poblaciones y festivos
│   ├── requests/  # Gestión de solicitudes de vacaciones
│   ├── users/     # Portal del usuario
│   └── errors/    # Páginas de error (404, 401)
├── routes/        # Configuración de rutas y navegación
├── services/      # Servicios de API (authApi, vacationApi, userApi, etc.)
├── stores/        # Estado global con Zustand
│   ├── authStore.js       # Estado de autenticación
│   ├── useAdminStore.js   # Estado de administración
│   └── useVacationStore.js # Estado de vacaciones
├── test/          # Tests unitarios y de integración
├── utils/         # Utilidades centralizadas
│   ├── notifications.js  # Sistema de toasts centralizado
│   ├── validation.js    # Funciones de validación reutilizables
│   └── errors.js        # Manejo centralizado de errores de API
├── validators/    # Validaciones de formularios (legacy, migrar a utils/validation.js)
├── main.jsx       # Punto de entrada de la aplicación
└── styles.css     # Estilos globales y configuración de Tailwind
```

## 🎨 Stack Tecnológico

- **Vite** - Build tool y dev server
- **React 19** - Biblioteca de UI
- **Tailwind CSS v4** - Framework de CSS
- **React Router** - Navegación y rutas protegidas
- **Axios** - Cliente HTTP con interceptores
- **Zustand** - Gestión de estado global
- **React Hook Form** - Manejo de formularios
- **react-hot-toast** - Sistema de notificaciones toast
- **FullCalendar** - Componente de calendario
- **date-fns** - Utilidades para manejo de fechas

## 📝 Propósito de cada carpeta

### `/api`
Contiene todas las funciones que hacen peticiones HTTP al backend. Por ejemplo:
- `authApi.js` - Login, logout, registro
- `vacationsApi.js` - CRUD de vacaciones
- `usersApi.js` - Gestión de usuarios

### `/components`
Componentes reutilizables en toda la app:
- `Button.jsx` - Botón personalizado
- `Input.jsx` - Input de formulario
- `Card.jsx` - Tarjeta para mostrar información
- `Modal.jsx` - Ventana modal

### `/hooks`
Custom hooks para lógica reutilizable:
- `useAuth.js` - Manejo de autenticación
- `useFetch.js` - Hook para peticiones HTTP
- `useForm.js` - Gestión de formularios

### `/layout`
Componentes que estructuran las páginas:
- `Header.jsx` - Barra superior con navegación
- `Sidebar.jsx` - Menú lateral
- `Footer.jsx` - Pie de página
- `MainLayout.jsx` - Layout principal que envuelve las páginas

### `/pages`
Páginas completas de la aplicación:
- `Login.jsx` - Página de inicio de sesión
- `Dashboard.jsx` - Panel principal
- `VacationRequest.jsx` - Solicitar vacaciones
- `VacationHistory.jsx` - Histórico de vacaciones
- `AdminPanel.jsx` - Panel de administración

### `/routes`
Configuración del sistema de rutas:
- `AppRouter.jsx` - Configuración de rutas
- `PrivateRoute.jsx` - Rutas protegidas (requieren autenticación)
- `AdminRoute.jsx` - Rutas solo para administradores

### `/services`
Lógica de negocio separada de los componentes:
- `vacationService.js` - Cálculos de días disponibles
- `dateService.js` - Manejo de fechas y festivos
- `authService.js` - Validación de tokens

### `/stores`
Gestión del estado global:
- `authStore.js` - Estado de autenticación
- `userStore.js` - Información del usuario actual
- `vacationStore.js` - Estado de vacaciones

### `/test`
Pruebas automatizadas:
- `components/` - Tests de componentes
- `pages/` - Tests de páginas
- `utils/` - Tests de utilidades

### `/utils`
Utilidades centralizadas para toda la aplicación:
- `notifications.js` - Sistema de toasts centralizado (showSuccess, showError, showInfo, showLoading)
- `validation.js` - Funciones de validación reutilizables (email, password, nombres, etc.)
- `errors.js` - Manejo centralizado de errores de API (getApiErrorMessage, handleUnauthorizedError)

### `/validators`
Validaciones de formularios (legacy - migrar a `/utils/validation.js`):
- Funciones de validación específicas por formulario

## 🔧 Utilidades Centralizadas

### Notificaciones (Toasts)
Todas las notificaciones se gestionan a través de `src/utils/notifications.js`:

```javascript
import { showSuccess, showError, showInfo, showLoading, dismiss } from '../../utils/notifications';

// Ejemplo de uso
showSuccess('Operación exitosa');
showError('Error al procesar');
showInfo('Información importante');

// Para operaciones asíncronas
const loadingToast = showLoading('Procesando...');
// ... operación ...
dismiss(loadingToast);
showSuccess('Completado');
```

### Validaciones
Funciones de validación reutilizables en `src/utils/validation.js`:

```javascript
import { isValidEmail, isStrongPassword, isValidPersonName } from '../../utils/validation';

// Ejemplo de uso
if (!isValidEmail(email)) {
  showError('Email inválido');
}
```

### Manejo de Errores
Extracción de mensajes de error de API en `src/utils/errors.js`:

```javascript
import { getApiErrorMessage } from '../../utils/errors';

try {
  await apiCall();
} catch (error) {
  const message = getApiErrorMessage(error);
  showError(message);
}
```

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores definida en `src/styles.css`:

- **CoHispania Orange**: `#F68D2E` - Color principal de marca
- **CoHispania Blue**: `#1F2A44` - Color secundario de marca
- **Red 400**: `#EC5B59` - Festivos en calendarios
- **Light Green 400/600**: `#9CCC65` / `#7CB342` - Vacaciones aprobadas
- **Light Background**: `#F4F6FA` - Fondo claro
- **Gray Stroke**: `#E0E4EA` - Bordes y separadores

Todos los componentes deben usar estas variables CSS en lugar de valores hardcodeados.

