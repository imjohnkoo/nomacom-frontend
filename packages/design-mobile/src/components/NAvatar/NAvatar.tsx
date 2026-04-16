import React from 'react'
import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native'
import { theme } from '../../theme'

export interface NAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src?: ImageSourcePropType | string
  text?: string
  color?: string
}

const sizeMap = { sm: 32, md: 40, lg: 48, xl: 64 }
const fontSizeMap = { sm: 12, md: 14, lg: 16, xl: 20 }

export function NAvatar({ size = 'md', src, text, color }: NAvatarProps) {
  const dimension = sizeMap[size]
  const bgColor = color || theme.colors.primary[100]
  const textColor = theme.colors.primary[700]

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: bgColor,
  }

  if (src) {
    const source = typeof src === 'string' ? { uri: src } : src
    return (
      <Image
        source={source}
        style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      />
    )
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.text, { fontSize: fontSizeMap[size], color: textColor }]}>
        {text?.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  text: {
    fontWeight: '600',
  },
})
