import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base configuration for JavaScript files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
      'no-empty': 'warn',
      'no-undef': 'error',
      'react/no-unescaped-entities': 'warn',
    },
  },
  
  // TypeScript and TSX files configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off', // Turn off base rule
      '@typescript-eslint/no-unused-vars': 'warn', // Use TypeScript version
      'no-useless-escape': 'warn',
      'no-empty': 'warn',
      'no-undef': 'off', // TypeScript handles this
      'react/no-unescaped-entities': 'warn',
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'build/',
      '.next/',
      'dist/',
      'coverage/',
      'node_modules/',
      'drizzle/',
      'playwright-report/',
      'test-results/',
    ],
  },
];
