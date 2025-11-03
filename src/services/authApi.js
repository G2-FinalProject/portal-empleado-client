/* eslint-disable no-useless-catch */
import api from '../api/client';


/**
 * Iniciar sesión
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise} Respuesta del backend con { token, sesionData }
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.first_name - Nombre del usuario
 * @param {string} userData.last_name - Apellido del usuario (opcional)
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {number} userData.role_id - ID del rol (1=admin, 2=manager, 3=employee)
 * @returns {Promise} Respuesta con los datos del nuevo usuario
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener resumen de vacaciones del usuario autenticado
 * @returns {Promise} { allowance_days, remaining_days, used_days }
 */
export const getVacationSummary = async () => {
  try {
    // Obtenemos el token desde localStorage (como lo hace el authStore)
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Decodificamos el token para obtener el ID del usuario
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.id;

    // Llamamos al endpoint correcto del backend
    const response = await api.get(`/users/${userId}/vacations/summary`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
