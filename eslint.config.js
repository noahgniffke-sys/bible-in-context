import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'ios', 'web']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
      // Empty catch blocks are the app's deliberate fail-soft pattern
      // (haptics, share, localStorage — never crash on optional features).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Contexts/components intentionally co-export hooks and helpers;
      // fast-refresh falling back to a full reload in dev is acceptable.
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['scripts/**'],
    languageOptions: { globals: globals.node },
  },
])
