import { LayoutDashboard, ClipboardList, Users, UserPlus, Calendar, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Sidebar() {
  // Obtenemos el usuario actual y la función de logout del store de Zustand
  const { user, logout } = useAuthStore();

  // Definimos los elementos del menú para cada tipo de rol
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

  // Función que decide qué menú mostrar según el rol del usuario
  const getMenuItems = () => {
    // Usamos roleId del store de Zustand
    // Roles: 1 = admin, 2 = manager, 3 = employee
    if (user?.roleId === 1) {
      return adminItems;
    } else if (user?.roleId === 2) {
      return managerItems;
    } else {
      return employeeItems;
    }
  };

  // Función para obtener el nombre del rol en texto
  const getRoleName = () => {
    if (user?.roleId === 1) return 'Administrador';
    if (user?.roleId === 2) return 'Manager';
    return 'Empleado';
  };

  return (
    <aside className="w-64 bg-cohispania-blue border-r border-blue-stroke flex flex-col h-screen">
      {/* Header con logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-stroke">
        <div className="h-10 w-10 bg-cohispania-orange rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">CoHispania</span>
          <span className="text-xs text-gray-100">Portal del Empleado</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menú Principal
          </p>
          {/* items del menú según el rol */}
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-stroke text-white font-medium'
                      : 'text-white hover:bg-blue-stroke'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer con información del usuario y botón de logout */}
      <div className="border-t border-blue-stroke p-4">
        {/* Información del usuario */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar con la inicial del nombre */}
          <div className="h-10 w-10 rounded-full bg-cohispania-orange flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {/* Nombre y rol */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || 'Usuario'}
            </p>
            <p className="text-xs text-gray-100 truncate">
              {getRoleName()}
            </p>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-blue-stroke text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
