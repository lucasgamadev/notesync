"use client";

import { ReactNode, MouseEvent, useState, useRef, useEffect } from 'react';
import './Button.css';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
}: ButtonProps) {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      const timer = setTimeout(() => {
        setIsRippling(false);
        setCoords({ x: -1, y: -1 });
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsRippling(false);
    }
  }, [coords]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    if (onClick) {
      onClick(e);
    }
  };

  // Classes base e variantes são definidas no arquivo CSS

  // Adiciona a classe de ripple ativo quando necessário
  useEffect(() => {
    if (isRippling && buttonRef.current) {
      const button = buttonRef.current;
      button.classList.add('ripple-active');
      
      // Remove a classe após a animação terminar
      const onAnimationEnd = () => {
        button.classList.remove('ripple-active');
      };
      
      button.addEventListener('animationend', onAnimationEnd);
      return () => {
        button.removeEventListener('animationend', onAnimationEnd);
      };
    }
  }, [isRippling]);
  
  // Define a posição do ripple
  useEffect(() => {
    if (isRippling && buttonRef.current) {
      const button = buttonRef.current;
      
      // Define as propriedades personalizadas diretamente no elemento
      button.style.setProperty('--ripple-x', `${coords.x}px`);
      button.style.setProperty('--ripple-y', `${coords.y}px`);
      
      // Força um reflow para garantir que a animação seja reiniciada
      void button.offsetWidth;
    }
  }, [isRippling, coords.x, coords.y]);

  // Classes base do botão
  const buttonClasses = [
    variant,
    size,
    fullWidth ? 'full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={buttonClasses}
    >
      <span className="relative z-10 flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
        )}
        {children}
      </span>
    </button>
  );
}
