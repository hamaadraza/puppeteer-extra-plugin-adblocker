module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // Equivalent to ordered-imports in tslint
    'import/order': [
      'error',
      {
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        },
        'newlines-between': 'always',
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ]
      }
    ],
    // Add other custom rules here
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ['dist', 'node_modules', '**/*.js', '!.eslintrc.js'],
}; 