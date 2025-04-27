'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import NotePage from '../[id]/page';

/**
 * Página de Criação de Nova Nota
 * 
 * Esta página renderiza diretamente o componente de edição de notas com o ID 'new'.
 * Utilizamos o mesmo componente de edição para criar novas notas e editar existentes.
 * O componente [id]/page.tsx detecta o ID 'new' e trata como criação de nova nota.
 */
export default function NewNotePage() {
  return (
    <ProtectedRoute>
      {/* Renderiza o componente de edição com o ID 'new' */}
      <NotePage params={{ id: 'new' }} />
    </ProtectedRoute>
  );
}