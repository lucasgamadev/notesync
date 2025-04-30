"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

// Estendendo a interface Window para incluir as propriedades específicas do Google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
        }
      }
    };
    handleGoogleSignIn?: (response: { credential: string }) => void;
  }
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  useEffect(() => {
    // Carrega a API do Google quando o componente é montado
    const loadGoogleAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = initializeGoogleButton;
    };
    
    loadGoogleAPI();
    
    return () => {
      // Limpa global Google callback quando o componente for desmontado
      window.handleGoogleSignIn = undefined;
    };
  }, []);
  
  // Inicializa o botão de login do Google
  const initializeGoogleButton = () => {
    // Adiciona callback global para o login do Google
    window.handleGoogleSignIn = async (response: { credential: string }) => {
      try {
        setGoogleLoading(true);
        setError("");
        
        // Extrai o token ID do response.credential
        const { credential } = response;
        
        // Envia o token para o backend para verificação
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: credential }),
        });
        
        const data = await backendResponse.json();
        
        if (!backendResponse.ok) {
          throw new Error(data.message || 'Erro ao fazer login com o Google');
        }
        
        // Armazena tokens de autenticação
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        // Redireciona para o dashboard
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Erro ao autenticar com Google:", error);
        setError(error.message || "Falha na autenticação com Google");
      } finally {
        setGoogleLoading(false);
      }
    };
    
    // Inicializa o botão do Google usando a API do Google Identity Services
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      const buttonElement = document.getElementById('googleSignInButton');
      if (buttonElement) {
        window.google.accounts.id.renderButton(
          buttonElement,
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            logo_alignment: 'center',
            text: 'continue_with'
          }
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Login beta: autentica qualquer usuário ao pressionar "Entrar"
    setTimeout(() => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("refreshToken", "fake-refresh-token");
      router.push("/dashboard");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Entre na sua conta</h2>
          <p className="mt-2 text-sm text-gray-700 font-medium">
            Ou{" "}
            <Link href="/register" className="font-semibold text-indigo-700 hover:text-indigo-600">
              crie uma nova conta
            </Link>
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-700 hover:text-indigo-600">
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div id="googleSignInButton" className={`flex justify-center ${googleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {/* O botão do Google será renderizado aqui pela API do Google */}
                {googleLoading && <span className="absolute z-10 flex items-center justify-center">Conectando...</span>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
