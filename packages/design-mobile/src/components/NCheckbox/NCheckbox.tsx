import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NCheckboxProps {
  checked: boolean
  onToggle: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function NCheckbox({ checked, onToggle, label, disabled = false }: NCheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onToggle(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
        ]}
      >
        {checked && <Text style={styles.check}>✓</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  boxChecked: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  check: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    marginLeft: theme.spacing[2],
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[900],
  },
})
