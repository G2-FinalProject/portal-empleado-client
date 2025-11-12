import { create } from "zustand";
import * as vacationApi from "../services/vacationApi";


const mapRequest = (req) => ({
  id: req.id,
  userId: req.user_id,
  requesterId: req.requester_id || req.user_id,
  startDate: req.start_date,
  endDate: req.end_date,
  requestedDays: req.requested_days || req.days_requested,
  status: (req.request_status || req.status || "").toLowerCase(),
  reason: req.requester_comment || req.reason || null,
  comments: req.approver_comment || req.comments || null,
  approvedBy: req.approved_by,
  approvedAt: req.approved_at,
  rejectedBy: req.rejected_by,
  rejectedAt: req.rejected_at,
  createdAt: req.createdAt || req.created_at || req.updatedAt || req.updated_at,
  updatedAt: req.updatedAt || req.updated_at,
  requesterName:
    req.requester_name ||
    req.user_name ||
    (req.requester
      ? `${req.requester.first_name} ${req.requester.last_name}`
      : ""),
  requesterEmail: req.requester_email || req.user_email || req.requester?.email,
  departmentName: req.department_name,
  departmentId: req.requester?.department_id,
});

/**
 * IMPORTANTE: Esta función es solo un FALLBACK cuando no hay conexión con la BD
 * @param {Array} requests - Array de solicitudes del usuario
 * @returns {Object} { total, available, used, pending }
 */
const calculateStats = (requests) => {
  const used = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

  const pending = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

  return {
    total: used,
    available: 0,
    used,
    pending,
  };
};

/**
 * Helper: Obtiene el ID del usuario desde el token de localStorage
 * @returns {number|null} ID del usuario o null si no hay token
 */
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.id;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

const useVacationStore = create((set, get) => ({
  myRequests: [],
  allRequests: [],
  stats: { total: 0, available: 0, used: 0, pending: 0 },
  loading: false,
  error: null,


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
        } catch (summaryError) {
          console.warn(
            "No se pudo obtener el summary, usando valores calculados:",
            summaryError
          );
        }
      }

      const stats = summaryData
        ? {
            total: summaryData.remaining_days + summaryData.used_days,
            available: summaryData.remaining_days,
            used: summaryData.used_days,
            pending: requests
              .filter((r) => r.status === "pending")
              .reduce((sum, r) => sum + (r.requestedDays || 0), 0),
          }
        : calculateStats(requests);


      set({
        myRequests: requests,
        stats,
        loading: false,
      });
    } catch (error) {
      console.error("Error en fetchMyRequests:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al cargar solicitudes",
        loading: false,
      });
      throw error;
    }
  },

 
  createRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.create(data);
      const newRequest = mapRequest(response.data || response);
      const { myRequests, stats } = get();
      const updated = [newRequest, ...myRequests];

      const newPending = updated
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

      set({
        myRequests: updated,
        stats: { ...stats, pending: newPending },
        loading: false,
      });
      return newRequest;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al crear solicitud",
        loading: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    await get().fetchMyRequests();
  },


  fetchAllRequests: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.getAll();
      let requests = (response.data || response).map(mapRequest);

      if (filters.status)
        requests = requests.filter((r) => r.status === filters.status);
      if (filters.userId)
        requests = requests.filter((r) => r.requesterId === filters.userId);

      set({ allRequests: requests, loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al cargar solicitudes",
        loading: false,
      });
      throw error;
    }
  },


  approveRequest: async (id, comment = null) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.approve(id, comment);
      const updated = mapRequest(response.data || response);
      const { allRequests } = get();
      set({
        allRequests: allRequests.map((r) => (r.id === id ? updated : r)),
        loading: false,
      });
      return updated;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al aprobar solicitud",
        loading: false,
      });
      throw error;
    }
  },


  rejectRequest: async (id, comment = null) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.reject(id, comment);
      const updated = mapRequest(response.data || response);
      const { allRequests } = get();
      set({
        allRequests: allRequests.map((r) => (r.id === id ? updated : r)),
        loading: false,
      });
      return updated;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al rechazar solicitud",
        loading: false,
      });
      throw error;
    }
  },


  updateRequestLocal: (id, updates) => {
    const { myRequests, allRequests, stats } = get();
    const updatedMy = myRequests.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );

    const newPending = updatedMy
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

    set({
      myRequests: updatedMy,
      allRequests: allRequests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      stats: { ...stats, pending: newPending },
    });
  },

 
  removeRequestLocal: (id) => {
    const { myRequests, allRequests, stats } = get();
    const updatedMy = myRequests.filter((r) => r.id !== id);


    const newPending = updatedMy
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

    set({
      myRequests: updatedMy,
      allRequests: allRequests.filter((r) => r.id !== id),
      stats: { ...stats, pending: newPending },
    });
  },


  clearError: () => set({ error: null }),

 
  reset: () =>
    set({
      myRequests: [],
      allRequests: [],
      stats: { total: 0, available: 0, used: 0, pending: 0 },
      loading: false,
      error: null,
    }),

 
  getRequestsByStatus: (status, fromAll = false) => {
    const { myRequests, allRequests } = get();
    return (fromAll ? allRequests : myRequests).filter(
      (r) => r.status === status
    );
  },
}));

export default useVacationStore;
