"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import QuickActionButtons from "@/src/components/QuickActionButtons";
import { useRouter } from "next/navigation";

// Página principal do Dashboard
export default function Dashboard() {
  const router = useRouter();
  
  // Função para redirecionar para a página de criação de notas
  const openNoteEditor = () => {
    router.push('/dashboard/notes/new');
  };

  return (
    <ProtectedRoute>
      {/* Conteúdo principal simplificado, inspirado no Evernote */}
      <main className="flex flex-row min-h-screen">
          {/* Coluna 1: Lista de Cadernos/Notas com botões de ação rápida */}
          <section className="w-80 bg-white border-r border-gray-200 h-screen pt-8 px-4 pb-4 overflow-y-auto hidden md:flex flex-col">
            <div className="mb-6">
              <QuickActionButtons />
            </div>
          </section>

          {/* Coluna 2: Painel do editor */}
          <section className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen p-4 md:p-8 overflow-y-auto min-w-0">
            {/* Área de edição de nota */}
            <div className="w-full max-w-3xl h-full">
              {/* Área para criar nova nota */}
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
            </div>
          </section>
        </main>
    </ProtectedRoute>
  );
}
