import { useEffect, useState } from 'react'
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'

import {
  NButton,
  NCard,
  NCodeRow,
  NInfoChip,
  NLinkCard,
  NPageHeading,
  NStatusPill,
  NStepProgress,
  NTrustNote,
} from '@imjohnkoo/design-mobile'

import { FlowScreen } from '@/components/flow-screen'
import { buildAppleUniversalLink } from '@/lib/esim'
import { useOrderStore } from '@/lib/order-store'
import type { Esim } from '@/lib/types'

const GUIDE_URL = 'https://esimmany.super.site'

const copyToClipboard = (value: string) => {
  void Clipboard.setStringAsync(value)
}

function EsimInstallBody({ esim }: { esim: Esim }) {
  const isIos = Platform.OS === 'ios'

  const openInstallLink = () => {
    Linking.openURL(buildAppleUniversalLink(esim.activationCode)).catch((err) =>
      console.warn('Failed to open eSIM universal link', err),
    )
  }

  return (
    <View>
      {isIos ? (
        <>
          <View style={styles.installCta}>
            <NButton variant="primary" size="xl" fullWidth onPress={openInstallLink}>
              eSIM 설치하기
            </NButton>
            <Text style={styles.installHint}>
              iOS 17.4 이상에서 Apple 설치 화면이 바로 열려요.{'\n'}설치가 안 되면 아래 수동 설치
              코드를 이용해 주세요.
            </Text>
          </View>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionDividerText}>수동 설치 (설정 → 셀룰러 → eSIM 추가)</Text>
          </View>
          <NCodeRow label="SM-DP+ 주소" value={esim.smdpAddress} onCopy={copyToClipboard} />
          <NCodeRow label="활성화 코드" value={esim.manualCode} onCopy={copyToClipboard} />

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionDividerText}>다른 기기 (안드로이드) 에 설치하려면</Text>
          </View>
          <NCodeRow label="LPA 전체" value={esim.activationCode} onCopy={copyToClipboard} />
        </>
      ) : (
        <>
          <Text style={styles.androidGuide}>
            설정 → 연결 → SIM 관리자 → <Text style={styles.androidGuideStrong}>eSIM 추가</Text>{' '}
            에서 아래 코드를 입력해 주세요. (기기에 따라 메뉴 이름이 조금 다를 수 있어요)
          </Text>
          <NCodeRow label="SM-DP+ 주소" value={esim.smdpAddress} onCopy={copyToClipboard} />
          <NCodeRow label="활성화 코드" value={esim.manualCode} onCopy={copyToClipboard} />
          <NCodeRow label="LPA 전체" value={esim.activationCode} onCopy={copyToClipboard} />

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionDividerText}>다른 기기 (아이폰) 에 설치하려면</Text>
          </View>
          <Text style={styles.androidGuide}>
            아이폰 (iOS 17.4+) 의 Safari 에서 설치 링크를 열면 Apple 설치 화면이 바로 열려요. 아래
            버튼으로 링크를 복사해 전달해 주세요.
          </Text>
          <NCodeRow
            label="아이폰 설치 링크"
            value={buildAppleUniversalLink(esim.activationCode)}
            onCopy={copyToClipboard}
          />
        </>
      )}
    </View>
  )
}

