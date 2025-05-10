'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import FloatingActionButton from './FloatingActionButton';

/**
 * Componente de layout do lado do cliente
 * 
 * Gerencia a exibição condicional da sidebar e do botão de ação flutuante
 * com base na rota atual do usuário
 */
export default function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Obtém o pathname atual usando o hook do Next.js
  const pathname = usePathname();
  
  // Verifica se a página atual é a página de login, registro ou home
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/';
  
  if (isAuthPage) {
    // Renderiza apenas o conteúdo para páginas de autenticação
    return <>{children}</>;
  }
  
  // Renderiza o layout com sidebar para as demais páginas
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100 flex">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <main className="flex-1 ml-64">
        {children}
      </main>
      
      <FloatingActionButton />
    </div>
  );
}