// src/router/Router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';

// MVP Pages
import MyRequestsPage from '../pages/requests/MyRequestsPage';
import TeamRequestsPage from '../pages/requests/TeamRequestsPage';
import AllRequestsPage from '../pages/requests/AllRequestsPage';
import HolidaysPage from '../pages/holidays/HolidaysPage';
import MyHolidaysPage from '../pages/holidays/MyHolidaysPage';
import UsersPage from '../pages/users/UsersPage';
import DepartmentsPage from '../pages/departments/DepartmentsPage';
import ProfilePage from '../pages/users/ProfilePage';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },

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
  {
    path: '/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/departments',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DepartmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },

  { path: '*', element: <NotFoundPage /> },
]);

export default router;