export default function ViewScreen() {
  const router = useRouter()
  const { orderId: orderIdParam } = useLocalSearchParams<{ orderId: string }>()
  const orderId = Number(orderIdParam)
  const orderStore = useOrderStore()

  const order = orderStore.singleOrder
  const esims = order?.esims ?? []
  // 다발 발급 케이스: 2개 이상이면 accordion 으로 1번만 펼쳐서 시작
  const isMulti = esims.length >= 2
  const [openIdx, setOpenIdx] = useState(0)

  useEffect(() => {
    if (!order) {
      router.replace({ pathname: '/verify/[orderId]', params: { orderId: orderIdParam } })
    }
    // 최초 진입 가드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goHome = () => {
    orderStore.reset()
    router.dismissTo('/')
  }

  return (
    <FlowScreen>
      <NStepProgress step={4} total={4} label="발급 완료" />

      <View style={styles.heading}>
        <NPageHeading
          eyebrow="eSIM QR 코드 발급"
          title={'eSIM 발급이\n완료됐어요'}
          description={'아래 버튼으로 바로 설치해 주세요.\n현지 도착 후 데이터 로밍을 켜면 자동으로 연결돼요.'}
        />
      </View>

      {order && (
        <View style={styles.chipRow}>
          <NInfoChip label="주문번호" value={String(orderId)} />
          <NInfoChip value={order.planNameKr} />
        </View>
      )}

      {order && esims.length > 0 ? (
        <>
          {!isMulti ? (
            <View style={styles.single}>
              <NCard variant="outlined" padding="lg">
                <View style={styles.singleHead}>
                  <NStatusPill color="success" dot>
                    발급완료
                  </NStatusPill>
                </View>
                <EsimInstallBody esim={esims[0]} />
              </NCard>
            </View>
          ) : (
            <View style={styles.list}>
              {esims.map((esim, index) => {
                const open = openIdx === index
                return (
                  <View key={index} style={[styles.row, open && styles.rowOpen]}>
                    <TouchableOpacity
                      style={styles.rowHead}
                      onPress={() => setOpenIdx(open ? -1 : index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.rowHeadLeft}>
                        <Text style={styles.rowNum}>eSIM {index + 1}</Text>
                        <NStatusPill color="success" dot>
                          발급완료
                        </NStatusPill>
                      </View>
                      <Text style={[styles.chev, open && styles.chevOpen]}>⌄</Text>
                    </TouchableOpacity>
                    {open && (
                      <View style={styles.rowBody}>
                        <EsimInstallBody esim={esim} />
                        {index > 0 && (
                          <Text style={styles.multiHint}>
                            이 eSIM 을 다른 기기에서 사용하려면 코드를 복사해 전달해 주세요.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )}

          <View style={styles.guides}>
            <NLinkCard
              label="아이폰 설치 가이드"
              sub="iOS · Universal Link 자동 설치"
              onPress={() => Linking.openURL(GUIDE_URL)}
            />
            <NLinkCard
              label="안드로이드 설치 가이드"
              sub="Galaxy · Pixel · 수동 등록"
              onPress={() => Linking.openURL(GUIDE_URL)}
            />
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>주문 정보를 불러오는 중이에요…</Text>
        </View>
      )}

      <View style={styles.notes}>
        <NTrustNote title="사용 일수는 첫 연결 시점부터 24시간 단위로 차감돼요.">
          {'현지에 도착해 처음 회선이 연결된 순간부터 24시간이 지나면 1일이 차감돼요.'}
        </NTrustNote>
        <View style={styles.noteGap} />
        <NTrustNote title="다국가 이심은 자동 로밍으로 그대로 사용할 수 있어요.">
          {'한 번 개통된 다음에는 포함된 국가들을 오가도 추가 설치나 설정 변경 없이 자동으로 연결돼요.'}
        </NTrustNote>
      </View>

      <View style={styles.back}>
        <NButton variant="ghost" size="md" fullWidth onPress={goHome}>
          처음으로
        </NButton>
      </View>
    </FlowScreen>
  )
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 28,
  },
  chipRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  single: {
    marginTop: 24,
  },
  singleHead: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  installCta: {
    marginTop: 12,
  },
  installHint: {
    marginTop: 8,
    fontSize: 11.5,
    lineHeight: 17,
    color: '#94a3b8',
    textAlign: 'center',
  },
  sectionDivider: {
    marginTop: 22,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  sectionDividerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  androidGuide: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#4b5563',
  },
  androidGuideStrong: {
    fontWeight: '700',
    color: '#111827',
  },
  list: {
    marginTop: 24,
    gap: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: '#eef2f7',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  rowOpen: {
    borderColor: '#a78bff',
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  chev: {
    fontSize: 18,
    color: '#94a3b8',
    marginTop: -6,
  },
  chevOpen: {
    color: '#6239ff',
    transform: [{ rotate: '180deg' }],
    marginTop: 6,
  },
  rowBody: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  multiHint: {
    marginTop: 12,
    fontSize: 11.5,
    color: '#94a3b8',
  },
  guides: {
    marginTop: 24,
    gap: 8,
  },
  empty: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  notes: {
    marginTop: 24,
  },
  noteGap: {
    height: 8,
  },
  back: {
    marginTop: 28,
  },
})
