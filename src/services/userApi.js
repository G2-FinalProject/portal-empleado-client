import api from '../api/client';

 /**
  * Obtiene todos los usuarios
  * @returns {Promise}
  */
export const getAll = async () => {
try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users: ', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por ID
 * @param {string|number} id - ID del usuario
 * @returns {Promise} Datos del usuario
 */
export const getById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.first_name - Nombre del usuario
 * @param {string} userData.last_name - Apellido del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {number} userData.role_id - ID del rol
 * @param {number} userData.department_id -ID del departamento
 * @param {number} userData.location_id -ID de la ubicación
 * @returns {Promise} Datos del usuario creado
 */
export const create = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user: ', error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param {string|number} id - ID del usuario a actualizar
 * @param {Object} userData - Datos a actualizar del usuario
 * @returns {Promise} Datos del usuario actualizado
 */
export const update = async (id, userData) => {
  try {
    const response = await api.patch(`/users/${id}`, userData); //aquíhe cambiado a PATCH como en el backend
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {string|number} id - ID del usuario a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
 /**
 * Asigna un rol a un usuario (Admin only)
 * @param {Object} data
 * @param {number} data.userId - ID del usuario
 * @param {number} data.roleId - ID del nuevo rol
 * @returns {Promise} Datos de la respuesta (message + user)
 */
export const assignRole = async (data) => {
  try {
    // Usamos la ruta /roles/assign
    const response = await api.post('/roles/assign', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};