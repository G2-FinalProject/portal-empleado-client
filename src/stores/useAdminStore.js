import { create } from 'zustand';
import * as userApi from '../services/userApi';
import * as departmentApi from '../services/departmentsApi';
import * as locationApi from '../services/locationApi';
import * as roleApi from '../services/roleApi';
import * as holidayApi from '../services/holidaysApi';

/**
 * useAdminStore - Store centralizado para gestión de administración
 * Maneja:
 * - Usuarios
 * - Departamentos
 * - Localizaciones
 * - Roles
 * - Festivos (por localización)
 */

const useAdminStore = create((set, get) => ({
  // ============================================
  // ESTADO INICIAL
  // ============================================
  users: [],
  departments: [],
  locations: [],
  roles: [],
  holidays: {}, // { locationId: [holidays] }

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
      const response = await userApi.getAll();
      set({ users: response.data || response });
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
      const response = await userApi.create(data);
      const newUser = response.data || response;
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
      const response = await userApi.update(id, data);
      const updatedUser = response.data || response;
      set((state) => ({
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
      const response = await departmentApi.getAll();
      set({ departments: response.data || response });
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
      const response = await departmentApi.create(data);
      const newDepartment = response.data || response;
      set((state) => ({
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
      const response = await departmentApi.update(id, data);
      const updatedDepartment = response.data || response;
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
      const response = await locationApi.getAll();
      set({ locations: response.data || response });
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
      const response = await locationApi.create(data);
      const newLocation = response.data || response;
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
      const response = await locationApi.update(id, data);
      const updatedLocation = response.data || response;
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
      const response = await roleApi.getAll();
      set({ roles: response.data || response });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('roles', false);
    }
  },

  // ============================================
  // ACCIONES: FESTIVOS (por localización)
  // ============================================

  fetchHolidaysByLocation: async (locationId) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const response = await holidayApi.getByLocation(locationId);
      const holidays = response.data || response;
      set((state) => ({
        holidays: {
          ...state.holidays,
          [locationId]: holidays,
        },
      }));
      return holidays;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  createHoliday: async (data) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const response = await holidayApi.create(data);
      const newHoliday = response.data || response;
      const locationId = newHoliday.location_id || newHoliday.locationId;

      // Actualizar los festivos de esa localización
      set((state) => ({
        holidays: {
          ...state.holidays,
          [locationId]: [
            ...(state.holidays[locationId] || []),
            newHoliday,
          ],
        },
      }));

      return newHoliday;
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  deleteHoliday: async (id, locationId) => {
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      await holidayApi.deleteHoliday(id);

      // Eliminar el festivo de la localización correspondiente
      if (locationId) {
        set((state) => ({
          holidays: {
            ...state.holidays,
            [locationId]: (state.holidays[locationId] || []).filter(
              (holiday) => holiday.id !== id
            ),
          },
        }));
      }
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
      holidays: {},
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
