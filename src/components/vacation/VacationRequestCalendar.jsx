import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import * as holidaysApi from '../../services/holidaysApi';
//import RequestConfirmModal from './RequestConfirmModal';

const VacationRequestCalendar = ({ availableDays, onRequestCreated }) => {
  // Estado para los festivos que vienen del backend
  const [holidays, setHolidays] = useState([]);
  
  // Estado para controlar si se muestra el modal de confirmación
  const [showModal, setShowModal] = useState(false);
  
  // Estado para guardar las fechas seleccionadas
  const [selectedDates, setSelectedDates] = useState(null);

  // Cuando el componente se monta, obtenemos los festivos del usuario
  useEffect(() => {
    fetchMyHolidays();
  }, []);

  /**
   * Función para obtener los festivos de mi población
   */
  const fetchMyHolidays = async () => {
    try {
      const data = await holidaysApi.getMyHolidays(); // ✅ Corregido
      
      // Convertimos los festivos al formato que entiende FullCalendar
      const holidayEvents = data.map(holiday => ({
        title: 'Festivo',
        start: holiday.date, // Debe venir en formato 'YYYY-MM-DD'
        display: 'background', // Se muestra como fondo
        backgroundColor: '#ffcccc', // Color rojo claro
        extendedProps: {
          isHoliday: true // Marcamos que es festivo
        }
      }));
      
      setHolidays(holidayEvents);
    } catch (error) {
      console.error('Error al cargar festivos:', error);
    }
  };

  /**
   * Función que se ejecuta cuando el usuario selecciona un rango de fechas
   * @param {Object} selectInfo - Información de la selección
   */
  const handleDateSelect = (selectInfo) => {
    const start = selectInfo.start;
    const end = new Date(selectInfo.end);
    end.setDate(end.getDate() - 1); // FullCalendar incluye un día extra

    // Calculamos los días laborables
    const workingDays = calculateWorkingDays(start, end);

    // Guardamos la información de las fechas seleccionadas
    setSelectedDates({
      start: start,
      end: end,
      workingDays: workingDays,
      calendarApi: selectInfo.view.calendar // Para limpiar la selección después
    });

    // Mostramos el modal de confirmación
    setShowModal(true);
  };

  /**
   * Función que calcula los días laborables entre dos fechas
   * Excluye fines de semana y festivos
   */
  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay(); // 0=domingo, 6=sábado
      const dateString = current.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

      // Si NO es fin de semana Y NO es festivo, lo contamos
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.some(h => h.start === dateString);

      if (!isWeekend && !isHoliday) {
        count++;
      }

      current.setDate(current.getDate() + 1); // Avanzamos un día
    }

    return count;
  };

  /**
   * Función que determina si un día se puede seleccionar o no
   * Devuelve false para días que NO se pueden seleccionar
   */
  const isDateSelectable = (selectInfo) => {
    const date = selectInfo.start;
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // No se pueden seleccionar fines de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // No se pueden seleccionar festivos
    const isHoliday = holidays.some(h => h.start === dateString);
    if (isHoliday) {
      return false;
    }

    return true; // El día SÍ se puede seleccionar
  };

  /**
   * Cuando se cierra el modal sin enviar
   */
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDates(null);
    
    // Limpiamos la selección visual del calendario
    if (selectedDates?.calendarApi) {
      selectedDates.calendarApi.unselect();
    }
  };

  /**
   * Cuando se confirma la solicitud desde el modal
   */
  const handleRequestConfirmed = () => {
    setShowModal(false);
    setSelectedDates(null);
    
    // Limpiamos la selección visual del calendario
    if (selectedDates?.calendarApi) {
      selectedDates.calendarApi.unselect();
    }

    // Notificamos al componente padre que se creó una solicitud
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  return (
    <div className="vacation-request-calendar">
      <FullCalendar
        // Plugins necesarios
        plugins={[dayGridPlugin, interactionPlugin]}
        
        // Vista inicial
        initialView="dayGridMonth"
        
        // Idioma español
        locale={esLocale}
        
        // Configuración de selección
        selectable={true}
        selectMirror={true}
        
        // Eventos (en este caso, los festivos)
        events={holidays}
        
        // Callback cuando se selecciona un rango
        select={handleDateSelect}
        
        // Función para validar si un día es seleccionable
        selectAllow={isDateSelectable}
        
        // Personalización de la cabecera
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        
        // Altura del calendario
        height="auto"
        
        // Textos personalizados
        buttonText={{
          today: 'Hoy'
        }}
      />

      {/* Modal de confirmación */}
      {showModal && selectedDates && (
        <RequestConfirmModal
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          workingDays={selectedDates.workingDays}
          availableDays={availableDays}
          onClose={handleModalClose}
          onConfirm={handleRequestConfirmed}
        />
      )}
    </div>
  );
};

export default VacationRequestCalendar;
