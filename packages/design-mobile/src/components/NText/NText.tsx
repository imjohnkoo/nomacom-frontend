import React from 'react'
import { Text, type TextProps, type TextStyle } from 'react-native'
import { theme } from '../../theme'

export interface NTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label'
  color?: string
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
}

const variantStyles: Record<string, TextStyle> = {
  h1: { fontSize: theme.fontSize['3xl'], lineHeight: Math.round(theme.fontSize['3xl'] * theme.lineHeight.tight), fontWeight: '700' },
  h2: { fontSize: theme.fontSize['2xl'], lineHeight: Math.round(theme.fontSize['2xl'] * theme.lineHeight.tight), fontWeight: '700' },
  h3: { fontSize: theme.fontSize.xl, lineHeight: Math.round(theme.fontSize.xl * theme.lineHeight.tight), fontWeight: '600' },
  body: { fontSize: theme.fontSize.base, lineHeight: Math.round(theme.fontSize.base * theme.lineHeight.normal) },
  bodySmall: { fontSize: theme.fontSize.sm, lineHeight: Math.round(theme.fontSize.sm * theme.lineHeight.normal) },
  caption: { fontSize: theme.fontSize.xs, lineHeight: Math.round(theme.fontSize.xs * theme.lineHeight.normal) },
  label: { fontSize: theme.fontSize.sm, lineHeight: Math.round(theme.fontSize.sm * theme.lineHeight.normal), fontWeight: '500' },
}

const weightMap: Record<string, string> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

export function NText({
  variant = 'body',
  color = theme.colors.neutral[900],
  weight,
  align,
  style,
  children,
  ...rest
}: NTextProps) {
  const textStyle: TextStyle = {
    ...variantStyles[variant],
    color,
    ...(weight && { fontWeight: weightMap[weight] as TextStyle['fontWeight'] }),
    ...(align && { textAlign: align }),
  }

  return (
    <Text style={[textStyle, style]} {...rest}>
      {children}
    </Text>
  )
}
