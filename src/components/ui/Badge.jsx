/**
 * Badge - Componente para mostrar etiquetas y contadores
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'} props.variant - Estilo del badge
 * @param {'small' | 'medium' | 'large'} props.size - Tamaño del badge
 * @param {React.ReactNode} props.children - Contenido del badge
 * @param {string} props.className - Clases CSS adicionales
 */
export default function Badge({
  variant = 'neutral',
  size = 'medium',
  children,
  className = '',
  ...props
}) {
  // Estilos base
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full';

  // Estilos por variante usando clases personalizadas de Tailwind
  const variantStyles = {
    primary: 'bg-cohispania-orange text-cohispania-blue',
    secondary: 'bg-cohispania-blue text-white',
    success: 'bg-light-green-600 text-white',
    warning: 'bg-cohispania-orange text-cohispania-blue',
    danger: 'bg-red-400 text-white',
    info: 'bg-indigo-400 text-white',
    purple: 'bg-purple-400 text-white',
    neutral: 'bg-gray-stroke text-gray-400',
  };

  // Estilos por tamaño
  const sizeStyles = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base',
  };

  // Combinar estilos
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim();

  return (
    <span
      className={combinedClassName}
      {...props}
    >
      {children}
    </span>
  );
}
