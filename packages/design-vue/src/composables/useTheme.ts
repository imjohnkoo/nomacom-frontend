import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface ThemeContext {
  /** Current color mode: 'light' | 'dark' */
  mode: Ref<'light' | 'dark'>
  /** Toggle between light and dark */
  toggle: () => void
}

export const THEME_KEY: InjectionKey<ThemeContext> = Symbol('NTheme')

/** Provide theme context (used by NApp / NThemeNew) */
export function provideTheme(ctx: ThemeContext) {
  provide(THEME_KEY, ctx)
}

/** Inject theme context */
export function useTheme(): ThemeContext | undefined {
  return inject(THEME_KEY, undefined)
}
