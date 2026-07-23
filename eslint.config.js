import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore build outputs and config files
  { ignores: ['dist', 'vite.config.ts'] },
  
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: '19.0', // Explicitly set React 19
      },
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Inherit recommended rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // Disables needing `import React from 'react'`
      ...reactHooks.configs.recommended.rules,

      // Vite-specific rule for Fast Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Optional: Turn off prop-types if you strictly use TypeScript
      'react/prop-types': 'off',
    },
  }
);