"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import QuickActionButtons from "@/src/components/QuickActionButtons";

import Sidebar from "@/src/components/Sidebar";

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100 flex">
        {/* Sidebar fixa à esquerda */}
        <Sidebar />

        {/* Conteúdo principal simplificado, inspirado no Evernote */}
        <main className="flex-1 ml-64 flex flex-row min-h-screen">
          {/* Coluna 1: Lista de Cadernos/Notas com botões de ação rápida */}
          <section className="w-80 bg-white border-r border-gray-200 h-screen pt-8 px-4 pb-4 overflow-y-auto hidden md:flex flex-col">
            <div className="mb-6">
              <QuickActionButtons />
            </div>
            <h2 className="text-lg font-bold text-blue-700 mb-6">Notas</h2>
            {/* Lista de notas/cadernos */}
            <div className="space-y-4 flex-1">
              <a href="#" className="block p-3 hover:bg-blue-50 rounded">
                <p className="font-semibold text-gray-800">Anotações de Reunião</p>
                <p className="text-xs text-gray-500">Atualizado há 2 horas</p>
              </a>
              <a href="#" className="block p-3 hover:bg-blue-50 rounded">
                <p className="font-semibold text-gray-800">Lista de Tarefas</p>
                <p className="text-xs text-gray-500">Atualizado há 1 dia</p>
              </a>
              <a href="#" className="block p-3 hover:bg-blue-50 rounded">
                <p className="font-semibold text-gray-800">Ideias para Projeto</p>
                <p className="text-xs text-gray-500">Atualizado há 3 dias</p>
              </a>
            </div>
            <a
              href="/dashboard/notes"
              className="text-blue-700 text-sm font-semibold mt-6 inline-block"
            >
              Ver todas as notas
            </a>
          </section>

          {/* Coluna 2: Painel do editor */}
          <section className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen p-4 md:p-8 overflow-y-auto min-w-0">
            {/* Aqui pode entrar o componente de editor de nota, como o TipTapEditor */}
            <div className="w-full max-w-3xl h-full flex items-center justify-center text-gray-400">
              <span>Selecione ou crie uma nota para editar</span>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
