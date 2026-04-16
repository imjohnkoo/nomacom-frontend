import React from 'react'
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native'
import { theme } from '../../theme'

export interface NCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap: Record<string, number> = {
  none: 0,
  sm: theme.spacing[3],
  md: theme.spacing[4],
  lg: theme.spacing[6],
}

export function NCard({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...rest
}: NCardProps) {
  const variantStyle: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: theme.colors.white, ...theme.shadow.sm as any }
      : variant === 'outlined'
        ? { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.neutral[200] }
        : { backgroundColor: theme.colors.neutral[50] }

  return (
    <View
      style={[styles.base, variantStyle, { padding: paddingMap[padding] }, style]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
})
