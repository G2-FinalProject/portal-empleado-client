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
import { showError, showSuccess, showLoading, dismiss, showInfo } from "../../utils/notifications";
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

      // ✅ Festivos: rojo de la paleta
      const holidayEvents = holidaysData.map((holiday) => ({
        title: isMobileDevice ? "🎉 F " : "Festivo",
        start: holiday.holiday_date,
        display: "background",
        backgroundColor: "var(--color-red-400)",
        borderColor: "var(--color-red-400)",
        extendedProps: {
          isHoliday: true,
        },
      }));

      const approvedVacations = myRequests
        .filter((req) => req.status === "approved")
        .flatMap((req) => {
          const start = new Date(req.startDate + "T00:00:00");
          const end = new Date(req.endDate + "T00:00:00");
          const days = eachDayOfInterval({ start, end });

          return days.map((day) => {
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, "0");
            const dayNum = String(day.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${dayNum}`;

              return {
                title: isMobileDevice ? "✈️ V " : "Vacaciones",
                start: dateStr,
                display: "background",
                backgroundColor: "var(--color-light-green-400)",
                borderColor: "var(--color-light-green-600)",
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
      showError("Error al cargar los datos. Por favor, recarga la página.");
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

    const start = new Date(startStr + "T00:00:00");
    const end = new Date(actualEndStr + "T00:00:00");

    // ✅ VALIDACIÓN: Verificar que el rango sea seleccionable
    if (!isDateSelectable(selectInfo)) {
      if (selectInfo.view?.calendar) {
        selectInfo.view.calendar.unselect();
      }

      showError('No puedes seleccionar fines de semana, festivos o días ya reservados');
      return;
    }

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

  // ✅ Clases CSS personalizadas para las celdas
  const dayCellClassNames = (arg) => {
    const classes = ["text-xs", "sm:text-sm"];
    const dayOfWeek = arg.date.getDay();
    const dateStr = arg.date.toISOString().split("T")[0];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      classes.push("fc-day-weekend-disabled");
    }

    const hasEvent = holidays.some((h) => h.start === dateStr);
    if (hasEvent) {
      classes.push("fc-day-unavailable");
    }

    return classes;
  };

  const handleSubmitRequest = async () => {
    if (!selectedRange) {
      showError("Por favor, selecciona un rango de fechas en el calendario");
      return;
    }

    if (selectedRange.workingDays > vacationSummary.remaining_days) {
      showError(
        `No tienes suficientes días disponibles. Solicitaste ${selectedRange.workingDays} días pero solo tienes ${vacationSummary.remaining_days} disponibles.`
      );
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showLoading("Enviando solicitud...");

    try {
      const requestData = {
        start_date: selectedRange.startStr,
        end_date: selectedRange.endStr,
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
      fetchInitialData();

      dismiss(loadingToast);
      showSuccess("¡Solicitud enviada correctamente!");
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Error al enviar la solicitud. Por favor, inténtalo de nuevo.";

      dismiss(loadingToast);
      showError(errorMessage);
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

    showInfo("Selección cancelada");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-stroke p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cohispania-orange mb-4" />
          <p className="text-gray-500">Cargando calendario...</p>
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
      <div className="bg-white rounded-lg border border-gray-stroke overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-stroke">
          <h2 className="text-xl sm:text-2xl font-bold text-cohispania-blue">
            Solicitar Vacaciones
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Ajusta el rango de fechas según tus días disponibles.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {/* Leyenda - Colores unificados: festivos rojo, vacaciones verde */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400 border border-red"></div>
              <span className="text-gray-400">Festivos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-light-green-400 border border-light-green-600"></div>
              <span className="text-gray-400">Vacaciones aprobadas</span>
            </div>
          </div>

          {/* Calendario - ✅ Wrapper unificado */}
          <div className="vacation-calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              selectable={true}
              selectMirror={true}
              unselectAuto={false}
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
              dayCellClassNames={dayCellClassNames}
              eventClassNames="text-xs"
            />

            {!selectedRange && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm sm:text-base text-indigo-500 text-center">
                  Selecciona o arrastra sobre el calendario para seleccionar tus
                  fechas de vacaciones
                </p>
              </div>
            )}
          </div>

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
  };
  const textareaId = useId();

  return (
    <div className="bg-white rounded-lg border-2 border-cohispania-orange p-4 sm:p-5 animate-fadeIn">
      <h3 className="text-base sm:text-lg font-bold mb-4 text-cohispania-blue">
        Resumen de Solicitud
      </h3>

      <div className="space-y-4">
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
