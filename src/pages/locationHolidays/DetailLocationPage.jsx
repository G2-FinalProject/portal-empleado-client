import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, Button } from '../../components/ui';
import { getById as getLocationById } from '../../services/locationApi';
import { showError } from '../../utils/notifications';
import { ArrowLeft, Pencil, Calendar as CalendarIcon } from 'lucide-react';

export default function DetailLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

   // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Crear eventos para FullCalendar desde los festivos (rojo de la paleta)
  const calendarEvents = location?.holidays?.map(holiday => ({
    title: holiday.holiday_name,
    start: holiday.holiday_date,
    backgroundColor: 'var(--color-red-400)',
    borderColor: 'var(--color-red-400)',
    textColor: '#FFFFFF',
    display: 'block',
  })) || [];

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
        showError(errorMessage);
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
          className="text-cohispania-blue hover:underline cursor-pointer"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
            Población: {location.location_name}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {location.holidays?.length || 0} festivos configurados
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/locations')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate(`/locations/${id}/edit`)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Pencil className="w-4 h-4" />
            Editar población
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <Card padding={true}>
        <div className="space-y-6">
          {/* Lista de festivos */}
          <div>
            <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cohispania-orange" />
              Lista de Festivos ({location.holidays?.length || 0})
            </h3>

            {location.holidays && location.holidays.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {location.holidays
                  .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date))
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between bg-light-background p-4 rounded-lg border border-gray-stroke"
                    >
                      <div>
                        <p className="font-semibold text-cohispania-blue">{holiday.holiday_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(holiday.holiday_date)}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        ID: {holiday.id}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay festivos configurados para esta población</p>
                <button
                  onClick={() => navigate(`/locations/${id}/edit`)}
                  className="mt-2 text-cohispania-blue hover:underline cursor-pointer"
                >
                  Añadir festivos
                </button>
              </div>
            )}
          </div>

          {/* Calendario de festivos (solo lectura) */}
          <div>
            <h2 className="text-xl font-bold text-cohispania-blue mb-4 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Calendario de Festivos
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Vista anual de todos los festivos configurados para {location.location_name}
            </p>
            <div className="bg-white border border-gray-stroke rounded-lg p-4">
              <FullCalendar
                plugins={[dayGridPlugin, multiMonthPlugin]}
                initialView="multiMonthYear"
                locale={esLocale}
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
                selectable={false}
                editable={false}
                eventClick={false}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

