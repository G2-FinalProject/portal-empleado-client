import { Loader2 } from 'lucide-react';

/**
 * 🧩 Reusable Button Component
 * - Variants: primary | secondary | danger | ghost
 * - Sizes: small | medium | large
 * - States: loading | disabled
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
  // 🔹 Base styles
  const baseStyles =
    'font-semibold rounded-md transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none';

  // 🔹 Variants (hover styles)
  const variantStyles = {
    primary: 'hover:opacity-90',
    secondary: 'hover:opacity-85',
    danger: 'hover:opacity-90',
    ghost: 'hover:bg-gray-50',
  };

  // 🔹 Inline variant styles (brand colors + subtle shadows)
  const variantInlineStyles = {
    primary: {
      backgroundColor: '#F68D2E',
      color: '#1F2A44',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      border: '0.5px solid transparent',
    },
    secondary: {
      backgroundColor: '#1F2A44',
      color: '#FFFFFF',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      border: '0.5px solid transparent',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#FFFFFF',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      border: '0.5px solid transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#1F2A44',
      border: '1px solid #E5E7EB', // 👈 más fino y claro
      boxShadow: 'none',
    },
  };

  // 🔹 Sizes
  const sizeStyles = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-2.5 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  // 🔹 Full width support
  const widthStyle = fullWidth ? 'w-full' : '';

  // 🔹 Combine styles
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
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
