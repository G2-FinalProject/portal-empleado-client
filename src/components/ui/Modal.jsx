import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Modal - Componente modal reutilizable
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Overlay (fondo con poca opacidad para ver el contenido debajo)
    <div
      className="fixed inset-0 border-gray-stroke bg-opacity-90 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose} // Cerrar al clicar fuera
    >
      {/* Modal */}
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // No cerrar al clicar dentro
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-gray-stroke">
          <h2 className="text-xl font-bold text-cohispania-blue">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cohispania-blue transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}