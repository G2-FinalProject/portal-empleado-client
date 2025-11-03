import { create } from "zustand";
import * as vacationApi from "../services/vacationApi";


/**
 * Mapea los datos de una solicitud del backend al formato del frontend
 */
const mapRequest = (req) => ({
  id: req.id,
  userId: req.user_id,
  requesterId: req.requester_id || req.user_id,
  startDate: req.start_date,
  endDate: req.end_date,
  requestedDays: req.requested_days || req.days_requested,
  status: req.request_status || req.status,
  reason: req.reason,
  comments: req.comments,
  approvedBy: req.approved_by,
  approvedAt: req.approved_at,
  rejectedBy: req.rejected_by,
  rejectedAt: req.rejected_at,
  createdAt: req.created_at,
  updatedAt: req.updated_at,
  requesterName: req.requester_name || req.user_name,
  requesterEmail: req.requester_email || req.user_email,
  departmentName: req.department_name,
});

/**
 * Calcula las estadísticas de vacaciones
 * IMPORTANTE: Esta función es solo un FALLBACK cuando no hay conexión con la BD
 * @param {Array} requests - Array de solicitudes del usuario
 * @returns {Object} { total, available, used, pending }
 */
const calculateStats = (requests) => {
  const used = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

  const pending = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

  // FALLBACK: Si no tenemos datos de la BD, devolvemos valores mínimos
  // Esto solo debería pasar si falla la llamada a getVacationSummary
  return {
    total: used,
    available: 0,
    used,
    pending
  };
};

/**
 * Helper: Obtiene el ID del usuario desde el token de localStorage
 * @returns {number|null} ID del usuario o null si no hay token
 */
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.id;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

const useVacationStore = create((set, get) => ({
  myRequests: [],
  allRequests: [],
  stats: { total: 0, available: 0, used: 0, pending: 0 }, // Sin valores hardcodeados
  loading: false,
  error: null,

  /**
   * 📊 Obtiene las solicitudes del usuario Y su resumen de vacaciones de la BD
   * Esta es la función principal que carga TODOS los datos
   */
  fetchMyRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.getMyRequests();
      const requests = (response.data || response).map(mapRequest);
      const userId = getUserIdFromToken();
      let summaryData = null;

      if (userId) {
        try {
          summaryData = await vacationApi.getVacationSummary(userId);
          console.log('✅ Resumen de vacaciones obtenido:', summaryData);
        } catch (summaryError) {
          console.warn('⚠️ No se pudo obtener el summary, usando valores calculados:', summaryError);
        }
      }

      const stats = summaryData
        ? {
            total: summaryData.remaining_days + summaryData.used_days,
            available: summaryData.remaining_days,
            used: summaryData.used_days,
            pending: requests
              .filter(r => r.status === 'pending')
              .reduce((sum, r) => sum + (r.requestedDays || 0), 0)
          }
        : calculateStats(requests); // Fallback si no hay summary

      console.log('📊 Stats calculadas:', stats);

      set({
        myRequests: requests,
        stats,
        loading: false
      });
    } catch (error) {
      console.error('❌ Error en fetchMyRequests:', error);
      set({
        error: error.response?.data?.message || error.message || "Error al cargar solicitudes",
        loading: false
      });
      throw error;
    }
  },

  /**
   * Crea una nueva solicitud de vacaciones
   */
  createRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.create(data);
      const newRequest = mapRequest(response.data || response);
      const { myRequests, stats } = get();
      const updated = [newRequest, ...myRequests];

      // Recalcular stats (el pending aumenta)
      const newPending = updated
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

      set({
        myRequests: updated,
        stats: { ...stats, pending: newPending },
        loading: false
      });
      return newRequest;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al crear solicitud",
        loading: false
      });
      throw error;
    }
  },

  /**
   * Recarga las estadísticas desde la BD
   */
  fetchStats: async () => {
    await get().fetchMyRequests();
  },

  /**
   * 📋 Obtiene todas las solicitudes (para managers/admins)
   */
  fetchAllRequests: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.getAll();
      let requests = (response.data || response).map(mapRequest);

      if (filters.status) requests = requests.filter(r => r.status === filters.status);
      if (filters.userId) requests = requests.filter(r => r.requesterId === filters.userId);

      set({ allRequests: requests, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar solicitudes",
        loading: false
      });
      throw error;
    }
  },

  /**
   * ✅ Aprueba una solicitud
   */
  approveRequest: async (id, comment = null) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.approve(id, comment);
      const updated = mapRequest(response.data || response);
      const { allRequests } = get();
      set({
        allRequests: allRequests.map(r => r.id === id ? updated : r),
        loading: false
      });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al aprobar solicitud",
        loading: false
      });
      throw error;
    }
  },

  /**
   * Rechaza una solicitud
   */
  rejectRequest: async (id, comment = null) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.reject(id, { reason: comment });
      const updated = mapRequest(response.data || response);
      const { allRequests } = get();
      set({
        allRequests: allRequests.map(r => r.id === id ? updated : r),
        loading: false
      });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al rechazar solicitud",
        loading: false
      });
      throw error;
    }
  },

  /**
   * Actualiza una solicitud localmente (sin llamar al backend)
   */
  updateRequestLocal: (id, updates) => {
    const { myRequests, allRequests, stats } = get();
    const updatedMy = myRequests.map(r => r.id === id ? { ...r, ...updates } : r);

    // Recalcular pending
    const newPending = updatedMy
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

    set({
      myRequests: updatedMy,
      allRequests: allRequests.map(r => r.id === id ? { ...r, ...updates } : r),
      stats: { ...stats, pending: newPending }
    });
  },

  /**
   * Elimina una solicitud localmente
   */
  removeRequestLocal: (id) => {
    const { myRequests, allRequests, stats } = get();
    const updatedMy = myRequests.filter(r => r.id !== id);

    // Recalcular pending
    const newPending = updatedMy
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

    set({
      myRequests: updatedMy,
      allRequests: allRequests.filter(r => r.id !== id),
      stats: { ...stats, pending: newPending }
    });
  },

  /**
   * Limpia el error
   */
  clearError: () => set({ error: null }),

  /**
   * Resetea el store al estado inicial
   */
  reset: () => set({
    myRequests: [],
    allRequests: [],
    stats: { total: 0, available: 0, used: 0, pending: 0 }, // Sin valores hardcodeados
    loading: false,
    error: null,
  }),

  /**
   * 🔍 Obtiene solicitudes por estado
   */
  getRequestsByStatus: (status, fromAll = false) => {
    const { myRequests, allRequests } = get();
    return (fromAll ? allRequests : myRequests).filter(r => r.status === status);
  },
}));

export default useVacationStore;
