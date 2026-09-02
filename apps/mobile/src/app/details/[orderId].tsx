import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import {
  NAlertDialog,
  NButton,
  NCard,
  NInfoChip,
  NLoaderDialog,
  NPageHeading,
  NStatusPill,
  NStepProgress,
} from '@imjohnkoo/design-mobile'

import { FlowScreen } from '@/components/flow-screen'
import { api } from '@/lib/api'
import { formatDateString } from '@/lib/date'
import { useOrderStore } from '@/lib/order-store'

export default function DetailsScreen() {
  const router = useRouter()
  const { orderId: orderIdParam } = useLocalSearchParams<{ orderId: string }>()
  const orderId = Number(orderIdParam)
  const orderStore = useOrderStore()

  const [isNoOrderAlertVisible, setIsNoOrderAlertVisible] = useState(false)
  const [isCancelledOrderVisible, setIsCancelledOrderVisible] = useState(false)
  const [isLoadingVisible, setIsLoadingVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const backToVerify = (
    hideDialog: () => void,
    delay: number,
  ) => {
    timers.current.push(
      setTimeout(() => {
        hideDialog()
        router.replace({ pathname: '/verify/[orderId]', params: { orderId: orderIdParam } })
      }, delay),
    )
  }

  useEffect(() => {
    if (!orderStore.orders || orderStore.orders.length === 0) {
      setIsNoOrderAlertVisible(true)
      backToVerify(() => setIsNoOrderAlertVisible(false), 3000)
    }
    // 최초 진입 가드 — client details 페이지 onMounted 와 동일 정책
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectOrder = async (idx: number) => {
    const orders = orderStore.orders
    if (!orders || !orders[idx]) {
      setIsNoOrderAlertVisible(true)
      backToVerify(() => setIsNoOrderAlertVisible(false), 3000)
      return
    }

    setIsLoadingVisible(true)
    try {
      // store 의 수신자 정보로 재검증 — DB 원본값이라 서버 대조 통과
      const response = await api.verifyOrder({
        orderId,
        phoneNumber: orders[idx].receiverPhoneNumber || '',
        fullName: orders[idx].receiverName || '',
      })
      const { verified, cancelled, details } = response

      if (verified && !cancelled) {
        orderStore.setOrders(details || [])
        orderStore.setSingleOrder(details?.[idx] || orders[idx])
        setIsLoadingVisible(false)
        if (orders[idx].esims && orders[idx].esims.length > 0) {
          router.push({ pathname: '/view/[orderId]', params: { orderId: orderIdParam } })
        } else {
          router.push({ pathname: '/select-date/[orderId]', params: { orderId: orderIdParam } })
        }
      } else if (verified && cancelled) {
        setIsLoadingVisible(false)
        setIsCancelledOrderVisible(true)
        backToVerify(() => setIsCancelledOrderVisible(false), 2000)
      } else {
        setIsLoadingVisible(false)
        setIsNoOrderAlertVisible(true)
        backToVerify(() => setIsNoOrderAlertVisible(false), 2000)
      }
    } catch (error) {
      console.error(error)
      setIsLoadingVisible(false)
      setIsNoOrderAlertVisible(true)
      backToVerify(() => setIsNoOrderAlertVisible(false), 2000)
    }
  }

  return (
    <FlowScreen>
      <NStepProgress step={2} total={4} label="이심 선택" />

      <View style={styles.heading}>
        <NPageHeading
          eyebrow="eSIM QR 코드 발급"
          title={'발행할 이심을\n선택해 주세요'}
          description={'주문하신 상품이 여러 개라면\n발급할 항목을 골라 주세요.'}
        />
      </View>

      <View style={styles.chip}>
        <NInfoChip label="주문번호" value={String(orderId)} />
      </View>

      {orderStore.orders && orderStore.orders.length > 0 ? (
        <View style={styles.list}>
          {orderStore.orders.map((order, index) => {
            const issued = order.esims && order.esims.length > 0
            return (
              <NCard key={order.productOrderId} variant="outlined" padding="lg">
                <View style={styles.cardHead}>
                  {issued ? (
                    <NStatusPill color="info" dot>
                      발급완료
                    </NStatusPill>
                  ) : (
                    <NStatusPill color="success" dot>
                      주문완료
                    </NStatusPill>
                  )}
                  <Text style={styles.date}>{formatDateString(order.placeOrderDate)}</Text>
                </View>

                <Text style={styles.plan}>{order.planNameKr}</Text>
                <Text style={styles.meta}>
                  {order.planDataTypeKr} · {order.planDataLimitKr} · {order.planDataDuration}일
                </Text>

                <View style={styles.countries}>
                  {order.planCountriesKr.map((country, countryIndex) => (
                    <View key={countryIndex} style={styles.country}>
                      <Text style={styles.countryText}>{country}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.qty}>
                  <Text style={styles.qtyLabel}>수량</Text>
                  <Text style={styles.qtyValue}>{order.quantity}개</Text>
                </View>

                <View style={styles.action}>
                  <NButton
                    variant={issued ? 'secondary' : 'primary'}
                    size="lg"
                    fullWidth
                    onPress={() => handleSelectOrder(index)}
                  >
                    {issued ? '설치 정보 보기' : '선택하기'}
                  </NButton>
                </View>
              </NCard>
            )
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>주문 정보를 불러오는 중이에요…</Text>
        </View>
      )}

      <NLoaderDialog
        visible={isLoadingVisible}
        title="이심을 준비하고 있어요"
        description="잠시만 기다려주세요…"
      />

      <NAlertDialog
        visible={isNoOrderAlertVisible}
        title="주문 정보를 찾을 수 없어요"
        color="warning"
        closable={false}
      >
        {'주문번호를 다시 확인해 주세요.\n본인 확인 페이지로 돌아갈게요.'}
      </NAlertDialog>

      <NAlertDialog
        visible={isCancelledOrderVisible}
        title="이미 취소된 주문이에요"
        color="warning"
        closable={false}
      >
        {'취소된 주문은 발급할 수 없어요.\n본인 확인 페이지로 돌아갈게요.'}
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
  list: {
    marginTop: 28,
    gap: 14,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
  },
  plan: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 24,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748b',
  },
  countries: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  country: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  countryText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
  },
  qty: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  qtyLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  action: {
    marginTop: 16,
  },
  empty: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
})
