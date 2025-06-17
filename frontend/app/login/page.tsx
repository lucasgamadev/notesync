"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "../../src/components/ui/Button";

// Adicionando animações personalizadas
import "./login.css";

// Estendendo a interface Window para incluir as propriedades específicas do Google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
    handleGoogleSignIn?: (response: { credential: string }) => void;
  }

  interface GoogleConfig {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }

  interface GoogleButtonOptions {
    type?: string;
    theme: 'outline' | 'filled_blue' | 'filled_black';
    size: 'large' | 'medium' | 'small';
    text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string;
  }
}

export default function Login() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Inicializa o botão de login do Google
  const initializeGoogleButton = useCallback(() => {
    // Adiciona callback global para o login do Google
    window.handleGoogleSignIn = async (response: { credential: string }) => {
      try {
        setGoogleLoading(true);
        setError("");
        
        // Usa o serviço de autenticação para login com Google
        await loginWithGoogle(response.credential);
        
        // Redireciona para o dashboard após o login bem-sucedido
        router.push("/dashboard");
      } catch (error) {
        console.error("Erro ao autenticar com Google:", error);
        const errorMessage = error instanceof Error ? error.message : "Falha na autenticação com Google";
        setError(errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    };

    // Inicializa o botão do Google usando a API do Google Identity Services
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: window.handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const buttonElement = document.getElementById("googleSignInButton");
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '100%',
          logo_alignment: 'center',
          text: 'continue_with',
          shape: 'rectangular'
        } as GoogleButtonOptions);
      }
    }
  }, [loginWithGoogle, router]);

  useEffect(() => {
    // Carrega a API do Google quando o componente é montado
    const loadGoogleAPI = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
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
  }, [initializeGoogleButton]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simula login e redireciona direto
    setTimeout(() => {
      localStorage.setItem("notesync_auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ3MDEyODgwMDAsInVzZXJJZCI6IjEyMyIsIm5hbWUiOiJVc3VhcmlvIFRlc3RlIn0.signature");
      router.push("/dashboard");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="login-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="login-logo-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
          </div>
          <h2 className="login-title">
            Entre na sua conta
          </h2>
          <p className="login-subtitle">
            Ou{" "}
            <Link href="/register" className="login-link">
              crie uma nova conta
            </Link>
          </p>
        </motion.div>

        {error && (
          <div className="error-message" role="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="form-input-container">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="form-input-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <div className="form-input-container">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="form-input-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="remember-me">
            <div className="remember-me-checkbox">
              <input id="remember-me" name="remember-me" type="checkbox" />
              <label htmlFor="remember-me" className="remember-me-checkbox-label"></label>
            </div>
            <label htmlFor="remember-me" className="remember-me-text">
              Lembrar-me
            </label>
            
            <div className="forgot-password ml-auto">
              <a href="#" className="forgot-password-link">
                <span>Esqueceu sua senha?</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={loading || googleLoading}
              className="mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <div className="mt-6">
            <div className="divider">
              <div className="divider-line"></div>
              <div className="divider-text">
                <span>Ou continue com</span>
              </div>
            </div>

            <div className="google-button-container">
              <div className="relative">
                <div
                  id="googleSignInButton"
                  className={`google-button-wrapper ${googleLoading ? 'loading' : ''}`}
                >
                  {/* O botão do Google será renderizado aqui pela API do Google */}
                </div>
                {googleLoading && !loading && (
                  <div className="google-loading-overlay">
                    <div className="google-loading-content">
                      <svg
                        className="animate-spin h-5 w-5 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="google-loading-text">Conectando...</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs text-center text-gray-500">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="terms-link">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="terms-link">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Elementos decorativos */}
      <div className="decorative-blob decorative-blob-1"></div>
      <div className="decorative-blob decorative-blob-2"></div>
    </div>
  );
}
