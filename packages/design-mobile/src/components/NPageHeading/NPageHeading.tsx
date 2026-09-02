import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NPageHeadingProps {
  eyebrow?: string
  title: string
  description?: string
}

/** eyebrow + 큰 헤딩 + 보조 설명. `\n` 으로 줄바꿈 (RN Text 기본 동작). */
export function NPageHeading({ eyebrow, title, description }: NPageHeadingProps) {
  return (
    <View>
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.primary[600],
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    lineHeight: Math.round(theme.fontSize['2xl'] * 1.35),
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  description: {
    marginTop: 10,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.55),
    color: theme.colors.neutral[500],
  },
})
