import toast from 'react-hot-toast';

/**
 *  SISTEMA DE TOASTS CENTRALIZADO
 *
 * Este archivo centraliza todos los toasts de la aplicación
 * con estilos consistentes de CoHispania
 */

// ============================================
//  ESTILOS BASE
// ============================================
/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje a mostrar
 * @returns {string} ID del toast
 */
export const showSuccess = (message) => {
  return toast.success(message, {
    style: {
      borderLeft: '4px solid #22C55E',
    },
  });
};

/**
 * Muestra una notificación de error
 * @param {string} message - Mensaje de error a mostrar
 * @returns {string} ID del toast
 */
export const showError = (message) => {
  return toast.error(message, {
    style: {
      borderLeft: '4px solid #EC5B59',
    },
  });
};

/**
 * Muestra una notificación informativa
 * @param {string} message - Mensaje informativo a mostrar
 * @returns {string} ID del toast
 */
export const showInfo = (message) => {
  return toast(message, {
    icon: 'ℹ️',
    style: {
      borderLeft: '4px solid #F68D2E',
    },
  });
};

/**
 * Muestra un toast de loading y devuelve el ID para actualizarlo
 * @param {string} message - Mensaje de loading
 * @returns {string} ID del toast
 */
export const showLoading = (message) => {
  return toast.loading(message);
};

/**
 * Actualiza un toast existente a éxito
 * @param {string} toastId - ID del toast a actualizar
 * @param {string} message - Nuevo mensaje
 */
export const updateToastSuccess = (toastId, message) => {
  toast.success(message, { id: toastId });
};

/**
 * Actualiza un toast existente a error
 * @param {string} toastId - ID del toast a actualizar
 * @param {string} message - Nuevo mensaje de error
 */
export const updateToastError = (toastId, message) => {
  toast.error(message, { id: toastId });
};

/**
 * Cierra un toast específico
 * @param {string} toastId - ID del toast a cerrar
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Cierra todos los toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
