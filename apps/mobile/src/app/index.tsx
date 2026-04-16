import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

const SAMPLE_LPA = 'LPA:1$smdp.maya.net$DEMO-ACTIVATION-CODE'

function buildAppleUniversalLink(activationCode: string): string {
  const encoded = encodeURIComponent(activationCode)
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encoded}`
}

export default function Index() {
  const url = buildAppleUniversalLink(SAMPLE_LPA)

  async function handleInstallPress() {
    try {
      await Linking.openURL(url)
    } catch (err) {
      console.warn('Failed to open eSIM universal link', err)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>nomacom-mobile</Text>
        <Text style={styles.subtitle}>Expo SDK 55 dev server running</Text>
        <Text style={styles.meta}>Platform: {Platform.OS}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>eSIM install (iOS 17.4+)</Text>
        <Text style={styles.sectionBody}>
          Tapping the button below opens Apple&apos;s native eSIM install sheet via Universal
          Link. Works on iOS 17.4+. On other platforms the URL will not resolve.
        </Text>

        <Pressable style={styles.button} onPress={handleInstallPress}>
          <Text style={styles.buttonText}>Install demo eSIM</Text>
        </Pressable>

        <Text style={styles.debug} numberOfLines={2}>
          {url}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
})
