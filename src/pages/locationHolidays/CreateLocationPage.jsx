import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Trash2, Calendar as CalendarIcon, Plus } from 'lucide-react';
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidayName, setHolidayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar click en un día del calendario
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  // Añadir festivo temporal
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      toast.error('El nombre del festivo es obligatorio');
      return;
    }

    // Verificar que no exista ya un festivo en esa fecha
    if (holidays.some(h => h.date === selectedDate)) {
      toast.error('Ya existe un festivo en esta fecha');
      return;
    }

    const newHoliday = {
      date: selectedDate,
      name: holidayName.trim(),
      tempId: Date.now(), // ID temporal para poder eliminarlo
    };

    setHolidays([...holidays, newHoliday]);
    setHolidayName('');
    setIsModalOpen(false);
    toast.success('Festivo añadido al calendario');
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
    setSelectedDate(null);
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
        <h1 className="text-3xl font-bold text-cohispania-blue">Nueva Población</h1>
        <p className="text-gray-300 mt-1">
          Crea una población y asigna sus festivos
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
              className="w-full px-4 py-3 rounded-lg bg-light-background border border-gray-stroke text-cohispania-blue placeholder-gray-300 focus:ring-2 focus:ring-cohispania-blue focus:border-cohispania-blue outline-none transition"
              disabled={isSubmitting}
            />
          </div>

          {/* Calendario */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Festivos <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-300 mb-4">
              Haz clic en los días del calendario para añadir festivos
            </p>

            <div className="bg-white border border-gray-stroke rounded-lg p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridYear"
                locale={esLocale}
                dateClick={handleDateClick}
                events={calendarEvents}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: '',
                }}
                buttonText={{
                  today: 'Hoy',
                }}
                height="auto"
                dayMaxEvents={2}
                fixedWeekCount={false}
              />
            </div>
          </div>

          {/* Lista de festivos añadidos */}
          {holidays.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Festivos añadidos ({holidays.length})
              </h3>

              <div className="space-y-2">
                {holidays
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((holiday) => (
                    <div
                      key={holiday.tempId}
                      className="flex items-center justify-between bg-light-background p-4 rounded-lg border border-gray-stroke"
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

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-stroke">
            <Button
              variant="primary"
              size="medium"
              onClick={handleSubmit}
              disabled={isSubmitting || !locationName.trim() || holidays.length === 0}
              loading={isSubmitting}
              fullWidth
            >
              Crear Población
            </Button>

            <Button
              variant="ghost"
              size="medium"
              onClick={() => navigate('/locations')}
              disabled={isSubmitting}
              fullWidth
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal para añadir festivo */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelModal}
        title="Añadir Festivo"
      >
        <div className="space-y-4">
          {/* Fecha seleccionada */}
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">Fecha seleccionada</p>
            <p className="text-base font-semibold text-cohispania-blue">
              {selectedDate && formatDate(selectedDate)}
            </p>
          </div>

          {/* Nombre del festivo */}
          <div>
            <label htmlFor="holidayName" className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Nombre del festivo <span className="text-red-400">*</span>
            </label>
            <input
              id="holidayName"
              type="text"
              placeholder="Ej: Día de la Constitución"
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
          </div>

          {/* Botones del modal */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="medium"
              onClick={handleAddHoliday}
              fullWidth
            >
              <Plus className="w-5 h-5 mr-2" />
              Añadir Festivo
            </Button>

            <Button
              variant="ghost"
              size="medium"
              onClick={handleCancelModal}
              fullWidth
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
