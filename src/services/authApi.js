/* eslint-disable no-useless-catch */
import api from '../api/client';

/**
*@param {Object} credentials--credenciales del ususario
*@param {string}credentials.email --crdenciales del ususario 
*@param {string} credential.password --contraseña del ususario 
*@param {Promise} --respuesta con token y datosdel usuario
 */
export const login = async (credentials)=> {

    try {
        const response = await api.post ('/auth/login', credentials);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response.data;
        
    }
    catch (error) {
        throw error;

    }
};


/**
 * @param {Object} userData --datos del nuevo usuario
 * @param {string} userData.name --nombre del usuario
 * @param {string} userData.email --email del usuario
 * @param {string} userData.password --password del usuario
 * @returns {Promise} Respuesta con los datos del nuevo usuario
 */

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register',userData);
        return response.data;

    }
    catch (error) {
        throw error;
    }
};

/**
 * 
 * @returns {Promise} datos del perfil de usuario
 */

export const getProfile = async () =>{
    try {
        const response = await api.get('/users/profile');
        return response.data;

    }
    catch (error) {
        throw error;
    }
};


export const logout =()=> {
    localStorage.removeItem('token');
    localStorage.removeItem('token');
};

/**
 * @returns {boolean} true si existe token falsa si es lo contrario
 */

export const isAuthenticated = () => {
    return localStorage.getItem('token');

};

/**
 * @returns  {string|null} token JWT o null si no existe
 */
export const getToken = () =>{
    return localStorage.getItem ('token');
};

/**
 * @returns {Object|null} objeto con datos del usuario o  null si  no existe
 */

export const getUser = () => {
 const user = localStorage.getItem('user');
 return user ? JSON.parse (user) : null;
}
