import { create } from "zustand";

/**
 * 🎓 EXPLICACIÓN: Store de Autenticación con Zustand
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
 * 🔍 Decodificar JWT para extraer información básica
 * 
 * El JWT contiene:
 * - id: ID del usuario
 * - role: ID del rol (1, 2, 3)
 * - iat: Fecha de creación
 * - exp: Fecha de expiración
 */
const decodeToken = (token) => {
  try {

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token inválido: no tiene 3 partes');
      return null;
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    return decoded;
    
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
};

/**
 * 🏪 STORE DE AUTENTICACIÓN
 */
const useAuthStore = create((set, get) => ({
  
  // ============================================
  // 📦 ESTADO INICIAL
  // ============================================
  
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  isLoading: false,
  
  
  // ============================================
  // 🔐 ACCIÓN: LOGIN
  // ============================================
  
  /**
   * Guardar token y datos básicos del usuario
   * 
   * @param {string} token - El JWT recibido del backend
   * @param {object} sesionData - Objeto con { first_name, role_id }
   * 
   * Ejemplo de uso:
   *   const { login } = useAuthStore();
   *   const response = await api.post('/auth/login', { email, password });
   *   login(response.data.token, response.data.sesionData);
   */
  login: (token, sesionData) => {
    console.log("🔐 authStore: Guardando sesión");
    const decoded = decodeToken(token);
    if (!decoded) {
      console.error("❌ No se pudo decodificar el token");
      return;
    }
    
    const userData = {
      id: decoded.id,                    // Del JWT
      firstName: sesionData.first_name,  // De sesionData
      roleId: sesionData.role_id,        // De sesionData
      exp: decoded.exp,                  // Del JWT - fecha expiración
      iat: decoded.iat                   // Del JWT - fecha creación
    };
    
    console.log("   - Usuario:", userData.firstName);
    console.log("   - Role ID:", userData.roleId);
    console.log("   - User ID:", userData.id);
    
    //  Guardar en localStorage (persiste aunque cierres el navegador)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Actualizar estado de Zustand (reactivo, actualiza componentes)
    set({
      token: token,
      user: userData,
    });
    
    console.log("✅ authStore: Sesión guardada correctamente");
  },
  
  
  // ============================================
  // 🚪 ACCIÓN: LOGOUT
  // ============================================
  
  /**
   * Cerrar sesión y limpiar todo
   * 
   * Ejemplo de uso:
   *   const { logout } = useAuthStore();
   *   logout();
   */
  logout: () => {
    console.log("👋 authStore: Cerrando sesión");
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    set({
      token: null,
      user: null,
    });
    
    console.log("✅ authStore: Sesión cerrada");
  },
  
  
  // ============================================
  // ✅ VERIFICACIÓN: ¿ESTÁ AUTENTICADO?
  // ============================================
  
  /**
   * Verifica si hay sesión activa
   * 
   * @returns {boolean} true si hay token, false si no
   * 
   * Ejemplo de uso:
   *   const { isAuthenticated } = useAuthStore();
   *   if (isAuthenticated()) {
   *     // Usuario tiene sesión activa
   *   }
   */
  isAuthenticated: () => {
    const state = get();
    return state.token !== null;
  },
  
  
  // ============================================
  // 🎭 VERIFICACIÓN: ¿TIENE ESTE ROL? (por ID)
  // ============================================
  
  /**
   * Verifica si el usuario tiene un rol específico por su ID
   * 
   * @param {number} roleId - El ID del rol (1=admin, 2=manager, 3=employee)
   * @returns {boolean} true si tiene ese rol, false si no
   * 
   * Ejemplo de uso:
   *   const { hasRoleId } = useAuthStore();
   *   if (hasRoleId(1)) {
   *     // Es administrador
   *   }
   */
  hasRoleId: (roleId) => {
    const state = get();
    return state.user?.roleId === roleId;
  },
  
  
  // ============================================
  // 👑 VERIFICACIÓN: ¿ES ADMIN?
  // ============================================
  
  /**
   * Atajo para verificar si es administrador
   * 
   * @returns {boolean}
   * 
   * Ejemplo de uso:
   *   const { isAdmin } = useAuthStore();
   *   if (isAdmin()) {
   *     // Mostrar panel de administración
   *   }
   */
  isAdmin: () => {
    const state = get();
    return state.user?.roleId === 1;  // 1 = admin
  },
  
  
  // ============================================
  // 👔 VERIFICACIÓN: ¿ES MANAGER?
  // ============================================
  
  /**
   * Atajo para verificar si es responsable de departamento
   * 
   * @returns {boolean}
   * 
   * Ejemplo de uso:
   *   const { isManager } = useAuthStore();
   *   if (isManager()) {
   *     // Mostrar solicitudes pendientes de aprobar
   *   }
   */
  isManager: () => {
    const state = get();
    return state.user?.roleId === 2;  // 2 = manager
  },
  
  
  // ============================================
  // 👤 VERIFICACIÓN: ¿ES EMPLEADO?
  // ============================================
  
  /**
   * Atajo para verificar si es empleado regular
   * 
   * @returns {boolean}
   * 
   * Ejemplo de uso:
   *   const { isEmployee } = useAuthStore();
   *   if (isEmployee()) {
   *     // Mostrar formulario de solicitud de vacaciones
   *   }
   */
  isEmployee: () => {
    const state = get();
    return state.user?.roleId === 3;  // 3 = employee
  },
  
  
  // ============================================
  // 🔄 ACCIÓN: ACTUALIZAR ESTADO DE CARGA
  // ============================================
  
  /**
   * Actualiza el estado de carga (útil durante peticiones al backend)
   * 
   * @param {boolean} loading - true si está cargando, false si terminó
   * 
   * Ejemplo de uso:
   *   const { setLoading } = useAuthStore();
   *   setLoading(true);   // Mostrar spinner
   *   await hacerPeticion();
   *   setLoading(false);  // Ocultar spinner
   */
  setLoading: (loading) => set({ isLoading: loading }),
  
  
  // ============================================
  // 👤 ACCIÓN: ACTUALIZAR DATOS DEL USUARIO
  // ============================================
  
  /**
   * Actualiza los datos del usuario (útil después de hacer petición a /user/me)
   * 
   * @param {object} userData - Objeto con datos completos del usuario
   * 
   * Ejemplo de uso:
   *   const { updateUser } = useAuthStore();
   *   const response = await api.get('/user/me');
   *   updateUser(response.data);
   */
  updateUser: (userData) => {
    console.log("🔄 authStore: Actualizando datos del usuario");
    
    // Combinar datos actuales con los nuevos
    const currentUser = get().user;
    const updatedUser = {
      ...currentUser,      // Mantenemos id, roleId, exp, iat
      ...userData          // Añadimos/actualizamos el resto
    };
    
    // Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Actualizar estado
    set({ user: updatedUser });
    
    console.log("✅ authStore: Datos actualizados");
  },
  
}));

export default useAuthStore;
