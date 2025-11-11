import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Trash2, Calendar as CalendarIcon, Save, X, ArrowLeft } from 'lucide-react';
import { Modal, Card, Button } from '../../components/ui';
import { getById as getLocationById, update as updateLocation } from '../../services/locationApi';
import { create as createHoliday, deleteHoliday } from '../../services/holidaysApi';
import { showSuccess, showError, showInfo, showLoading, dismiss } from '../../utils/notifications';

export default function EditLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Estado
  const [locationName, setLocationName] = useState('');
  const [originalLocationName, setOriginalLocationName] = useState('');
  const [existingHolidays, setExistingHolidays] = useState([]);
  const [newHolidays, setNewHolidays] = useState([]);
  const [deletedHolidayIds, setDeletedHolidayIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [holidayName, setHolidayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ NUEVO: Modal de confirmación para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  // Cargar datos existentes
  useEffect(() => {
    const loadLocationData = async () => {
      if (!id || isNaN(parseInt(id))) {
        showError('ID de población no válido');
        navigate('/locations');
        return;
      }

      try {
        setIsLoading(true);
        const locationData = await getLocationById(id);

        if (!locationData || !locationData.location_name) {
          throw new Error('Datos de población incompletos');
        }

        setLocationName(locationData.location_name);
        setOriginalLocationName(locationData.location_name);
        setExistingHolidays(locationData.holidays || []);

        showSuccess('Población cargada correctamente');
      } catch (error) {

        let errorMessage = 'Error al cargar la población';
        if (error.response?.status === 404) {
          errorMessage = 'Población no encontrada';
        } else if (error.response?.status === 403) {
          errorMessage = 'No tienes permisos para editar esta población';
        }

        showError(errorMessage);
        navigate('/locations');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, [id, navigate]);

  // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formatear rango de fechas para el modal
  const formatDateRange = () => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) return formatDate(selectedDates[0]);

    const sortedDates = [...selectedDates].sort();
    return `${formatDate(sortedDates[0])} - ${formatDate(sortedDates[sortedDates.length - 1])}`;
  };

  // Manejar selección de rango de fechas (drag)
  const handleDateSelect = (selectInfo) => {
    const start = new Date(selectInfo.startStr);
    const end = new Date(selectInfo.endStr);

    const dates = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
      showError('Selección no válida. Selecciona al menos un día.');
      return;
    }

    setSelectedDates(dates);
    setIsModalOpen(true);
  };

  // ✅ NUEVO: Manejar click en evento (abrir modal de confirmación)
  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;

    const existingHoliday = existingHolidays.find(h => h.id.toString() === eventId);
    const newHoliday = newHolidays.find(h => h.tempId === eventId);

    if (existingHoliday || newHoliday) {
      setHolidayToDelete({ event: existingHoliday || newHoliday, isNew: !!newHoliday });
      setShowDeleteModal(true);
    }
  };

  // ✅ NUEVO: Confirmar eliminación desde modal
  const handleConfirmDelete = () => {
    if (!holidayToDelete) return;

    if (holidayToDelete.isNew) {
      // Es un festivo nuevo
      setNewHolidays(prev => prev.filter(h => h.tempId !== holidayToDelete.event.tempId));
      showSuccess('Festivo eliminado');
    } else {
      // Es un festivo existente
      setDeletedHolidayIds(prev => [...prev, holidayToDelete.event.id]);
      showSuccess('Festivo marcado para eliminar');
    }

    setShowDeleteModal(false);
    setHolidayToDelete(null);
  };

  // ✅ NUEVO: Cancelar eliminación
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setHolidayToDelete(null);
    showInfo('Eliminación cancelada');
  };

  // Añadir nuevo festivo temporal
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      showError('El nombre del festivo es obligatorio');
      return;
    }

    const existingDates = existingHolidays
      .filter(h => !deletedHolidayIds.includes(h.id))
      .map(h => h.holiday_date);

    const newDates = newHolidays.map(h => h.date);
    const allCurrentDates = [...existingDates, ...newDates];

    const duplicates = selectedDates.filter(date => allCurrentDates.includes(date));

    if (duplicates.length > 0) {
      showError('Ya hay festivos en algunas de las fechas seleccionadas');
      return;
    }

    const newHolidaysToAdd = selectedDates.map(date => ({
      date,
      name: holidayName.trim(),
      tempId: `new-${date}-${Date.now()}`,
    }));

    setNewHolidays(prev => [...prev, ...newHolidaysToAdd]);
    setHolidayName('');
    setSelectedDates([]);
    setIsModalOpen(false);

    const count = newHolidaysToAdd.length;
    showSuccess(`${count} festivo${count > 1 ? 's' : ''} añadido${count > 1 ? 's' : ''} al calendario`);
  };

  // Cancelar modal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setHolidayName('');
    setSelectedDates([]);

    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }

    showInfo('Selección cancelada');
  };

  // ✅ MEJORADO: Manejar cancelación con confirmación si hay cambios
  const handleCancelEdit = () => {
    const hasChanges =
      locationName.trim() !== originalLocationName ||
      newHolidays.length > 0 ||
      deletedHolidayIds.length > 0;

    if (hasChanges) {
      if (window.confirm('¿Descartar cambios sin guardar?')) {
        showInfo('Cambios descartados');
        navigate(`/locations/${id}`);
      }
    } else {
      navigate(`/locations/${id}`);
    }
  };

  // Lógica de guardado completa
  const handleSaveChanges = async () => {
    if (!locationName.trim()) {
      showError('El nombre de la población es obligatorio');
      return;
    }

    const totalHolidays = existingHolidays.length - deletedHolidayIds.length + newHolidays.length;
    if (totalHolidays === 0) {
      showError('Debes tener al menos un festivo configurado');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showLoading('Guardando cambios...');

    try {
      const changesSummary = [];

      if (locationName.trim() !== originalLocationName) {
        await updateLocation(id, { location_name: locationName.trim() });
        changesSummary.push('nombre');
      }

      if (deletedHolidayIds.length > 0) {
        const deletePromises = deletedHolidayIds.map(holidayId =>
          deleteHoliday(holidayId)
        );
        await Promise.all(deletePromises);
        changesSummary.push(`${deletedHolidayIds.length} eliminado${deletedHolidayIds.length > 1 ? 's' : ''}`);
      }

      if (newHolidays.length > 0) {
        const createPromises = newHolidays.map(holiday =>
          createHoliday({
            holiday_name: holiday.name,
            holiday_date: holiday.date,
            location_id: parseInt(id),
          })
        );
        await Promise.all(createPromises);
        changesSummary.push(`${newHolidays.length} festivo${newHolidays.length > 1 ? 's' : ''} nuevo${newHolidays.length > 1 ? 's' : ''}`);
      }

      dismiss(loadingToast);
      showSuccess(`¡Cambios guardados! (${changesSummary.join(', ')})`);

      navigate(`/locations/${id}`);
    } catch (error) {

      let errorMessage = 'Error al guardar los cambios';

      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 404) {
        errorMessage = 'Población no encontrada';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para editar esta población';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      dismiss(loadingToast);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combinar festivos existentes (no eliminados) + nuevos
  const allDisplayHolidays = [
    ...existingHolidays.filter(h => !deletedHolidayIds.includes(h.id)),
    ...newHolidays
  ];

  // Eventos para FullCalendar (festivos: rojo, nuevos: rojo con opacidad)
  const calendarEvents = [
    // Festivos existentes (rojo de la paleta)
    ...existingHolidays
      .filter(h => !deletedHolidayIds.includes(h.id))
      .map(holiday => ({
        id: holiday.id.toString(),
        title: holiday.holiday_name,
        start: holiday.holiday_date,
        backgroundColor: 'var(--color-red-400)',
        borderColor: 'var(--color-red-400)',
        textColor: '#FFFFFF',
        display: 'block',
      })),
    // Festivos nuevos (rojo con opacidad para diferenciar)
    ...newHolidays.map(holiday => ({
      id: holiday.tempId,
      title: holiday.name,
      start: holiday.date,
      backgroundColor: 'var(--color-red-400)',
      borderColor: 'var(--color-red-400)',
      textColor: '#FFFFFF',
      display: 'block',
      classNames: 'opacity-75',
    }))
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cohispania-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/locations/${id}`)}
          className="mb-4 flex items-center gap-2 w-fit"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a detalles
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">Editar población</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Modifica el nombre y gestiona los festivos de la población
        </p>
      </div>

      {/* Formulario */}
      <Card padding={true}>
        <div className="space-y-6">
          {/* Nombre de la población */}
          <div>
            <label htmlFor="locationName" className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Nombre de la población <span className="text-red-400">*</span>
            </label>
            <input
              id="locationName"
              type="text"
              placeholder="Ej: Madrid, Barcelona..."
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:border-cohispania-orange focus:ring-0 outline-none transition"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Lista de festivos con gestión */}
          <div>
            <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Festivos configurados ({allDisplayHolidays.length})
            </h3>

            {allDisplayHolidays.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Festivos existentes (no eliminados) */}
                {existingHolidays
                  .filter(h => !deletedHolidayIds.includes(h.id))
                  .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date))
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between bg-light-background p-4 rounded-lg border border-gray-stroke"
                    >
                      <div>
                        <p className="font-semibold text-cohispania-blue">{holiday.holiday_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(holiday.holiday_date)}</p>
                        <p className="text-xs text-gray-400">Existente • ID: {holiday.id}</p>
                      </div>
                      <button
                        onClick={() => {
                          setHolidayToDelete({ event: holiday, isNew: false });
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-600 transition cursor-pointer shadow-sm hover:shadow-md"
                        disabled={isSubmitting}
                        aria-label={`Eliminar ${holiday.holiday_name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                {/* Festivos nuevos */}
                {newHolidays
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((holiday) => (
                    <div
                      key={holiday.tempId}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'rgba(156, 204, 101, 0.12)',
                        borderColor: 'var(--color-light-green-600)',
                      }}
                    >
                      <div>
                        <p className="font-semibold text-light-green-600">{holiday.name}</p>
                        <p className="text-sm text-light-green-600 opacity-90">{formatDate(holiday.date)}</p>
                        <p className="text-xs text-light-green-600/80">Nuevo</p>
                      </div>
                      <button
                        onClick={() => {
                          setHolidayToDelete({ event: holiday, isNew: true });
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-600 transition cursor-pointer shadow-sm hover:shadow-md"
                        disabled={isSubmitting}
                        aria-label={`Eliminar festivo temporal ${holiday.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-stroke rounded-lg">
                <p className="text-sm text-gray-400">
                  Aún no hay festivos en la lista. Selecciona días en el calendario para añadirlos.
                </p>
              </div>
            )}
          </div>

          {/* Calendario interactivo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Festivos <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Haz clic en un día para añadir festivos. Haz clic en un evento existente para eliminarlo.
            </p>

            {/* Leyenda de colores unificada */}
            <div className="mb-3 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-gray-400">Festivos</span>
              </div>
            </div>

            {/* ✅ Wrapper unificado con clase vacation-calendar-wrapper */}
            <div className="vacation-calendar-wrapper bg-white border border-gray-stroke rounded-lg p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView="multiMonthYear"
                locale={esLocale}
                selectable={true}
                unselectAuto={false}
                select={handleDateSelect}
                eventClick={handleEventClick}
                events={calendarEvents}
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today',
                }}
                buttonText={{
                  today: 'Hoy',
                }}
                height="auto"
                dayMaxEvents={3}
                fixedWeekCount={false}
              />
            </div>
          </div>

          {/* Festivos eliminados (info) */}
          {deletedHolidayIds.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {deletedHolidayIds.length} festivo{deletedHolidayIds.length > 1 ? 's' : ''} será{deletedHolidayIds.length > 1 ? 'n' : ''} eliminado{deletedHolidayIds.length > 1 ? 's' : ''} al guardar
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-stroke">
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </Button>

            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-cohispania-blue border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal para añadir festivo */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelModal}
        title={selectedDates.length > 1 ? "Añadir festivos" : "Añadir festivo"}
      >
        <div className="space-y-4">
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">
              {selectedDates.length > 1 ? "Fechas seleccionadas" : "Fecha seleccionada"}
            </p>
            <p className="text-base font-semibold text-cohispania-blue">
              {formatDateRange()}
            </p>
            {selectedDates.length > 1 && (
              <p className="text-sm text-gray-500 mt-1">
                Esta acción eliminará los festivos seleccionados y los volverá a dejar disponibles en el calendario.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="holidayName" className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Nombre del festivo <span className="text-red-400">*</span>
            </label>
            <input
              id="holidayName"
              type="text"
              placeholder={selectedDates.length > 1 ? "Ej: Semana Santa, Navidades..." : "Ej: Día de la Constitución"}
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && holidayName.trim()) {
                  handleAddHoliday();
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:border-2 focus:border-cohispania-orange focus:ring-0 outline-none transition"
              autoFocus
            />
            {selectedDates.length > 1 && (
              <p className="text-xs text-gray-400 mt-2">
                El mismo nombre se aplicará a todos los días seleccionados
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={handleCancelModal}
              className="flex-1 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAddHoliday}
              disabled={!holidayName.trim()}
              className="flex-1 cursor-pointer"
            >
              Añadir
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ NUEVO: Modal de confirmación para eliminar festivo */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            ¿Estás seguro de que deseas eliminar el festivo{" "}
            <span className="font-bold text-cohispania-blue">
              {holidayToDelete?.event?.holiday_name || holidayToDelete?.event?.name}
            </span>
            ?
          </p>
          <p className="text-sm text-red-400">
            ⚠️ Esta acción se aplicará al guardar los cambios.
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
              className="flex-1 cursor-pointer"
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
