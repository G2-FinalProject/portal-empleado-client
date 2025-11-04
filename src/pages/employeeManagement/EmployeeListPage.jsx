import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import useAdminStore from '../../stores/useAdminStore';
import { Card, Modal, Button } from '../../components/ui';

export default function EmployeeListPage() {
  const navigate = useNavigate();

  // ============================================
  // ESTADO DE ZUSTAND
  // ============================================
  const users = useAdminStore((state) => state.users);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const deleteUser = useAdminStore((state) => state.deleteUser);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  const departments = useAdminStore((state) => state.departments);
  const fetchDepartments = useAdminStore((state) => state.fetchDepartments);

  // ============================================
  // ESTADO LOCAL
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // ESTADO PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15; // 15 empleados por página

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  // ============================================
  // FILTRADO
  // ============================================
  const filteredUsers = useMemo(() => {
    let result = users || [];

    // Filtrar por búsqueda (nombre o email)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Filtrar por departamento
    if (selectedDepartmentId) {
      result = result.filter(
        (user) => user.department_id === parseInt(selectedDepartmentId)
      );
    }

    return result;
  }, [users, searchQuery, selectedDepartmentId]);

  // ============================================
  // PAGINACIÓN - cálculo
  // ============================================

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // ============================================
  // FUNCIONES DE PAGINACIÓN
  // ============================================
  
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartmentId]);

  // ============================================
  // FUNCIONES DE ELIMINACIÓN
  // ============================================
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(employeeToDelete.id);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      

      if (paginatedUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    <main className="space-y-6">
      {/* Botón Nuevo Empleado */}
      <div className="flex justify-end">
        <Link to="/employees/create">
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cohispania-blue text-white hover:opacity-90 transition font-medium">
            <UserPlus className="w-6 h-6" />
            Nuevo Empleado
          </button>
        </Link>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Gestión de Empleados
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Administra la información de todos los empleados
        </p>
      </div>

      {/* Card principal */}
      <Card padding={true}>
        {/* Controles: Búsqueda + Filtro */}
        <div className="space-y-4 mb-6">
          {/* Barra de búsqueda */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              aria-label="Buscar empleado"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-1 focus:ring-cohispania-orange outline-none transition"
            />
          </div>

          {/* Filtro por departamento */}
          <div>
            <label
              htmlFor="department-filter"
              className="block text-sm font-semibold mb-2 text-cohispania-blue"
            >
              Filtrar por departamento
            </label>
            <select
              id="department-filter"
              value={selectedDepartmentId || ''}
              onChange={(e) =>
                setSelectedDepartmentId(e.target.value || null)
              }
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue focus:ring-1 focus:ring-cohispania-orange  outline-none transition"
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>

          {/* Información de resultados */}
          {filteredUsers.length > 0 && (
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} empleados
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading?.users && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cohispania-blue" />
          </div>
        )}

        {/* Error State */}
        {error && !loading?.users && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-4">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Empty State o Tabla */}
        {!loading?.users && !error && (
          filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                {searchQuery || selectedDepartmentId
                  ? 'No se encontraron empleados con esos criterios'
                  : 'No hay empleados registrados todavía'}
              </p>
              {!searchQuery && !selectedDepartmentId && (
                <Link to="/employees/create" className="mt-4 inline-block">
                  <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cohispania-blue text-white hover:opacity-90 transition font-medium mx-auto">
                    <UserPlus className="w-6 h-6" />
                    Crear primer empleado
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
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                        Nombre Completo
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                        Rol
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                        Departamento
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400">
                        Población
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-semibold text-gray-400">
                        Días Disponibles
                      </th>
                      <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-stroke bg-white">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-light-background transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-medium text-cohispania-blue">
                            {user.first_name} {user.last_name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {user.email}
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize text-cohispania-blue">
                            {user.role?.role_name || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {user.department?.department_name || '-'}
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {user.location?.location_name || '-'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-cohispania-orange">
                            {user.available_days}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Botón Ver */}
                            <button
                              type="button"
                              aria-label={`Ver detalles de ${user.first_name}`}
                              onClick={() => navigate(`/employees/${user.id}`)}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-stroke transition"
                            >
                              <Eye className="w-5 h-5 text-gray-400" />
                            </button>
                            {/* Botón Editar */}
                            <button
                              type="button"
                              aria-label={`Editar ${user.first_name}`}
                              onClick={() =>
                                navigate(`/employees/${user.id}/edit`)
                              }
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-stroke transition"
                            >
                              <Pencil className="w-5 h-5 text-gray-400" />
                            </button>
                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              aria-label={`Eliminar ${user.first_name}`}
                              onClick={() => handleDeleteClick(user)}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-50 transition"
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
                {paginatedUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="p-4 border border-gray-stroke"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-cohispania-blue">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <span className="font-semibold text-cohispania-orange">
                          {user.available_days} días
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Rol:</span>
                          <p className="font-medium text-cohispania-blue capitalize">
                            {user.role?.role_name || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Departamento:</span>
                          <p className="font-medium text-cohispania-blue">
                            {user.department?.department_name || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-400">Población:</span>
                        <p className="font-medium text-cohispania-blue">
                          {user.location?.location_name || '-'}
                        </p>
                      </div>

                      {/* Botones de acción en mobile */}
                      <div className="flex gap-2 pt-2 border-t border-gray-stroke">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => navigate(`/employees/${user.id}`)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => navigate(`/employees/${user.id}/edit`)}
                          className="flex-1"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteClick(user)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* CONTROLES DE PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-stroke">
                  {/* Botón Anterior */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-background text-cohispania-blue font-medium hover:bg-gray-stroke transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      
                      // Mostrar solo algunas páginas para no saturar
                      // Lógica: mostrar primera, última, actual y 2 alrededor
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        Math.abs(pageNumber - currentPage) <= 1;

                      if (!showPage) {
                        // Mostrar "..." solo una vez entre rangos
                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return (
                            <span key={pageNumber} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            currentPage === pageNumber
                              ? 'bg-cohispania-blue text-white'
                              : 'bg-light-background text-cohispania-blue hover:bg-gray-stroke'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-background text-cohispania-blue font-medium hover:bg-gray-stroke transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )
        )}
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            ¿Estás seguro de que deseas eliminar al empleado{' '}
            <span className="font-bold text-cohispania-blue">
              {employeeToDelete?.first_name} {employeeToDelete?.last_name}
            </span>
            ?
          </p>
          <p className="text-sm text-red-400">
            ⚠️ Esta acción no se puede deshacer. El empleado será eliminado permanentemente del sistema.
          </p>

          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={handleCancelDelete}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={loading?.users}
              className="flex-1"
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
