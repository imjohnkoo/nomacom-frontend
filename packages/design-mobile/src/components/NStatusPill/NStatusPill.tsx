import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NStatusPillProps {
  color?: 'success' | 'info' | 'warning' | 'error' | 'primary' | 'neutral'
  dot?: boolean
  children: string
}

const colorMap = {
  success: { bg: theme.colors.success[50], text: theme.colors.success[700], dot: theme.colors.success[500] },
  info: { bg: theme.colors.info[50], text: theme.colors.info[700], dot: theme.colors.info[500] },
  warning: { bg: theme.colors.warning[50], text: theme.colors.warning[700], dot: theme.colors.warning[500] },
  error: { bg: theme.colors.error[50], text: theme.colors.error[700], dot: theme.colors.error[500] },
  primary: { bg: theme.colors.primary[50], text: theme.colors.primary[700], dot: theme.colors.primary[500] },
  neutral: { bg: theme.colors.neutral[100], text: theme.colors.neutral[700], dot: theme.colors.neutral[500] },
}

export function NStatusPill({ color = 'neutral', dot = false, children }: NStatusPillProps) {
  const c = colorMap[color]
  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: c.dot }]} />}
      <Text style={[styles.text, { color: c.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '600',
  },
})
