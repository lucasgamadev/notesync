import React, { useState, useEffect, useRef } from 'react';

interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  type?: 'divider' | 'item';
  disabled?: boolean;
}

interface DropdownProps {
  children: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  items,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar o dropdown ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {children}
      </div>
      
      {isOpen && (
        <div className={`dropdown-menu ${align}-align`} role="menu">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={`divider-${index}`} className="dropdown-divider" />;
            }

            return (
              <button
                key={item.label || `item-${index}`}
                className={`dropdown-item ${item.isActive ? 'is-active' : ''}`}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                type="button"
                role="menuitem"
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                {item.label && <span className="dropdown-item-label">{item.label}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
