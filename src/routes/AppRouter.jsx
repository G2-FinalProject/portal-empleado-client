import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
