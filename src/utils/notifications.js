// Centralización de notificaciones (toasts)
// - Este helper expone una API mínima y consistente para toda la app.
// - Internamente delega en react-hot-toast a través de nuestro wrapper de servicios.
// - Si algún día cambiamos de librería, solo habrá que tocar este archivo.
import toast from '../services/toast';

/**
 * Muestra un toast de éxito
 * @param {string} message Mensaje a mostrar
 * @param {object} [options] Opciones extra de react-hot-toast
 */
export const showSuccess = (message, options = {}) => toast.success(message, options);

/**
 * Muestra a toast de error
 * @param {string} message Mensaje a mostrar
 * @param {object} [options] Opciones extra de react-hot-toast
 */
export const showError = (message, options = {}) => toast.error(message, options);

/**
 * Muestra un toast informativo
 * @param {string} message Mensaje a mostrar
 * @param {object} [options] Opciones extra de react-hot-toast
 */
export const showInfo = (message, options = {}) => toast.info(message, options);

/**
 * Muestra un toast de carga y devuelve su id
 * @param {string} message Mensaje de carga
 * @param {object} [options] Opciones extra de react-hot-toast
 * @returns {string} id del toast de carga
 */
export const showLoading = (message, options = {}) => toast.loading(message, options);

/**
 * Cierra un toast por id
 * @param {string} id Identificador devuelto por showLoading
 */
export const dismiss = (id) => toast.dismiss(id);

export default {
  showSuccess,
  showError,
  showInfo,
  showLoading,
  dismiss,
};


