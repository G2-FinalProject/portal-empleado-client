import { useEffect, useMemo, useState } from 'react';
import { Tabs, Badge, Card, Modal, Button } from '../../components/ui';
import { Calendar, Eye, Check, X } from 'lucide-react';
import useVacationStore from '../../stores/useVacationStore';
import useAuthStore from '../../stores/authStore';
import { toast } from 'react-hot-toast';

/**
 * RequestsPage - Página de gestión de solicitudes para managers y admins
 * 
 * Funcionalidades:
 * - Los managers solo ven solicitudes de su departamento
 * - Los admins ven todas las solicitudes
 * - Sistema de pestañas: Pendientes, Aprobadas, Denegadas
 * - Aprobar/Denegar solicitudes con comentarios
 */
export default function RequestsPage() {
  const { allRequests, fetchAllRequests, loading } = useVacationStore();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  // Filtrar solicitudes según el rol
  const filteredRequests = useMemo(() => {
    if (isAdmin()) {
      return allRequests; // Admin ve todas
    }
    // Manager solo ve las de su departamento
    return allRequests.filter(req => req.departmentId === user?.departmentId);
  }, [allRequests, user, isAdmin]);

  // Filtrar por estado
  const pendingRequests = useMemo(
    () => filteredRequests.filter(req => req.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [filteredRequests]
  );

  const approvedRequests = useMemo(
    () => filteredRequests.filter(req => req.status === 'approved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [filteredRequests]
  );

  const rejectedRequests = useMemo(
    () => filteredRequests.filter(req => req.status === 'rejected')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [filteredRequests]
  );

  // Configuración de las pestañas
  const tabs = [
    {
      id: 'pending',
      label: 'Pendientes',
      count: pendingRequests.length,
      content: <RequestsList 
        requests={pendingRequests} 
        emptyMessage="No hay solicitudes pendientes" 
        loading={loading}
        showActions={true}
      />,
    },
    {
      id: 'approved',
      label: 'Aprobadas',
      count: approvedRequests.length,
      content: <RequestsList 
        requests={approvedRequests} 
        emptyMessage="No hay solicitudes aprobadas" 
        loading={loading}
        showActions={false}
      />,
    },
    {
      id: 'rejected',
      label: 'Denegadas',
      count: rejectedRequests.length,
      content: <RequestsList 
        requests={rejectedRequests} 
        emptyMessage="No hay solicitudes denegadas" 
        loading={loading}
        showActions={false}
      />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Todas las solicitudes
        </h1>
        <p className="text-gray-300 mt-1">
          Gestiona las solicitudes de vacaciones de toda la empresa
        </p>
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
function RequestsList({ requests, emptyMessage, loading, showActions }) {
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
        <div className="bg-white rounded-lg">
          <h2 className="text-xl font-bold text-cohispania-blue mb-4 px-4 pt-4">
            Solicitudes {showActions ? 'Pendientes' : requests[0]?.status === 'approved' ? 'Aprobadas' : 'Denegadas'}
          </h2>
          <p className="text-gray-300 mb-6 px-4">
            {showActions ? 'Solicitudes que requieren tu aprobación' : 
             requests[0]?.status === 'approved' ? 'Histórico de solicitudes aprobadas' : 
             'Histórico de solicitudes denegadas'}
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-stroke">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Empleado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Fecha de solicitud</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Período</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Comentarios</th>
                {showActions && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Acciones</th>
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
        <h2 className="text-xl font-bold text-cohispania-blue mb-2">
          Solicitudes {showActions ? 'Pendientes' : requests[0]?.status === 'approved' ? 'Aprobadas' : 'Denegadas'}
        </h2>
        <p className="text-gray-300 mb-4">
          {showActions ? 'Solicitudes que requieren tu aprobación' : 
           requests[0]?.status === 'approved' ? 'Histórico de solicitudes aprobadas' : 
           'Histórico de solicitudes denegadas'}
        </p>
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
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'purple', label: 'Pendiente' },
      approved: { variant: 'success', label: 'Aprobado' },
      rejected: { variant: 'info', label: 'Rechazado' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== '';
  const hasApproverComment = request.comments && request.comments.trim() !== '';
  const hasAnyComment = hasRequesterComment || hasApproverComment;

  return (
    <>
      <tr className="border-b border-gray-stroke hover:bg-light-background transition-colors">
        <td className="py-4 px-4">
          <span className="text-cohispania-blue font-medium">
            {request.requesterName || 'Sin nombre'}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="text-gray-400">
            {formatDate(request.createdAt)}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-cohispania-blue font-medium">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          {getStatusBadge(request.status)}
        </td>
        <td className="py-4 px-4">
          {hasAnyComment ? (
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center gap-2 text-cohispania-blue hover:text-cohispania-orange transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Ver comentarios</span>
            </button>
          ) : (
            <span className="text-gray-300 text-sm">-</span>
          )}
        </td>
        {showActions && (
          <td className="py-4 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-cohispania-blue text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                Aprobar
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-400 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Denegar
              </button>
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
    return new Date(date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'purple', label: 'Pendiente' },
      approved: { variant: 'success', label: 'Aprobado' },
      rejected: { variant: 'info', label: 'Rechazado' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== '';
  const hasApproverComment = request.comments && request.comments.trim() !== '';
  const hasAnyComment = hasRequesterComment || hasApproverComment;

  return (
    <>
      <Card padding={true}>
        <div className="space-y-3">
          {/* Header con empleado y estado */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-cohispania-blue">
                {request.requesterName || 'Sin nombre'}
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
            <button
              onClick={() => setShowCommentsModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-light-background rounded-lg text-cohispania-blue hover:bg-cohispania-orange hover:text-white transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Ver comentarios</span>
            </button>
          )}

          {/* Botones de acción */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-4 bg-cohispania-blue text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                Aprobar
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-4 bg-red-400 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Denegar
              </button>
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
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const hasRequesterComment = request.reason && request.reason.trim() !== '';
  const hasApproverComment = request.comments && request.comments.trim() !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comentarios de la solicitud"
    >
      <div className="space-y-4">
        {/* Período de la solicitud */}
        <div className="bg-light-background p-4 rounded-lg">
          <p className="text-sm text-gray-400 font-semibold mb-1">Período solicitado</p>
          <p className="text-sm text-cohispania-blue font-semibold">
            {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.requestedDays} días)
          </p>
        </div>

        {/* Comentario del empleado */}
        {hasRequesterComment && (
          <div>
            <h3 className="text-base font-semibold text-cohispania-blue mb-2">
              Comentario del empleado:
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
  );
}

/**
 * ApproveRejectModal - Modal para aprobar o rechazar solicitudes
 */
function ApproveRejectModal({ isOpen, onClose, request, action }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { approveRequest, rejectRequest, fetchAllRequests } = useVacationStore();

  const isApprove = action === 'approve';
  const title = isApprove ? 'Aprobar Solicitud' : 'Denegar Solicitud';
  const buttonText = isApprove ? 'Aprobar' : 'Denegar';
  const buttonClass = isApprove ? 'bg-cohispania-blue' : 'bg-red-400';

  // El comentario es obligatorio solo para rechazar
  const isCommentRequired = !isApprove;
  const canSubmit = isCommentRequired ? comment.trim() !== '' : true;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      if (isApprove) {
        await approveRequest(request.id, comment || null);
        toast.success('Solicitud aprobada correctamente');
      } else {
        await rejectRequest(request.id, comment);
        toast.success('Solicitud denegada correctamente');
      }
      
      // Recargar solicitudes
      await fetchAllRequests();
      
      onClose();
      setComment('');
    } catch (error) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
    >
      <div className="space-y-4">
        {/* Información de la solicitud */}
        <div className="bg-light-background p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-400 font-semibold">
            Solicitud de {request.requesterName || 'Sin nombre'} para el período del {formatDate(request.startDate)} al {formatDate(request.endDate)}
          </p>
        </div>

        {/* Campo de comentario */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
            Comentario {isCommentRequired && <span className="text-red-400">*</span>}
            {!isCommentRequired && <span className="text-gray-400 font-normal">(opcional)</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añade un comentario opcional..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-light-background text-cohispania-blue border border-gray-stroke placeholder-cohispania-blue placeholder-opacity-60 focus:ring-2 focus:ring-cohispania-orange focus:border-cohispania-orange outline-none transition resize-none"
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
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                {isApprove ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span>{buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}