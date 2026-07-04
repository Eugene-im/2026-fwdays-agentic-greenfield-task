import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Build output and Playwright-generated artifacts, never hand-written code.
    ignores: ['dist/**', 'test-results/**', 'playwright-report/**'],
  },
)
