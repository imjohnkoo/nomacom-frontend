import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NLinkCardProps {
  label: string
  sub?: string
  icon?: React.ReactNode
  onPress?: () => void
}

/** 아이콘 박스 + 제목 + 보조 + chevron — 외부 가이드 링크 카드. */
export function NLinkCard({ label, sub, icon, onPress }: NLinkCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.white,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  sub: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral[400],
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.neutral[300],
    fontWeight: '600',
  },
})
