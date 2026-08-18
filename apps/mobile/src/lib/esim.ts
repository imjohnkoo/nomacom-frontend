/**
 * iOS 17.4+ Apple Universal Link eSIM 설치 URL.
 * MVNO 라 CoreTelephony entitled API 경로는 불가 — Universal Link 가 유일한 자동 설치 경로.
 */
export function buildAppleUniversalLink(activationCode: string): string {
  const encoded = encodeURIComponent(activationCode)
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encoded}`
}
