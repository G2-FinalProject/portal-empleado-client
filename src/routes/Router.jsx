import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const routerPortal = createBrowserRouter([
  {
    path: "/",
    element: < Navigate to="/login" />
  },
  {
    path: "/login",
    element: < LoginPage />
  },
  {
    path: "/employee",
    element: <EmployeeDashboard />
  },
  {
    path: "/admin",
    element: <AdminDashboard />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

export default routerPortal;
