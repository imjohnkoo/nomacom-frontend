import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NHeaderProps {
  title: string
  subtitle?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onLeftPress?: () => void
  onRightPress?: () => void
  transparent?: boolean
}

export function NHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
}: NHeaderProps) {
  return (
    <View style={[styles.container, !transparent && styles.bordered]}>
      <View style={styles.left}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            {leftIcon}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.white,
    minHeight: 56,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  iconButton: {
    padding: theme.spacing[1],
  },
})
