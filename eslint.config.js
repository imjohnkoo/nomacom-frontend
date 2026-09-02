import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginReactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    // React Native 워크스페이스(`apps/mobile`, `packages/design-mobile`)용.
    // 이 플러그인이 없으면 코드의 `// eslint-disable-next-line react-hooks/exhaustive-deps`
    // 주석이 «Definition for rule not found» 에러가 된다 (2026-09-02 실측 4건).
    files: ['apps/mobile/**/*.{ts,tsx}', 'packages/design-mobile/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // babel.config.js / metro.config.js 등은 CommonJS 라 `module`·`require` 를 쓴다.
    files: ['**/*.config.js', '**/*.config.cjs', '**/babel.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },
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
