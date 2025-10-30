import { create } from "zustand";
import * as vacationApi from "../services/vacationApi";

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

const calculateStats = (requests, total = 22) => {
  const used = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);
  
  const pending = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (r.requestedDays || 0), 0);

  return { total, available: total - used, used, pending };
};

const useVacationStore = create((set, get) => ({
  myRequests: [],
  allRequests: [],
  stats: { total: 22, available: 22, used: 0, pending: 0 },
  loading: false,
  error: null,

  fetchMyRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.getMyRequests();
      const requests = (response.data || response).map(mapRequest);
      set({ 
        myRequests: requests,
        stats: calculateStats(requests),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || "Error al cargar solicitudes",
        loading: false 
      });
      throw error;
    }
  },

  createRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.create(data);
      const newRequest = mapRequest(response.data || response);
      const { myRequests } = get();
      const updated = [newRequest, ...myRequests];
      set({ 
        myRequests: updated,
        stats: calculateStats(updated),
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

  fetchStats: async () => {
    const { myRequests } = get();
    if (myRequests.length >= 0) {
      set({ stats: calculateStats(myRequests) });
      return;
    }
    await get().fetchMyRequests();
  },

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

  approveRequest: async (id, comment = null) => {
    set({ loading: true, error: null });
    try {
      const response = await vacationApi.approve(id);
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

  updateRequestLocal: (id, updates) => {
    const { myRequests, allRequests } = get();
    const updatedMy = myRequests.map(r => r.id === id ? { ...r, ...updates } : r);
    set({ 
      myRequests: updatedMy,
      allRequests: allRequests.map(r => r.id === id ? { ...r, ...updates } : r),
      stats: calculateStats(updatedMy)
    });
  },

  removeRequestLocal: (id) => {
    const { myRequests, allRequests } = get();
    const updatedMy = myRequests.filter(r => r.id !== id);
    set({ 
      myRequests: updatedMy,
      allRequests: allRequests.filter(r => r.id !== id),
      stats: calculateStats(updatedMy)
    });
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    myRequests: [],
    allRequests: [],
    stats: { total: 22, available: 22, used: 0, pending: 0 },
    loading: false,
    error: null,
  }),

  getRequestsByStatus: (status, fromAll = false) => {
    const { myRequests, allRequests } = get();
    return (fromAll ? allRequests : myRequests).filter(r => r.status === status);
  },
}));

export default useVacationStore;