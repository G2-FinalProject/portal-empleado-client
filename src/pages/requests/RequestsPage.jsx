import { useEffect, useMemo, useState } from "react";
import { Tabs, Badge, Card, Modal, Button } from "../../components/ui";
import {
  Calendar,
  Eye,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import useVacationStore from "../../stores/useVacationStore";
import useAuthStore from "../../stores/authStore";
import { showSuccess, showError } from "../../utils/notifications";
import { getApiErrorMessage } from "../../utils/errors";

export default function RequestsPage() {
  const { allRequests, fetchAllRequests, loading } = useVacationStore();
  const { user, isAdmin, isManager } = useAuthStore();

  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const filteredRequests = useMemo(() => {
    if (isAdmin()) {
      return allRequests;
    }

    return allRequests.filter((req) => req.departmentId === user?.departmentId);
  }, [allRequests, user, isAdmin]);

  const sortByDate = (requests) => {
    return [...requests].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  const pendingRequests = useMemo(
    () =>
      sortByDate(filteredRequests.filter((req) => req.status === "pending")),
    [filteredRequests, sortOrder]
  );

  const approvedRequests = useMemo(
    () =>
      sortByDate(filteredRequests.filter((req) => req.status === "approved")),
    [filteredRequests, sortOrder]
  );

  const rejectedRequests = useMemo(
    () =>
      sortByDate(filteredRequests.filter((req) => req.status === "rejected")),
    [filteredRequests, sortOrder]
  );

  const subtitleText = isManager()
    ? "Gestiona las solicitudes de vacaciones de tu equipo"
    : "Gestiona las solicitudes de vacaciones de toda la empresa";

  const tabs = [
    {
      id: "pending",
      label: "Pendientes",
      count: pendingRequests.length,
      content: (
        <RequestsList
          requests={pendingRequests}
          emptyMessage="No hay solicitudes pendientes"
          loading={loading}
          showActions={true}
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
          emptyMessage="No hay solicitudes aprobadas"
          loading={loading}
          showActions={false}
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
          emptyMessage="No hay solicitudes denegadas"
          loading={loading}
          showActions={false}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Todas las solicitudes
        </h1>
        <p className="text-gray-500 mt-1">{subtitleText}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-stroke p-6">
        <Tabs tabs={tabs} defaultTab="pending" />
      </div>
    </div>
  );
}

/**
 * RequestsList - Lista de solicitudes
 */
function RequestsList({
  requests,
  emptyMessage,
  loading,
  showActions,
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
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <div className="bg-white rounded-lg">
          <h2 className="text-xl font-bold text-cohispania-blue mb-4 px-4 pt-4">
            Solicitudes{" "}
            {showActions
              ? "Pendientes"
              : requests[0]?.status === "approved"
              ? "Aprobadas"
              : "Denegadas"}
          </h2>
          <p className="text-gray-500 mb-6 px-4">
            {showActions
              ? "Solicitudes que requieren tu aprobación"
              : requests[0]?.status === "approved"
              ? "Histórico de solicitudes aprobadas"
              : "Histórico de solicitudes denegadas"}
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-stroke">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                  Empleado
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-400"
                  aria-sort={sortOrder === "desc" ? "descending" : "ascending"}
                >
                  <button
                    type="button"
                    onClick={() => onSortChange(sortOrder === "desc" ? "asc" : "desc")}
                    className="flex items-center gap-2 text-gray-400 hover:text-cohispania-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-cohispania-orange)]"
                    title={
                      sortOrder === "desc"
                        ? "Ordenar ascendente"
                        : "Ordenar descendente"
                    }
                  >
                    <span>Fecha de solicitud</span>
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
                  Estado
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                  Comentarios
                </th>
                {showActions && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  showActions={showActions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Mobile: Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-cohispania-blue mb-2">
              Solicitudes{" "}
              {showActions
                ? "Pendientes"
                : requests[0]?.status === "approved"
                ? "Aprobadas"
                : "Denegadas"}
            </h2>
            <p className="text-gray-500">
              {showActions
                ? "Solicitudes que requieren tu aprobación"
                : requests[0]?.status === "approved"
                ? "Histórico de solicitudes aprobadas"
                : "Histórico de solicitudes denegadas"}
            </p>
          </div>
          <Button
            onClick={() => onSortChange(sortOrder === "desc" ? "asc" : "desc")}
            variant="ghost"
            size="small"
            aria-label={
              sortOrder === "desc"
                ? "Ordenar solicitudes de más antiguas a más recientes"
                : "Ordenar solicitudes de más recientes a más antiguas"
            }
            title={
              sortOrder === "desc"
                ? "Ordenar ascendente"
                : "Ordenar descendente"
            }
            className="text-cohispania-blue"
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            showActions={showActions}
          />
        ))}
      </div>
    </>
  );
}

/**
 * RequestRow - Fila de la tabla (desktop)
 */
function RequestRow({ request, showActions }) {
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
        <td className="py-4 px-4">
          <span className="text-cohispania-blue font-medium text-sm">
            {request.requesterName || "Sin nombre"}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="text-gray-400">{formatDate(request.createdAt)}</span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-cohispania-blue font-medium">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
        <td className="py-4 px-4">
          <div className="flex items-center justify-center">
            {hasAnyComment ? (
              <Button
                onClick={() => setShowCommentsModal(true)}
                variant="ghost"
                title="Ver más info"
              >
                <Eye className="h-5 w-5 cursor-pointer" />
              </Button>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
        </td>
        {showActions && (
          <td className="py-4 px-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowApproveModal(true)}
                variant="secondary"
                size="small"
                aria-label="Aprobar solicitud"
                className="flex-1 gap-1 px-4 text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                Aprobar
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="danger"
                size="small"
                className="flex-1 gap-1 px-4 text-sm font-medium"
                aria-label="Denegar solicitud"
              >
                <X className="h-4 w-4" />
                Denegar
              </Button>
            </div>
          </td>
        )}
      </tr>

      {/* Modal de comentarios */}
      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        request={request}
      />

      {/* Modal de aprobar */}
      <ApproveRejectModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        request={request}
        action="approve"
      />

      {/* Modal de denegar */}
      <ApproveRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        request={request}
        action="reject"
      />
    </>
  );
}

/**
 * RequestCard - Card para vista mobile
 */
function RequestCard({ request, showActions }) {
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
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
      <Card padding={true}>
        <div className="space-y-3">
          {/* Header con empleado y estado */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-cohispania-blue">
                {request.requesterName || "Sin nombre"}
              </p>
              <p className="text-xs text-gray-400">
                Solicitado: {formatDate(request.createdAt)}
              </p>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Período */}
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cohispania-orange" />
            <div>
              <p className="text-xs text-gray-400 font-semibold">Período</p>
              <p className="text-sm text-cohispania-blue font-medium">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </p>
            </div>
          </div>

          {/* Botón para ver comentarios */}
          {hasAnyComment && (
            <Button
              onClick={() => setShowCommentsModal(true)}
              variant="ghost"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Ver comentarios</span>
            </Button>
          )}

          {/* Botones de acción */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowApproveModal(true)}
                variant="secondary"
                size="small"
                className="flex-1 gap-1 px-4 text-sm font-medium"
                aria-label="Aprobar solicitud"
              >
                <Check className="h-4 w-4" />
                Aprobar
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="danger"
                size="small"
                className="flex-1 gap-1 px-4 text-sm font-medium"
                aria-label="Denegar solicitud"
              >
                <X className="h-4 w-4" />
                Denegar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Modales */}
      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        request={request}
      />

      <ApproveRejectModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        request={request}
        action="approve"
      />

      <ApproveRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        request={request}
        action="reject"
      />
    </>
  );
}

/**
 * CommentsModal - Modal para ver comentarios de la solicitud
 */
function CommentsModal({ isOpen, onClose, request }) {
  // Formato DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== "";
  const hasApproverComment = request.comments && request.comments.trim() !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              Comentario del empleado:
            </h3>
            <p className="text-base text-gray-500 bg-light-background p-4 rounded-lg">
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
  );
}

/**
 * ApproveRejectModal - Modal para aprobar o rechazar solicitudes
 */
function ApproveRejectModal({ isOpen, onClose, request, action }) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { approveRequest, rejectRequest, fetchAllRequests } =
    useVacationStore();

  const isApprove = action === "approve";
  const title = isApprove ? "Aprobar Solicitud" : "Denegar Solicitud";
  const buttonText = isApprove ? "Aprobar" : "Denegar";
  const buttonVariant = isApprove ? "secondary" : "danger";


  const isCommentRequired = !isApprove;
  const canSubmit = isCommentRequired ? comment.trim() !== "" : true;

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let result;
      if (isApprove) {
        result = await approveRequest(request.id, comment || null);
      } else {
        result = await rejectRequest(request.id, comment);
      }

      const successMessage = result?.message ||
        (isApprove ? "Solicitud aprobada correctamente" : "Solicitud denegada correctamente");

      showSuccess(successMessage);

      // Recargar solicitudes
      await fetchAllRequests();

      onClose();
      setComment("");
    } catch (error) {
      showError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {/* Información de la solicitud */}
        <div className="bg-light-background p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-400 font-semibold">
            Solicitud de {request.requesterName || "Sin nombre"} para el período
            del {formatDate(request.startDate)} al {formatDate(request.endDate)}
          </p>
        </div>

        {/* Campo de comentario */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
            Comentario{" "}
            {isCommentRequired && <span className="text-red-400">*</span>}
            {!isCommentRequired && (
              <span className="text-gray-400 font-normal">(opcional)</span>
            )}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añade un comentario..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-light-background text-cohispania-blue border border-gray-stroke placeholder-cohispania-blue placeholder-opacity-60 focus:ring-0 focus:border-[var(--color-cohispania-orange)] outline-none transition resize-none"
          />
          {isCommentRequired && (
            <p className="mt-2 text-xs text-gray-400">
              * El comentario es obligatorio al denegar una solicitud
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            variant={buttonVariant}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                {isApprove ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>{buttonText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
