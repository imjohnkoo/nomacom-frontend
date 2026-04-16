import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native'
import { theme } from '../../theme'

export interface NInputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  hint?: string
  error?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  disabled?: boolean
}

export function NInput({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  disabled = false,
  ...rest
}: NInputProps) {
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? theme.colors.error[500]
    : focused
      ? theme.colors.primary[500]
      : theme.colors.neutral[300]

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, { borderColor }, disabled && styles.disabled]}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholderTextColor={theme.colors.neutral[400]}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true)
            rest.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            rest.onBlur?.(e)
          }}
          {...rest}
        />
        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
      </View>
      {(error || hint) && (
        <Text style={[styles.hint, error && styles.errorText]}>{error || hint}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.neutral[700],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[3],
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[900],
    paddingVertical: theme.spacing[2.5] ?? 10,
  },
  inputDisabled: {
    color: theme.colors.neutral[400],
  },
  disabled: {
    backgroundColor: theme.colors.neutral[50],
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral[500],
  },
  errorText: {
    color: theme.colors.error[500],
  },
})
