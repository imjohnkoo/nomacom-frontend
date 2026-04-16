import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NDividerProps {
  label?: string
  color?: string
  spacing?: number
}

export function NDivider({
  label,
  color = theme.colors.neutral[200],
  spacing: gap = theme.spacing[4],
}: NDividerProps) {
  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: gap }]}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.line, { backgroundColor: color }]} />
      </View>
    )
  }

  return <View style={[styles.line, { backgroundColor: color, marginVertical: gap }]} />
}

const styles = StyleSheet.create({
  line: {
    flex: 1,
    height: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginHorizontal: theme.spacing[3],
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral[400],
  },
})
