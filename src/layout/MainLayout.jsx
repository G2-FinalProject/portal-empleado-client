import { useState } from "react";
import Sidebar from "../components/common/SideBar";
import { Outlet } from "react-router-dom";
import { PanelLeft, Bell } from "lucide-react";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-light-background">
      {/* Overlay oscuro en mobile*/}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-stroke flex items-center justify-between px-4 md:px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-cohispania-orange transition-colors text-cohispania-blue"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
