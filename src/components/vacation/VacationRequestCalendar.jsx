
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getMyHolidays } from "../../services/holidaysApi";
import { create as createVacationRequest } from "../../services/vacationApi";
import { getVacationSummary } from "../../services/authApi";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const VacationRequestCalendar = ({ onRequestCreated }) => {
  const [holidays, setHolidays] = useState([]);
  const [vacationSummary, setVacationSummary] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [summary, holidaysData] = await Promise.all([
        getVacationSummary(),
        getMyHolidays(),
      ]);

      setVacationSummary(summary);

      const isMobileDevice = window.innerWidth < 640;

      const holidayEvents = holidaysData.map((holiday) => ({
        title: isMobileDevice ? "🎉 F" : "Festivo",
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
      toast.error("Error al cargar los datos. Por favor, recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSubmitRequest = async () => {
    if (!selectedRange) {
      toast.error("Por favor, selecciona un rango de fechas en el calendario");
      return;
    }

    if (selectedRange.workingDays > vacationSummary.remaining_days) {
      toast.error(
        `No tienes suficientes días disponibles. Solicitaste ${selectedRange.workingDays} días pero solo tienes ${vacationSummary.remaining_days} disponibles.`,
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Enviando solicitud...");

    try {
      const requestData = {
        start_date: selectedRange.start.toISOString().split("T")[0],
        end_date: selectedRange.end.toISOString().split("T")[0],
        requested_days: selectedRange.workingDays,
        requester_comment: comments || null,
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

      toast.success("¡Solicitud enviada correctamente!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al enviar la solicitud. Por favor, inténtalo de nuevo.";

      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedRange(null);
    setComments("");

    if (selectedRange?.calendarApi) {
      selectedRange.calendarApi.unselect();
    }

    toast("Selección cancelada", {
      icon: "ℹ️",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-300">Cargando calendario...</p>
      </div>
    );
  }

  if (!vacationSummary) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-400">Error al cargar el resumen de vacaciones</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Card contenedor principal */}
      <div className="bg-white rounded-lg border border-gray-stroke overflow-hidden">
        {/* Header de la card */}
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-cohispania-blue">
            Solicitar Vacaciones
          </h2>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Selecciona un rango de fechas en el calendario
          </p>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6">
          {/* Layout: Calendario solo o Calendario + Formulario */}
          <div
            className={`
              ${selectedRange ? "space-y-6" : ""}
            `}
          >
            {/* Calendario */}
            <div className="w-full">
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
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }}
                buttonText={{
                  today: "Hoy",
                }}
                height="auto"
                aspectRatio={1.35}
                handleWindowResize={true}
                windowResizeDelay={100}
                dayHeaderFormat={{ weekday: "short" }}
                dayCellClassNames="text-xs sm:text-sm"
                eventClassNames="text-xs"
              />

              {/* Mensaje informativo cuando no hay selección */}
              {!selectedRange && (
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm sm:text-base text-indigo-500 text-center">
                    Selecciona o arrastra sobre el calendario para seleccionar tus fechas
                  </p>
                </div>
              )}
            </div>

            {/* Formulario de solicitud (aparece cuando hay selección) */}
            {selectedRange && (
              <div className="bg-light-background rounded-lg p-4 sm:p-6 border-2 border-cohispania-orange animate-fadeIn">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-cohispania-blue flex items-center gap-2">
                  Resumen de Solicitud
                </h3>

                <div className="space-y-4">
                  {/* Información de las fechas */}
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                      <span className="text-sm text-gray-300 font-medium">
                        Desde:
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-cohispania-blue">
                        {formatDate(selectedRange.start)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                      <span className="text-sm text-gray-300 font-medium">
                        Hasta:
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-cohispania-blue">
                        {formatDate(selectedRange.end)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                      <span className="text-sm text-gray-300 font-medium">
                        Días laborables:
                      </span>
                      <span className="font-bold text-base sm:text-lg text-cohispania-orange">
                        {selectedRange.workingDays} días
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-300 font-medium">
                        Días disponibles:
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-cohispania-blue">
                        {vacationSummary.remaining_days} días
                      </span>
                    </div>
                  </div>

                  {/* Campo de comentarios */}
                  <div>
                    <label
                      htmlFor="comments"
                      className="block text-sm font-semibold mb-2 text-cohispania-blue"
                    >
                      Comentarios (opcional)
                    </label>
                    <textarea
                      id="comments"
                      className="w-full px-4 py-3 border border-gray-stroke rounded-lg text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-cohispania-orange focus:border-transparent transition-all"
                      placeholder="Añade algún comentario sobre tu solicitud..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Mensaje de advertencia */}
                  {selectedRange.workingDays >
                    vacationSummary.remaining_days && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-700 font-semibold text-sm sm:text-base">
                          No tienes suficientes días disponibles
                        </p>
                        <p className="text-red-600 text-xs sm:text-sm mt-1">
                          Solicitaste {selectedRange.workingDays} días pero solo
                          tienes {vacationSummary.remaining_days} disponibles
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="medium"
                      loading={isSubmitting}
                      disabled={
                        selectedRange.workingDays >
                        vacationSummary.remaining_days
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationRequestCalendar;
