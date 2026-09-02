import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NStepProgressProps {
  step: number
  total?: number
  label?: string
}

export function NStepProgress({ step, total = 4, label }: NStepProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step ? styles.barActive : styles.barIdle]} />
        ))}
      </View>
      <Text style={styles.label}>
        <Text style={styles.labelStrong}>{step}</Text>
        {` / ${total}`}
        {label ? ` · ${label}` : ''}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bars: {
    flexDirection: 'row',
    gap: 5,
  },
  bar: {
    width: 22,
    height: 4,
    borderRadius: theme.radius.full,
  },
  barActive: {
    backgroundColor: theme.colors.primary[500],
  },
  barIdle: {
    backgroundColor: theme.colors.neutral[200],
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral[400],
  },
  labelStrong: {
    color: theme.colors.primary[600],
    fontWeight: '700',
  },
})
