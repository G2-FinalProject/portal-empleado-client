import { useState } from "react";
import Badge from "./Badge";

/**
 * Tabs - Sistema de pestañas reutilizable
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array de objetos con { id, label, count?, content }
 * @param {string} props.defaultTab - ID de la pestaña activa por defecto
 * @param {Function} props.onChange - Callback cuando cambia la pestaña activa
 * @param {string} props.className - Clases CSS adicionales
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { id: 'pending', label: 'Pendientes', count: 2, content: <PendingList /> },
 *     { id: 'approved', label: 'Aprobadas', count: 5, content: <ApprovedList /> }
 *   ]}
 *   defaultTab="pending"
 *   onChange={(tabId) => console.log('Tab activa:', tabId)}
 * />
 */
export default function Tabs({
  tabs = [],
  defaultTab,
  onChange,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Pestañas con fondo gris */}
      <div
        className="bg-light-background rounded-lg p-0.5 sm:p-1 flex gap-0.5 sm:gap-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 px-2 py-2 sm:px-4 sm:py-3 rounded-md
                flex items-center justify-center gap-1 sm:gap-2
                transition-all duration-200
                font-medium text-xs sm:text-sm
                focus:outline-none focus:ring-1 focus:ring-cohispania-orange focus:ring-offset-2
                ${
                  isActive
                    ? "bg-white text-cohispania-blue shadow-sm"
                    : "bg-transparent text-gray-400 hover:text-cohispania-blue"
                }
              `}

            >
              <span className="text-xs sm:text-base truncate">{tab.label}</span>

              {/* Badge con el contador */}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant={isActive ? "secondary" : "neutral"} size="small">
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la pestaña activa */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4 sm:mt-6"
      >
        {activeTabData?.content}
      </div>
    </div>
  );
}
