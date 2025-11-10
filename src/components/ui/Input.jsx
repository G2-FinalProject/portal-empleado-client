import { forwardRef } from 'react';

/**
 * COMPONENTE INPUT ACCESIBLE Y CONSISTENTE
 *
 * Input reutilizable optimizado para:
 * - Accesibilidad WCAG 2.1 AA
 * - Integración perfecta con react-hook-form
 * - Diseño consistente con sistema de design CoHispania
 * - Estados visuales claros (error, disabled, focus)
 * - Soporte completo para lectores de pantalla
 *
 * @component
 * @example
 * // Uso básico con validación
 * <Input
 *   label="Email"
 *   name="email"
 *   type="email"
 *   register={register}
 *   validation={{ required: "Email es obligatorio" }}
 *   errors={errors}
 *   required
 * />
 *
 */

/**
 * @typedef {Object} InputProps
 * @property {string} [label] - Etiqueta visible del input
 * @property {string} name - Nombre del campo (requerido para react-hook-form)
 * @property {'text'|'email'|'password'|'number'|'tel'|'url'|'search'} [type='text'] - Tipo de input HTML
 * @property {string} [placeholder] - Texto de placeholder
 * @property {Function} [register] - Función register de react-hook-form
 * @property {Object} [validation] - Reglas de validación para react-hook-form
 * @property {Object} [errors] - Objeto de errores de react-hook-form
 * @property {boolean} [disabled=false] - Si el input está deshabilitado
 * @property {boolean} [required=false] - Si el campo es obligatorio (muestra asterisco)
 * @property {boolean} [autoFocus=false] - Si debe enfocarse automáticamente
 * @property {string} [autoComplete] - Atributo autocomplete HTML
 * @property {string} [className] - Clases CSS adicionales
 * @property {string} [helpText] - Texto de ayuda debajo del input
 * @property {React.ReactNode} [leftIcon] - Icono a la izquierda del input
 * @property {React.ReactNode} [rightIcon] - Icono a la derecha del input
 * @property {Function} [onKeyPress] - Handler para eventos de teclado
 * @property {Function} [onChange] - Handler para cambios de valor
 * @property {Function} [onBlur] - Handler para evento blur
 * @property {Function} [onFocus] - Handler para evento focus
 * @property {string|number} [min] - Valor mínimo (para type="number")
 * @property {string|number} [max] - Valor máximo (para type="number")
 * @property {number} [step] - Incremento (para type="number")
 * @property {number} [maxLength] - Longitud máxima del texto
 * @property {boolean} [readOnly=false] - Si el input es solo lectura
 * @property {string} [ariaLabel] - Label para accesibilidad (si no hay label visible)
 * @property {string} [ariaDescribedBy] - ID del elemento que describe el input
 */

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  register,
  validation = {},
  errors = {},
  disabled = false,
  required = false,
  autoFocus = false,
  autoComplete,
  className = '',
  helpText,
  leftIcon,
  rightIcon,
  onKeyPress,
  onChange,
  onBlur,
  onFocus,
  min,
  max,
  step,
  maxLength,
  readOnly = false,
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {

  /**
   * Determina si el campo tiene error
   * @type {boolean}
   */
  const hasError = !!errors[name];

  /**
   * Mensaje de error específico del campo
   * @type {string|undefined}
   */
  const errorMessage = errors[name]?.message;

  /**
   * ID único para asociar label, error y help text
   * @type {string}
   */
  const fieldId = `input-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  /**
   * Clases CSS dinámicas basadas en estado
   * @type {string}
   */
  const inputClasses = `
    input-base
    ${hasError ? 'input-error' : ''}
    ${disabled ? 'disabled' : 'clickable'}
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon ? 'pr-12' : ''}
    ${className}
  `.trim();

  /**
   * Construye el atributo aria-describedby dinámicamente
   * @type {string|undefined}
   */
  const describedBy = [
    hasError ? errorId : null,
    helpText ? helpId : null,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  /**
   * Props combinadas para el input
   */
  const inputProps = {
    id: fieldId,
    type,
    placeholder,
    disabled,
    autoFocus,
    autoComplete,
    readOnly,
    min,
    max,
    step,
    maxLength,
    className: inputClasses,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    'aria-invalid': hasError ? 'true' : 'false',
    'aria-required': required ? 'true' : 'false',
    onKeyPress,
    onChange,
    onBlur,
    onFocus,
    ref,
    ...props
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label con indicador de campo requerido */}
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold mb-2 text-cohispania-blue cursor-pointer"
        >
          {label}
          {required && (
            <span
              className="text-red-400 ml-1"
              aria-label="campo obligatorio"
              title="Este campo es obligatorio"
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Contenedor del input con iconos */}
      <div className="relative">
        {/* Icono izquierdo */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5">
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input principal */}
        {register ? (
          <input
            {...inputProps}
            {...register(name, validation)}
          />
        ) : (
          <input {...inputProps} />
        )}

        {/* Icono derecho */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5">
              {rightIcon}
            </div>
          </div>
        )}

        {/* Indicador visual de estado de carga o validación */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div
              className="text-red-400 w-5 h-5"
              aria-hidden="true"
            >

            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error con ARIA live region */}
      {hasError && errorMessage && (
        <div
          id={errorId}
          className="mt-2 text-sm text-red-400 animate-fadeIn"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}

      {/* Texto de ayuda */}
      {helpText && !hasError && (
        <div
          id={helpId}
          className="mt-2 text-sm text-gray-400"
        >
          {helpText}
        </div>
      )}

      {/* Contador de caracteres para inputs con maxLength */}
      {maxLength && type === 'text' && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          <span
            aria-live="polite"
            aria-label={`${props.value?.length || 0} de ${maxLength} caracteres utilizados`}
          >
            {props.value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

// Nombre para debugging
Input.displayName = 'Input';

export default Input;

/**
 *  VARIANTES ESPECÍFICAS DEL INPUT
 *
 * Componentes especializados para casos de uso comunes
 */

/**
 * Input específico para emails con validación integrada
 */
export const EmailInput = (props) => (
  <Input
    type="email"
    autoComplete="email"
    leftIcon="📧"
    placeholder="usuario@cohispania.com"
    {...props}
  />
);

/**
 * Input específico para contraseñas con toggle de visibilidad
 */
export const PasswordInput = ({ showPassword, onTogglePassword, ...props }) => (
  <Input
    type={showPassword ? 'text' : 'password'}
    autoComplete="current-password"
    leftIcon="🔒"
    rightIcon={
      <button
        type="button"
        onClick={onTogglePassword}
        className="cursor-pointer hover:text-cohispania-blue transition-colors"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>
    }
    {...props}
  />
);

/**
 * Input específico para búsquedas
 */
export const SearchInput = (props) => (
  <Input
    type="search"
    leftIcon="🔍"
    placeholder="Buscar..."
    autoComplete="off"
    {...props}
  />
);

/**
 * Input específico para números con controles
 */
export const NumberInput = (props) => (
  <Input
    type="number"
    inputMode="numeric"
    pattern="[0-9]*"
    {...props}
  />
);
