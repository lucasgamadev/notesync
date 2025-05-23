"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // Redirecionar para login se não houver token
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

    // Definir um timeout para garantir que o loading não fique preso
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Timeout de autenticação atingido, assumindo autenticado');
        setIsAuthenticated(true);
        setLoading(false);
      }
    }, 3000);

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [router, loading]);

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
