import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
  serial,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// prod DB 는 TypeORM 기본 naming (camelCase 컬럼). backend (NestJS) 와 schema 공유.
// 표 이름: `order`, `esim`, `plan`, `plan-type` (plan-type 는 hyphen)

export const orders = pgTable('order', {
  productOrderId: bigint('productOrderId', { mode: 'number' }).primaryKey(),
  orderId: bigint('orderId', { mode: 'number' }),
  productOrderStatus: varchar('productOrderStatus', { length: 255 }),
  lastChangedType: varchar('lastChangedType', { length: 255 }),
  paymentDate: timestamp('paymentDate'),
  lastChangedDate: timestamp('lastChangedDate'),
  claimType: varchar('claimType', { length: 255 }),
  claimStatus: varchar('claimStatus', { length: 255 }),
  receiverAddressChanged: boolean('receiverAddressChanged'),

  productName: varchar('productName', { length: 255 }),
  productOption: varchar('productOption', { length: 255 }),
  placeOrderDate: timestamp('placeOrderDate'),
  quantity: integer('quantity'),
  totalPaymentAmount: integer('totalPaymentAmount'),
  sellerProductCode: varchar('sellerProductCode', { length: 255 }),
  optionManageCode: varchar('optionManageCode', { length: 255 }),

  customerName: varchar('customerName', { length: 255 }),
  customerPhoneNumber: varchar('customerPhoneNumber', { length: 50 }),
  customerId: varchar('customerId', { length: 255 }),
  customerEmail: varchar('customerEmail', { length: 255 }),

  receiverName: varchar('receiverName', { length: 255 }),
  receiverPhoneNumber: varchar('receiverPhoneNumber', { length: 50 }),

  cancelApprovalDate: timestamp('cancelApprovalDate'),
  cancelCompletedDate: timestamp('cancelCompletedDate'),
  cancelClaimRequestDate: timestamp('cancelClaimRequestDate'),
  refundStandbyStatus: varchar('refundStandbyStatus', { length: 255 }),
  cancelReason: varchar('cancelReason', { length: 255 }),

  returnClaimRequestDate: timestamp('returnClaimRequestDate'),
  returnClaimStatus: varchar('returnClaimStatus', { length: 255 }),
  returnDetailedReason: text('returnDetailedReason'),
  returnReason: varchar('returnReason', { length: 255 }),
  returnCompletedDate: timestamp('returnCompletedDate'),

  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const esims = pgTable('esim', {
  esimId: varchar('esimId', { length: 255 }).primaryKey(),
  apn: varchar('apn', { length: 255 }),
  tag: varchar('tag', { length: 255 }),
  uid: varchar('uid', { length: 255 }),
  iccid: varchar('iccid', { length: 255 }),
  state: varchar('state', { length: 100 }),
  autoApn: varchar('autoApn', { length: 255 }),
  manualCode: varchar('manualCode', { length: 255 }),
  smdpAddress: varchar('smdpAddress', { length: 255 }),
  dateAssigned: timestamp('dateAssigned'),
  networkStatus: varchar('networkStatus', { length: 100 }),
  serviceStatus: varchar('serviceStatus', { length: 100 }),
  activationCode: text('activationCode'),

  // TypeORM 기본 ManyToOne FK naming: `{relation}{ReferencedPK}` → `orderProductOrderId`
  orderId: bigint('orderProductOrderId', { mode: 'number' }).references(
    () => orders.productOrderId,
  ),
})

export const planTypes = pgTable('plan-type', {
  planTypeId: varchar('planTypeId', { length: 255 }).primaryKey(),
  planCode: varchar('planCode', { length: 100 }),
  dataCode: varchar('dataCode', { length: 100 }),
  durationCode: varchar('durationCode', { length: 100 }),
  version: varchar('version', { length: 50 }),

  planNameKr: varchar('planNameKr', { length: 255 }),
  planDataTypeKr: varchar('planDataTypeKr', { length: 255 }),
  planDataLimitKr: varchar('planDataLimitKr', { length: 255 }),
  planNameEng: varchar('planNameEng', { length: 255 }),
  planDataTypeEng: varchar('planDataTypeEng', { length: 255 }),
  planDataLimitEng: varchar('planDataLimitEng', { length: 255 }),

  planDataDuration: integer('planDataDuration'),
  planCountriesKr: text('planCountriesKr').array(),
  planCountriesEng: text('planCountriesEng').array(),
  planCountriesIso: text('planCountriesIso').array(),
  timeZones: text('timeZones').array(),

  uid: varchar('uid', { length: 255 }),
  name: varchar('name', { length: 255 }),
  policyId: integer('policyId'),
  policyName: varchar('policyName', { length: 255 }),
  dataQuotaMb: integer('dataQuotaMb'),
  validityDays: integer('validityDays'),
  countriesEnabled: text('countriesEnabled').array(),
})

export const plans = pgTable('plan', {
  planId: serial('planId').primaryKey(),
  id: varchar('id', { length: 255 }),
  isActivated: boolean('isActivated'),
  activatedAt: timestamp('activatedAt'),
  timeToBeActivatedInUTC: timestamp('timeToBeActivatedInUTC'),
  timeToBeActivatedInLocal: timestamp('timeToBeActivatedInLocal'),

  startDateEntered: varchar('startDateEntered', { length: 50 }),
  startTimeEntered: integer('startTimeEntered'),
  startTimeZoneEntered: varchar('startTimeZoneEntered', { length: 100 }),
  startCountryEntered: varchar('startCountryEntered', { length: 100 }),

  startTime: timestamp('startTime'),
  endTime: timestamp('endTime'),

  networkStatus: varchar('networkStatus', { length: 100 }),
  dataQuotaBytes: bigint('dataQuotaBytes', { mode: 'number' }),
  dataBytesRemaining: bigint('dataBytesRemaining', { mode: 'number' }),
  countriesEnabled: text('countriesEnabled').array(),

  // TypeORM 기본 FK naming
  esimId: varchar('esimEsimId', { length: 255 }).references(() => esims.esimId),
  planTypeId: varchar('planTypePlanTypeId', { length: 255 }).references(() => planTypes.planTypeId),

  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const ordersRelations = relations(orders, ({ many }) => ({
  esims: many(esims),
}))

export const esimsRelations = relations(esims, ({ one, many }) => ({
  order: one(orders, {
    fields: [esims.orderId],
    references: [orders.productOrderId],
  }),
  plans: many(plans),
}))

export const planTypesRelations = relations(planTypes, ({ many }) => ({
  plans: many(plans),
}))

export const plansRelations = relations(plans, ({ one }) => ({
  esim: one(esims, {
    fields: [plans.esimId],
    references: [esims.esimId],
  }),
  planType: one(planTypes, {
    fields: [plans.planTypeId],
    references: [planTypes.planTypeId],
  }),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type Esim = typeof esims.$inferSelect
export type NewEsim = typeof esims.$inferInsert
export type PlanType = typeof planTypes.$inferSelect
export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert
