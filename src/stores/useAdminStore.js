import { create } from 'zustand';
import * as userApi from '../services/userApi';
import * as departmentApi from '../services/departmentsApi';
import * as locationApi from '../services/locationApi';
import * as roleApi from '../services/roleApi';
import * as holidayApi from '../services/holidaysApi';
import { showError, showLoading, updateToastSuccess, updateToastError } from '../utils/notifications';

const useAdminStore = create((set, get) => ({
  // ============================================
  // ESTADO INICIAL
  // ============================================
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

  // ============================================
  // HELPERS INTERNOS
  // ============================================
  setLoading: (entity, value) => {
    set((state) => ({
      loading: { ...state.loading, [entity]: value },
    }));
  },

  setError: (error) => {
    const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
    set({ error: errorMessage });
    // Mostrar toast de error automáticamente
    showError(errorMessage);
  },

  clearError: () => set({ error: null }),

  // ============================================
  // ACCIONES: USUARIOS
  // ============================================
  fetchUsers: async () => {
    get().setLoading('users', true);
    set({ error: null });
    try {
      const users = await userApi.getAll();
      set({ users });
    } catch (error) {
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  createUser: async (data) => {
    const loadingToast = showLoading('Creando empleado...');
    get().setLoading('users', true);
    set({ error: null });
    try {
      const newUser = await userApi.create(data);
      set((state) => ({ users: [...state.users, newUser] }));
      updateToastSuccess(loadingToast, '¡Empleado creado exitosamente!'); // ✅ CORREGIDO
      return newUser;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al crear el empleado';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  updateUser: async (id, data) => {
    const loadingToast = showLoading('Actualizando empleado...');
    get().setLoading('users', true);
    set({ error: null });
    try {
      const updatedUser = await userApi.update(id, data);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
      }));
      updateToastSuccess(loadingToast, '¡Empleado actualizado exitosamente!');
      return updatedUser;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el empleado';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('users', false);
    }
  },

  deleteUser: async (id) => {
    const loadingToast = showLoading('Eliminando empleado...');
    get().setLoading('users', true);
    set({ error: null });
    try {
      await userApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
      updateToastSuccess(loadingToast, 'Empleado eliminado exitosamente');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el empleado';
      updateToastError(loadingToast, errorMessage);
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
    const loadingToast = showLoading('Creando departamento...');
    get().setLoading('departments', true);
    set({ error: null });
    try {
      const newDepartment = await departmentApi.create(data);
      set((state) => ({
        departments: [...state.departments, newDepartment]
      }));
      updateToastSuccess(loadingToast, '¡Departamento creado exitosamente!');
      return newDepartment;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al crear el departamento';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },

  updateDepartment: async (id, data) => {
    const loadingToast = showLoading('Actualizando departamento...');
    get().setLoading('departments', true);
    set({ error: null });
    try {
      const updatedDepartment = await departmentApi.update(id, data);
      set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === id ? updatedDepartment : dept
        ),
      }));
      updateToastSuccess(loadingToast, '¡Departamento actualizado exitosamente!');
      return updatedDepartment;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el departamento';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('departments', false);
    }
  },

  deleteDepartment: async (id) => {
    const loadingToast = showLoading('Eliminando departamento...');
    get().setLoading('departments', true);
    set({ error: null });
    try {
      await departmentApi.deleteDepartment(id);
      set((state) => ({
        departments: state.departments.filter((dept) => dept.id !== id),
      }));
      updateToastSuccess(loadingToast, 'Departamento eliminado exitosamente');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el departamento';
      updateToastError(loadingToast, errorMessage);
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
    const loadingToast = showLoading('Creando población...');
    get().setLoading('locations', true);
    set({ error: null });
    try {
      const newLocation = await locationApi.create(data);
      set((state) => ({
        locations: [...state.locations, newLocation]
      }));
      updateToastSuccess(loadingToast, '¡Población creada exitosamente!'); // ✅ CORREGIDO
      return newLocation;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al crear la población';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  updateLocation: async (id, data) => {
    const loadingToast = showLoading('Actualizando población...');
    get().setLoading('locations', true);
    set({ error: null });
    try {
      const updatedLocation = await locationApi.update(id, data);
      set((state) => ({
        locations: state.locations.map((loc) =>
          loc.id === id ? updatedLocation : loc
        ),
      }));
      updateToastSuccess(loadingToast, '¡Población actualizada exitosamente!');
      return updatedLocation;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar la población';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('locations', false);
    }
  },

  deleteLocation: async (id) => {
    const loadingToast = showLoading('Eliminando población...');
    get().setLoading('locations', true);
    set({ error: null });
    try {
      await locationApi.remove(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
      }));
      updateToastSuccess(loadingToast, 'Población eliminada exitosamente');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al eliminar la población';
      updateToastError(loadingToast, errorMessage);
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
    const loadingToast = showLoading('Creando festivo...');
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const newHoliday = await holidayApi.create(data);
      set((state) => ({
        holidays: [...state.holidays, newHoliday]
      }));
      updateToastSuccess(loadingToast, '¡Festivo creado exitosamente!');
      return newHoliday;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al crear el festivo';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  updateHoliday: async (id, data) => {
    const loadingToast = showLoading('Actualizando festivo...'); // ✅ CORREGIDO
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      const updatedHoliday = await holidayApi.update(id, data);
      set((state) => ({
        holidays: state.holidays.map((holiday) =>
          holiday.id === parseInt(id) ? updatedHoliday : holiday
        ),
      }));
      updateToastSuccess(loadingToast, '¡Festivo actualizado exitosamente!');
      return updatedHoliday;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el festivo';
      updateToastError(loadingToast, errorMessage);
      get().setError(error);
      throw error;
    } finally {
      get().setLoading('holidays', false);
    }
  },

  deleteHoliday: async (id) => {
    const loadingToast = showLoading('Eliminando festivo...');
    get().setLoading('holidays', true);
    set({ error: null });
    try {
      await holidayApi.deleteHoliday(id);
      set((state) => ({
        holidays: state.holidays.filter((holiday) =>
          holiday.id !== parseInt(id)
        ),
      }));
      updateToastSuccess(loadingToast, 'Festivo eliminado exitosamente');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el festivo';
      updateToastError(loadingToast, errorMessage);
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
