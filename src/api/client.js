import axios from "axios";
import { showError } from "../utils/notifications";

/**
 * CLIENTE API MEJORADO CON MANEJO DE ERRORES
 *
 * Cliente configurado para manejar automáticamente:
 * - Autenticación JWT
 * - Manejo robusto de errores HTTP
 * - Logout automático en 401
 * - Mensajes de error amigables
 * - Timeouts y reintentos
 *
 */
/**
 * Instancia configurada de axios para toda la aplicación
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
});

/**
 * Mapeo de códigos de error HTTP a mensajes amigables
 *
 * @type {Object<number, string>}
 */
const ERROR_MESSAGES = {
  400: "Los datos enviados no son válidos. Por favor, revisa la información.",
  401: "Tu sesión ha expirado. Serás redirigido al login.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no fue encontrado.",
  409: "Este email o nombre ya existe en el sistema.",
  422: "Los datos enviados contienen errores de validación.",
  429: "Demasiadas solicitudes. Por favor, espera un momento.",
  500: "Error interno del servidor. Por favor, intenta más tarde.",
  502: "Servicio no disponible temporalmente.",
  503: "El servidor está en mantenimiento. Intenta más tarde.",
  504: "Timeout del servidor. Verifica tu conexión.",
};

/**
 * Extrae el mensaje de error más específico del response del backend
 *
 * @param {import('axios').AxiosError} error - Error de axios
 * @returns {string} Mensaje de error formateado para el usuario
 */
const extractErrorMessage = (error) => {
  // Sin conexión a internet
  if (!navigator.onLine) {
    return "No hay conexión a internet. Verifica tu conexión.";
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return "La solicitud tardó demasiado. Verifica tu conexión.";
  }

  // Error de red
  if (error.message === 'Network Error') {
    return "Error de conexión. Verifica que el servidor esté disponible.";
  }

  // Si hay response del backend
  if (error.response?.data) {
    const { data } = error.response;

    // Prioridad 1: Mensaje específico del backend
    if (data.message) {
      return data.message;
    }

    // Prioridad 2: Errores de validación (array de errores)
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message || data.errors[0];
    }

    // Prioridad 3: Error simple
    if (data.error) {
      return data.error;
    }

    // Prioridad 4: Mensaje de error genérico por status
    const statusCode = error.response.status;
    if (ERROR_MESSAGES[statusCode]) {
      return ERROR_MESSAGES[statusCode];
    }
  }

  // Fallback: Mensaje genérico
  return "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";
};

/**
 * Maneja el logout automático y redirección
 *
 * @param {string} [customMessage] - Mensaje personalizado para mostrar
 */
const handleLogout = (customMessage) => {
  // Limpiar localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Mostrar mensaje
  const message = customMessage || "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
  showError(message);

  // Redirigir al login (con delay para que se vea el mensaje)
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};
/**
 * Interceptor de request - Añade el token JWT automáticamente
 *
 * @param {import('axios').AxiosRequestConfig} config - Configuración de la request
 * @returns {import('axios').AxiosRequestConfig} Configuración modificada
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response - Maneja errores automáticamente
 *
 * @param {import('axios').AxiosResponse} response - Respuesta exitosa
 * @returns {import('axios').AxiosResponse} Respuesta sin modificar
 */
api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }

    return response;
  },
  (error) => {
    const statusCode = error.response?.status;

    // Log detallado del error
    console.error(`❌ API Error [${statusCode}]:`, {
      url: error.config?.url,
      method: error.config?.method,
      message: extractErrorMessage(error),
      response: error.response?.data,
    });

    // Manejo específico por código de error
    switch (statusCode) {
      case 401:
        // Unauthorized - Logout automático
        handleLogout("Tu sesión ha expirado");
        break;

      case 403:
        // Forbidden - Solo mostrar error, no hacer logout
        const forbiddenMessage = extractErrorMessage(error);
        showError(forbiddenMessage);
        break;

      case 404:
        // Not Found - Error específico
        showError("El recurso solicitado no fue encontrado");
        break;

      case 409:
        // Conflict - Recurso ya existe
        const conflictMessage = extractErrorMessage(error);
        showError(conflictMessage);
        break;

      case 422:
        // Validation Error - No mostrar toast aquí, lo maneja el formulario
        console.log("Validation error - handled by form");
        break;

      case 429:
        // Too Many Requests
        showError("Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.");
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server Errors
        showError("Error del servidor. Por favor, intenta más tarde.");
        break;

      default:
        // Otros errores - Solo mostrar si no es de validación
        if (statusCode !== 422 && statusCode !== 400) {
          const genericMessage = extractErrorMessage(error);
          showError(genericMessage);
        }
    }

    return Promise.reject(error);
  }
);

/**
 * Función helper para realizar peticiones GET con manejo de errores
 *
 * @template T
 * @param {string} url - URL endpoint
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional
 * @returns {Promise<T>} Datos de la respuesta
 */
api.get = async (url, config) => {
  try {
    const response = await axios.get.call(api, url, config);
    return response.data;
  } catch (error) {
    // El interceptor ya manejó el error
    throw error;
  }
};

/**
 * Función helper para realizar peticiones POST con manejo de errores
 *
 * @template T
 * @param {string} url - URL endpoint
 * @param {any} [data] - Datos a enviar
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional
 * @returns {Promise<T>} Datos de la respuesta
 */
api.post = async (url, data, config) => {
  try {
    const response = await axios.post.call(api, url, data, config);
    return response.data;
  } catch (error) {
    // El interceptor ya manejó el error
    throw error;
  }
};

/**
 * Función helper para realizar peticiones PATCH con manejo de errores
 *
 * @template T
 * @param {string} url - URL endpoint
 * @param {any} [data] - Datos a enviar
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional
 * @returns {Promise<T>} Datos de la respuesta
 */
api.patch = async (url, data, config) => {
  try {
    const response = await axios.patch.call(api, url, data, config);
    return response.data;
  } catch (error) {
    // El interceptor ya manejó el error
    throw error;
  }
};

/**
 * Función helper para realizar peticiones DELETE con manejo de errores
 *
 * @template T
 * @param {string} url - URL endpoint
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional
 * @returns {Promise<T>} Datos de la respuesta
 */
api.delete = async (url, config) => {
  try {
    const response = await axios.delete.call(api, url, config);
    return response.data;
  } catch (error) {
    // El interceptor ya manejó el error
    throw error;
  }
};


// if (error.response && error.response.status === 401) {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
//   window.location.href = "/login";
// }

export default api;
