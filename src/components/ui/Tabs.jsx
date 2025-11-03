import { useState } from 'react';
import Badge from './Badge';

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
  className = ''
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Pestañas */}
      <div
        className="flex gap-6 border-b border-gray-stroke"
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
              className={`relative pb-4 px-1 flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isActive
                  ? 'text-cohispania-blue font-semibold border-cohispania-blue'
                  : 'text-gray-300 font-normal border-transparent'
              }`}
              style={{ marginBottom: '-1px' }}
            >
              <span className="text-base">{tab.label}</span>

              {/* Badge con el contador */}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" size="small">
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
        className="mt-6"
      >
        {activeTabData?.content}
      </div>
    </div>
  );
}
