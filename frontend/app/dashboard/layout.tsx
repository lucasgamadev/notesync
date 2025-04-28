'use client';

import FloatingActionButton from '@/src/components/FloatingActionButton';

/**
 * Layout do Dashboard
 * 
 * Componente de layout que envolve todas as páginas do dashboard.
 * Inclui o botão de ação flutuante (FAB) para acesso rápido à criação de notas e cadernos.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
      <FloatingActionButton />
    </div>
  );
}