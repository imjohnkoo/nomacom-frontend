<template>
  <div>
    <h2 class="page-title">Orders</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>상품주문번호</th>
            <th>상태</th>
            <th>상품명</th>
            <th>주문자</th>
            <th>결제금액</th>
            <th>결제일</th>
            <th>생성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="8" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="8" class="empty">No orders found</td>
          </tr>
          <tr v-for="order in data" :key="order.productOrderId">
            <td>{{ order.orderId }}</td>
            <td>{{ order.productOrderId }}</td>
            <td>
              <span class="badge" :class="statusClass(order.productOrderStatus)">
                {{ order.productOrderStatus }}
              </span>
            </td>
            <td>{{ order.productName }}</td>
            <td>{{ order.customerName }}</td>
            <td>{{ order.totalPaymentAmount?.toLocaleString() }}원</td>
            <td>{{ formatDate(order.paymentDate) }}</td>
            <td>{{ formatDate(order.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/esim/orders')

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

function statusClass(s: string | null) {
  if (!s) return ''
  const map: Record<string, string> = {
    PAYED: 'status-paid',
    DELIVERED: 'status-delivered',
    CANCELED: 'status-canceled',
    RETURNED: 'status-returned',
    EXCHANGED: 'status-exchanged',
  }
  return map[s] || 'status-default'
}
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: #1a1a2e;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f0f0f0;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-paid { background: #dbeafe; color: #2563eb; }
.status-delivered { background: #f0fdf4; color: #16a34a; }
.status-canceled { background: #fee2e2; color: #dc2626; }
.status-returned { background: #fef3c7; color: #d97706; }
.status-exchanged { background: #ede9fe; color: #7c3aed; }
.status-default { background: #f3f4f6; color: #6b7280; }
</style>
