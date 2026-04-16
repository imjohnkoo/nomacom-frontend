import React from 'react'
import { View, ScrollView, StyleSheet, type ViewProps } from 'react-native'
import { theme } from '../../theme'

export interface NScreenProps extends ViewProps {
  scroll?: boolean
  padding?: boolean
  safeArea?: boolean
  backgroundColor?: string
}

export function NScreen({
  scroll = true,
  padding = true,
  backgroundColor = theme.colors.white,
  children,
  style,
  ...rest
}: NScreenProps) {
  const content = (
    <View style={[padding && styles.padding, style]} {...rest}>
      {children}
    </View>
  )

  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: theme.spacing[4],
  },
  scrollContent: {
    flexGrow: 1,
  },
})
