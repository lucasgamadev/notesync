import { useEffect, useState } from "react";

/**
 * Hook para gerenciar dados no localStorage
 *
 * @param {string} key - Chave para armazenar no localStorage
 * @param {any} initialValue - Valor inicial caso não exista no localStorage
 * @returns {Array} - [storedValue, setValue] para ler e atualizar o valor
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Obter do localStorage pelo key
      const item = window.localStorage.getItem(key);
      // Analisar JSON armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se ocorrer erro, retornar initialValue
      console.error(`Erro ao recuperar ${key} do localStorage:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor no localStorage
  const setValue = (value) => {
    try {
      // Permitir que value seja uma função
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Salvar estado
      setStoredValue(valueToStore);

      // Salvar no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  // Sincronizar com mudanças em outras abas/janelas
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
        } catch (error) {
          console.error(`Erro ao processar mudança no localStorage para ${key}:`, error);
        }
      }
    };

    // Adicionar event listener
    window.addEventListener("storage", handleStorageChange);

    // Remover event listener no cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};
