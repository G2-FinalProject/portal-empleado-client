/**
 * Input - Componente de input reutilizable integrado con React Hook Form
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta del input
 * @param {string} props.name - Nombre del campo (para register)
 * @param {string} props.type - Tipo de input (text, email, password, etc.)
 * @param {string} props.placeholder - Texto placeholder
 * @param {Function} props.register - Función register de React Hook Form
 * @param {Object} props.validation - Reglas de validación para React Hook Form
 * @param {Object} props.errors - Objeto de errores de React Hook Form
 * @param {boolean} props.disabled - Si el input está deshabilitado
 * @param {boolean} props.required - Si el campo es obligatorio (muestra *)
 * @param {string} props.className - Clases CSS adicionales
 *
 * @example
 * <Input
 *   label="Correo electrónico"
 *   name="email"
 *   type="email"
 *   placeholder="tu.email@cohispania.com"
 *   register={register}
 *   validation={{
 *     required: 'El email es obligatorio',
 *     pattern: {
 *       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 *       message: 'Email inválido'
 *     }
 *   }}
 *   errors={errors}
 *   required
 * />
 */
export default function Input({
  label,
  name,
  type = 'text',
  placeholder = '',
  register,
  validation = {},
  errors = {},
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const hasError = errors[name];

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold mb-2 text-cohispania-blue"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-light-background
          text-cohispania-blue
          border border-gray-stroke
          placeholder-cohispania-blue placeholder-opacity-60
          focus:ring-2 focus:ring-cohispania-orange focus:border-cohispania-orange
          outline-none transition
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}
        `}
        {...(register ? register(name, validation) : {})}
        {...props}
      />

      {/* Error Message */}
      {hasError && (
        <p className="mt-2 text-sm text-red-400">
          {hasError.message}
        </p>
      )}
    </div>
  );
}
