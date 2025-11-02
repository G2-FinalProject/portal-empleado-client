
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
    <div className="w-full max-w-7xl mx-auto">

      <div
        className={`
          flex flex-col gap-4 lg:gap-6 p-2 sm:p-4
          ${selectedRange ? "lg:grid lg:grid-cols-2" : ""}
        `}
      >
        {/* COLUMNA IZQUIERDA: Calendario */}
        <div
          className={`
            border border-gray-stroke rounded-lg p-2 sm:p-4 bg-white overflow-x-auto
            transition-all duration-300
            ${selectedRange ? "" : "lg:max-w-3xl lg:mx-auto"}
          `}
        >
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
          
          {/* ✅ Mensaje informativo cuando no hay selección */}
          {!selectedRange && (
            <div className="mt-4 p-4 bg-blue-50 border border-indigo-400 rounded-md">
              <p className="text-sm text-indigo-500 text-center">
                Selecciona un rango de fechas en el calendario para crear una solicitud de vacaciones
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Resumen y formulario de selección */}
        {selectedRange && (
          <div className="border border-gray-stroke rounded-lg p-4 sm:p-6 bg-white animate-fadeIn">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-cohispania-blue">
              Resumen de Solicitud
            </h3>

            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Información de las fechas */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-xs sm:text-sm text-gray-300">
                    Desde:
                  </span>
                  <span className="font-medium text-xs sm:text-base text-cohispania-blue text-right">
                    {formatDate(selectedRange.start)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-xs sm:text-sm text-gray-300">
                    Hasta:
                  </span>
                  <span className="font-medium text-xs sm:text-base text-cohispania-blue text-right">
                    {formatDate(selectedRange.end)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-xs sm:text-sm text-gray-300">
                    Total días laborables:
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-cohispania-orange">
                    {selectedRange.workingDays} días
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-stroke">
                  <span className="text-xs sm:text-sm text-gray-300">
                    Días disponibles:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-cohispania-blue">
                    {vacationSummary.remaining_days} días
                  </span>
                </div>
              </div>

              {/* Campo de comentarios */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="comments"
                  className="text-xs sm:text-sm font-medium text-gray-400"
                >
                  Comentarios (opcional)
                </label>
                <textarea
                  id="comments"
                  className="w-full px-3 py-2 border border-gray-stroke rounded-md text-xs sm:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-cohispania-orange focus:border-transparent"
                  placeholder="Añade algún comentario sobre tu solicitud..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Mensaje de advertencia */}
              {selectedRange.workingDays > vacationSummary.remaining_days && (
                <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs sm:text-sm">
                  ⚠️ No tienes suficientes días disponibles
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default VacationRequestCalendar;
