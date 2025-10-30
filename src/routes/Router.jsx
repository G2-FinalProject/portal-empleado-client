import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import NotAuthorizedPage from '../pages/errors/NotAuthorizedPage';
import TestVacationStore from '../pages/errors/TestVacationStore';
import ProtectedRoute from '../components/ProtectedRoute';

// Mis gestiones
import UserPage from '../pages/users/UserPage';

// Requests
import RequestsPage from '../pages/requests/RequestsPage';

// Location Holidays
import LocationListPage from '../pages/locationHolidays/LocationListPage';
import CreateLocationPage from '../pages/locationHolidays/CreateLocationPage';
import EditLocationPage from '../pages/locationHolidays/EditLocationPage';
import DetailLocationPage from '../pages/locationHolidays/DetailLocationPage';

// Employee Management
import EmployeeListPage from '../pages/employeeManagement/EmployeeListPage';
import CreateEmployeePage from '../pages/employeeManagement/CreateEmployeePage';
import EditEmployeePage from '../pages/employeeManagement/EditEmployeePage';
import DetailEmployeePage from '../pages/employeeManagement/DetailEmployeePage';


const router = createBrowserRouter([
  // Públicas
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },

    // Mis gestiones 
  {
    path: '/myportal',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
        <UserPage />
      </ProtectedRoute>
    ),
  },
  // En Router.jsx, añade esta ruta temporal:
{
  path: '/test-vacation-store',
  element: (
    <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
      <TestVacationStore />
    </ProtectedRoute>
  ),
},


  // Solicitudes de Vacaciones
  
  {
    path: '/requests',
    element: (
      <ProtectedRoute allowedRoles={['manager', 'admin']}>
        <RequestsPage />
      </ProtectedRoute>
    ),
  },

 // Festivos por localización (solo Admin)
  {
    path: '/locations',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <LocationListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateLocationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <EditLocationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations/:id',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DetailLocationPage />
      </ProtectedRoute>
    ),
  },


// Gestión de Empleados (solo Admin)
  {
    path: '/employees',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <EmployeeListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateEmployeePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <EditEmployeePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees/:id',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DetailEmployeePage />
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
