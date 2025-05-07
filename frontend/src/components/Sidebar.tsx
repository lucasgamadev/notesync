import React from "react";
import { FaBook, FaStickyNote, FaTags, FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-200 via-white to-gray-100 text-gray-800 h-full fixed left-0 top-0 shadow-lg border-r border-gray-200 flex flex-col justify-between z-20">
      <div>
        <div className="p-6 flex items-center gap-2">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">NoteSync</h1>
        </div>
        <nav className="px-4 space-y-2 mt-8">
          <a href="/dashboard" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium">
            <FaHome className="text-blue-600" /> Dashboard
          </a>
          <a href="/dashboard/notebooks" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium">
            <FaBook className="text-blue-600" /> Cadernos
          </a>
          <a href="/dashboard/notes" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium">
            <FaStickyNote className="text-blue-600" /> Notas
          </a>
          <a href="/dashboard/tags" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium">
            <FaTags className="text-blue-600" /> Etiquetas
          </a>
        </nav>
      </div>
      <div className="px-4 pb-6">
        <a href="/dashboard/settings" className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium mb-2">
          <FaCog className="text-blue-600" /> Configurações
        </a>
        <button
          className="flex items-center gap-3 w-full text-left py-2.5 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }}
        >
          <FaSignOutAlt className="text-blue-600" /> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
