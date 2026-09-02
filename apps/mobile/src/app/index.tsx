import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { NButton, NInput, NText, NTrustNote } from '@imjohnkoo/design-mobile'

import { FlowScreen, FlowSpacer } from '@/components/flow-screen'

export default function Home() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')

  const canSubmit = orderId.trim().length > 0

  const onSubmit = () => {
    if (!canSubmit) return
    router.push({ pathname: '/verify/[orderId]', params: { orderId: orderId.trim() } })
  }

  return (
    <FlowScreen>
      <View style={styles.hero}>
        <NText variant="h1">eSIMmany</NText>
        <NText variant="bodySmall" color="#6b7280" style={styles.sub}>
          eSIM QR코드 발급 서비스
        </NText>
      </View>

      <View style={styles.form}>
        <NInput
          label="주문번호 입력"
          placeholder="주문번호를 입력하세요"
          keyboardType="number-pad"
          value={orderId}
          onChangeText={(t) => setOrderId(t.replace(/[^\d]/g, ''))}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
        />
      </View>

      <View style={styles.note}>
        <NTrustNote title="스마트스토어 주문번호로 발급해요">
          네이버 스마트스토어에서 구매하신 주문번호를 입력하면 본인 확인 후 eSIM 을 발급받을 수
          있어요.
        </NTrustNote>
      </View>

      <FlowSpacer />

      <NButton variant="primary" size="xl" fullWidth disabled={!canSubmit} onPress={onSubmit}>
        주문 확인하기
      </NButton>
    </FlowScreen>
  )
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 48,
    alignItems: 'center',
  },
  sub: {
    marginTop: 8,
  },
  form: {
    marginTop: 40,
  },
  note: {
    marginTop: 16,
  },
})
