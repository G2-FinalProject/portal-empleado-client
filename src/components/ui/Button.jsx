import { Loader2 } from 'lucide-react';

/**
 * Botón reutilizable con variantes y estados
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'success' | 'danger' | 'ghost'} props.variant - Estilo del botón
 * @param {'small' | 'medium' | 'large'} props.size - Tamaño del botón
 * @param {boolean} props.loading - Muestra spinner y deshabilita el botón
 * @param {boolean} props.disabled - Deshabilita el botón
 * @param {boolean} props.fullWidth - Ocupa todo el ancho disponible
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onClick - Función al hacer click
 * @param {'button' | 'submit' | 'reset'} props.type - Tipo de botón HTML
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // Estilos base
  const baseStyles = 'font-semibold rounded-lg transition duration-200 ease-in-out cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

  // Estilos por variante
  const variantStyles = {
    primary: 'bg-cohispania-orange text-cohispania-blue shadow hover:opacity-90 focus-visible:ring-[var(--color-cohispania-blue)]',
    secondary: 'bg-cohispania-blue text-white shadow hover:opacity-90 focus-visible:ring-[var(--color-cohispania-orange)]',
    success: 'bg-[var(--color-light-green-600)] text-white shadow hover:opacity-90 focus-visible:ring-[var(--color-light-green-800)]',
    danger: 'bg-[var(--color-red-600)] text-white shadow hover:opacity-90 focus-visible:ring-[var(--color-red-600)]',
    ghost: 'bg-transparent text-cohispania-blue border border-gray-stroke hover:bg-gray-100 focus-visible:ring-[var(--color-blue-stroke)]',
  };

  // Estilos por tamaño
  const sizeStyles = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-3.5 px-4 text-base',
    large: 'py-4 px-6 text-lg',
  };

  // Ancho completo
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combinar estilos
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={combinedClassName}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
