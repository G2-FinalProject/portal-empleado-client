import { create } from "zustand";

/**
 *  Store de Autenticación con Zustand
 *
 * Este store maneja la autenticación del Portal del Empleado.
 * Guarda el token JWT y los datos básicos del usuario desde sesionData.
 *
 * Roles esperados por ID:
 * - 1: 'admin' - Administrador (gestiona todo)
 * - 2: 'manager' - Responsable de departamento (aprueba vacaciones)
 * - 3: 'employee' - Empleado (solicita vacaciones)
 */

/**
 * Decodificar JWT para extraer información básica
 *
 * El JWT contiene:
 * - id: ID del usuario
 * - role: ID del rol (1, 2, 3)
 * - iat: Fecha de creación
 * - exp: Fecha de expiración
 */
const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * STORE DE AUTENTICACIÓN
 */
const useAuthStore = create((set, get) => ({
  // ============================================
  // ESTADO INICIAL
  // ============================================

  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  isLoading: false,

  // ============================================
  // ACCIÓN: LOGIN
  // ============================================

  /**
   * Guardar token y datos básicos del usuario
   *
   * @param {string} token - El JWT recibido del backend
   * @param {object} sesionData - Objeto con { first_name, role_id }
   */
  login: (token, sesionData) => {
    const decoded = decodeToken(token);
    if (!decoded) {
      return;
    }

    const userData = {
      id: decoded.id,
      firstName: sesionData.first_name,
      roleId: sesionData.role_id,
      departmentId: sesionData.department_id,
      exp: decoded.exp,
      iat: decoded.iat,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    set({
      token: token,
      user: userData,
    });
  },

  // ============================================
  // ACCIÓN: LOGOUT
  // ============================================

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      token: null,
      user: null,
    });
  },

  // ============================================
  // VERIFICACIÓN: ¿ESTÁ AUTENTICADO?
  // ============================================

  /**
   * Verifica si hay sesión activa
   *
   * @returns {boolean} true si hay token, false si no
   */
  isAuthenticated: () => {
    const state = get();
    return state.token !== null;
  },

  // ============================================
  // VERIFICACIÓN: ¿TIENE ESTE ROL? (por ID)
  // ============================================

  /**
   * Verifica si el usuario tiene un rol específico por su ID
   *
   * @param {number} roleId - El ID del rol (1=admin, 2=manager, 3=employee)
   * @returns {boolean} true si tiene ese rol, false si no
   */
  hasRoleId: (roleId) => {
    const state = get();
    return state.user?.roleId === roleId;
  },

  // ============================================
  // VERIFICACIÓN: ¿ES ADMIN?
  // ============================================

  /**
   * Atajo para verificar si es administrador
   *
   * @returns {boolean}
   */
  isAdmin: () => {
    const state = get();
    return state.user?.roleId === 1; // 1 = admin
  },

  // ============================================
  // VERIFICACIÓN: ¿ES MANAGER?
  // ============================================

  /**
   * Atajo para verificar si es responsable de departamento
   *
   * @returns {boolean}
   *
   */
  isManager: () => {
    const state = get();
    return state.user?.roleId === 2; // 2 = manager
  },

  // ============================================
  // VERIFICACIÓN: ¿ES EMPLEADO?
  // ============================================

  /**
   * Atajo para verificar si es empleado regular
   *
   * @returns {boolean}
   *
   */
  isEmployee: () => {
    const state = get();
    return state.user?.roleId === 3; // 3 = employee
  },

  // ============================================
  // ACCIÓN: ACTUALIZAR ESTADO DE CARGA
  // ============================================

  /**
   * Actualiza el estado de carga (útil durante peticiones al backend)
   *
   * @param {boolean} loading (Muestra u oculta el spinner)
   *
   */
  setLoading: (loading) => set({ isLoading: loading }),

  // ============================================
  // ACCIÓN: ACTUALIZAR DATOS DEL USUARIO
  // ============================================

  /**
   * Actualiza los datos del usuario
   *
   * @param {object} userData - Objeto con datos completos del usuario
   */
  updateUser: (userData) => {
    const currentUser = get().user;
    const updatedUser = {
      ...currentUser,
      ...userData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    set({ user: updatedUser });
  },
}));

export default useAuthStore;
