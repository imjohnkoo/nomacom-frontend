import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, type DimensionValue, type ViewStyle } from 'react-native'
import { theme } from '../../theme'

export interface NSkeletonProps {
  width?: DimensionValue
  height?: number
  circle?: boolean
  radius?: number
  style?: ViewStyle
}

export function NSkeleton({
  width = '100%',
  height = 16,
  circle = false,
  radius,
  style,
}: NSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  const borderRadius = circle ? (height / 2) : (radius ?? theme.radius.md)

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.neutral[200],
  },
})
