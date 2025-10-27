import api from '../api/client';

/**
 * Crea una nueva solicitud de vacaciones
 * @param {Object} requestData - Datos de la solicitud
 * @param {string} requestData.startDate - Fecha de inicio de las vacaciones
 * @param {string} requestData.endDate - Fecha de fin de las vacaciones
 * @param {string} requestData.reason - Motivo de la solicitud (opcional)
 * @returns {Promise} Datos de la solicitud creada
 */
export const create = async (requestData) => {
  try {
    const response = await api.post('/vacation-requests', requestData);
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
    const response = await api.get('/vacation-requests/my-requests');
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
    const response = await api.get('/vacation-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Aprueba una solicitud de vacaciones
 * @param {string|number} id - ID de la solicitud a aprobar
 * @returns {Promise} Datos de la solicitud aprobada
 */
export const approve = async (id) => {
  try {
    const response = await api.put(`/vacation-requests/${id}/approve`);
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
    const response = await api.put(`/vacation-requests/${id}/reject`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};