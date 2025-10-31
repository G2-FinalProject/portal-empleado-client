import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getMyHolidays } from "../../services/holidaysApi";
import { create as createVacationRequest } from "../../services/vacationApi";
import { getProfile } from "../../services/authApi";
import Button from "../ui/Button";

const VacationRequestCalendar = ({ onRequestCreated }) => {
  // Estado para los festivos
  const [holidays, setHolidays] = useState([]);

  // Estado para el perfil del usuario
  const [userProfile, setUserProfile] = useState(null);

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
   * Obtiene el perfil del usuario y los festivos
   */
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Ejecutamos ambas peticiones en paralelo para que sea más rápido
      const [profile, holidaysData] = await Promise.all([
        getProfile(),
        getMyHolidays(),
      ]);

      // Guardamos el perfil del usuario
      setUserProfile(profile);

      // Convertimos los festivos al formato de FullCalendar
      const holidayEvents = holidaysData.map((holiday) => ({
        title: "Festivo",
        start: holiday.date, // Formato: 'YYYY-MM-DD'
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
      alert("Error al cargar los datos. Por favor, recarga la página.");
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
    end.setDate(end.getDate() - 1); // FullCalendar suma un día extra

    // Calculamos cuántos días laborables hay en el rango
    const workingDays = calculateWorkingDays(start, end);

    // Guardamos la selección
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

      // Verificamos si es fin de semana (0=domingo, 6=sábado)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Verificamos si es festivo
      const isHoliday = holidays.some((h) => h.start === dateString);

      // Si NO es fin de semana NI festivo, lo contamos
      if (!isWeekend && !isHoliday) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  /**
   * Determina si una fecha se puede seleccionar
   * Retorna false para fines de semana y festivos
   */
  const isDateSelectable = (selectInfo) => {
    const date = selectInfo.start;
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split("T")[0];

    // No permitir fines de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // No permitir festivos
    const isHoliday = holidays.some((h) => h.start === dateString);
    if (isHoliday) {
      return false;
    }

    return true;
  };

  /**
   * Formatea una fecha al estilo español (ej: "15 de marzo de 2025")
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
    // Validación 1: Verificar que hay fechas seleccionadas
    if (!selectedRange) {
      alert("Por favor, selecciona un rango de fechas en el calendario");
      return;
    }

    // Validación 2: Verificar que no excede los días disponibles
    if (selectedRange.workingDays > userProfile.available_days) {
      alert(
        `No tienes suficientes días disponibles. Solicitaste ${selectedRange.workingDays} días pero solo tienes ${userProfile.available_days} disponibles.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparamos los datos para enviar al backend
      const requestData = {
        startDate: selectedRange.start.toISOString().split("T")[0], // 'YYYY-MM-DD'
        endDate: selectedRange.end.toISOString().split("T")[0], // 'YYYY-MM-DD'
        reason: comments || undefined, // Solo enviamos si hay comentarios
      };

      // Llamamos al servicio para crear la solicitud
      await createVacationRequest(requestData);

      // Limpiamos todo después de enviar
      setSelectedRange(null);
      setComments("");

      // Limpiamos la selección visual del calendario
      if (selectedRange.calendarApi) {
        selectedRange.calendarApi.unselect();
      }

      // Recargamos el perfil para actualizar los días disponibles
      const updatedProfile = await getProfile();
      setUserProfile(updatedProfile);

      // Notificamos al componente padre
      if (onRequestCreated) {
        onRequestCreated();
      }

      // Mostramos mensaje de éxito
      alert("¡Solicitud enviada correctamente!");
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      alert("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
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
  };

  // Mostrar mensaje de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-300">Cargando calendario...</p>
      </div>
    );
  }

  // Si no hay perfil, mostrar error
  if (!userProfile) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-400">Error al cargar el perfil de usuario</p>
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

          {/* Si hay un rango seleccionado, mostramos el resumen */}
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
                    {userProfile.available_days} días
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

              {/* Mensaje de advertencia si excede días disponibles */}
              {selectedRange.workingDays > userProfile.available_days && (
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
                  disabled={selectedRange.workingDays > userProfile.available_days}
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
            // Si NO hay selección, mostramos un mensaje
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
