module.exports = {
  root: true,
  extends: ['@payhost/eslint-config-node/nest.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.cjs'],
  rules: {
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      { 'exceptAfterOverload': true, 'exceptAfterSingleLine': true }
    ],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        'assertionStyle': 'as'
      }
    ],
    'camelcase': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['src/*', '*/src/*'],
      },
    ],
    'padding-line-between-statements': ['error',
      { 'blankLine': 'always', 'prev': 'block', 'next': '*' },
      { 'blankLine': 'always', 'prev': '*', 'next': 'for' },
      { 'blankLine': 'always', 'prev': '*', 'next': 'return' },
      { 'blankLine': 'always', 'prev': 'if', 'next': '*' },
      { 'blankLine': 'always', 'prev': '*', 'next': 'if' },
      { 'blankLine': 'any', 'prev': 'if', 'next': 'if' },
      { 'blankLine': 'always', 'prev': 'for', 'next': '*' },
      { 'blankLine': 'always', 'prev': '*', 'next': 'try' },
      { 'blankLine': 'always', 'prev': ['const', 'let', 'var'], 'next': '*'},
      { 'blankLine': 'any', 'prev': ['const', 'let', 'var'], 'next': ['const', 'let', 'var']},
    ],
    'space-before-blocks': 'error',
    'spaced-comment': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'prefer-template': 'error',
  },
};
