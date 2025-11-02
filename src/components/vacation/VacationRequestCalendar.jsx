import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getMyHolidays } from "../../services/holidaysApi";
import { create as createVacationRequest } from "../../services/vacationApi";
import { getVacationSummary } from "../../services/authApi"; 
import Button from "../ui/Button";
import toast from 'react-hot-toast';

const VacationRequestCalendar = ({ onRequestCreated }) => {
  // Estado para los festivos
  const [holidays, setHolidays] = useState([]);

  // Estado para el resumen de vacaciones
  const [vacationSummary, setVacationSummary] = useState(null);

  // Estado para las fechas seleccionadas en el calendario
  const [selectedRange, setSelectedRange] = useState(null);

  // Estado para el campo de comentarios
  const [comments, setComments] = useState("");

  // Estado para controlar si se está enviando la solicitud
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para controlar la carga inicial
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Obtiene el resumen de vacaciones y los festivos
   */
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Ejecutamos ambas peticiones en paralelo para que sea más rápido
      const [summary, holidaysData] = await Promise.all([
        getVacationSummary(), 
        getMyHolidays(),
      ]);

      // Guardamos el resumen
      setVacationSummary(summary);

      // Convertimos los festivos al formato de FullCalendar
      const holidayEvents = holidaysData.map((holiday) => ({
        title: "Festivo",
        start: holiday.holiday_date,
        display: "background",
        backgroundColor: "#fee2e2",
        borderColor: "#fca5a5",
        extendedProps: {
          isHoliday: true,
        },
      }));

      setHolidays(holidayEvents);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error('Error al cargar los datos. Por favor, recarga la página.');;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Se ejecuta cuando el usuario selecciona un rango de fechas en el calendario
   */
  const handleDateSelect = (selectInfo) => {
    const start = selectInfo.start;
    const end = new Date(selectInfo.end);
    end.setDate(end.getDate() - 1);

    const workingDays = calculateWorkingDays(start, end);

    setSelectedRange({
      start: start,
      end: end,
      workingDays: workingDays,
      calendarApi: selectInfo.view.calendar,
    });
  };

  /**
   * Calcula los días laborables entre dos fechas
   * (excluye fines de semana y festivos)
   */
  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dateString = current.toISOString().split("T")[0];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.some((h) => h.start === dateString);

      if (!isWeekend && !isHoliday) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  /**
   * Determina si una fecha se puede seleccionar
   */
  const isDateSelectable = (selectInfo) => {
    const date = selectInfo.start;
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split("T")[0];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    const isHoliday = holidays.some((h) => h.start === dateString);
    if (isHoliday) {
      return false;
    }

    return true;
  };

  /**
   * Formatea una fecha al estilo español
   */
  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /**
   * Envía la solicitud de vacaciones al backend
   */
  const handleSubmitRequest = async () => {
    if (!selectedRange) {
       toast.error('Por favor, selecciona un rango de fechas en el calendario');
      return;
    }


    if (selectedRange.workingDays > vacationSummary.remaining_days) {
      toast.error(
        `No tienes suficientes días disponibles. Solicitaste ${selectedRange.workingDays} días pero solo tienes ${vacationSummary.remaining_days} disponibles.`,
        { duration: 5000 } // Más tiempo para leer el mensaje
      );
      return;
    }

    setIsSubmitting(true);

    const loadingToast = toast.loading('Enviando solicitud...');

  try {
    // ✅ Ajustar al formato que espera el backend
    const requestData = {
      start_date: selectedRange.start.toISOString().split("T")[0],
      end_date: selectedRange.end.toISOString().split("T")[0],
      requested_days: selectedRange.workingDays,
      comments: comments || null,
    };

      await createVacationRequest(requestData);

      setSelectedRange(null);
      setComments("");

      if (selectedRange.calendarApi) {
        selectedRange.calendarApi.unselect();
      }


      const updatedSummary = await getVacationSummary();
      setVacationSummary(updatedSummary);

      if (onRequestCreated) {
        onRequestCreated();
      }
       toast.success('¡Solicitud enviada correctamente!', {
        id: loadingToast,
      });

    } catch (error) {
      console.error("Error al crear solicitud:", error);
      const errorMessage = error.response?.data?.message 
        || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
      
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancela la selección actual
   */
  const handleCancelSelection = () => {
    setSelectedRange(null);
    setComments("");

    if (selectedRange?.calendarApi) {
      selectedRange.calendarApi.unselect();
    }
    toast('Selección cancelada', {
      icon: '↩️',
    });
  };

  // Mostrar mensaje de carga
  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-300">Cargando calendario...</p>
      </div>
    );
  }

  // Mostrar error si no hay resumen
  if (!vacationSummary) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-400">Error al cargar el resumen de vacaciones</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* COLUMNA IZQUIERDA: Calendario */}
        <div className="border border-gray-stroke rounded-lg p-4 bg-white">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            selectable={true}
            selectMirror={true}
            events={holidays}
            select={handleDateSelect}
            selectAllow={isDateSelectable}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            height="auto"
            buttonText={{
              today: "Hoy",
            }}
          />
        </div>

        {/* COLUMNA DERECHA: Resumen y formulario */}
        <div className="border border-gray-stroke rounded-lg p-6 bg-white">
          <h3 className="text-lg font-bold mb-6 text-cohispania-blue">
            Resumen de Solicitud
          </h3>

          {selectedRange ? (
            <div className="flex flex-col gap-6">
              {/* Información de las fechas */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-sm text-gray-300">Desde:</span>
                  <span className="font-medium text-cohispania-blue">
                    {formatDate(selectedRange.start)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-sm text-gray-300">Hasta:</span>
                  <span className="font-medium text-cohispania-blue">
                    {formatDate(selectedRange.end)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-sm text-gray-300">
                    Total días laborables:
                  </span>
                  <span className="font-semibold text-cohispania-orange">
                    {selectedRange.workingDays} días
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-sm text-gray-300">
                    Días disponibles:
                  </span>
                  <span className="font-medium text-cohispania-blue">
                    {vacationSummary.remaining_days} días
                  </span>
                </div>
              </div>

              {/* Campo de comentarios */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="comments"
                  className="text-sm font-medium text-gray-400"
                >
                  Comentarios (opcional)
                </label>
                <textarea
                  id="comments"
                  className="w-full px-3 py-2 border border-gray-stroke rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-cohispania-orange focus:border-transparent"
                  placeholder="Añade algún comentario sobre tu solicitud..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Mensaje de advertencia */}
              {selectedRange.workingDays > vacationSummary.remaining_days && (
                <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                  ⚠️ No tienes suficientes días disponibles
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="medium"
                  loading={isSubmitting}
                  disabled={
                    selectedRange.workingDays > vacationSummary.remaining_days
                  }
                  onClick={handleSubmitRequest}
                  fullWidth
                >
                  Enviar Solicitud
                </Button>

                <Button
                  variant="ghost"
                  size="medium"
                  disabled={isSubmitting}
                  onClick={handleCancelSelection}
                  fullWidth
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-300 text-center py-8">
              Selecciona un rango de fechas en el calendario para crear una
              nueva solicitud
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacationRequestCalendar;
