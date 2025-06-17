"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "../services/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Componente para proteger rotas que requerem autenticação
 * Redireciona para a página de login se o usuário não estiver autenticado
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      
      if (!authenticated) {
        // Redirecionar para login se não estiver autenticado
        try {
          router.push("/login");
        } catch (err) {
          console.error('Erro ao redirecionar para login:', err);
          // Fallback para navegação direta
          window.location.href = "/login";
        }
      } else {
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };

    // Verificar autenticação
    checkAuth();
    
    // Adicionar listener para mudanças de autenticação
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [router]);

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Renderizar os filhos apenas se estiver autenticado
  return isAuthenticated ? <>{children}</> : null;
}
