"use client";

import { useRouter } from "next/navigation";
import safeLocalStorage from "@/utils/safeLocalStorage";

export default function AdminSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    safeLocalStorage.removeItem("user"); // Elimina el token o datos del usuario
    router.push("/login"); // Redirige al login
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 p-4">
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/dashboard")}
            >
              <span>🏠</span>
              <span>Resumen</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/usuarios")}
            >
              <span>👤</span>
              <span>Usuarios</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/titulos")}
            >
              <span>🎓</span>
              <span>Títulos</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/herramientas")}
            >
              <span>🛠️</span>
              <span>Herramientas</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/maquinaria")}
            >
              <span>⚙️</span>
              <span>Maquinaria</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/mantenimientos")}
            >
              <span>🔧</span>
              <span>Mantenimientos</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-800"
              onClick={() => router.push("/admin/configuracion")}
            >
              <span>⚙️</span>
              <span>Configuración</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          <span>🔓</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
