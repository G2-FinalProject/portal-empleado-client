import { useMemo, useState } from "react";
import { Tabs, Badge, Card, Modal } from "../ui";
import { Calendar, Eye, ArrowDown, ArrowUp } from "lucide-react";
import useVacationStore from "../../stores/useVacationStore";

export default function MyRequestsTabs() {
  const myRequests = useVacationStore((state) => state.myRequests);
  const loading = useVacationStore((state) => state.loading);

  const [sortOrder, setSortOrder] = useState("desc");

  const pendingRequests = useMemo(() => {
    const filtered = myRequests.filter((req) => req.status === "pending");
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [myRequests, sortOrder]);

  const approvedRequests = useMemo(() => {
    const filtered = myRequests.filter((req) => req.status === "approved");
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [myRequests, sortOrder]);

  const rejectedRequests = useMemo(() => {
    const filtered = myRequests.filter((req) => req.status === "rejected");
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [myRequests, sortOrder]);

  const tabs = [
    {
      id: "pending",
      label: "Pendientes",
      count: pendingRequests.length,
      content: (
        <RequestsList
          requests={pendingRequests}
          emptyMessage="No tienes solicitudes pendientes"
          loading={loading}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      ),
    },
    {
      id: "approved",
      label: "Aprobadas",
      count: approvedRequests.length,
      content: (
        <RequestsList
          requests={approvedRequests}
          emptyMessage="No tienes solicitudes aprobadas"
          loading={loading}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      ),
    },
    {
      id: "rejected",
      label: "Denegadas",
      count: rejectedRequests.length,
      content: (
        <RequestsList
          requests={rejectedRequests}
          emptyMessage="No tienes solicitudes denegadas"
          loading={loading}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-stroke p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-cohispania-blue">
          Solicitudes
        </h2>
        <p className="text-gray-300 mt-1">
          Revisa el estado de tus solicitudes
        </p>
      </div>
      <Tabs tabs={tabs} defaultTab="pending" />
    </div>
  );
}

/**
 * RequestsList - Lista de solicitudes (tabla en desktop, cards en mobile)
 */
function RequestsList({
  requests,
  emptyMessage,
  loading,
  sortOrder,
  onSortChange,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cohispania-blue" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-stroke">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                <button
                  onClick={() =>
                    onSortChange(sortOrder === "desc" ? "asc" : "desc")
                  }
                  className="flex items-center gap-2 hover:text-cohispania-blue transition-colors"
                  title={
                    sortOrder === "desc"
                      ? "Ordenar ascendente"
                      : "Ordenar descendente"
                  }
                >
                  Fecha de solicitud
                  {sortOrder === "desc" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                Período
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                Días solicitados
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                Estado
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                Comentarios
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile: Cards */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm text-gray-400 font-semibold">
            {requests.length}{" "}
            {requests.length === 1 ? "solicitud" : "solicitudes"}
          </p>
          <button
            onClick={() => onSortChange(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1 px-2 py-1.5 bg-cohispania-blue text-white rounded-lg hover:opacity-90 transition-opacity text-xs"
            title={
              sortOrder === "desc"
                ? "Ordenar ascendente"
                : "Ordenar descendente"
            }
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
          </button>
        </div>
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </>
  );
}

/**
 * RequestRow - Fila de la tabla (desktop)
 */
function RequestRow({ request }) {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "purple", label: "Pendiente" },
      approved: { variant: "success", label: "Aprobado" },
      rejected: { variant: "info", label: "Rechazado" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== "";
  const hasApproverComment = request.comments && request.comments.trim() !== "";
  const hasAnyComment = hasRequesterComment || hasApproverComment;

  return (
    <>
      <tr className="border-b border-gray-stroke hover:bg-light-background transition-colors">
        {/* Fecha de solicitud */}
        <td className="py-4 px-4">
          <span className="text-gray-400 text-sm">
            {formatDate(request.createdAt)}
          </span>
        </td>

        {/* Período */}
        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-cohispania-blue font-medium">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </span>
          </div>
        </td>

        {/* Días solicitados */}
        <td className="py-4 px-4">
          <span className="text-cohispania-blue font-semibold">
            {request.requestedDays} días
          </span>
        </td>

        {/* Estado */}
        <td className="py-4 px-4">{getStatusBadge(request.status)}</td>

        {/* Comentarios - Solo icono centrado */}
        <td className="py-4 px-4">
          <div className="flex items-center justify-center">
            {hasAnyComment ? (
              <button
                onClick={() => setShowModal(true)}
                className="text-cohispania-blue hover:text-cohispania-orange transition-colors"
                title="Ver más info"
              >
                <Eye className="h-5 w-5" />
              </button>
            ) : (
              <span className="text-gray-300 text-sm">-</span>
            )}
          </div>
        </td>
      </tr>

      {/* Modal de comentarios */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Comentarios de la solicitud"
      >
        <div className="space-y-4">
          {/* Período de la solicitud */}
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">
              Período solicitado
            </p>
            <p className="text-sm text-cohispania-blue font-semibold">
              {formatDate(request.startDate)} - {formatDate(request.endDate)} (
              {request.requestedDays} días)
            </p>
          </div>

          {/* Comentario del empleado */}
          {hasRequesterComment && (
            <div>
              <h3 className="text-base font-semibold text-cohispania-blue mb-2">
                Tu comentario:
              </h3>
              <p className="text-base text-gray-300 bg-light-background p-4 rounded-lg">
                {request.reason}
              </p>
            </div>
          )}

          {/* Comentario del responsable */}
          {hasApproverComment && (
            <div>
              <h3 className="text-base font-semibold text-cohispania-blue mb-2">
                Respuesta del responsable:
              </h3>
              <p className="text-base text-cohispania-blue bg-light-background p-4 rounded-lg border-l-4 border-cohispania-orange">
                {request.comments}
              </p>
            </div>
          )}

          {/* Si no hay comentarios */}
          {!hasRequesterComment && !hasApproverComment && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 italic">
                No hay comentarios en esta solicitud
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

/**
 * RequestCard - Card para vista mobile
 */
function RequestCard({ request }) {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "purple", label: "Pendiente" },
      approved: { variant: "success", label: "Aprobado" },
      rejected: { variant: "info", label: "Rechazado" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== "";
  const hasApproverComment = request.comments && request.comments.trim() !== "";
  const hasAnyComment = hasRequesterComment || hasApproverComment;

  return (
    <>
      <Card padding={false} className="p-3">
        <div className="space-y-2">
          {/* Header con fecha de solicitud y estado */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold">
                Fecha de solicitud
              </p>
              <p className="text-xs sm:text-sm text-cohispania-blue font-medium truncate">
                {formatDate(request.createdAt)}
              </p>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Período */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cohispania-orange shrink-0 mt-0.5" />
            <div className="flex items-start gap-2">
              <p className="text-xs text-gray-400 font-semibold">Período</p>
              <p className="text-xs sm:text-sm text-cohispania-blue font-medium wrap-break-word">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </p>
            </div>
          </div>

          {/* Días solicitados */}
          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Días solicitados
            </p>
            <p className="text-sm text-cohispania-blue font-semibold">
              {request.requestedDays} días
            </p>
          </div>

          {/* Botón para ver comentarios */}
          {hasAnyComment && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-light-background rounded-lg text-cohispania-blue hover:bg-cohispania-orange hover:text-white transition-colors mt-2"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Ver comentarios</span>
            </button>
          )}
        </div>
      </Card>

      {/* Modal de comentarios */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Comentarios de la solicitud"
      >
        <div className="space-y-4">
          <div className="bg-light-background p-4 rounded-lg">
            <p className="text-sm text-gray-400 font-semibold mb-1">
              Período solicitado
            </p>
            <p className="text-sm text-cohispania-blue font-semibold">
              {formatDate(request.startDate)} - {formatDate(request.endDate)} (
              {request.requestedDays} días)
            </p>
          </div>

          {hasRequesterComment && (
            <div>
              <h3 className="text-base font-semibold text-cohispania-blue mb-2">
                Tu comentario:
              </h3>
              <p className="text-base text-gray-300 bg-light-background p-4 rounded-lg">
                {request.reason}
              </p>
            </div>
          )}

          {hasApproverComment && (
            <div>
              <h3 className="text-base font-semibold text-cohispania-blue mb-2">
                Respuesta del responsable:
              </h3>
              <p className="text-base text-cohispania-blue bg-light-background p-4 rounded-lg border-l-4 border-cohispania-orange">
                {request.comments}
              </p>
            </div>
          )}

          {!hasRequesterComment && !hasApproverComment && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 italic">
                No hay comentarios en esta solicitud
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
