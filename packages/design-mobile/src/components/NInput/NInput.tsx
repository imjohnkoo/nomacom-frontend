import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  type TextInputProps,
  type TextStyle,
} from 'react-native'
import { theme } from '../../theme'

/**
 * react-native-web 은 TextInput 을 <input> 으로 렌더하고, 브라우저 UA 가 포커스 시
 * `outline: auto` (Chrome/macOS 기준 주황 #E59700) 를 그린다. 포커스 표시는 컨테이너
 * 보더 (primary/500) 가 담당하므로 UA 링은 끈다. `outlineStyle` 은 네이티브에 없는
 * 속성이라 web 에서만 주입 — RN 타입에도 없어 캐스팅이 필요하다.
 */
const webOutlineReset = Platform.select({
  web: { outlineStyle: 'none' } as unknown as TextStyle,
  default: undefined,
})

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
          style={[styles.input, webOutlineReset, disabled && styles.inputDisabled]}
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
