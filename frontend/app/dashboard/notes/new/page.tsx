'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import NotePage from '../[id]/page';

/**
 * Página de Criação de Nova Nota
 * 
 * Esta página renderiza diretamente o componente de edição de notas com o ID 'new'.
 * Utilizamos o mesmo componente de edição para criar novas notas e editar existentes.
 * O componente [id]/page.tsx detecta o ID 'new' e trata como criação de nova nota.
 * 
 * Modificado para ser exibido diretamente no painel lateral direito, sem modal.
 */
export default function NewNotePage() {
  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto p-4 md:p-8 bg-white">
        {/* Renderiza o componente de edição com o ID 'new' */}
        <NotePage params={{ id: 'new' }} />
      </div>
    </ProtectedRoute>
  );
}