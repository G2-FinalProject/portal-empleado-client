import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Trash2, Calendar as CalendarIcon, Save, X, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Modal, Card, Button } from '../../components/ui';
import { create as createLocation } from '../../services/locationApi';
import { create as createHoliday } from '../../services/holidaysApi';
import { showSuccess, showError, showLoading, dismiss } from '../../utils/notifications';

export default function CreateLocationPage() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Estado
  const [locationName, setLocationName] = useState('');
  const [holidays, setHolidays] = useState([]); // { date, name, tempId }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]); // Array para selección múltiple
  const [holidayName, setHolidayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para unificar el estilo de arrastre del calendario
  const [dragging, setDragging] = useState(false);

  // Deshabilitar el calendario si no se ha introducido el nombre de la población a añadir
  const isCalendarDisabled = !locationName.trim();

  // Eventos para FullCalendar (festivos temporales: rojo de la paleta)
  const calendarEvents = holidays.map(holiday => ({
    title: holiday.name,
    start: holiday.date,
    display: "background",
    backgroundColor: 'var(--color-red-400)',
    borderColor: 'var(--color-red-400)',
    extendedProps: {
        isHoliday: true,
    }
  }));

  // Función unificada para navegar de vuelta
  const handleCancel = useCallback(() => {
    navigate('/locations');
  }, [navigate]);

  // Lógica para determinar si un rango de fechas es seleccionable (copiado de VacationRequestCalendar)
  // Un día no es seleccionable si: es fin de semana O ya ha sido añadido como festivo temporal
  const isDateSelectable = (selectInfo) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    end.setDate(end.getDate() - 1);

    const current = new Date(start);
    const rangeDates = [];

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      rangeDates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    for (const dateStr of rangeDates) {
      const date = new Date(dateStr + "T00:00:00");
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false; // Es fin de semana
      }

      // Comprueba si ya es un festivo temporalmente añadido
      const isAlreadyHoliday = holidays.some((h) => h.date === dateStr);
      if (isAlreadyHoliday) {
        return false;
      }
    }

    return true;
  };

  // Manejar selección de rango de fechas (Simplificado, confiando en selectAllow para la validación)
  const handleDateSelect = (selectInfo) => {
    if (isCalendarDisabled) return;

    // 1. Determinar el rango de fechas real (excluyendo el día final de FullCalendar)
    const startStr = selectInfo.startStr;
    const endStr = selectInfo.endStr;

    const endDate = new Date(endStr);
    endDate.setDate(endDate.getDate() - 1);
    const actualEndStr = endDate.toISOString().split("T")[0];

    const dates = [];
    const current = new Date(startStr);
    const end = new Date(actualEndStr);

    // 2. Recolectar todas las fechas. Si selectAllow fue 'true', sabemos que todas son válidas.
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // 3. Validación explícita y toast de error
    if (dates.length === 0) {
        // Esto captura casos donde selectAllow pudo haber sido true, pero por error de cálculo o
        // límite de fechas, el array quedó vacío (aunque isDateSelectable debería prevenirlo).
        // Más importante: en un click de un solo día NO laborable (donde isDateSelectable=false),
        // esta función NO se ejecuta. El mensaje está como fallback.
        showError('Selección no válida. Asegúrate de seleccionar solo días laborables no festivos.');
        if (calendarRef.current) {
            calendarRef.current.getApi().unselect();
        }
        return;
    }

    setSelectedDates(dates);
    setHolidayName(''); // Limpia el nombre del festivo anterior
    setIsModalOpen(true);
  };

  // Añadir festivo (s) para múltiples fechas
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      showError('El nombre del festivo es obligatorio');
      return;
    }

    // Verificar si alguna fecha seleccionada ya fue marcada como festivo (doble check)
    const duplicates = selectedDates.filter(date =>
      holidays.some(h => h.date === date)
    );

    if (duplicates.length > 0) {
      showError(`Ya hay festivos en algunas de las ${duplicates.length} fecha(s) seleccionada(s)`);
      return;
    }

    // Crear festivos para todas las fechas seleccionadas
    const newHolidays = selectedDates.map(date => ({
      date,
      name: holidayName.trim(),
      tempId: `${date}-${Date.now()}-${Math.random()}`,
    }));

    setHolidays([...holidays, ...newHolidays]);
    setHolidayName('');
    setSelectedDates([]);
    setIsModalOpen(false);

    // Limpiar selección del calendario
    if (calendarRef.current) {
        calendarRef.current.getApi().unselect();
    }

    const count = newHolidays.length;
    showSuccess(`${count} festivo${count > 1 ? 's' : ''} añadido${count > 1 ? 's' : ''} al calendario`);
  };

  // Eliminar festivo temporal
  const handleDeleteHoliday = (tempId) => {
    setHolidays(holidays.filter(h => h.tempId !== tempId));
    showSuccess('Festivo eliminado');
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

  // Crear población y festivos
  const handleSubmit = async () => {
    // Validaciones
    if (!locationName.trim()) {
      showError('El nombre de la población es obligatorio');
      return;
    }

    if (holidays.length === 0) {
      showError('Debes añadir al menos un festivo');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoading('Creando población...');

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

      dismiss(loadingToastId);
      showSuccess('¡Población creada exitosamente!');
      navigate('/locations');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error al crear la población';

      dismiss(loadingToastId);
      showError(errorMessage);

      if (import.meta.env.MODE === "development") {
        console.warn("Error al crear población:", error);
      }
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

    // Clonar y ordenar las fechas para asegurar que el rango sea correcto
    const sortedDates = [...selectedDates].sort();

    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];

    if (start === end) return formatDate(start);

    // Solo mostramos el rango real (de la primera a la última fecha seleccionada)
    return `${formatDate(start)} - ${formatDate(end)}`;
  };


  return (
    <div className="space-y-6">
      {/* Header unificado con CreateEmployeePage */}
      <div>
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4 flex items-center gap-2 w-fit"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Añade una nueva población
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Completa los datos para registrar una nueva población y sus festivos en el sistema.
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
              className="w-full pl-4 pr-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-0 focus:border-[var(--color-cohispania-orange)] outline-none transition"
              disabled={isSubmitting}
            />
            {/* Alerta cuando calendario está deshabilitado */}
            {isCalendarDisabled && (
              <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Escribe el nombre de la población para habilitar el calendario de festivos.
              </p>
            )}
          </div>

          {/* Calendario con efectos visuales cuando está deshabilitado */}
          <div className={isCalendarDisabled ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Festivos <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Haz clic en un día del calendario para añadir festivos y arrastra para seleccionar varios días.
            </p>

            {/* Calendario (Estilos y funcionalidad unificados) */}
            <div
                // CLASES CORREGIDAS: cursor-grab para inactivo, cursor-grabbing para arrastrar
                className={`bg-white border border-gray-stroke rounded-lg p-4 ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                onMouseDown={() => setDragging(true)}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
            >
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView="multiMonthYear"
                locale={esLocale}
                selectable={!isCalendarDisabled}
                selectMirror={true}
                select={handleDateSelect}
                selectAllow={isDateSelectable}
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
                dayHeaderFormat={{ weekday: "short" }}
                // CLASE CORREGIDA: Se elimina cursor-pointer para que el cursor-grab del div padre funcione
                dayCellClassNames="text-xs sm:text-sm"
                eventClassNames="text-xs"
              />
            </div>

            {/* Contador de días seleccionados */}
            <p className="text-sm text-gray-500 mt-2">
              Días festivos añadidos sin guardar: {holidays.length}
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
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {holidays
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((holiday) => (
                    <div
                      key={holiday.tempId}
                      className="flex items-center justify-between bg-light-background p-4 rounded-lg border border-gray-stroke hover:border-cohispania-orange transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-cohispania-blue">{holiday.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(holiday.date)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.tempId)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-red-600)] hover:text-[var(--color-red-600)] transition cursor-pointer shadow-sm hover:shadow-md"
                        disabled={isSubmitting}
                        aria-label={`Eliminar ${holiday.name}`}
                        title={`Eliminar ${holiday.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-stroke">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !locationName.trim() || holidays.length === 0}
              className="flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Población
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
          {/* Fechas seleccionadas */}
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">
              {selectedDates.length > 1 ? "Fechas seleccionadas" : "Fecha seleccionada"}
            </p>
            <p className="text-base font-semibold text-cohispania-blue">
              {formatDateRange()}
            </p>
            {selectedDates.length > 1 && (
              <p className="text-sm text-gray-500 mt-1">
                **{selectedDates.length} días** laborables
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && holidayName.trim()) {
                  e.preventDefault();
                  handleAddHoliday();
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-0 focus:border-cohispania-orange focus:border-2 outline-none transition"
              autoFocus
            />
            {/* Ayuda para selección múltiple */}
            {selectedDates.length > 1 && (
              <p className="text-xs text-gray-400 mt-2">
                El mismo nombre se aplicará a **todos los días seleccionados**.
              </p>
            )}
          </div>

          {/* Botones del modal */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddHoliday}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={!holidayName.trim()}
            >
              <Save className="w-5 h-5" />
              Añadir
            </Button>

            <Button
              onClick={handleCancelModal}
              variant="ghost"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
