// ESLint 8 legacy config (.eslintrc format).
// The previous flat eslint.config.js was unrunnable: it imported
// 'eslint-plugin-react' and '@eslint/js' packages that are not installed,
// and the lint script's --ext flag is incompatible with flat config.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: [
    'dist',
    'dist-ssr',
    'release',
    'node_modules',
    'backup',
    'public',
    'electron',
  ],
  rules: {
    // tsc --noEmit (with strict null checks) is the type/name gate; no-undef
    // misfires on TS type positions and ambient globals like __APP_VERSION__
    'no-undef': 'off',
    // The codebase intentionally uses `any` at legacy component boundaries
    // (translate props, dispatch payloads); tightening is tracked separately
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react-hooks/rules-of-hooks': 'error',
    // Existing effects omit stable store/dispatch deps by design
    'react-hooks/exhaustive-deps': 'off',
    'react-refresh/only-export-components': 'off',
  },
};
