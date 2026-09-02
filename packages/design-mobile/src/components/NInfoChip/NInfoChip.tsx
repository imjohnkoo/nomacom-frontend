import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NInfoChipProps {
  value: string
  label?: string
  icon?: React.ReactNode
}

/** rounded-full chip — label + value + optional icon. brand-50 bg / brand-700 text. */
export function NInfoChip({ value, label, icon }: NInfoChipProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  icon: {
    marginRight: 0,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.primary[500],
  },
  value: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.primary[700],
  },
})
