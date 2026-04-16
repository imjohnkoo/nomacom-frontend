import colors from '@imjohnkoo/design-tokens/src/colors.json'
import typography from '@imjohnkoo/design-tokens/src/typography.json'
import spacing from '@imjohnkoo/design-tokens/src/spacing.json'
import shadows from '@imjohnkoo/design-tokens/src/shadows.json'
import base from '@imjohnkoo/design-tokens/src/base.json'

function remToNumber(rem: string): number {
  const match = rem.match(/^([\d.]+)rem$/)
  return match ? parseFloat(match[1]) * 16 : parseFloat(rem)
}

function pxToNumber(px: string): number {
  const match = px.match(/^([\d.]+)px$/)
  return match ? parseFloat(match[1]) : parseFloat(px)
}

const typedSpacing = spacing as Record<string, string>
const typedShadows = shadows as Record<string, { x: string; y: string; blur: string; spread: string; color: string }>
const typedRadius = base.radius as Record<string, string>

export const theme = {
  colors: {
    primary: colors.primary,
    neutral: colors.neutral,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  fontSize: Object.fromEntries(
    Object.entries(typography.fontSize).map(([key, val]) => [key, remToNumber(val)]),
  ) as Record<string, number>,

  lineHeight: Object.fromEntries(
    Object.entries(typography.lineHeight).map(([key, val]) => [key, parseFloat(val)]),
  ) as Record<string, number>,

  fontWeight: typography.fontWeight as Record<string, string>,

  fontFamily: typography.fontFamily,

  spacing: Object.fromEntries(
    Object.entries(typedSpacing).map(([key, val]) => [key, remToNumber(val)]),
  ) as Record<string, number>,

  radius: Object.fromEntries(
    Object.entries(typedRadius).map(([key, val]) => {
      if (val === '9999px') return [key, 9999]
      return [key, remToNumber(val)]
    }),
  ) as Record<string, number>,

  shadow: Object.fromEntries(
    Object.entries(typedShadows).map(([key, val]) => [
      key,
      {
        shadowOffset: { width: pxToNumber(val.x), height: pxToNumber(val.y) },
        shadowRadius: pxToNumber(val.blur),
        shadowColor: val.color,
        shadowOpacity: 1,
        elevation: key === 'sm' ? 2 : key === 'md' ? 4 : key === 'lg' ? 8 : 12,
      },
    ]),
  ),
} as const

export type Theme = typeof theme
