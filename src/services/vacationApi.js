/* eslint-disable no-useless-catch */
import api from '../api/client';

/**
 * Crea una nueva solicitud de vacaciones
 * @param {Object} requestData - Datos de la solicitud
 * @param {string} requestData.start_date - Fecha de inicio
 * @param {string} requestData.end_date - Fecha de fin
 * @param {number} requestData.requested_days - Días solicitados
 * @param {string} requestData.comments - Comentarios (opcional)
 * @returns {Promise} Datos de la solicitud creada
 */
export const create = async (requestData) => {
  try {
    const response = await api.post('/vacations', requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de vacaciones del usuario autenticado
 * @returns {Promise} Lista de solicitudes del usuario
 */
export const getMyRequests = async () => {
  try {
    const response = await api.get('/vacations/my-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de vacaciones
 * @returns {Promise} Lista de todas las solicitudes
 */
export const getAll = async () => {
  try {
    const response = await api.get('/vacations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Aprueba una solicitud de vacaciones
 * @param {string|number} id - ID de la solicitud a aprobar
 * @param {string} comment - Comentario opcional
 * @returns {Promise} Datos de la solicitud aprobada
 */
export const approve = async (id, comment = null) => {
  try {
    const response = await api.patch(`/vacations/${id}/review`, {
      status: 'approved',
      comment: comment
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Rechaza una solicitud de vacaciones
 * @param {string|number} id - ID de la solicitud a rechazar
 * @param {Object} data - Datos del rechazo
 * @param {string} data.reason - Motivo del rechazo (opcional)
 * @returns {Promise} Datos de la solicitud rechazada
 */
export const reject = async (id, data) => {
  try {
    const response = await api.patch(`/vacations/${id}/review`, {
      status: 'rejected',
      comment: data.reason
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 🆕 Obtiene el resumen de vacaciones del usuario
 * Incluye: allowance_days, remaining_days, used_days
 * @param {string|number} userId - ID del usuario
 * @returns {Promise} { allowance_days, remaining_days, used_days }
 */
export const getVacationSummary = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/vacations/summary`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
