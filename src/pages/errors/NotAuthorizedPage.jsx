// ✅ Error 403 (sin permisos)
import { useNavigate } from 'react-router-dom';

export default function NotAuthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="text-8xl mb-6">🔒</div>
        <h1 className="text-4xl font-bold text-[--color-cohispania-blue] mb-4">
          Acceso denegado
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          No tienes permisos para acceder a esta página.
          Si crees que esto es un error, contacta con el administrador.
        </p>
        <button
          onClick={() => navigate('/myportal')}
          className="px-6 py-3 bg-[--color-cohispania-orange] hover:bg-[#e57e1f] text-white font-semibold rounded-lg transition duration-200"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
