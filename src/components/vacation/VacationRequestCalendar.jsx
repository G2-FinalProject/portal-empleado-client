import { useState, useEffect, useId } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getMyHolidays } from "../../services/holidaysApi";
import { create as createVacationRequest } from "../../services/vacationApi";
import { getVacationSummary } from "../../services/authApi";
import useVacationStore from "../../stores/useVacationStore";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { eachDayOfInterval } from "date-fns";

const VacationRequestCalendar = ({ onRequestCreated, onSelectionChange }) => {
  const [holidays, setHolidays] = useState([]);
  const [vacationSummary, setVacationSummary] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const myRequests = useVacationStore((state) => state.myRequests);

  useEffect(() => {
    fetchInitialData();
  }, [myRequests]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRange);
    }
  }, [selectedRange, onSelectionChange]);

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
        title: isMobileDevice ? "🎉 F " : "Festivo",
        start: holiday.holiday_date,
        display: "background",
        backgroundColor: "#fee2e2",
        borderColor: "#fca5a5",
        extendedProps: {
          isHoliday: true,
        },
      }));

      const approvedVacations = myRequests
        .filter((req) => req.status === "approved")
        .flatMap((req) => {
          /* Añadir T00:00:00 para forzar hora local y evitar que las 
          fechas cambien al día anterior por conversión de timezone*/
          const start = new Date(req.startDate + "T00:00:00");
          const end = new Date(req.endDate + "T00:00:00");
          const days = eachDayOfInterval({ start, end });

          return days.map((day) => {
            /* Usar métodos locales (getFullYear, getMonth, getDate) en lugar de toISOString() 
            para mantener el día correcto sin conversión a UTC */
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, "0");
            const dayNum = String(day.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${dayNum}`;

            return {
              title: isMobileDevice ? "✈️ V " : "Vacaciones",
              start: dateStr,
              display: "background",
              backgroundColor: "#d1fae5",
              borderColor: "#10b981",
              extendedProps: {
                isApprovedVacation: true,
                requestId: req.id,
              },
            };
          });
        });

      setHolidays([...holidayEvents, ...approvedVacations]);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Error al cargar los datos. Por favor, recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (selectInfo) => {
    const startStr = selectInfo.startStr;
    const endStr = selectInfo.endStr;

    const endDate = new Date(endStr);
    endDate.setDate(endDate.getDate() - 1);
    const actualEndStr = endDate.toISOString().split("T")[0];

    /* Añadir T00:00:00 para forzar interpretación en hora local y 
    evitar desfases de 1 día por conversión de timezone */
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(actualEndStr + "T00:00:00");

    const workingDays = calculateWorkingDays(start, end);

    setSelectedRange({
      start: start,
      end: end,
      startStr: startStr,
      endStr: actualEndStr,
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
      const isUnavailable = holidays.some((h) => h.start === dateString);

      if (!isWeekend && !isUnavailable) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const isDateSelectable = (selectInfo) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    end.setDate(end.getDate() - 1);

    const current = new Date(start);
    const rangeDates = [];

    while (current <= end) {
      // Usar getFullYear/getMonth/getDate en lugar de toISOString() para evitar
      // problemas de timezone que cambian el día al convertir a UTC
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
        return false;
      }

      const isUnavailable = holidays.some((h) => h.start === dateStr);
      if (isUnavailable) {
        return false;
      }
    }

    return true;
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
        start_date: selectedRange.startStr,
        end_date: selectedRange.endStr,
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
      fetchInitialData();

      toast.success("¡Solicitud enviada correctamente!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
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
      <div className="w-full bg-white rounded-lg border border-gray-stroke p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cohispania-orange mb-4" />
          <p className="text-gray-300">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (!vacationSummary) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-stroke p-8">
        <p className="text-red-400 text-center">
          Error al cargar el resumen de vacaciones
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Card contenedor principal */}
      <div className="bg-white rounded-lg border border-gray-stroke overflow-hidden">
        {/* Header de la card */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-stroke">
          <h2 className="text-xl sm:text-2xl font-bold text-cohispania-blue">
            Solicitar Vacaciones
          </h2>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Selecciona un rango de fechas en el calendario
          </p>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6">
          {/* Leyenda del calendario */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-gray-400">Festivos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
              <span className="text-gray-400">Vacaciones aprobadas</span>
            </div>
          </div>

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
                  Selecciona o arrastra sobre el calendario para seleccionar tus
                  fechas de vacaciones
                </p>
              </div>
            )}
          </div>

          {/* Formulario EN MOBILE: Aparece debajo del calendario */}
          {selectedRange && (
            <div className="lg:hidden mt-6">
              <RequestSummaryForm
                selectedRange={selectedRange}
                vacationSummary={vacationSummary}
                comments={comments}
                setComments={setComments}
                isSubmitting={isSubmitting}
                handleSubmitRequest={handleSubmitRequest}
                handleCancelSelection={handleCancelSelection}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function RequestSummaryForm({
  selectedRange,
  vacationSummary,
  comments,
  setComments,
  isSubmitting,
  handleSubmitRequest,
  handleCancelSelection,
}) {
  const formatDateShort = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const textareaId = useId();

  return (
    <div className="bg-white rounded-lg border-2 border-cohispania-orange p-4 sm:p-5 animate-fadeIn">
      <h3 className="text-base sm:text-lg font-bold mb-4 text-cohispania-blue">
        Resumen de Solicitud
      </h3>

      <div className="space-y-4">
        {/* Información de las fechas */}
        <div className="bg-light-background rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Desde:</span>
            <span className="font-semibold text-cohispania-blue">
              {formatDateShort(selectedRange.start)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Hasta:</span>
            <span className="font-semibold text-cohispania-blue">
              {formatDateShort(selectedRange.end)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-stroke">
            <span className="text-gray-400 font-medium">Días lab.:</span>
            <span className="font-bold text-base text-cohispania-orange">
              {selectedRange.workingDays}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Disponibles:</span>
            <span className="font-semibold text-cohispania-blue">
              {vacationSummary?.remaining_days || 0}
            </span>
          </div>
        </div>

        {/* Campo de comentarios */}
        <div>
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold mb-2 text-cohispania-blue"
          >
            Comentarios (opcional)
          </label>
          <textarea
            id={textareaId}
            className="w-full px-3 py-2 border border-gray-stroke rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cohispania-orange focus:border-transparent transition-all"
            placeholder="Añade un comentario..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>

        {/* Mensaje de advertencia */}
        {selectedRange.workingDays > (vacationSummary?.remaining_days || 0) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 font-semibold text-sm">
                Días insuficientes
              </p>
              <p className="text-red-600 text-xs mt-1">
                Solicitaste {selectedRange.workingDays} días pero solo tienes{" "}
                {vacationSummary?.remaining_days || 0} disponibles
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="medium"
            loading={isSubmitting}
            disabled={
              selectedRange.workingDays > (vacationSummary?.remaining_days || 0)
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
  );
}

export default VacationRequestCalendar;
export { RequestSummaryForm };
