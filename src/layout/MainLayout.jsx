import { Sidebar } from '../components/common/SideBar';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Outlet renderiza el componente de la ruta actual */}
        <Outlet />
      </main>
    </div>
  );
}
