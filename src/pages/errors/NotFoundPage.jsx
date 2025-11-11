// ✅ Error 404
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-9xl font-bold text-[--color-cohispania-orange]">404</h1>
        <h2 className="text-3xl font-bold text-[--color-cohispania-blue] mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mt-4 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <button
          onClick={() => navigate('/myportal')}
          className="px-6 py-3 bg-[--color-cohispania-orange] hover:opacity-90 text-white font-semibold rounded-lg transition duration-200"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
