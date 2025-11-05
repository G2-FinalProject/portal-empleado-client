import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { Card } from '../../components/ui';
import { getById as getLocationById } from '../../services/locationApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Calendar as CalendarIcon } from 'lucide-react';

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

  // Crear eventos para FullCalendar desde los festivos
  const calendarEvents = location?.holidays?.map(holiday => ({
    title: holiday.holiday_name,
    start: holiday.holiday_date,
    backgroundColor: '#F68D2E', // cohispania-orange
    borderColor: '#F68D2E',
    textColor: '#1F2A44', // cohispania-blue
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-cohispania-blue text-cohispania-blue hover:bg-light-background transition font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <button
            onClick={() => navigate(`/locations/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cohispania-orange text-cohispania-blue hover:opacity-90 transition font-semibold cursor-pointer"
          >
            <Edit className="w-5 h-5" />
            Editar
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <Card padding={true}>
        <div className="space-y-6">
          {/* Calendario de festivos (solo lectura) */}
          <div>
            <h2 className="text-xl font-bold text-cohispania-blue mb-4 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Calendario de Festivos
            </h2>
            <p className="text-sm text-gray-300 mb-4">
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
                selectable={false} // Solo lectura
                editable={false}   // Solo lectura
                eventClick={false} // Deshabilitar clicks en eventos
              />
            </div>
          </div>

{/* Lista de festivos */}
          <div>
            <h3 className="text-lg font-bold text-cohispania-blue mb-4 flex items-center gap-2">
              📋 Lista de Festivos ({location.holidays?.length || 0})
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
                        <p className="text-sm text-gray-300">{formatDate(holiday.holiday_date)}</p>
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
                  className="mt-2 text-cohispania-blue hover:underline"
                >
                  Añadir festivos
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

