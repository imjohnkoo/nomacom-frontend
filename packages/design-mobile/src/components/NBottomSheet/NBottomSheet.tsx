import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import { theme } from '../../theme'

export interface NBottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** 하단 고정 영역 (예: 선택 완료 CTA) */
  footer?: React.ReactNode
  height?: number | string
}

export function NBottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  height = 'auto',
}: NBottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.sheet, typeof height === 'number' ? { height } : undefined]}>
        <View style={styles.handle} />
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.content}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    paddingBottom: 34,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.neutral[300],
    alignSelf: 'center',
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  close: {
    fontSize: 24,
    color: theme.colors.neutral[400],
    lineHeight: 24,
  },
  content: {
    padding: theme.spacing[4],
  },
  footer: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },
})
