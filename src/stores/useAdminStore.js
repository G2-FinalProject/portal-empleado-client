import { create } from 'zustand';
import * as userApi from '../services/userApi';
import * as departmentApi from '../services/departmentsApi';
import * as locationApi from '../services/locationApi';
import * as roleApi from '../services/roleApi';
import * as holidayApi from '../services/holidaysApi';

/**
 * useAdminStore - Store centralizado simplificado para eliminar la duplicación con servicios API.
 */

const useAdminStore = create((set, get) => ({
  // ============================================
  // ESTADO INICIAL
  // ============================================
  users: [],
  departments: [],
  locations: [],
  roles: [],
  holidays: [], // Array simple para todos los festivos

  // Loading granular por entidad
  loading: {
    users: false,
    departments: false,
    locations: false,
    roles: false,
    holidays: false,
  },

  error: null,

  // ============================================
  // HELPERS INTERNOS
  // ============================================

  setLoading: (entity, value) => {
    set((state) => ({
      loading: { ...state.loading, [entity]: value },
    }));
  },

  setError: (error) => {
    set({ error: error?.response?.data?.message || error?.message || 'Error desconocido' });
  },

  clearError: () => set({ error: null }),

  // ============================================
  // ACCIONES: USUARIOS
  // ============================================

  fetchUsers: async () => {
    get().setLoading('users', true);
    set({ error: null });
    try {
      const users = await userApi.getAll(); //=> El servicio ya devuelve data
      set({ users });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  createUser: async (data) => {
    get().setLoading('users', true);
    set({ error: null });
    try {
      const newUser = await userApi.create(data); //=> El servicio ya devuelve data
      set((state) => ({ users: [...state.users, newUser] }));
      return newUser;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  updateUser: async (id, data) => {
    get().setLoading('users', true);
    set({ error: null });
    try {
      const updatedUser = await userApi.update(id, data); set((state) => ({ // Servicio ya devuelve data
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
      }));
      return updatedUser;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  deleteUser: async (id) => {
    get().setLoading('users', true);
    set({ error: null });
    try {
      await userApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  // ============================================
  // ACCIONES: DEPARTAMENTOS
  // ============================================

  fetchDepartments: async () => {
    get().setLoading('departments', true);
    set({ error: null });
    try {
      const departments = await departmentApi.getAll();
      set({ departments });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },

  createDepartment: async (data) => {
    get().setLoading('departments', true);
    set({ error: null });
    try {
      const newDepartment = await departmentApi.create(data); set((state) => ({
        departments: [...state.departments, newDepartment]
      }));
      return newDepartment;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },

  updateDepartment: async (id, data) => {
    get().setLoading('departments', true);
    set({ error: null });
    try {
      const updatedDepartment = await departmentApi.update(id, data);
      set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === id ? updatedDepartment : dept
        ),
      }));
      return updatedDepartment;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },

  deleteDepartment: async (id) => {
    get().setLoading('departments', true);
    set({ error: null });
    try {
      await departmentApi.deleteDepartment(id);
      set((state) => ({
        departments: state.departments.filter((dept) => dept.id !== id),
      }));
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },
  // ============================================
  // ACCIONES: LOCALIZACIONES
  // ============================================

  fetchLocations: async () => {
    get().setLoading('locations', true);
    set({ error: null });
    try {
      const locations = await locationApi.getAll();
      set({ locations });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  createLocation: async (data) => {
    get().setLoading('locations', true);
    set({ error: null });
    try {
      const newLocation = await locationApi.create(data);
      set((state) => ({
        locations: [...state.locations, newLocation]
      }));
      return newLocation;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  updateLocation: async (id, data) => {
    get().setLoading('locations', true);
    set({ error: null });
    try {
      const updatedLocation = await locationApi.update(id, data);
      set((state) => ({
        locations: state.locations.map((loc) =>
          loc.id === id ? updatedLocation : loc
        ),
      }));
      return updatedLocation;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  deleteLocation: async (id) => {
    get().setLoading('locations', true);
    set({ error: null });
    try {
      await locationApi.remove(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
      }));
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  // ============================================
  // ACCIONES: ROLES
  // ============================================

  fetchRoles: async () => {
    get().setLoading('roles', true);
    set({ error: null });
    try {
      const roles = await roleApi.getAll();
      set({ roles });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('roles', false);
    }
  },

  // ============================================
  // ACCIONES: FESTIVOS
  // ============================================

  fetchHolidays: async () => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const holidays = await holidayApi.getAll();
      set({ holidays });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  // Helper para filtrar festivos por localización
  getHolidaysByLocation: (locationId) => {
    const state = get();
    return state.holidays.filter(holiday =>
      holiday.location_id === parseInt(locationId)
    );
  },

  createHoliday: async (data) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const newHoliday = await holidayApi.create(data);
      set((state) => ({
        holidays: [...state.holidays, newHoliday]
      }));
      return newHoliday;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  updateHoliday: async (id, data) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const updatedHoliday = await holidayApi.update(id, data); // 🔧 Simplificado
      set((state) => ({
        holidays: state.holidays.map((holiday) =>
          holiday.id === parseInt(id) ? updatedHoliday : holiday
        ),
      }));
      return updatedHoliday;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  deleteHoliday: async (id) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      await holidayApi.deleteHoliday(id);
      set((state) => ({
        holidays: state.holidays.filter((holiday) =>
          holiday.id !== parseInt(id)
        ),
      }));
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  // ============================================
  // RESET
  // ============================================

  reset: () => {
    set({
      users: [],
      departments: [],
      locations: [],
      roles: [],
      holidays: [],
      loading: {
        users: false,
        departments: false,
        locations: false,
        roles: false,
        holidays: false,
      },
      error: null,
    });
  },
}));

export default useAdminStore;
