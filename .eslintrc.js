module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-shadow': 0,
  },
  overrides: [
    {
      files: ['*-test.js', '*.spec.js'],
      env: {
        jest: true,
      },
      plugins: ['jest'],
    },
  ],
};
