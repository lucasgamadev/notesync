import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import a11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      "*.md",
      "*.css",
      "*.html",
      "*.json",
      "*.yml",
      "*.yaml",
      "*.txt",
      "node_modules/",
      "dist/",
      "build/"
    ]
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        browser: true,
        es2021: true,
        node: true
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': a11yPlugin,
      'prettier': prettierPlugin
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'prettier/prettier': [
        'error',
        {
          trailingComma: "none",
          singleQuote: false,
          semi: true,
          tabWidth: 2,
          printWidth: 100,
          endOfLine: "auto"
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
