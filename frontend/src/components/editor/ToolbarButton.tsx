import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  title,
  disabled = false,
  children,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-button ${isActive ? 'is-active' : ''} ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
};
