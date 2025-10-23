import api from './client.js';
 /**
  * @returns {Promise} -devuelve todos los usuarios
  */
 export const getAll = async () => {
try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {string|number} id - ID del usuario
 * @returns {Promise} Datos del usuario
 */
export const getById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {string} userData.name - Nombre del usuario
 * @param {string} userData.department - Departamento del usuario (opcional)
 * @param {string} userData.role - Rol del usuario (opcional)
 * @returns {Promise} Datos del usuario creado
 */
export const create = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {string|number} id - ID del usuario a actualizar
 * @param {Object} userData - Datos a actualizar del usuario
 * @returns {Promise} Datos del usuario actualizado
 */
export const update = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {string|number} id - ID del usuario a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};