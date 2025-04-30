"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import QuickActionButtons from "@/src/components/QuickActionButtons";

// Componente de Sidebar
const Sidebar = () => {
  return (
    <div className="w-64 bg-indigo-800 text-white h-full fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-8">NoteSync</h1>

        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="block py-2.5 px-4 rounded bg-indigo-900 hover:bg-indigo-700 text-gray-300"
          >
            Dashboard
          </a>
          <a href="/dashboard/notebooks" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
            Cadernos
          </a>
          <a href="/dashboard/notes" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
            Notas
          </a>
          <a href="/dashboard/tags" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
            Etiquetas
          </a>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <a href="/dashboard/settings" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
          Configurações
        </a>
        <button
          className="block w-full text-left py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300"
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
};

// Componente de Estatísticas
const StatsWidget = ({
  title,
  value,
  icon
}: {
  title: string;
  value: string | number;
  icon: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-700">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Componente de Atividade Recente
const RecentActivity = () => {
  // Dados de exemplo
  const activities = [
    { id: 1, type: "note", title: "Anotações de Reunião", date: "2 horas atrás" },
    { id: 2, type: "notebook", title: "Projeto Alpha", date: "Ontem" },
    { id: 3, type: "note", title: "Lista de Tarefas", date: "3 dias atrás" }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade Recente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center border-b pb-3">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
              <span className="text-sm">{activity.type === "note" ? "📝" : "📘"}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{activity.title}</p>
              <p className="text-sm text-gray-700 font-medium">{activity.date}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/dashboard/activity"
        className="text-indigo-700 text-sm font-semibold mt-4 inline-block"
      >
        Ver todas as atividades
      </a>
    </div>
  );
};

// Página principal do Dashboard
export default function Dashboard() {
  // Dados de exemplo para estatísticas
  const stats = [
    { title: "Total de Notas", value: 24, icon: "📝" },
    { title: "Cadernos", value: 5, icon: "📘" },
    { title: "Etiquetas", value: 12, icon: "🏷️" },
    { title: "Armazenamento", value: "45%", icon: "☁️" }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />

        <div className="ml-64 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
          
          {/* Botões de Ação Rápida */}
          <QuickActionButtons />

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsWidget key={index} title={stat.title} value={stat.value} icon={stat.icon} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade Recente */}
            <RecentActivity />

            {/* Notas Recentes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notas Recentes</h3>
              <div className="space-y-2">
                <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                  <p className="font-semibold text-gray-800">Anotações de Reunião</p>
                  <p className="text-sm text-gray-700 font-medium">Atualizado há 2 horas</p>
                </a>
                <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                  <p className="font-semibold text-gray-800">Lista de Tarefas</p>
                  <p className="text-sm text-gray-700 font-medium">Atualizado há 1 dia</p>
                </a>
                <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                  <p className="font-semibold text-gray-800">Ideias para Projeto</p>
                  <p className="text-sm text-gray-700 font-medium">Atualizado há 3 dias</p>
                </a>
              </div>
              <a
                href="/dashboard/notes"
                className="text-indigo-700 text-sm font-semibold mt-4 inline-block"
              >
                Ver todas as notas
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
