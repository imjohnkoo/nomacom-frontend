import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import {
  NAlertDialog,
  NButton,
  NInfoChip,
  NInput,
  NLoaderDialog,
  NPageHeading,
  NStepProgress,
  NTrustNote,
} from '@imjohnkoo/design-mobile'

import { FlowScreen, FlowSpacer } from '@/components/flow-screen'
import { api } from '@/lib/api'
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/format'
import { useOrderStore } from '@/lib/order-store'

export default function VerifyScreen() {
  const router = useRouter()
  const { orderId: orderIdParam } = useLocalSearchParams<{ orderId: string }>()
  const orderId = Number(orderIdParam)
  const orderStore = useOrderStore()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [isCancelledOrderVisible, setIsCancelledOrderVisible] = useState(false)
  const [isServerErrorVisible, setIsServerErrorVisible] = useState(false)

  const validate = () => {
    const next: typeof errors = {}
    if (!fullName.trim()) next.fullName = '이름을 입력해주세요.'
    if (!phoneNumber) {
      next.phoneNumber = '전화번호를 입력해주세요.'
    } else if (!isValidPhoneNumber(phoneNumber)) {
      next.phoneNumber = '유효하지 않은 전화번호 형식입니다.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async () => {
    if (!validate() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await api.verifyOrder({
        fullName: fullName.trim(),
        phoneNumber,
        orderId,
      })
      const { verified, cancelled, details } = response
      if (verified && !cancelled) {
        orderStore.setOrders(details || [])
        router.push({ pathname: '/details/[orderId]', params: { orderId: orderIdParam } })
      } else if (verified && cancelled) {
        setIsCancelledOrderVisible(true)
      } else {
        setIsAlertVisible(true)
      }
    } catch (error) {
      console.error(error)
      setIsServerErrorVisible(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FlowScreen>
      <NStepProgress step={1} total={4} label="본인 확인" />

      <View style={styles.heading}>
        <NPageHeading
          eyebrow="eSIM QR 코드 발급"
          title={'주문하신 분이\n맞는지 확인할게요'}
          description={'주문 시 입력하신 이름과 전화번호를\n그대로 입력해 주세요.'}
        />
      </View>

      <View style={styles.chip}>
        <NInfoChip label="주문번호" value={String(orderId)} />
      </View>

      <View style={styles.form}>
        <NInput
          label="이름"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          autoCapitalize="none"
          returnKeyType="next"
        />
        <View style={styles.field}>
          <NInput
            label="전화번호"
            value={phoneNumber}
            onChangeText={(t) => setPhoneNumber(formatPhoneNumber(t))}
            error={errors.phoneNumber}
            keyboardType="phone-pad"
            maxLength={13}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </View>
      </View>

      <View style={styles.note}>
        <NTrustNote>
          {'본인 확인은 주문자와 동일한지 검증하기 위한 용도예요.\n입력한 정보는 안전하게 처리되며, 발급 외 다른 목적으로 사용하지 않아요.'}
        </NTrustNote>
      </View>

      <FlowSpacer />

      <View style={styles.cta}>
        <NButton variant="primary" size="xl" fullWidth disabled={isSubmitting} onPress={onSubmit}>
          주문 확인하기
        </NButton>
      </View>

      <NLoaderDialog
        visible={isSubmitting}
        title="주문을 확인하고 있어요"
        description="잠시만 기다려주세요…"
      />

      <NAlertDialog
        visible={isAlertVisible}
        title="주문번호와 일치하지 않아요"
        color="warning"
        closable={false}
        actions={
          <NButton variant="primary" fullWidth onPress={() => setIsAlertVisible(false)}>
            다시 입력하기
          </NButton>
        }
      >
        {'주문 시 입력하신 이름과 전화번호를\n다시 한 번 확인해 주세요.'}
      </NAlertDialog>

      <NAlertDialog
        visible={isCancelledOrderVisible}
        title="이미 취소된 주문이에요"
        color="warning"
        closable={false}
        actions={
          <NButton variant="primary" fullWidth onPress={() => setIsCancelledOrderVisible(false)}>
            확인
          </NButton>
        }
      >
        {'취소된 주문은 발급할 수 없어요.\n스마트스토어에서 새로 주문해 주세요.'}
      </NAlertDialog>

      <NAlertDialog
        visible={isServerErrorVisible}
        title="잠시 후 다시 시도해 주세요"
        color="error"
        closable={false}
        actions={
          <NButton variant="primary" fullWidth onPress={() => setIsServerErrorVisible(false)}>
            확인
          </NButton>
        }
      >
        {'서버에 일시적인 문제가 발생했어요.\n잠시 후 다시 시도해 주세요.'}
      </NAlertDialog>
    </FlowScreen>
  )
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 28,
  },
  chip: {
    marginTop: 18,
  },
  form: {
    marginTop: 28,
  },
  field: {
    marginTop: 12,
  },
  note: {
    marginTop: 28,
  },
  cta: {
    paddingTop: 32,
  },
})
