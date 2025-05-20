import React, { useState, useEffect, useCallback, useMemo } from "react";
import TipTapEditorAvancado from "./TipTapEditorAvancado";
import pluginSystem from "./editor/EditorPluginSystem";
import { registerAllPlugins } from "./editor/plugins";
import { FaPlus, FaCode, FaWrench, FaMagic, FaPuzzlePiece, FaKeyboard, FaHistory, FaFileExport } from "react-icons/fa";
import { MdExtension, MdSettings, MdOutlineAutoAwesome } from "react-icons/md";
import "./editor-personalizavel.css";

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
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          z-index: 100;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
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
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #333;
        }
        
        .plugin-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px 0;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        
        .plugin-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .plugin-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .plugin-list::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 6px;
        }
        
        .plugin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }
        
        .plugin-item:hover {
          background-color: #f9f9f9;
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
          width: 44px;
          height: 24px;
          margin-left: 8px;
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
          transition: .3s ease-in-out;
          border-radius: 34px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s ease-in-out;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        
        input:checked + .toggle-slider {
          background-color: #4a86e8;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        
        .toggle-switch:hover .toggle-slider:before {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          z-index: 100;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
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
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #333;
        }
        
        .macro-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 10px 0;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        
        .macro-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .macro-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .macro-list::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 6px;
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
          padding: 14px 18px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }
        
        .macro-item:hover {
          background-color: #f9f9f9;
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
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .execute-button {
          color: #4a86e8;
        }
        
        .execute-button:hover {
          background-color: #eef4ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(74, 134, 232, 0.15);
        }
        
        .delete-button {
          color: #e53e3e;
          font-size: 18px;
        }
        
        .delete-button:hover {
          background-color: #fff5f5;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(229, 62, 62, 0.15);
        }
        
        .create-form {
          padding: 16px;
          border-top: 1px solid #e0e4e8;
        }
        
        .create-form input {
          width: 100%;
          padding: 10px 14px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .create-form input:focus {
          border-color: #4a86e8;
          box-shadow: 0 0 0 2px rgba(74, 134, 232, 0.2);
          outline: none;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
        
        .save-button, .cancel-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .save-button {
          background-color: #4a86e8;
          color: white;
          border: none;
          box-shadow: 0 2px 4px rgba(74, 134, 232, 0.2);
        }
        
        .save-button:hover {
          background-color: #3b78e7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(74, 134, 232, 0.25);
        }
        
        .cancel-button {
          background-color: transparent;
          border: 1px solid #ddd;
          color: #666;
        }
        
        .cancel-button:hover {
          background-color: #f5f5f5;
          border-color: #ccc;
          color: #333;
        }
        
        .create-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 36px);
          margin: 18px;
          padding: 10px 0;
          background-color: #f0f4f8;
          border: 1px dashed #ccc;
          border-radius: 8px;
          color: #4a86e8;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.25s ease;
          font-weight: 500;
        }
        
        .create-button:hover {
          background-color: #e6f0ff;
          border-color: #4a86e8;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(74, 134, 232, 0.15);
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
    // Registra todos os plugins disponíveis
    registerAllPlugins(pluginSystem);
    
    // Registra plugins iniciais adicionais
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
      },
      {
        name: 'history',
        title: 'Histórico de Alterações',
        icon: <FaHistory />,
        onClick: (editor) => {
          if (editor && editor.commands.navigateHistory) {
            // Abre o painel de histórico se disponível
            if (pluginSystem.plugins.historyEnhanced && pluginSystem.plugins.historyEnhanced.enabled) {
              alert('Histórico de alterações disponível através do plugin de Histórico Avançado');
            } else {
              alert('Ative o plugin de Histórico Avançado para usar esta funcionalidade');
            }
          }
        }
      },
      {
        name: 'export',
        title: 'Exportar Conteúdo',
        icon: <FaFileExport />,
        onClick: (editor) => {
          if (editor) {
            const content = editor.getHTML();
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nota-exportada.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      },
      {
        name: 'aiAssistant',
        title: 'Assistente de IA',
        icon: <MdOutlineAutoAwesome />,
        onClick: () => {
          alert('Assistente de IA em desenvolvimento. Em breve você poderá usar IA para melhorar seus textos!');
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
    <div className="editor-personalizavel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
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
    </div>
  );
};

export default EditorPersonalizavel;