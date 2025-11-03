import { useMemo } from 'react';
import { Tabs, Badge, Card } from '../ui';
import { Calendar } from 'lucide-react';
import useVacationStore from '../../stores/useVacationStore';

/**
 * MyRequestsTabs - Componente con pestañas para visualizar solicitudes del usuario
 *
 * Muestra las solicitudes filtradas por estado:
 * - Pendientes
 * - Aprobadas
 * - Denegadas
 */
export default function MyRequestsTabs() {
  const myRequests = useVacationStore((state) => state.myRequests);
  const loading = useVacationStore((state) => state.loading);

  // Filtrar solicitudes por estado
  const pendingRequests = useMemo(
    () => myRequests.filter((req) => req.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [myRequests]
  );

  const approvedRequests = useMemo(
    () => myRequests.filter((req) => req.status === 'approved').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [myRequests]
  );

  const rejectedRequests = useMemo(
    () => myRequests.filter((req) => req.status === 'rejected').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [myRequests]
  );

  // Configuración de las pestañas
  const tabs = [
    {
      id: 'pending',
      label: 'Pendientes',
      count: pendingRequests.length,
      content: <RequestsList requests={pendingRequests} emptyMessage="No tienes solicitudes pendientes" loading={loading} />,
    },
    {
      id: 'approved',
      label: 'Aprobadas',
      count: approvedRequests.length,
      content: <RequestsList requests={approvedRequests} emptyMessage="No tienes solicitudes aprobadas" loading={loading} />,
    },
    {
      id: 'rejected',
      label: 'Denegadas',
      count: rejectedRequests.length,
      content: <RequestsList requests={rejectedRequests} emptyMessage="No tienes solicitudes denegadas" loading={loading} />,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-stroke p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cohispania-blue">
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
function RequestsList({ requests, emptyMessage, loading }) {
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Período</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Días solicitados</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Comentarios</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Estado</th>
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
      <div className="md:hidden space-y-4">
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
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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

  return (
    <tr className="border-b border-gray-stroke hover:bg-light-background transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="h-4 w-4" />
          <span className="text-cohispania-blue font-medium">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-cohispania-blue font-semibold">{request.requestedDays} días</span>
      </td>
      <td className="py-4 px-4">
        <div className="max-w-xs">
          {request.reason ? (
            <p className="text-gray-300 text-sm truncate">{request.reason}</p>
          ) : (
            <span className="text-gray-300 text-sm">-</span>
          )}
          {request.comments && (
            <p className="text-gray-400 text-xs mt-1 italic">Respuesta: {request.comments}</p>
          )}
        </div>
      </td>
      <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
    </tr>
  );
}

/**
 * RequestCard - Card para vista mobile
 */
function RequestCard({ request }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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

  return (
    <Card padding={true}>
      <div className="space-y-3">
        {/* Período */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cohispania-orange" />
            <div>
              <p className="text-xs text-gray-400 font-semibold">Período</p>
              <p className="text-sm text-cohispania-blue font-medium">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* Días solicitados */}
        <div>
          <p className="text-xs text-gray-400 font-semibold">Días solicitados</p>
          <p className="text-sm text-cohispania-blue font-semibold">{request.requestedDays} días</p>
        </div>

        {/* Comentarios del empleado */}
        {request.reason && (
          <div>
            <p className="text-xs text-gray-400 font-semibold">Comentarios</p>
            <p className="text-sm text-gray-300">{request.reason}</p>
          </div>
        )}

        {/* Comentarios del manager */}
        {request.comments && (
          <div className="bg-light-background rounded p-3">
            <p className="text-xs text-gray-400 font-semibold mb-1">Respuesta del responsable</p>
            <p className="text-sm text-cohispania-blue italic">{request.comments}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
