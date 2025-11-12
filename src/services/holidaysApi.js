import api from '../api/client';

/**
 * Obtiene todos los festivos
 * @returns {Promise} Lista de todos los festivos
 */
export const getAll = async () => {
  try {
    const response = await api.get('/holidays');
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

/**
 * Obtiene los festivos del usuario autenticado según su location_id
 * Usa el endpoint de locations para obtener los festivos
 * @returns {Promise} Lista de festivos del usuario
 */
export const getMyHolidays = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.id;

    const userResponse = await api.get(`/users/${userId}`);
    const locationId = userResponse.data.location_id;

    if (!locationId) {
      throw new Error('El usuario no tiene una ubicación asignada');
    }

    const locationResponse = await api.get(`/locations/${locationId}`);
    
    return locationResponse.data.holidays || [];
  } catch (error) {
    console.error('Error fetching my holidays:', error);
    throw error;
  }
};

/**
 * Crea un nuevo festivo
 * @param {Object} holidayData - Datos del nuevo festivo
 * @param {string} holidayData.name - Nombre del festivo
 * @param {string} holidayData.date - Fecha del festivo
 * @param {string} holidayData.type - Tipo de festivo (nacional, regional, local)
 * @param {boolean} holidayData.recurring - Si se repite cada año (opcional)
 * @returns {Promise} Datos del festivo creado
 */
export const create = async (holidayData) => {
  try {
    const response = await api.post('/holidays', holidayData);
    return response.data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
};

/**
 * Actualiza un festivo existente
 * @param {string|number} id - ID del festivo a actualizar
 * @param {Object} holidayData - Datos a actualizar del festivo
 * @returns {Promise} Datos del festivo actualizado
 */
export const update = async (id, holidayData) => {
  try {
    const response = await api.patch(`/holidays/${id}`, holidayData);
    return response.data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

/**
 * Elimina un festivo
 * @param {string|number} id - ID del festivo a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const deleteHoliday = async (id) => {
  try {
    const response = await api.delete(`/holidays/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};
