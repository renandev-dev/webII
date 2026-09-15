import js from '@eslint/js';
import globals from 'globals';

export default [
  // 1. OBJETO DE IGNORES GLOBAIS (Primeira posição obrigatória no ESLint 9)
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.agents/**',
      '**/*.json',
      '**/*.md',
      '**/*.css',
      'test-eslint.js',
    ],
  },

  // 2. Regras recomendadas para código JavaScript
  js.configs.recommended,

  // 3. Aplicação do ambiente Node para o código da API (src)
  {
    files: ['src/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 4. Aplicação do ambiente Jest para os testes (tests)
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
