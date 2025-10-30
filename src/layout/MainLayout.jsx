import { useState } from "react";
import Sidebar from "../components/common/SideBar";
import { Outlet } from "react-router-dom";
import { PanelLeft, Bell } from "lucide-react";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-light-background">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <header className="h-10 bg-white border-b border-gray-stroke flex items-center justify-between px-6">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-cohispania-orange transition-colors text-cohispania-blue"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Botón de notificaciones (opcional-Desarrollo futuro)
          <button
            className="p-2 rounded-lg hover:bg-gray-stroke/50 transition-colors text-cohispania-blue relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          /* Badge de notificaciones (ejemplo) 
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cohispania-orange"></span>
          </button>
          */}
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
