"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import QuickActionButtons from "@/src/components/QuickActionButtons";
import SideNoteEditor from "@/src/components/SideNoteEditor";
import { useState, useEffect } from "react";

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
  
  // Estado para controlar a exibição do editor de notas
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  
  // Função para abrir o editor de notas
  const openNoteEditor = () => setShowNoteEditor(true);
  
  // Função para fechar o editor de notas
  const closeNoteEditor = () => setShowNoteEditor(false);
  
  // Verificar se há parâmetro de consulta para abrir o editor
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openEditor') === 'true') {
        setShowNoteEditor(true);
      }
    }
  }, []);

  return (
    <ProtectedRoute>
      {/* Conteúdo principal simplificado, inspirado no Evernote */}
      <main className="flex flex-row min-h-screen">
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
            {/* Área de edição de nota */}
            <div className="w-full max-w-3xl h-full">
              {/* Componente de edição de nota */}
              {showNoteEditor ? (
                <SideNoteEditor onClose={closeNoteEditor} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="mb-4">Selecione ou crie uma nota para editar</span>
                  <button
                    onClick={openNoteEditor}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md flex items-center shadow-md font-bold"
                  >
                    <span className="mr-2">📝</span>
                    Nova Nota
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
    </ProtectedRoute>
  );
}
