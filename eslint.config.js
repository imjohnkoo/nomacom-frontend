import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', '**/.output/**', '**/.nuxt/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    // TS·Vue 파일에서 `no-undef` 는 끈다 (typescript-eslint 공식 권장).
    // ① TypeScript 컴파일러가 이미 미정의 식별자를 잡는다 — 이중 검사이고,
    // ② Nuxt 자동 import(`ref`·`onMounted`·`useFetch`…)를 eslint 는 모르므로
    //    켜 두면 정상 코드에 대해 대량 오탐이 난다 (2026-09-02 실측 client 56건).
    // 타입 검사는 `.github/scripts/typecheck-gate.sh` 가 담당한다.
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      'no-undef': 'off',
    },
  },
]
