/**
 * Card - Componente contenedor reutilizable
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del card
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.padding - Si debe tener padding interno (default: true)
 * @param {boolean} props.shadow - Si debe tener sombra (default: true)
 * @param {Function} props.onClick - Función al hacer click (hace el card clickeable)
 */
export default function Card({
  children,
  className = "",
  padding = true,
  shadow = true,
  onClick,
  ...props
}) {
  const baseStyles =
    "bg-white rounded-lg transition-all duration-200 border border-gray-200";

  const paddingStyles = padding ? "p-6" : "";

  const shadowStyles = shadow ? "shadow-sm hover:shadow-md" : "";

  const clickableStyles = onClick ? "cursor-pointer hover:scale-[1.01]" : "";

  const combinedClassName = `
    ${baseStyles}
    ${paddingStyles}
    ${shadowStyles}
    ${clickableStyles}
    ${className}
  `.trim();

  const Component = "div";

  return (
    <Component
      className={combinedClassName}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick(e) : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
