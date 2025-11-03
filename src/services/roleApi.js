/* eslint-disable no-useless-catch */
import api from '../api/client';

/**
 * Obtiene todos los roles
 * @returns {Promise} Lista de todos los roles
 */
export const getAll = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un rol por ID
 * @param {string|number} id - ID del rol
 * @returns {Promise} Datos del rol
 */
export const getById = async (id) => {
  try {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un nuevo rol
 * @param {Object} roleData - Datos del nuevo rol
 * @param {string} roleData.role_name - Nombre del rol
 * @returns {Promise} Datos del rol creado
 */
export const create = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza un rol existente
 * @param {string|number} id - ID del rol a actualizar
 * @param {Object} roleData - Datos a actualizar del rol
 * @returns {Promise} Datos del rol actualizado
 */
export const update = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un rol
 * @param {string|number} id - ID del rol a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const remove = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
