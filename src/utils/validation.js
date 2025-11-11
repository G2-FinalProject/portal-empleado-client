// Validaciones reutilizables de formularios
// - No dependemos de librerías externas para mantenerlo ligero.
// - Si en el futuro usamos zod/yup, podemos mapear estas funciones aquí.

/**
 * Valida formato de email simple (RFC básico)
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Valida contraseña: mínimo 8, al menos 1 número y 1 letra
 * @param {string} password
 * @returns {boolean}
 */
export function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[A-Za-z]/.test(password);
  return minLength && hasNumber && hasLetter;
}

/**
 * Valida nombre/apellidos: longitud entre 2 y 50
 * @param {string} text
 * @returns {boolean}
 */
export function isValidPersonName(text) {
  if (typeof text !== 'string') return false;
  const len = text.trim().length;
  return len >= 2 && len <= 50;
}

/**
 * Valida nombre de población: longitud entre 2 y 50
 * @param {string} text
 * @returns {boolean}
 */
export function isValidLocationName(text) {
  return isValidPersonName(text);
}

/**
 * Valida días disponibles: entero entre 0 y 30
 * @param {number} value
 * @returns {boolean}
 */
export function isValidAvailableDays(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 30;
}

/**
 * Valida longitud máxima de comentario (500)
 * @param {string} text
 * @returns {boolean}
 */
export function isValidComment(text) {
  if (text == null) return true;
  if (typeof text !== 'string') return false;
  return text.length <= 500;
}

export default {
  isValidEmail,
  isStrongPassword,
  isValidPersonName,
  isValidLocationName,
  isValidAvailableDays,
  isValidComment,
};


