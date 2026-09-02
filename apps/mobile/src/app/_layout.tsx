import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { OrderProvider } from '@/lib/order-store'

export default function RootLayout() {
  return (
    <OrderProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </OrderProvider>
  )
}
