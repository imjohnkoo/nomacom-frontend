import React from 'react'
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { theme } from '../../theme'

export interface NBadgeProps {
  label: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  variant?: 'solid' | 'subtle' | 'outline'
  size?: 'sm' | 'md'
}

const colorMap = {
  primary: { bg: theme.colors.primary[500], subtle: theme.colors.primary[50], text: theme.colors.primary[700], border: theme.colors.primary[200] },
  success: { bg: theme.colors.success[500], subtle: theme.colors.success[50], text: theme.colors.success[700], border: theme.colors.success[500] },
  warning: { bg: theme.colors.warning[500], subtle: theme.colors.warning[50], text: theme.colors.warning[700], border: theme.colors.warning[500] },
  error: { bg: theme.colors.error[500], subtle: theme.colors.error[50], text: theme.colors.error[700], border: theme.colors.error[500] },
  info: { bg: theme.colors.info[500], subtle: theme.colors.info[50], text: theme.colors.info[700], border: theme.colors.info[500] },
  neutral: { bg: theme.colors.neutral[500], subtle: theme.colors.neutral[100], text: theme.colors.neutral[700], border: theme.colors.neutral[300] },
}

export function NBadge({ label, color = 'primary', variant = 'subtle', size = 'sm' }: NBadgeProps) {
  const c = colorMap[color]

  const containerStyle: ViewStyle = {
    backgroundColor: variant === 'solid' ? c.bg : variant === 'subtle' ? c.subtle : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? c.border : undefined,
    paddingHorizontal: size === 'sm' ? 8 : 10,
    paddingVertical: size === 'sm' ? 2 : 4,
    borderRadius: theme.radius.full,
  }

  const textStyle: TextStyle = {
    color: variant === 'solid' ? theme.colors.white : c.text,
    fontSize: size === 'sm' ? theme.fontSize.xs : theme.fontSize.sm,
    fontWeight: '500',
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
})
