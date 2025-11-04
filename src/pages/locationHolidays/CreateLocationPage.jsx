import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Trash2, Calendar as CalendarIcon, Save, X, AlertCircle } from 'lucide-react';
import { Modal, Button, Card } from '../../components/ui';
import { create as createLocation } from '../../services/locationApi';
import { create as createHoliday } from '../../services/holidaysApi';
import toast from 'react-hot-toast';

export default function CreateLocationPage() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Estado
  const [locationName, setLocationName] = useState('');
  const [holidays, setHolidays] = useState([]); // { date, name, tempId }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]); //Array para selección múltiple
  const [holidayName, setHolidayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deshabilitar el calendario si no se ha introducido el nombre de la población a añadir
  const isCalendarDisabled = !locationName.trim();

  // Meanejar selección de rango de fechas (tipo drag para que sea como en el general)
  const handleDateSelect = (selectInfo) => {
    if (isCalendarDisabled) return;

    const start = new Date(selectInfo.startStr);
    const end = new Date(selectInfo.endStr);

    //Crear array con todas las fechas del rango
    const dates = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    setSelectedDates(dates);
    setIsModalOpen(true);
  };

  // Añadir festivo (s) para múltiples fechas
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      toast.error('El nombre del festivo es obligatorio');
      return;
    }

    //Verificar duplicados
    const duplicates = selectedDates.filter(date =>
      holidays.some(h => h.date === date)
    );

    if (duplicates.length > 0) {
      toast.error(`Ya hay festivos en algunas de las fechas seleccionadas`);
      return;
    }

    // Crear festivos para todas las fechas seleccionadas
    const newHolidays = selectedDates.map(date => ({
      date,
      name: holidayName.trim(),
      tempId: `${date}-${Date.now()}`,
    }));

    setHolidays([...holidays, ...newHolidays]);
    setHolidayName('');
    setSelectedDates([]);
    setIsModalOpen(false);

    const count = newHolidays.length;
    toast.success(`${count} festivo${count > 1 ? 's' : ''} añadido${count > 1 ? 's' : ''} al calendario`);
  };

  // Eliminar festivo temporal
  const handleDeleteHoliday = (tempId) => {
    setHolidays(holidays.filter(h => h.tempId !== tempId));
    toast.success('Festivo eliminado');
  };

  // Cancelar modal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setHolidayName('');
    setSelectedDates([]); //Aquí limpio el array de fechas

    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }
  };

  // Crear población y festivos
  const handleSubmit = async () => {
    // Validaciones
    if (!locationName.trim()) {
      toast.error('El nombre de la población es obligatorio');
      return;
    }

    if (holidays.length === 0) {
      toast.error('Debes añadir al menos un festivo');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creando población...');

    try {
      // 1. Crear la población
      const locationResponse = await createLocation({ location_name: locationName.trim() });
      const locationId = locationResponse.id;

      // 2. Crear todos los festivos
      const holidayPromises = holidays.map(holiday =>
        createHoliday({
          holiday_name: holiday.name,
          holiday_date: holiday.date,
          location_id: locationId,
        })
      );

      await Promise.all(holidayPromises);

      toast.success('¡Población creada exitosamente!', { id: loadingToast });
      navigate('/locations');
    } catch (error) {
      console.error('Error al crear población:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear la población';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Eventos para FullCalendar (festivos temporales)
  const calendarEvents = holidays.map(holiday => ({
    title: holiday.name,
    start: holiday.date,
    backgroundColor: '#F68D2E', // cohispania-orange
    borderColor: '#F68D2E',
    textColor: '#1F2A44',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cohispania-blue">Añade una nueva población</h1>
        <p className="text-gray-300 mt-1">
          Selecciona los festivos de la nueva población
        </p>
      </div>

      {/* Formulario */}
      <Card padding={true}>
        <div className="space-y-6">
          {/* Nombre de la población - DESTACADO */}
          <div>
            <label htmlFor="locationName" className="block text-lg font-bold mb-2 text-cohispania-blue">
              Nombre de la población <span className="text-red-400">*</span>
            </label>
            <input
              id="locationName"
              type="text"
              placeholder="Ej: Madrid, Barcelona..."
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-2 focus:ring-cohispania-blue focus:border-cohispania-blue outline-none transition"
              disabled={isSubmitting}
            />
            {/* Alerta cuando calendario está deshabilitado */}
            {isCalendarDisabled && (
              <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Escribe el nombre de la población para habilitar el calendario
              </p>
            )}
          </div>

          {/* Calendario con efectos visuales cuando está deshabilitado */}
          <div className={isCalendarDisabled ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Festivos <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-300 mb-4">
              Haz clic en un día o arrastra para seleccionar varios días consecutivos
            </p>

            <div className="bg-white border border-gray-stroke rounded-lg p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView="multiMonthYear"
                locale={esLocale}
                selectable={!isCalendarDisabled}
                select={handleDateSelect}
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

            {/* Contador de días seleccionados */}
            <p className="text-sm text-gray-300 mt-2">
              Días seleccionados: {holidays.length}
            </p>
          </div>

          {/* Lista de festivos añadidos */}
          {holidays.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Festivos añadidos ({holidays.length})
              </h3>

              {/* Scroll en lista cuando hay muchos festivos */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {holidays
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((holiday) => (
                    <div
                      key={holiday.tempId}
                      className="flex items-center justify-between bg-light-background p-4 rounded-lg border border-gray-stroke hover:border-cohispania-orange transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-cohispania-blue">{holiday.name}</p>
                        <p className="text-sm text-gray-300">{formatDate(holiday.date)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.tempId)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                        disabled={isSubmitting}
                        aria-label={`Eliminar ${holiday.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Botones de acción --> los cambio a derecha */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-stroke">
            <button
              onClick={() => navigate('/locations')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-cohispania-blue text-cohispania-blue hover:bg-light-background transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !locationName.trim() || holidays.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cohispania-orange text-cohispania-blue hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-cohispania-blue border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Población
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
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-2 focus:ring-cohispania-blue focus:border-cohispania-blue outline-none transition"
              autoFocus
            />
            {/* MEJORA 3: Ayuda para selección múltiple */}
            {selectedDates.length > 1 && (
              <p className="text-xs text-gray-400 mt-2">
                El mismo nombre se aplicará a todos los días seleccionados
              </p>
            )}
          </div>

 {/* Botones del modal */}
          <div className="flex gap-3">
            <button
              onClick={handleAddHoliday}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cohispania-orange text-cohispania-blue hover:opacity-90 transition font-semibold"
            >
              <Save className="w-5 h-5" />
              Añadir
            </button>

            <button
              onClick={handleCancelModal}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-cohispania-blue text-cohispania-blue hover:bg-light-background transition font-semibold"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
