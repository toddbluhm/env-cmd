const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const globals = require('globals')
const stylistic = require('@stylistic/eslint-plugin')

module.exports = tseslint.config(
  {
    ignores: ['dist/*', 'bin/*'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['test/*.ts'],
        },
      },
    },
    extends: [
      eslint.configs.recommended,
      stylistic.configs['recommended-flat'],
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
  },
  // Disable Type Checking JS files
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // For test files ignore some rules
    files: ['test/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
)
