// LocationController.ts línea 25-40
// export const getLocationById = async (req: Request, res: Response) => {
//   const location = await Location.findByPk(id, {
//     include: [
//       { model: User, attributes: ["id", "first_name", "last_name", "email"] },
//       { model: Holiday, attributes: ["id", "holiday_name", "holiday_date"] }, // ← ¡AQUÍ ESTÁN!
//     ],
//   });
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui';
import { getById as getLocationById } from '../../services/locationApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit } from 'lucide-react';

export default function DetailLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de la población
  useEffect(() => {
    const loadLocationData = async () => {
      if (!id) {
        setError('ID de población no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const locationData = await getLocationById(id);
        setLocation(locationData);
      } catch (error) {
        console.error('Error loading location:', error);
        const errorMessage = error.response?.data?.message || 'Error al cargar la población';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cohispania-orange" />
      </div>
    );
  }

  // Error state
  if (error || !location) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-cohispania-blue mb-2">
          {error || 'Población no encontrada'}
        </h2>
        <button
          onClick={() => navigate('/locations')}
          className="text-cohispania-blue hover:underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cohispania-blue">
            Población: {location.location_name}
          </h1>
          <p className="text-gray-300 mt-1">
            {location.holidays?.length || 0} festivos configurados
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/locations')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-cohispania-blue text-cohispania-blue hover:bg-light-background transition font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <button
            onClick={() => navigate(`/locations/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cohispania-orange text-cohispania-blue hover:opacity-90 transition font-semibold"
          >
            <Edit className="w-5 h-5" />
            Editar
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <Card padding={true}>
        <div className="space-y-6">
          {/* TODO: Añadir FullCalendar aquí */}
          <div className="text-center py-8 text-gray-400">
            📅 Calendario (próximamente)
          </div>

          {/* TODO: Añadir lista de festivos aquí */}
          <div className="text-center py-8 text-gray-400">
            📋 Lista de festivos (próximamente)
          </div>
        </div>
      </Card>
    </div>
  );
}
