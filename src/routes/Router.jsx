import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import NotFoundPage from "../pages/errors/NotFoundPage";
import NotAuthorizedPage from "../pages/errors/NotAuthorizedPage";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "../pages/auth/LoginPage";
import UserPage from "../pages/users/UserPage";
import RequestsPage from "../pages/requests/RequestsPage";
import LocationListPage from "../pages/locationHolidays/LocationListPage";
import CreateLocationPage from "../pages/locationHolidays/CreateLocationPage";
import EditLocationPage from "../pages/locationHolidays/EditLocationPage";
import DetailLocationPage from "../pages/locationHolidays/DetailLocationPage";
import EmployeeListPage from "../pages/employeeManagement/EmployeeListPage";
import CreateEmployeePage from "../pages/employeeManagement/CreateEmployeePage";
import EditEmployeePage from "../pages/employeeManagement/EditEmployeePage";
import DetailEmployeePage from "../pages/employeeManagement/DetailEmployeePage";


const router = createBrowserRouter([
  // ==========================================
  // RUTAS PÚBLICAS 
  // ==========================================
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <NotAuthorizedPage />,
  },

  // ==========================================
  // RUTAS PROTEGIDAS
  // ==========================================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Redirección inicial
      {
        index: true,
        element: <Navigate to="/myportal" replace />,
      },

      // Mis gestiones (todos los roles)
      {
        path: "myportal",
        element: (
          <ProtectedRoute allowedRoles={["employee", "manager", "admin"]}>
            <UserPage />
          </ProtectedRoute>
        ),
      },

      // Solicitudes (manager y admin)
      {
        path: "requests",
        element: (
          <ProtectedRoute allowedRoles={["manager", "admin"]}>
            <RequestsPage />
          </ProtectedRoute>
        ),
      },

      // Festivos por localización (solo admin)
      {
        path: "locations",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <LocationListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "locations/create",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateLocationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "locations/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditLocationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "locations/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <DetailLocationPage />
          </ProtectedRoute>
        ),
      },

      // Gestión de empleados (solo admin)y maa¡nager para ver empleados de su departamento
      {
        path: "employees",
        element: (
          <ProtectedRoute allowedRoles={["admin","manager",]}>
            <EmployeeListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/create",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateEmployeePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditEmployeePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <DetailEmployeePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ==========================================
  // ⚠️ RUTA 404
  // ==========================================
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
