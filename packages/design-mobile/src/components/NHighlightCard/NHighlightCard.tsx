import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NHighlightCardProps {
  icon?: React.ReactNode
  /** string 이면 기본 스타일 Text 로 감쌈. 강조는 NText/Text 중첩으로. */
  children: React.ReactNode
}

/** brand-50 카드 — 요약/사용 기간 미리보기. */
export function NHighlightCard({ icon, children }: NHighlightCardProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.body}>
        {typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: theme.spacing[4],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  icon: {
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  text: {
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.55),
    color: theme.colors.neutral[700],
  },
})
