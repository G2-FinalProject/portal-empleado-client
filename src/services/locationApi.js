/* eslint-disable no-useless-catch */
import api from '../api/client.js';

/**
 * Obtiene todas las localizaciones
 * @returns {Promise} Lista de todas las localizaciones
 */
export const getAll = async () => {
  try {
    const response =await api.get('/locations');
    return response.data;
  } catch (error) {
     console.error('Error fetching locations:', error);
    throw error;
  }
};

/**
 * Obtiene una localización por ID
 * @param {string|number} id - ID de la localización
 * @returns {Promise} Datos de la localización
 */
export const getById = async (id) => {
  try {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea una nueva localización
 * @param {Object} locationData - Datos de la nueva localización
 * @param {string} locationData.location_name - Nombre de la localización
 * @returns {Promise} Datos de la localización creada
 */
export const create = async (locationData) => {
  try {
    const response = await api.post('/locations', locationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza una localización existente
 * @param {string|number} id - ID de la localización a actualizar
 * @param {Object} locationData - Datos a actualizar de la localización
 * @returns {Promise} Datos de la localización actualizada
 */
export const update = async (id, locationData) => {
  try {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina una localización
 * @param {string|number} id - ID de la localización a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const remove = async (id) => {
  try {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
