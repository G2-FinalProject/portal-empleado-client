import api from '../api/client';


// ============================================
// LOGIN - Autenticar usuario
// ============================================

/**
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise<Object>} - Respuesta con token y sesionData
 * 
 */

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};


// ============================================
// REGISTER - Registrar nuevo usuario
// ============================================

/**
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.first_name - Nombre del usuario
 * @param {string} userData.last_name - Apellidos del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {number} userData.role_id - ID del rol (1=admin, 2=manager, 3=employee)
 * @param {number} userData.department_id - ID del departamento
 * @param {number} userData.vacation_days - Días de vacaciones disponibles
 * @param {number} userData.location_id - ID de la población
 * @returns {Promise<Object>} - Respuesta con los datos del nuevo usuario
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};


// ============================================
// GET PROFILE - Obtener perfil completo
// ============================================

/**
 * @returns {Promise<Object>} - Datos completos del perfil
 */
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};


