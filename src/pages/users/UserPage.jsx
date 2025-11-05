import { useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import useVacationStore from "../../stores/useVacationStore";
import VacationRequestCalendar from "../../components/vacation/VacationRequestCalendar";
import VacationSummaryCards from "../../components/vacation/VacationSummaryCard";
import MyRequestsTabs from "../../components/vacation/MyRequestsTabs.jsx";

export default function UserPage() {
  const user = useAuthStore((state) => state.user);
  const fetchMyRequests = useVacationStore((state) => state.fetchMyRequests);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header de bienvenida */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Bienvenido {user?.firstName || "Usuario"}
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Gestiona tus vacaciones y consulta el estado de tus solicitudes
        </p>
      </div>

      {/* 
        SECCIÓN PRINCIPAL: Calendario + Resumen de vacaciones
        - En mobile: apilados verticalmente (calendario arriba, resumen abajo)
        - En desktop: lado a lado (calendario izquierda, resumen derecha)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario (ocupa 2 columnas en desktop) */}
        <div className="lg:col-span-2">
          <VacationRequestCalendar onRequestCreated={fetchMyRequests} />
        </div>

        {/* Resumen de vacaciones (ocupa 1 columna en desktop) */}
        <div className="flex justify-center lg:justify-start">
          <VacationSummaryCards />
        </div>
      </div>

      {/* Tabla de mis solicitudes */}
      <div>
        <MyRequestsTabs />
      </div>
    </div>
  );
}

