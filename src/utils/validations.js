/**
 *  VALIDACIONES REUTILIZABLES PARA FORMULARIOS
 *
 * Conjunto de validaciones estandarizadas para react-hook-form
 * que cumplen con los criterios de UX
 *
 */

/**
 * Validaciones para campos de email
 *
 * @type {import('react-hook-form').RegisterOptions}
 */
export const emailValidation = {
  required: {
    value: true,
    message: "El email es obligatorio"
  },
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "El formato del email no es válido"
  },
  maxLength: {
    value: 100,
    message: "El email no puede tener más de 100 caracteres"
  }
};

/**
 * Validaciones para contraseñas (modo creación)
 *
 * @type {import('react-hook-form').RegisterOptions}
 */
export const passwordValidation = {
  required: {
    value: true,
    message: "La contraseña es obligatoria"
  },
  minLength: {
    value: 8,
    message: "La contraseña debe tener al menos 8 caracteres"
  },
  pattern: {
    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
    message: "La contraseña debe contener al menos una letra y un número"
  },
  maxLength: {
    value: 50,
    message: "La contraseña no puede tener más de 50 caracteres"
  }
};

/**
 * Validaciones para nombres (first_name, last_name)
 *
 * @param {string} fieldName - Nombre del campo para personalizar el mensaje
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const nameValidation = (fieldName = "nombre") => ({
  required: {
    value: true,
    message: `El ${fieldName} es obligatorio`
  },
  minLength: {
    value: 2,
    message: `El ${fieldName} debe tener al menos 2 caracteres`
  },
  maxLength: {
    value: 50,
    message: `El ${fieldName} no puede tener más de 50 caracteres`
  },
  pattern: {
    value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/,
    message: `El ${fieldName} solo puede contener letras, espacios, acentos, guiones y apostrofes`
  }
});

/**
 * Validaciones para nombres de población/localización
 *
 * @type {import('react-hook-form').RegisterOptions}
 */
export const locationNameValidation = {
  required: {
    value: true,
    message: "El nombre de la población es obligatorio"
  },
  minLength: {
    value: 2,
    message: "El nombre debe tener al menos 2 caracteres"
  },
  maxLength: {
    value: 50,
    message: "El nombre no puede tener más de 50 caracteres"
  },
  pattern: {
    value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-()]+$/,
    message: "Solo se permiten letras, espacios, acentos, guiones, apostrofes y paréntesis"
  }
};

/**
 * Validaciones para días de vacaciones disponibles
 *
 * @type {import('react-hook-form').RegisterOptions}
 */
export const availableDaysValidation = {
  required: {
    value: true,
    message: "Los días disponibles son obligatorios"
  },
  min: {
    value: 0,
    message: "Los días disponibles no pueden ser negativos"
  },
  max: {
    value: 365,
    message: "Los días disponibles no pueden ser más de 365"
  },
  valueAsNumber: true
};

/**
 * Validaciones para comentarios opcionales
 *
 * @param {number} maxLength - Longitud máxima del comentario (default: 500)
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const commentValidation = (maxLength = 500) => ({
  required: false,
  maxLength: {
    value: maxLength,
    message: `El comentario no puede tener más de ${maxLength} caracteres`
  }
});

/**
 * Validaciones para comentarios obligatorios (ej: rechazo de solicitud)
 *
 * @param {number} maxLength - Longitud máxima del comentario (default: 500)
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const requiredCommentValidation = (maxLength = 500) => ({
  required: {
    value: true,
    message: "El comentario es obligatorio"
  },
  minLength: {
    value: 5,
    message: "El comentario debe tener al menos 5 caracteres"
  },
  maxLength: {
    value: maxLength,
    message: `El comentario no puede tener más de ${maxLength} caracteres`
  }
});

/**
 * Validaciones para selects obligatorios (roles, departamentos, etc.)
 *
 * @param {string} fieldName - Nombre del campo para personalizar el mensaje
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const selectValidation = (fieldName = "opción") => ({
  required: {
    value: true,
    message: `Selecciona ${fieldName}`
  }
});

/**
 * Validación custom para fechas futuras
 *
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const futureDateValidation = (fieldName = "fecha") => ({
  required: {
    value: true,
    message: `La ${fieldName} es obligatoria`
  },
  validate: {
    isFutureDate: (value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate >= today || `La ${fieldName} debe ser hoy o en el futuro`;
    }
  }
});

/**
 * Validación custom para verificar que end_date >= start_date
 *
 * @param {string} startDate - Valor de la fecha de inicio
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const endDateValidation = (startDate) => ({
  required: {
    value: true,
    message: "La fecha de fin es obligatoria"
  },
  validate: {
    isAfterStartDate: (endDate) => {
      if (!startDate || !endDate) return true;

      const start = new Date(startDate);
      const end = new Date(endDate);

      return end >= start || "La fecha de fin debe ser posterior o igual a la fecha de inicio";
    }
  }
});

/**
 * Validación personalizada para días laborables solicitados
 *
 * @param {number} availableDays - Días disponibles del usuario
 * @param {number} requestedDays - Días que está solicitando
 * @returns {import('react-hook-form').RegisterOptions}
 */
export const requestedDaysValidation = (availableDays) => ({
  required: {
    value: true,
    message: "Debe seleccionar al menos un día"
  },
  min: {
    value: 1,
    message: "Debe solicitar al menos 1 día"
  },
  validate: {
    hasEnoughDays: (requestedDays) => {
      return requestedDays <= availableDays ||
        `No tienes suficientes días disponibles. Tienes ${availableDays} días, pero solicitaste ${requestedDays}`;
    }
  }
});

/**
 * Helper: Valida que un string no contenga solo espacios
 *
 * @param {string} value - Valor a validar
 * @returns {boolean} True si es válido
 */
export const isNotOnlySpaces = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Helper: Calcula días laborables entre dos fechas (excluyendo fines de semana)
 *
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @param {string[]} [holidays=[]] - Array de fechas festivas (formato YYYY-MM-DD)
 * @returns {number} Número de días laborables
 */
export const calculateWorkingDays = (startDate, endDate, holidays = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];

    // No es fin de semana (0=domingo, 6=sábado) y no es festivo
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Configuraciones por defecto para react-hook-form
 *
 * @type {import('react-hook-form').UseFormProps}
 */
export const defaultFormConfig = {
  mode: 'onBlur', // Validar cuando el usuario sale del campo
  reValidateMode: 'onChange', // Re-validar en tiempo real después del primer error
  shouldFocusError: true, // Enfocar el primer campo con error
};

/**
 * Mensajes de error personalizados para casos específicos
 */
export const customErrorMessages = {
  network: "Error de conexión. Verifica tu red.",
  server: "Error del servidor. Intenta más tarde.",
  unauthorized: "Tu sesión ha expirado. Inicia sesión nuevamente.",
  forbidden: "No tienes permisos para realizar esta acción.",
  conflict: "Este elemento ya existe en el sistema.",
  validation: "Por favor, revisa los datos ingresados.",
  required: "Este campo es obligatorio.",
};
