import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Trash2, Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { Modal, Card, Button } from '../../components/ui';
import { getById as getLocationById, } from '../../services/locationApi';
import useAdminStore from '../../stores/useAdminStore';
//  update as updateLocation
// import { create as createHoliday, deleteHoliday } from '../../services/holidaysApi';
// import toast from 'react-hot-toast';
// import { showSuccess, showError, showLoading, updateToastSuccess, updateToastError } from '../../utils/notifications.js';

export default function EditLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Store (maneja toasts automátocamente)
  const { updateLocation, createHoliday, deleteHoliday } = useAdminStore();

  // Estado
  const [locationName, setLocationName] = useState('');
  const [originalLocationName, setOriginalLocationName] = useState(''); // Para detectar cambios
  const [existingHolidays, setExistingHolidays] = useState([]); // Festivos originales del backend
  const [newHolidays, setNewHolidays] = useState([]); // Festivos nuevos por añadir
  const [deletedHolidayIds, setDeletedHolidayIds] = useState([]); // IDs de festivos eliminados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [holidayName, setHolidayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos existentes
  useEffect(() => {
    const loadLocationData = async () => {
      if (!id || isNaN(parseInt(id))) {
        // showError ('ID de población no válido');
        // toast.error('ID de población no válido');
        navigate('/locations');
        return;
      }

      try {
        setIsLoading(true);
        const locationData = await getLocationById(id);

        if (!locationData || !locationData.location_name) {
          throw new Error('Datos de población incompletos');
        }

        // Establecer datos originales
        setLocationName(locationData.location_name);
        setOriginalLocationName(locationData.location_name);
        setExistingHolidays(locationData.holidays || []);
      } catch (error) {
        console.error('Error loading location:', error);

        // const errorMessage = error.response?.status === 404
        //   ? 'Población no encontrada'
        //   : 'Error al cargar la población';
        // showError(errorMessage);

        // toast.error(errorMessage);
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

    // Crear array con todas las fechas del rango
    const dates = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    setSelectedDates(dates);
    setIsModalOpen(true);
  };

  // Manejar click en evento existente (eliminar festivo)
  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;

    // Verificar si es un festivo existente o nuevo
    const existingHoliday = existingHolidays.find(h => h.id.toString() === eventId);
    const newHoliday = newHolidays.find(h => h.tempId === eventId);

    if (existingHoliday) {
      // Es un festivo existente - añadir a lista de eliminados
      if (window.confirm(`¿Eliminar el festivo "${existingHoliday.holiday_name}"?`)) {
        setDeletedHolidayIds(prev => [...prev, existingHoliday.id]);
        // showSuccess('Festivo marcado para eliminar');
      }
    } else if (newHoliday) {
      // Es un festivo nuevo - eliminar directamente
      if (window.confirm(`¿Eliminar el festivo "${newHoliday.name}"?`)) {
        setNewHolidays(prev => prev.filter(h => h.tempId !== newHoliday.tempId));
        // toast.success('Festivo eliminado');
        // showSuccess('Festivo eliminado');
      }
    }
  };

  // Añadir nuevo festivo temporal
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      // showError('El nombre del festivo es obligatorio');
      return;
    }

    // Verificar duplicados con festivos existentes (no eliminados)
    const existingDates = existingHolidays
      .filter(h => !deletedHolidayIds.includes(h.id))
      .map(h => h.holiday_date);

    const newDates = newHolidays.map(h => h.date);
    const allCurrentDates = [...existingDates, ...newDates];

    const duplicates = selectedDates.filter(date => allCurrentDates.includes(date));

    if (duplicates.length > 0) {
      // showError('Ya hay festivos en algunas de las fechas seleccionadas');
      return;
    }

    // Crear festivos para todas las fechas seleccionadas
    const newHolidaysToAdd = selectedDates.map(date => ({
      date,
      name: holidayName.trim(),
      tempId: `new-${date}-${Date.now()}`,
    }));

    setNewHolidays(prev => [...prev, ...newHolidaysToAdd]);
    setHolidayName('');
    setSelectedDates([]);
    setIsModalOpen(false);

    // const count = newHolidaysToAdd.length;
    // showSuccess(`${count} festivo${count > 1 ? 's' : ''} añadido${count > 1 ? 's' : ''} al calendario`);
  };


  // Cancelar modal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setHolidayName('');
    setSelectedDates([]);

    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }
  };

  // Lógica de guardado - VERSIÓN STORE
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    // const loadingToast = toast.loading('Guardando cambios...');

    try {
      // 1. Actualizar nombre de población si cambió
      if (locationName.trim() !== originalLocationName) {
        await updateLocation(id, { location_name: locationName.trim() });
      }

      // 2. Eliminar festivos marcados para eliminar
      if (deletedHolidayIds.length > 0) {
        const deletePromises = deletedHolidayIds.map(holidayId =>
          deleteHoliday(holidayId)
        );
        await Promise.all(deletePromises);
      }

      // 3. Crear nuevos festivos
      if (newHolidays.length > 0) {
        const createPromises = newHolidays.map(holiday =>
          createHoliday({
            holiday_name: holiday.name,
            holiday_date: holiday.date,
            location_id: parseInt(id),
          })
        );
        await Promise.all(createPromises);
      }

      // El store maneja todos los toasts automáticamente
      // toast.success('¡Cambios guardados exitosamente!', { id: loadingToast });
      // Redirigir a DetailLocationPage
      navigate(`/locations/${id}`);
    } catch (error) {
      // El store ya mostró el error
      console.error('Error saving changes:', error);
      // const errorMessage = error.response?.data?.message || 'Error al guardar los cambios';
      // toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };
  // VERSIÓN MANUAL (fallback si no gusta el store)
  /*
  const handleSaveChanges = async () => {
    if (!locationName.trim()) {
      showError('El nombre de la población es obligatorio');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showLoading('Guardando cambios...');

    try {
      // 1. Actualizar nombre de población si cambió
      if (locationName.trim() !== originalLocationName) {
        await updateLocation(id, { location_name: locationName.trim() });
      }

      // 2. Eliminar festivos marcados para eliminar
      if (deletedHolidayIds.length > 0) {
        const deletePromises = deletedHolidayIds.map(holidayId =>
          deleteHoliday(holidayId)
        );
        await Promise.all(deletePromises);
      }

      // 3. Crear nuevos festivos
      if (newHolidays.length > 0) {
        const createPromises = newHolidays.map(holiday =>
          createHoliday({
            holiday_name: holiday.name,
            holiday_date: holiday.date,
            location_id: parseInt(id),
          })
        );
        await Promise.all(createPromises);
      }

      updateToastSuccess(loadingToast, '¡Cambios guardados exitosamente!');
      navigate(`/locations/${id}`);
    } catch (error) {
      console.error('Error saving changes:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar los cambios';
      updateToastError(loadingToast, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  */

  // Combinar festivos existentes (no eliminados) + nuevos para mostrar en calendario
  const allDisplayHolidays = [
    ...existingHolidays.filter(h => !deletedHolidayIds.includes(h.id)),
    ...newHolidays
  ];

  // Crear eventos para FullCalendar
  const calendarEvents = [
    // Festivos existentes (no eliminados)
    ...existingHolidays
      .filter(h => !deletedHolidayIds.includes(h.id))
      .map(holiday => ({
        id: holiday.id.toString(),
        title: holiday.holiday_name,
        start: holiday.holiday_date,
        backgroundColor: '#F68D2E', // cohispania-orange
        borderColor: '#F68D2E',
        textColor: '#1F2A44', // cohispania-blue
        display: 'block',
      })),
    // Festivos nuevos
    ...newHolidays.map(holiday => ({
      id: holiday.tempId,
      title: holiday.name,
      start: holiday.date,
      backgroundColor: '#22C55E', // verde para nuevos
      borderColor: '#22C55E',
      textColor: '#FFFFFF',
      display: 'block',
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
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-cohispania-blue">Editar población</h1>
        <p className="text-gray-300 mt-1">
          Modifica el nombre y gestiona los festivos de la población
        </p>
      </div>

      {/* Formulario */}
      <Card className="animate-fadeIn" padding={true}>
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
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:border-2 focus:border-cohispania-orange focus:ring-0 outline-none transition"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Calendario interactivo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Festivos <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-300 mb-4">
              Haz clic en un día para añadir festivos. Haz clic en un evento existente para eliminarlo.
            </p>

            <div className="bg-white border border-gray-stroke rounded-lg p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView="multiMonthYear"
                locale={esLocale}
                selectable={true}
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

            {/* Leyenda de colores */}
            <div className="mt-3 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cohispania-orange rounded"></div>
                <span className="text-gray-600">Festivos existentes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Festivos nuevos</span>
              </div>
            </div>
          </div>

          {/* Lista de festivos con gestión */}
          {allDisplayHolidays.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Festivos configurados ({allDisplayHolidays.length})
              </h3>

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
                        <p className="text-sm text-gray-300">{formatDate(holiday.holiday_date)}</p>
                        <p className="text-xs text-gray-400">Existente • ID: {holiday.id}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el festivo "${holiday.holiday_name}"?`)) {
                            setDeletedHolidayIds(prev => [...prev, holiday.id]);
                            // toast.success('Festivo marcado para eliminar');
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer"
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
                      className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200"
                    >
                      <div>
                        <p className="font-semibold text-green-700">{holiday.name}</p>
                        <p className="text-sm text-green-600">{formatDate(holiday.date)}</p>
                        <p className="text-xs text-green-500">Nuevo</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el festivo "${holiday.name}"?`)) {
                            setNewHolidays(prev => prev.filter(h => h.tempId !== holiday.tempId));
                            // toast.success('Festivo eliminado');
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer"
                        disabled={isSubmitting}
                        aria-label={`Eliminar ${holiday.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>

              {/* Festivos eliminados (info) */}
              {deletedHolidayIds.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    {deletedHolidayIds.length} festivo{deletedHolidayIds.length > 1 ? 's' : ''} será{deletedHolidayIds.length > 1 ? 'n' : ''} eliminado{deletedHolidayIds.length > 1 ? 's' : ''} al guardar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-stroke">
            <button
              onClick={() => navigate(`/locations/${id}`)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-cohispania-blue text-cohispania-blue hover:bg-light-background transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cohispania-orange text-cohispania-blue hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
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
            </button>
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
          {/* Fechas seleccionadas */}
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">
              {selectedDates.length > 1 ? "Fechas seleccionadas" : "Fecha seleccionada"}
            </p>
            <p className="text-base font-semibold text-cohispania-blue">
              {formatDateRange()}
            </p>
            {selectedDates.length > 1 && (
              <p className="text-sm text-gray-300 mt-1">
                {selectedDates.length} días consecutivos
              </p>
            )}
          </div>

          {/* Nombre del festivo */}
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
                if (e.key === 'Enter') {
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

          {/* Botones del modal */}
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
              className="flex-1 cursor-pointer"
            >
              Añadir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
