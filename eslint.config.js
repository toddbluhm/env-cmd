import { default as tseslint } from 'typescript-eslint'
import { default as globals } from 'globals'
import { default as eslint } from '@eslint/js'

export default tseslint.config(
  {
    // Ignore build folder
    ignores: ['dist/*'],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    // Enable Type generation
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.json'],
      },
    }
  },
  {
    // For test files ignore some rules
    files: ['test/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off'
    },
  },
  // Disable Type Checking JS/CJS/MJS files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
)
