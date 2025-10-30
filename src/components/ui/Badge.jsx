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

  // Estilos por variante (usando colores exactos de styles.css y Figma)
  const variantInlineStyles = {
    primary: {
      backgroundColor: '#F68D2E', // cohispania-orange
      color: '#1F2A44', // cohispania-blue
    },
    secondary: {
      backgroundColor: '#1F2A44', // cohispania-blue
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: '#7CB342', // light-green-600
      color: '#FFFFFF',
    },
    warning: {
      backgroundColor: '#F68D2E', // cohispania-orange
      color: '#1F2A44',
    },
    danger: {
      backgroundColor: '#EC5B59', // red-400
      color: '#FFFFFF',
    },
    info: {
      backgroundColor: '#6171C9', // indigo-400
      color: '#FFFFFF',
    },
    purple: {
      backgroundColor: '#AB47BC', // purple-400 (para badges de pestañas)
      color: '#FFFFFF',
    },
    neutral: {
      backgroundColor: '#E0E4EA', // gray-stroke
      color: '#656775', // gray-400
    },
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
    ${sizeStyles[size]}
    ${className}
  `.trim();

  return (
    <span
      style={variantInlineStyles[variant]}
      className={combinedClassName}
      {...props}
    >
      {children}
    </span>
  );
}
