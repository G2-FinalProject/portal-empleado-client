import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import NotAuthorizedPage from '../pages/errors/NotAuthorizedPage';
import ProtectedRoute from '../components/ProtectedRoute';

// Requests
import MyRequestsPage from '../pages/requests/MyRequestsPage';
import TeamRequestsPage from '../pages/requests/TeamRequestsPage';
import AllRequestsPage from '../pages/requests/AllRequestsPage';

// Holidays
import MyHolidaysPage from '../pages/holidays/MyHolidaysPage';
import HolidaysPage from '../pages/holidays/HolidaysPage';

// Admin
import UsersPage from '../pages/users/UsersPage';
import DepartmentsPage from '../pages/departments/DepartmentsPage';

const router = createBrowserRouter([
  // 🏠 Públicas
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },

  // 📋 Solicitudes de Vacaciones
  {
    path: '/requests/my',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
        <MyRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/requests/team',
    element: (
      <ProtectedRoute allowedRoles={['manager', 'admin']}>
        <TeamRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/requests/all',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AllRequestsPage />
      </ProtectedRoute>
    ),
  },

  // 🎄 Festivos
  {
    path: '/holidays/my',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
        <MyHolidaysPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/holidays',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <HolidaysPage />
      </ProtectedRoute>
    ),
  },

  // 👤 Gestión de Usuarios (solo Admin)
  {
    path: '/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },

  // 🏢 Gestión de Departamentos (solo Admin)
  {
    path: '/departments',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DepartmentsPage />
      </ProtectedRoute>
    ),
  },

  // ⚠️ Errores
  {
    path: '/unauthorized',
    element: <NotAuthorizedPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  },
]);

export default router;
