import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { theme } from '../../theme'

export interface NCodeRowProps {
  label: string
  value: string
  /**
   * 복사 버튼 탭 시 호출 — 클립보드 구현은 앱이 주입 (예: expo-clipboard).
   * 미지정 시 복사 버튼을 숨기고 selectable 텍스트만 제공.
   */
  onCopy?: (value: string) => void
  copyLabel?: string
  copiedLabel?: string
}

/** 라벨 + mono value + 복사 버튼. 수동 설치 코드 표기용. */
export function NCodeRow({
  label,
  value,
  onCopy,
  copyLabel = '복사',
  copiedLabel = '복사됨',
}: NCodeRowProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const handleCopy = () => {
    onCopy?.(value)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {onCopy && (
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={[styles.copyText, copied && styles.copiedText]}>
              {copied ? copiedLabel : copyLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.neutral[500],
  },
  copyBtn: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  copyText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  copiedText: {
    color: theme.colors.success[700],
  },
  value: {
    fontSize: theme.fontSize.xs,
    lineHeight: Math.round(theme.fontSize.xs * 1.5),
    color: theme.colors.neutral[800],
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
})
