import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import useAdminStore from '../../stores/useAdminStore';
import { Card, Modal, Button } from '../../components/ui';

export default function LocationListPage() {
  const navigate = useNavigate();

  // Zustand
  const locations = useAdminStore((state) => state.locations);
  const fetchLocations = useAdminStore((state) => state.fetchLocations);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  // Estado local
  const [query, setQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  // Efectos
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Filtrado
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations || [];
    return (locations || []).filter((loc) =>
      (loc.location_name || '').toLowerCase().includes(q)
    );
  }, [locations, query]);

  // Funciones de eliminación
  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLocation(locationToDelete.id);
      setShowDeleteModal(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error('Error al eliminar población:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setLocationToDelete(null);
  };

  // Renderizado
  return (
    <main className="space-y-6">
      {/* Botón de nueva población */}
      <div className="flex justify-end animate-fadeIn">
        <Link to="/locations/create" className="cursor-pointer">
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cohispania-blue text-white hover:opacity-90 transition font-medium cursor-pointer">
            <UserPlus className="w-6 h-6" />
            Nueva Población
          </button>
        </Link>
      </div>

      {/* TÍTULO Y SUBTÍTULO */}
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-cohispania-blue">
          Lista de poblaciones
        </h1>
        <p className="text-sm text-gray-300 mt-2 sm:text-base">
          Gestiona las poblaciones y sus festivos configurados
        </p>
      </div>

      {/* Card principal con el contenido */}
      <Card padding={true}>
        <div className='space-y-4 mb-6'>
          {/* Search Bar con icono de lupa */}
          <div className='relative w-full animate-fadeIn'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300' />
            <input
              type="text"
              aria-label="Buscar población"
              placeholder="Buscar por nombre de población..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:border-2 focus:border-cohispania-orange focus:ring-0 outline-none transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading?.locations && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cohispania-orange" />
          </div>
        )}

        {/* Error State */}
        {error && !loading?.locations && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-4">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Empty State or Table*/}
        {!loading?.locations && !error && (
          filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                {query
                  ? `No se encontraron poblaciones con "${query}"`
                  : 'No hay poblaciones registradas todavía'}
              </p>
              {!query && (
                <Link to="/locations/create" className="mt-4 inline-block">
                  <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cohispania-blue text-white hover:opacity-90 transition font-medium mx-auto">
                    <UserPlus className="w-6 h-6" />
                    Crear primera población
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-stroke">
              <table className="w-full">
                <thead className="border-b border-gray-stroke">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                      Nombre
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-stroke bg-white">
                  {filtered.map((loc) => (
                    <tr
                      key={loc.id}
                      className="hover:bg-light-background transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-cohispania-blue">
                          {loc.location_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          aria-label={`Ver detalles de ${loc.location_name}`}
                          onClick={() => navigate(`/locations/${loc.id}`)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-stroke transition cursor-pointer"
                        >
                          <Eye className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </main>
  );
}
