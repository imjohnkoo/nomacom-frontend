import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NFieldCardProps {
  label: string
  value?: string
  placeholder?: string
  active?: boolean
  error?: boolean
  onPress?: () => void
}

/** 탭형 dropdown trigger — bottom sheet 를 여는 필드 카드. */
export function NFieldCard({
  label,
  value,
  placeholder,
  active = false,
  error = false,
  onPress,
}: NFieldCardProps) {
  const borderColor = error
    ? theme.colors.error[500]
    : active
      ? theme.colors.primary[300]
      : theme.colors.neutral[200]

  return (
    <TouchableOpacity style={[styles.container, { borderColor }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder || ''}
        </Text>
      </View>
      <Text style={styles.chevron}>⌄</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    backgroundColor: theme.colors.white,
  },
  texts: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.neutral[500],
    marginBottom: 3,
  },
  value: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  placeholder: {
    color: theme.colors.neutral[400],
    fontWeight: '400',
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.neutral[400],
    marginTop: -6,
  },
})
