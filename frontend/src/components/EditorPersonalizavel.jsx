import React, { useState, useEffect, useCallback, useMemo } from "react";
import TipTapEditorAvancado from "./TipTapEditorAvancado";
import pluginSystem from "./editor/EditorPluginSystem";
import { FaPlus, FaCode, FaWrench, FaMagic, FaPuzzlePiece, FaKeyboard } from "react-icons/fa";
import { MdExtension, MdSettings } from "react-icons/md";

/**
 * Componente de configuração de plugins
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.plugins - Lista de plugins disponíveis
 * @param {Function} props.onTogglePlugin - Função chamada quando um plugin é ativado/desativado
 * @param {Function} props.onClose - Função chamada quando o painel é fechado
 */
const PluginConfigPanel = ({ plugins, onTogglePlugin, onClose }) => {
  return (
    <div className="plugin-config-panel">
      <div className="panel-header">
        <h3>Plugins e Extensões</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="plugin-list">
        {Object.values(plugins).map((plugin) => (
          <div key={plugin.id} className="plugin-item">
            <div className="plugin-info">
              <h4>{plugin.name || plugin.id}</h4>
              {plugin.description && <p>{plugin.description}</p>}
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={plugin.enabled}
                onChange={() => onTogglePlugin(plugin.id, !plugin.enabled)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
      <style jsx>{`
        .plugin-config-panel {
          position: absolute;
          top: 50px;
          right: 20px;
          width: 350px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f0f4f8;
          border-bottom: 1px solid #e0e4e8;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          color: #2c3e50;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        }
        
        .plugin-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px 0;
        }
        
        .plugin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .plugin-info {
          flex: 1;
        }
        
        .plugin-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
        }
        
        .plugin-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #4a86e8;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
};

/**
 * Componente de gerenciamento de macros
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.macros - Mapa de macros disponíveis
 * @param {Function} props.onExecuteMacro - Função chamada quando uma macro é executada
 * @param {Function} props.onCreateMacro - Função chamada para criar uma nova macro
 * @param {Function} props.onDeleteMacro - Função chamada para excluir uma macro
 * @param {Function} props.onClose - Função chamada quando o painel é fechado
 */
const MacroPanel = ({ macros, onExecuteMacro, onCreateMacro, onDeleteMacro, onClose }) => {
  const [newMacroName, setNewMacroName] = useState("");
  const [newMacroDescription, setNewMacroDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateMacro = () => {
    if (newMacroName.trim()) {
      onCreateMacro({
        name: newMacroName.trim(),
        description: newMacroDescription.trim(),
        commands: []
      });
      setNewMacroName("");
      setNewMacroDescription("");
      setShowCreateForm(false);
    }
  };

  return (
    <div className="macro-panel">
      <div className="panel-header">
        <h3>Macros Personalizadas</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="macro-list">
        {Object.values(macros).length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma macro definida</p>
          </div>
        ) : (
          Object.values(macros).map((macro) => (
            <div key={macro.id} className="macro-item">
              <div className="macro-info">
                <h4>{macro.name || macro.id}</h4>
                {macro.description && <p>{macro.description}</p>}
                {macro.shortcut && <span className="shortcut">{macro.shortcut}</span>}
              </div>
              <div className="macro-actions">
                <button 
                  onClick={() => onExecuteMacro(macro.id)} 
                  className="execute-button"
                  title="Executar macro"
                >
                  <FaMagic />
                </button>
                <button 
                  onClick={() => onDeleteMacro(macro.id)} 
                  className="delete-button"
                  title="Excluir macro"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showCreateForm ? (
        <div className="create-form">
          <input
            type="text"
            placeholder="Nome da macro"
            value={newMacroName}
            onChange={(e) => setNewMacroName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={newMacroDescription}
            onChange={(e) => setNewMacroDescription(e.target.value)}
          />
          <div className="form-actions">
            <button onClick={handleCreateMacro} className="save-button">Salvar</button>
            <button onClick={() => setShowCreateForm(false)} className="cancel-button">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowCreateForm(true)} className="create-button">
          <FaPlus /> Nova Macro
        </button>
      )}
      
      <style jsx>{`
        .macro-panel {
          position: absolute;
          top: 50px;
          right: 20px;
          width: 350px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f0f4f8;
          border-bottom: 1px solid #e0e4e8;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          color: #2c3e50;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        }
        
        .macro-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 8px 0;
          flex: 1;
        }
        
        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          color: #999;
          font-style: italic;
        }
        
        .macro-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .macro-info {
          flex: 1;
        }
        
        .macro-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
        }
        
        .macro-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        
        .shortcut {
          display: inline-block;
          margin-top: 4px;
          padding: 2px 6px;
          background-color: #f0f0f0;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
        }
        
        .macro-actions {
          display: flex;
          gap: 8px;
        }
        
        .execute-button, .delete-button {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
        }
        
        .execute-button {
          color: #4a86e8;
        }
        
        .execute-button:hover {
          background-color: #f0f4f8;
        }
        
        .delete-button {
          color: #e53e3e;
          font-size: 18px;
        }
        
        .delete-button:hover {
          background-color: #fff5f5;
        }
        
        .create-form {
          padding: 16px;
          border-top: 1px solid #e0e4e8;
        }
        
        .create-form input {
          width: 100%;
          padding: 8px 12px;
          margin-bottom: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
        
        .save-button, .cancel-button {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .save-button {
          background-color: #4a86e8;
          color: white;
          border: none;
        }
        
        .cancel-button {
          background-color: transparent;
          border: 1px solid #ddd;
          color: #666;
        }
        
        .create-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 32px);
          margin: 16px;
          padding: 8px 0;
          background-color: #f0f4f8;
          border: 1px dashed #ccc;
          border-radius: 4px;
          color: #4a86e8;
          cursor: pointer;
          font-size: 14px;
        }
        
        .create-button:hover {
          background-color: #e6f0ff;
        }
      `}</style>
    </div>
  );
};

/**
 * Componente principal do editor personalizado com suporte a plugins e macros
 * @param {Object} props - Propriedades do componente
 * @param {string} props.initialContent - Conteúdo inicial do editor
 * @param {Function} props.onUpdate - Função chamada quando o conteúdo é atualizado
 * @param {string} props.noteId - ID da nota sendo editada
 * @param {Array} props.initialPlugins - Plugins iniciais a serem registrados
 * @param {Array} props.initialMacros - Macros iniciais a serem registradas
 * @param {Object} props.editorOptions - Opções adicionais para o editor
 */
const EditorPersonalizavel = ({
  initialContent = "",
  onUpdate,
  noteId,
  initialPlugins = [],
  initialMacros = [],
  editorOptions = {}
}) => {
  const [showPluginPanel, setShowPluginPanel] = useState(false);
  const [showMacroPanel, setShowMacroPanel] = useState(false);
  const [plugins, setPlugins] = useState({});
  const [macros, setMacros] = useState({});
  const [editorInstance, setEditorInstance] = useState(null);

  // Inicializa plugins e macros
  useEffect(() => {
    // Registra plugins iniciais
    initialPlugins.forEach(plugin => {
      pluginSystem.registerPlugin(plugin.id, plugin);
    });

    // Registra macros iniciais
    initialMacros.forEach(macro => {
      pluginSystem.registerMacro(macro.id, macro);
    });

    // Atualiza o estado local
    setPlugins(pluginSystem.plugins);
    setMacros(pluginSystem.macros);

    // Limpa ao desmontar
    return () => {
      // Opcional: limpar plugins e macros específicos deste editor
    };
  }, [initialPlugins, initialMacros]);

  // Manipuladores de eventos para plugins
  const handleTogglePlugin = useCallback((pluginId, enabled) => {
    pluginSystem.togglePlugin(pluginId, enabled);
    setPlugins({...pluginSystem.plugins});
  }, []);

  // Manipuladores de eventos para macros
  const handleExecuteMacro = useCallback((macroId) => {
    if (editorInstance) {
      pluginSystem.executeMacro(macroId, editorInstance);
    }
  }, [editorInstance]);

  const handleCreateMacro = useCallback((macroData) => {
    const macroId = macroData.name.toLowerCase().replace(/\s+/g, '-');
    pluginSystem.registerMacro(macroId, {
      ...macroData,
      commands: macroData.commands || []
    });
    setMacros({...pluginSystem.macros});
  }, []);

  const handleDeleteMacro = useCallback((macroId) => {
    pluginSystem.unregisterMacro(macroId);
    setMacros({...pluginSystem.macros});
  }, []);

  // Prepara extensões personalizadas do TipTap
  const customExtensions = useMemo(() => {
    return pluginSystem.getExtensions();
  }, [plugins]);

  // Prepara botões personalizados para a barra de ferramentas
  const customButtons = useMemo(() => {
    const defaultButtons = [
      {
        name: 'plugins',
        title: 'Gerenciar Plugins',
        icon: <MdExtension />,
        onClick: () => {
          setShowPluginPanel(prev => !prev);
          setShowMacroPanel(false);
        }
      },
      {
        name: 'macros',
        title: 'Macros Personalizadas',
        icon: <FaKeyboard />,
        onClick: () => {
          setShowMacroPanel(prev => !prev);
          setShowPluginPanel(false);
        }
      }
    ];

    return [...defaultButtons, ...pluginSystem.getToolbarButtons()];
  }, [plugins]);

  // Manipulador para capturar a instância do editor
  const handleEditorReady = useCallback((editor) => {
    setEditorInstance(editor);
    // Executa hooks de inicialização
    pluginSystem.runHook('created', editor);
  }, []);

  return (
    <div className="editor-personalizavel">
      {/* Painéis flutuantes */}
      {showPluginPanel && (
        <PluginConfigPanel
          plugins={plugins}
          onTogglePlugin={handleTogglePlugin}
          onClose={() => setShowPluginPanel(false)}
        />
      )}

      {showMacroPanel && (
        <MacroPanel
          macros={macros}
          onExecuteMacro={handleExecuteMacro}
          onCreateMacro={handleCreateMacro}
          onDeleteMacro={handleDeleteMacro}
          onClose={() => setShowMacroPanel(false)}
        />
      )}

      {/* Editor TipTap Avançado */}
      <TipTapEditorAvancado
        initialContent={initialContent}
        onUpdate={onUpdate}
        noteId={noteId}
        customExtensions={customExtensions}
        customButtons={customButtons}
        editorOptions={{
          ...editorOptions,
          onReady: handleEditorReady
        }}
      />

      <style jsx>{`
        .editor-personalizavel {
          position: relative;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default EditorPersonalizavel;