// src/components/ui/Button.jsx
import { Loader2 } from 'lucide-react';

/**
 * Botón reutilizable con variantes y estados
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Estilo del botón
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
  const baseStyles = 'font-semibold rounded-lg transition duration-200 ease-in-out cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  // Estilos por variante
  const variantStyles = {
    primary: 'hover:opacity-90',
    secondary: 'hover:opacity-80',
    danger: 'hover:opacity-90',
    ghost: 'hover:bg-gray-100',
  };

  // Estilos inline por variante (colores de marca)
  const variantInlineStyles = {
    primary: {
      backgroundColor: '#F68D2E',
      color: '#1F2A44',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    secondary: {
      backgroundColor: '#1F2A44',
      color: '#FFFFFF',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#FFFFFF',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#1F2A44',
      border: '1px solid #E0E4EA',
    },
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
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={variantInlineStyles[variant]}
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
