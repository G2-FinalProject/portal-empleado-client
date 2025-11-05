import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import useAdminStore from '../../stores/useAdminStore';
import { Card, Modal, Button } from '../../components/ui';

export default function LocationListPage() {
  const navigate = useNavigate();

  // ============================================
  // ESTADO DE ZUSTAND
  // ============================================
  const locations = useAdminStore((state) => state.locations);
  const fetchLocations = useAdminStore((state) => state.fetchLocations);
  const deleteLocation = useAdminStore((state) => state.deleteLocation); // ✅ AÑADIDO
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  // ============================================
  // ESTADO LOCAL
  // ============================================
  const [query, setQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // ============================================
  // FILTRADO
  // ============================================
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations || [];
    return (locations || []).filter((loc) =>
      (loc.location_name || '').toLowerCase().includes(q)
    );
  }, [locations, query]);

  // ============================================
  // FUNCIONES DE ELIMINACIÓN
  // ============================================
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

  // ============================================
  // RENDERIZADO
  // ============================================
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

      {/* Título y subtítulo */}
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-cohispania-blue">
          Lista de poblaciones
        </h1>
        <p className="text-sm text-gray-300 mt-2 sm:text-base">
          Gestiona las poblaciones y sus festivos configurados
        </p>
      </div>

      {/* Card principal */}
      <Card className="animate-fadeIn" padding={true}>
        {/* Búsqueda */}
        <div className="space-y-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
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

        {/* Empty State o Tabla */}
        {!loading?.locations && !error && (
          filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                {query
                  ? `No se encontraron poblaciones con "${query}"`
                  : 'No hay poblaciones registradas todavía'}
              </p>
              {!query && (
                <Link to="/locations/create" className="mt-4 inline-block cursor-pointer">
                  <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cohispania-blue text-white hover:opacity-90 transition font-medium mx-auto cursor-pointer">
                    <UserPlus className="w-6 h-6" />
                    Crear primera población
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-gray-stroke">
                <table className="w-full">
                  <thead className="border-b border-gray-stroke">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-300">
                        Nombre de Población
                      </th>
                      <th className="text-center py-3 px-6 text-sm font-medium text-gray-300">
                        Festivos
                      </th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-gray-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-stroke bg-white">
                    {filtered.map((location) => ( // ✅ CORREGIDO: filtered en lugar de filteredLocations
                      <tr
                        key={location.id}
                        className="hover:bg-light-background transition-colors cursor-pointer"
                        onClick={() => navigate(`/locations/${location.id}`)}
                      >
                        <td className="py-4 px-6">
                          <span className="font-medium text-cohispania-blue">
                            {location.location_name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-cohispania-orange">
                            {location.holidays?.length || 0} festivos
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Botón Ver */}
                            <button
                              type="button"
                              aria-label={`Ver detalles de ${location.location_name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/locations/${location.id}`);
                              }}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-stroke transition cursor-pointer"
                            >
                              <Eye className="w-5 h-5 text-gray-400" />
                            </button>
                            {/* Botón Editar */}
                            <button
                              type="button"
                              aria-label={`Editar ${location.location_name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/locations/${location.id}/edit`);
                              }}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-stroke transition cursor-pointer"
                            >
                              <Pencil className="w-5 h-5 text-gray-400" />
                            </button>
                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              aria-label={`Eliminar ${location.location_name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(location);
                              }}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4">
                {filtered.map((location) => (
                  <Card
                    key={location.id}
                    className="p-4 border border-gray-stroke cursor-pointer"
                    onClick={() => navigate(`/locations/${location.id}`)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-cohispania-blue">
                            {location.location_name}
                          </h3>
                        </div>
                        <span className="font-semibold text-cohispania-orange">
                          {location.holidays?.length || 0} festivos
                        </span>
                      </div>

                      {/* Botones de acción en mobile */}
                      <div className="flex gap-2 pt-2 border-t border-gray-stroke">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/locations/${location.id}`);
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/locations/${location.id}/edit`);
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(location);
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )
        )}
      </Card>

      {/* Modal de confirmación de eliminación - ✅ MOVIDO AL FINAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            ¿Estás seguro de que deseas eliminar la población{' '}
            <span className="font-bold text-cohispania-blue">
              {locationToDelete?.location_name}
            </span>
            ?
          </p>
          <p className="text-sm text-red-400">
            ⚠️ Esta acción no se puede deshacer. La población y todos sus festivos serán eliminados permanentemente del sistema.
          </p>

          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={handleCancelDelete}
              className="flex-1 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={loading?.locations}
              className="flex-1 cursor-pointer"
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
