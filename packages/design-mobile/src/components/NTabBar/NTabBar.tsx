import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../theme'

export interface NTabBarItem {
  key: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

export interface NTabBarProps {
  items: NTabBarItem[]
  activeKey: string
  onSelect: (key: string) => void
}

export function NTabBar({ items, activeKey, onSelect }: NTabBarProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = item.key === activeKey
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {item.icon && (
                <View style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</View>
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: active ? theme.colors.primary[600] : theme.colors.neutral[400] },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingBottom: 20,
    paddingTop: theme.spacing[2],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
})
