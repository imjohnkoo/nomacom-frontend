import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { theme } from '../../theme'

export interface NButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onPress?: () => void
  children: React.ReactNode
}

const variantBg: Record<string, ViewStyle> = {
  primary: { backgroundColor: theme.colors.primary[600] },
  secondary: { backgroundColor: theme.colors.neutral[100] },
  outline: { backgroundColor: 'transparent', borderColor: theme.colors.neutral[300], borderWidth: 1 },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: theme.colors.error[500] },
}

const variantText: Record<string, string> = {
  primary: theme.colors.white,
  secondary: theme.colors.neutral[800],
  outline: theme.colors.neutral[800],
  ghost: theme.colors.neutral[700],
  danger: theme.colors.white,
}

const sizeStyle: Record<string, ViewStyle> = {
  sm: { paddingVertical: theme.spacing[1.5] ?? 6, paddingHorizontal: theme.spacing[3] },
  md: { paddingVertical: theme.spacing[2.5] ?? 10, paddingHorizontal: theme.spacing[4] },
  lg: { paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[6] },
}

const sizeFontMap: Record<string, number> = {
  sm: theme.fontSize.sm,
  md: theme.fontSize.base,
  lg: theme.fontSize.lg,
}

export function NButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  onPress,
  children,
}: NButtonProps) {
  const isDisabled = disabled || loading

  const containerStyle: ViewStyle[] = [
    styles.base,
    variantBg[variant],
    sizeStyle[size],
    fullWidth ? styles.fullWidth : undefined,
    isDisabled ? styles.disabled : undefined,
  ].filter(Boolean) as ViewStyle[]

  const textColor = variantText[variant]

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator size="small" color={textColor} style={styles.iconLeft} />
      )}
      {!loading && iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
      <Text style={[styles.text, { color: textColor, fontSize: sizeFontMap[size] }]}>
        {children}
      </Text>
      {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
})
