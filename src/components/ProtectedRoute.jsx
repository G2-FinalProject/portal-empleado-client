import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ROLE_NAME_BY_ID = {
  1: 'admin',
  2: 'manager',
  3: 'employee',
};

function FullScreenSpinner({ label = 'Cargando...' }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-800"
          aria-hidden="true"
        />
        <p className="text-gray-900 text-base font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // 1) Loading
  if (isLoading) return <FullScreenSpinner />;

  // 2) No autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3) Token expirado (si el backend puso exp en el JWT  y se guarda en user)
  if (user?.exp && user.exp * 1000 < Date.now()) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // 4) Roles
  const userRoleName = ROLE_NAME_BY_ID[user?.roleId] ?? null;
  const roleDenied =
    allowedRoles.length > 0 && !allowedRoles.includes(userRoleName);

  if (roleDenied) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4" aria-hidden="true">
            ⛔
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-4">
            Acceso denegado
          </h1>
          <p className="text-gray-900 mb-6 text-base">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-700">
            Tu rol actual:{' '}
            <span className="font-semibold">
              {userRoleName ?? 'Sin rol'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 5) OK
  return children;
}
