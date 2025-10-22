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
├── api/           # Funciones para llamadas a la API del backend
├── assets/        # Imágenes, íconos y archivos estáticos
├── components/    # Componentes reutilizables (botones, inputs, cards, etc.)
├── hooks/         # Custom hooks de React
├── layout/        # Componentes de layout (Header, Footer, Sidebar)
├── pages/         # Páginas de la aplicación (Login, Dashboard, Vacaciones, etc.)
├── routes/        # Configuración de rutas y navegación
├── services/      # Lógica de negocio y servicios
├── stores/        # Estado global (Context API o Zustand)
├── test/          # Tests unitarios y de integración
├── validators/    # Validaciones de formularios
├── App.jsx        # Componente principal
├── main.jsx       # Punto de entrada de la aplicación
└── styles.css     # Estilos globales y configuración de Tailwind
```

## 🎨 Stack Tecnológico

- **Vite** - Build tool y dev server
- **React 19** - Biblioteca de UI
- **Tailwind CSS v4** - Framework de CSS
- **React Router** (próximamente) - Navegación
- **Axios** (próximamente) - Cliente HTTP

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

### `/validators`
Validaciones de formularios y datos:
- `loginValidator.js` - Validar formulario de login
- `vacationValidator.js` - Validar solicitud de vacaciones
- `userValidator.js` - Validar datos de usuario

