import api from '../api/client';
/**
 * Obtiene todos los departamentos
 * @returns {Promise} Lista de todos los departamentos
 */
export const getAll = async () => {
  try {
    const response = await api.get('/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments: ', error);
    throw error;
  }
};

/**
 * Obtiene un departamento por ID
 * @param {string|number} id - ID
 * @returns {Promise} Datos del departamento
 */
export const getById = async (id) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department: ', error);
    throw error;
  }
};

// ESTO YA NO ES MVP pero en el backend tienen la lógica

/**
 * Crea un nuevo departamento
 * @param {Object} deptData - Datos del nuevo departamento
 * @param {string} deptData.department_name - Nombre del departamento
 * @param {number} deptData.manager_id - ID del manager (opcional)
 * @returns {Promise} Datos del departamento creado
 */
export const create = async (deptData) => {
  try {
    const response = await api.post('/departments', deptData);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

/**
 * Actualiza un departamento existente
 * @param {string|number} id -ID del departamento a actualizar
 * @param {Object} deptData - Datos a actualizar del departamento
 * @returns {Promise} Datos del departamento actualizado
 */
export const update = async (id, deptData) => {
  try {
    const response = await api.patch(`/departments/${id}`, deptData); // PATCH en lugar de PUT
    return response.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

/**
 * Elimina un departamento
 * @param {string|number} id - ID del departamento a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
