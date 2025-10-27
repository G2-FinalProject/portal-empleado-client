import api from '../api/client';
/**
 * @returns {Promise}
 */

export const getAll = async () => {
    try {
        const response = await api.get('/departments');
        return response.data;
    }catch (error) {
        throw error;
    }
};

/**
 * @param {Object} deptData - datos del nuevo departamento
 * @param {string} deptData.name -nombre del departamento
 * @param {string} deptData.description  -descripción del nuevo departamento
 * @param {string} deptDta.managerId - ID del manager del departamento
 * @returns {Promise} datos del dpartamento creado
 */


export const create = async (depData) => {
    try {
        const response = await api.post ('/departments', depData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * @param {string|number} id -ID del departamento a actualizar
 * @param {Object} deptData - datos del departamento a actualizar
 * @returns {Promise} -datos del departamento actualizado
 */export const update = async (id, depData) => {
    try {
        const response = await api.put (`/departments/${id}`, deptData);
        return response.data;
    }catch (error ) {
        throw error;
    }
 };

  /**Eliminar un departamento
   * @param  {string|number} id - ide del departamento que se quiere eliminar
   *@returns {Promise} -Confirmacion de que se ha eliminado el departamento
   */
  
   export const deleteDepartment = async (id ) => {
    try {
        const response = await api.delete (`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw (error)
    }
   };