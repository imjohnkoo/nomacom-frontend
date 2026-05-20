import { useState } from 'react'
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { api } from '@/lib/api'
import type { VerifyOrderResponse } from '@/lib/types'

const SAMPLE_LPA = 'LPA:1$smdp.maya.net$DEMO-ACTIVATION-CODE'

function buildAppleUniversalLink(activationCode: string): string {
  const encoded = encodeURIComponent(activationCode)
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encoded}`
}

type VerifyState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: VerifyOrderResponse }
  | { status: 'error'; message: string }

export default function Index() {
  const url = buildAppleUniversalLink(SAMPLE_LPA)
  const [verifyState, setVerifyState] = useState<VerifyState>({ status: 'idle' })

  async function handleInstallPress() {
    try {
      await Linking.openURL(url)
    } catch (err) {
      console.warn('Failed to open eSIM universal link', err)
    }
  }

  async function handleVerifyPress() {
    setVerifyState({ status: 'loading' })
    try {
      const data = await api.verifyOrder({
        orderId: 12345,
        fullName: '테스트',
        phoneNumber: '010-0000-0000',
      })
      setVerifyState({ status: 'success', data })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setVerifyState({ status: 'error', message })
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>nomacom-mobile</Text>
        <Text style={styles.subtitle}>Expo SDK 55 dev server running</Text>
        <Text style={styles.meta}>Platform: {Platform.OS}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>eSIM install (iOS 17.4+)</Text>
        <Text style={styles.sectionBody}>
          Tapping the button below opens Apple&apos;s native eSIM install sheet via Universal Link.
          Works on iOS 17.4+. On other platforms the URL will not resolve.
        </Text>

        <Pressable style={styles.button} onPress={handleInstallPress}>
          <Text style={styles.buttonText}>Install demo eSIM</Text>
        </Pressable>

        <Text style={styles.debug} numberOfLines={2}>
          {url}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test POST /api/v1/verify</Text>
        <Text style={styles.sectionBody}>
          E-4 검증: 같은 Nitro 백엔드로 verify 호출. 응답을 그대로 표시. base URL =
          EXPO_PUBLIC_API_BASE_URL (fallback http://localhost:3000).
        </Text>

        <Pressable
          style={[styles.button, verifyState.status === 'loading' && styles.buttonDisabled]}
          onPress={handleVerifyPress}
          disabled={verifyState.status === 'loading'}
        >
          <Text style={styles.buttonText}>
            {verifyState.status === 'loading' ? 'Calling…' : 'Call verify'}
          </Text>
        </Pressable>

        {verifyState.status === 'success' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>200 OK</Text>
            <Text style={styles.resultBody}>{JSON.stringify(verifyState.data, null, 2)}</Text>
          </View>
        )}

        {verifyState.status === 'error' && (
          <View style={[styles.resultBox, styles.resultBoxError]}>
            <Text style={styles.resultLabel}>error</Text>
            <Text style={styles.resultBody}>{verifyState.message}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: '#f7f7f8',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  meta: {
    marginTop: 12,
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  debug: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  resultBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#ecfeff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  resultBoxError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#155e75',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultBody: {
    fontSize: 11,
    color: '#1f2937',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
})
