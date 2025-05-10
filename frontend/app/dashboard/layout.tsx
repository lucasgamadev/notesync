'use client';

/**
 * Layout do Dashboard
 * 
 * Componente de layout que envolve todas as páginas do dashboard.
 * A barra lateral e o botão de ação flutuante (FAB) agora são renderizados no layout raiz.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}