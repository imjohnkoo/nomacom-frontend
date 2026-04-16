import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native'
import { theme } from '../../theme'

export interface NAlertProps {
  title: string
  description?: string
  color?: 'info' | 'success' | 'warning' | 'error'
  icon?: React.ReactNode
  onClose?: () => void
}

const colorMap = {
  info: { bg: theme.colors.info[50], border: theme.colors.info[500], text: theme.colors.info[700] },
  success: { bg: theme.colors.success[50], border: theme.colors.success[500], text: theme.colors.success[700] },
  warning: { bg: theme.colors.warning[50], border: theme.colors.warning[500], text: theme.colors.warning[700] },
  error: { bg: theme.colors.error[50], border: theme.colors.error[500], text: theme.colors.error[700] },
}

export function NAlert({ title, description, color = 'info', icon, onClose }: NAlertProps) {
  const c = colorMap[color]

  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {description && <Text style={[styles.description, { color: c.text }]}>{description}</Text>}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Text style={{ color: c.text, fontSize: 18 }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing[3],
    borderRadius: theme.radius.lg,
    borderLeftWidth: 4,
  },
  icon: {
    marginRight: theme.spacing[3],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    opacity: 0.9,
  },
  close: {
    marginLeft: theme.spacing[2],
    padding: 4,
  },
})
