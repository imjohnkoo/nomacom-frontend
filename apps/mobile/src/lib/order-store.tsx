/**
 * 주문 상태 store — client Pinia `stores/order.ts` 의 최소 대응물.
 * 화면 5개 규모라 외부 상태 라이브러리 없이 React Context 로 유지.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { Order } from './types'

interface OrderStore {
  orders: Order[] | null
  singleOrder: Order | null
  setOrders: (orders: Order[]) => void
  setSingleOrder: (order: Order) => void
  reset: () => void
}

const OrderContext = createContext<OrderStore | null>(null)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrdersState] = useState<Order[] | null>(null)
  const [singleOrder, setSingleOrderState] = useState<Order | null>(null)

  const setOrders = useCallback((next: Order[]) => setOrdersState(next), [])
  const setSingleOrder = useCallback((next: Order) => setSingleOrderState(next), [])
  const reset = useCallback(() => {
    setOrdersState(null)
    setSingleOrderState(null)
  }, [])

  const value = useMemo(
    () => ({ orders, singleOrder, setOrders, setSingleOrder, reset }),
    [orders, singleOrder, setOrders, setSingleOrder, reset],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrderStore(): OrderStore {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrderStore must be used within OrderProvider')
  return ctx
}
