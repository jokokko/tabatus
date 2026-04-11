'use strict';

const js      = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Extension globals injected via script load order
        browser:   'readonly',
        contracts: 'readonly',
        Fuse:      'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    // compat.js intentionally sets `browser` as a global for other scripts
    files: ['src/compat.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
