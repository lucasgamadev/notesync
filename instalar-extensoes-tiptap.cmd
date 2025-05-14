@echo off
echo ===================================================
echo Instalando extensoes avancadas para o TipTap Editor
echo ===================================================
echo.

cd frontend

echo Instalando extensoes para formatacao avancada...
npm install @tiptap/extension-highlight @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-underline @tiptap/extension-superscript @tiptap/extension-subscript @tiptap/extension-typography

echo.
echo Instalando extensoes para destaque de sintaxe em blocos de codigo...
npm install @tiptap/extension-code-block-lowlight lowlight

echo.
echo Instalando react-icons para melhorar a interface...
npm install react-icons

echo.
echo ===================================================
echo Instalacao concluida!
echo ===================================================
echo.
echo Para usar o editor melhorado, substitua a importacao do TipTapEditor pelo TipTapEditorMelhorado nos seus componentes.
echo.
echo Exemplo:
echo import TipTapEditor from "../components/TipTapEditorMelhorado";
echo.
echo Pressione qualquer tecla para sair...
pause > nul