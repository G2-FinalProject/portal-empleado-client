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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cohispania-blue">
          Bienvenido {user?.firstName || "Usuario"}
        </h1>
        <p className="text-gray-300 mt-2">
          Gestiona tus vacaciones y consulta el estado de tus solicitudes
        </p>
      </div>
      <div>
        <VacationRequestCalendar />
      </div>
      <div>
        <VacationSummaryCards />
      </div>
      <MyRequestsTabs />
    </div>
  );
}
