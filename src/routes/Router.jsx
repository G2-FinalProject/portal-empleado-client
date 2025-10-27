import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const routerPortal = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/login' replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/employee',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'manager']}>
        <EmployeeDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export default routerPortal;
