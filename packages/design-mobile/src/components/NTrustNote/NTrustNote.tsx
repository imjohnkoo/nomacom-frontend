import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NTrustNoteProps {
  /** 강조 첫 줄 (bold, 진한 색) */
  title?: string
  /** 본문 — string 이면 기본 스타일 Text 로 감쌈 */
  children?: React.ReactNode
  icon?: React.ReactNode
}

/** rounded-2xl gray bg + 좌측 brand icon-circle — 보안/정책 안내 카드. */
export function NTrustNote({ title, children, icon }: NTrustNoteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {icon ?? <Text style={styles.iconFallback}>✓</Text>}
      </View>
      <View style={styles.body}>
        {title && <Text style={styles.title}>{title}</Text>}
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
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.neutral[50],
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  iconFallback: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xs,
    lineHeight: Math.round(theme.fontSize.xs * 1.55),
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  text: {
    fontSize: theme.fontSize.xs,
    lineHeight: Math.round(theme.fontSize.xs * 1.55),
    color: theme.colors.neutral[500],
  },
})
