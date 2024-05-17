module.exports = {
  root: true,
  extends: ['plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-duplicate-imports': 'error',
        '@typescript-eslint/no-duplicate-imports': 'warn',
        'no-console': 'error',
        indent: ['error', 2, { SwitchCase: 1 }],
        'comma-dangle': [
          'error',
          {
            arrays: 'never',
            objects: 'never',
            imports: 'never',
            exports: 'never',
            functions: 'ignore'
          }
        ],
        'lines-around-comment': ['error', { beforeBlockComment: true }],
        'padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: ['const', 'let', 'var', 'case'],
            next: '*'
          },
          {
            blankLine: 'any',
            prev: ['const', 'let', 'var'],
            next: ['const', 'let', 'var']
          }
        ]
      }
    }
  ]
};
