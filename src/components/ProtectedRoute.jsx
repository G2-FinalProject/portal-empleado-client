import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, user, isLoading } = useAuthStore();

  // CASO 1: Está cargando
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
        aria-label="Verificando autenticación"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-800"
            aria-hidden="true"
          ></div>
          <p className="text-gray-900 text-base font-medium">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // CASO 2: No está autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // CASO 3: No tiene el rol correcto
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div
            className="flex flex-col items-center text-center"
            role="status"
          >
            <div
              className="text-6xl mb-4"
              aria-hidden="true"
            >
              ⛔
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-900 mb-6 text-base">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-700">
              Tu rol actual: <span className="font-semibold">{user?.role || 'Sin rol'}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CASO 4: Todo OK
  return children;
}

export default ProtectedRoute;
