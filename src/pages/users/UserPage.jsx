import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useVacationStore from "../../stores/useVacationStore";
import VacationRequestCalendar, {
  RequestSummaryForm,
} from "../../components/vacation/VacationRequestCalendar";
import VacationSummaryCards from "../../components/vacation/VacationSummaryCard";
import MyRequestsTabs from "../../components/vacation/MyRequestsTabs.jsx";

export default function UserPage() {
  const user = useAuthStore((state) => state.user);
  const fetchMyRequests = useVacationStore((state) => state.fetchMyRequests);

  const [selectedRange, setSelectedRange] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const clearSelection = () => {
    setSelectedRange(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 sm:space-y-6 px-3 sm:px-0">
      {/* Header de bienvenida */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Bienvenido {user?.firstName || "Usuario"}
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Gestiona tus vacaciones y consulta el estado de tus solicitudes
        </p>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* CALENDARIO - 2 columnas en desktop */}
        <div className="lg:col-span-2">
          <VacationRequestCalendar
            onRequestCreated={fetchMyRequests}
            onSelectionChange={setSelectedRange}
          />
        </div>

        {/* SIDEBAR DERECHO - 1 columna en desktop */}
        <div className="hidden lg:block">
          {/* VacationSummaryCards O RequestSummaryForm */}
          {!selectedRange ? (
            <VacationSummaryCards />
          ) : (
            <SidebarRequestSummary
              selectedRange={selectedRange}
              onClearSelection={clearSelection}
            />
          )}
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div>
        <MyRequestsTabs />
      </div>
    </div>
  );
}

function SidebarRequestSummary({ selectedRange, onClearSelection }) {
  const fetchMyRequests = useVacationStore((state) => state.fetchMyRequests);
  const [vacationSummary, setVacationSummary] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { getVacationSummary } = await import("../../services/authApi");
        const summary = await getVacationSummary();
        setVacationSummary(summary);
      } catch (error) {
        console.error("Error al cargar resumen:", error);
      }
    };
    loadSummary();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRange) {
      toast.error("Por favor, selecciona un rango de fechas");
      return;
    }

    if (selectedRange.workingDays > vacationSummary?.remaining_days) {
      toast.error(
        `No tienes suficientes días disponibles. Solicitaste ${selectedRange.workingDays} días pero solo tienes ${vacationSummary.remaining_days} disponibles.`,
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Enviando solicitud...");

    try {
      const { create: createVacationRequest } = await import(
        "../../services/vacationApi"
      );
      const { getVacationSummary } = await import("../../services/authApi");

      const requestData = {
        start_date: selectedRange.startStr,
        end_date: selectedRange.endStr,
        requested_days: selectedRange.workingDays,
        comments: comments || null,
      };

      await createVacationRequest(requestData);

      setComments("");

      if (selectedRange.calendarApi) {
        selectedRange.calendarApi.unselect();
      }

      const updatedSummary = await getVacationSummary();
      setVacationSummary(updatedSummary);

      fetchMyRequests();
      onClearSelection();

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

  const handleCancel = () => {
    setComments("");

    if (selectedRange?.calendarApi) {
      selectedRange.calendarApi.unselect();
    }

    onClearSelection();

    toast("Selección cancelada", {
      icon: "ℹ️",
      duration: 2000,
    });
  };

  if (!vacationSummary) {
    return (
      <div className="bg-white rounded-lg border border-gray-stroke p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <RequestSummaryForm
      selectedRange={selectedRange}
      vacationSummary={vacationSummary}
      comments={comments}
      setComments={setComments}
      isSubmitting={isSubmitting}
      handleSubmitRequest={handleSubmit}
      handleCancelSelection={handleCancel}
    />
  );
}
