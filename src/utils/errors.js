// Manejo centralizado de errores de API
// - Extrae un mensaje amigable desde respuestas del backend
// - Aplica fallback según código de estado cuando no hay detalle del servidor
// - Expone utilidades para tratar 401 (logout/redirección)

/**
 * Devuelve un mensaje de error amigable a partir del error de Axios
 * @param {any} error Error lanzado por axios
 * @returns {string} Mensaje a mostrar al usuario
 */
export function getApiErrorMessage(error) {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg;

  if (serverMessage) {
    return serverMessage;
  }

  switch (status) {
    case 400:
      return 'Datos inválidos. Revisa la información introducida.';
    case 401:
      return 'Sesión expirada. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permisos para esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'Conflicto: el recurso ya existe.';
    case 500:
      return 'Error del servidor. Inténtalo más tarde.';
    default:
      return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
}

/**
 * Indica si el error es 401 (no autorizado)
 * @param {any} error
 * @returns {boolean}
 */
export function isUnauthorized(error) {
  return error?.response?.status === 401;
}

/**
 * Maneja 401: limpia sesión y redirige a /login
 * Nota: se usa en el interceptor. No dispara toasts para evitar ruido.
 */
export function handleUnauthorized() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } finally {
    window.location.href = '/login';
  }
}

export default {
  getApiErrorMessage,
  isUnauthorized,
  handleUnauthorized,
};


