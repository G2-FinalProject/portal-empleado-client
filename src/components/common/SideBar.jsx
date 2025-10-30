import { LayoutDashboard, ClipboardList, Users, Calendar, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import cohispaniaLogo from '../../assets/isotipo_CoHispania_Cuadrado_fondo.svg';

export default function Sidebar({ isOpen = true }) {
  const { user, logout } = useAuthStore();

  // Elementos del menú para cada tipo de rol
  // Employee solo ve "Mis gestiones"
  const employeeItems = [
    { 
      title: 'Mis gestiones', 
      url: '/myportal', 
      icon: LayoutDashboard 
    },
  ];

  // Manager ve "Mis gestiones" y "Solicitudes"
  const managerItems = [
    { 
      title: 'Mis gestiones', 
      url: '/myportal', 
      icon: LayoutDashboard 
    },
    { 
      title: 'Solicitudes', 
      url: '/requests', 
      icon: ClipboardList 
    },
  ];

  // Admin ve todas las opciones
  const adminItems = [
    { 
      title: 'Mis gestiones', 
      url: '/myportal', 
      icon: LayoutDashboard 
    },
    { 
      title: 'Solicitudes', 
      url: '/requests', 
      icon: ClipboardList 
    },
    { 
      title: 'Empleados', 
      url: '/employees', 
      icon: Users 
    },
    { 
      title: 'Festivos Poblaciones', 
      url: '/locations', 
      icon: Calendar 
    },
  ];

  // Función para mostrar según el rol del usuario
  // Roles: 1 = admin, 2 = manager, 3 = employee
  const getMenuItems = () => {
    if (user?.roleId === 1) {
      return adminItems;
    } else if (user?.roleId === 2) {
      return managerItems;
    } else {
      return employeeItems;
    }
  };

  const getRoleName = () => {
    if (user?.roleId === 1) return 'Administrador';
    if (user?.roleId === 2) return 'Manager';
    return 'Empleado';
  };

  return (
    <aside 
      className={`
        ${isOpen ? 'w-64' : 'w-20'} 
        bg-cohispania-blue 
        border-r border-blue-stroke 
        flex flex-col 
        h-screen 
        transition-all duration-300 
        ease-in-out
      `}
    >
      {/* Header con logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-stroke">
        <img 
          src={cohispaniaLogo} 
          alt="Cohispania" 
          className="h-10 w-10 shrink-0" 
        />
        {/* Texto solo visible cuando está abierto */}
        {isOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white whitespace-nowrap">CoHispania</span>
            <span className="text-xs text-gray-100 whitespace-nowrap">Portal del Empleado</span>
          </div>
        )}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {/* Título solo visible cuando está abierto */}
          {isOpen && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Menú Principal
            </p>
          )}
          
          {/* Items del menú según el rol */}
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center ${isOpen ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-stroke text-white font-medium'
                      : 'text-white hover:bg-blue-stroke'
                  }`
                }
                title={!isOpen ? item.title : undefined} // Tooltip cuando está colapsado
              >
                <Icon className="h-5 w-5 shrink-0" />
                {/* Texto solo visible cuando está abierto */}
                {isOpen && <span className="text-sm whitespace-nowrap">{item.title}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer con información del usuario y botón de logout */}
      <div className="border-t border-blue-stroke p-4">
        {/* Información del usuario */}
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'} mb-3`}>
          {/* Avatar con la inicial del nombre */}
          <div className="h-10 w-10 rounded-full bg-cohispania-orange flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          
          {/* Nombre y rol solo visibles cuando está abierto */}
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-100 truncate">
                {getRoleName()}
              </p>
            </div>
          )}
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={logout}
          className={`w-full flex items-center ${isOpen ? 'gap-2' : 'justify-center'} px-3 py-2 text-sm rounded-lg hover:bg-blue-stroke text-white transition-colors`}
          title={!isOpen ? 'Cerrar Sesión' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {/* Texto solo visible cuando está abierto */}
          {isOpen && <span className="whitespace-nowrap">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
