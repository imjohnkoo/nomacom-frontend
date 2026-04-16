import React from 'react'
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../../theme'

export interface NSwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function NSwitch({ value, onValueChange, label, description, disabled = false }: NSwitchProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.content, disabled && styles.disabled]}>
        {(label || description) && (
          <View style={styles.text}>
            {label && <Text style={styles.label}>{label}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
        )}
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.colors.neutral[200],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.colors.white}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  label: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: theme.colors.neutral[900],
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
})
