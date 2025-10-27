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
    throw error;
  }
};

/**
 * Obtiene los festivos que aplican al usuario autenticado
 * @returns {Promise} Lista de festivos del usuario
 */
export const getMyHolidays = async () => {
  try {
    const response = await api.get('/holidays/my-holidays');
    return response.data;
  } catch (error) {
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
    const response = await api.put(`/holidays/${id}`, holidayData);
    return response.data;
  } catch (error) {
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
    throw error;
  }
};