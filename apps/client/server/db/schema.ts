import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Order table
export const orders = pgTable('order', {
  productOrderId: bigint('product_order_id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }),
  productOrderStatus: varchar('product_order_status', { length: 255 }),
  lastChangedType: varchar('last_changed_type', { length: 255 }),
  paymentDate: timestamp('payment_date'),
  lastChangedDate: timestamp('last_changed_date'),
  claimType: varchar('claim_type', { length: 255 }),
  claimStatus: varchar('claim_status', { length: 255 }),
  receiverAddressChanged: boolean('receiver_address_changed'),

  // Order details
  productName: varchar('product_name', { length: 255 }),
  productOption: varchar('product_option', { length: 255 }),
  placeOrderDate: timestamp('place_order_date'),
  quantity: integer('quantity'),
  totalPaymentAmount: integer('total_payment_amount'),
  sellerProductCode: varchar('seller_product_code', { length: 255 }),
  optionManageCode: varchar('option_manage_code', { length: 255 }),

  // Customer info
  customerName: varchar('customer_name', { length: 255 }),
  customerPhoneNumber: varchar('customer_phone_number', { length: 50 }),
  customerId: varchar('customer_id', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),

  // Receiver info
  receiverName: varchar('receiver_name', { length: 255 }),
  receiverPhoneNumber: varchar('receiver_phone_number', { length: 50 }),

  // Cancel info
  cancelApprovalDate: timestamp('cancel_approval_date'),
  cancelCompletedDate: timestamp('cancel_completed_date'),
  cancelClaimRequestDate: timestamp('cancel_claim_request_date'),
  refundStandbyStatus: varchar('refund_standby_status', { length: 255 }),
  cancelReason: varchar('cancel_reason', { length: 255 }),

  // Return info
  returnClaimRequestDate: timestamp('return_claim_request_date'),
  returnClaimStatus: varchar('return_claim_status', { length: 255 }),
  returnDetailedReason: text('return_detailed_reason'),
  returnReason: varchar('return_reason', { length: 255 }),
  returnCompletedDate: timestamp('return_completed_date'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// eSIM table
export const esims = pgTable('esim', {
  esimId: varchar('esim_id', { length: 255 }).primaryKey(),
  apn: varchar('apn', { length: 255 }),
  tag: varchar('tag', { length: 255 }),
  uid: varchar('uid', { length: 255 }),
  iccid: varchar('iccid', { length: 255 }),
  state: varchar('state', { length: 100 }),
  autoApn: varchar('auto_apn', { length: 255 }),
  manualCode: varchar('manual_code', { length: 255 }),
  smdpAddress: varchar('smdp_address', { length: 255 }),
  dateAssigned: timestamp('date_assigned'),
  networkStatus: varchar('network_status', { length: 100 }),
  serviceStatus: varchar('service_status', { length: 100 }),
  activationCode: text('activation_code'),

  // Foreign key
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.productOrderId),
});

// Plan Type table
export const planTypes = pgTable('plan-type', {
  planTypeId: varchar('plan_type_id', { length: 255 }).primaryKey(),
  planCode: varchar('plan_code', { length: 100 }),
  dataCode: varchar('data_code', { length: 100 }),
  durationCode: varchar('duration_code', { length: 100 }),
  version: varchar('version', { length: 50 }),

  // Display names
  planNameKr: varchar('plan_name_kr', { length: 255 }),
  planDataTypeKr: varchar('plan_data_type_kr', { length: 255 }),
  planDataLimitKr: varchar('plan_data_limit_kr', { length: 255 }),
  planNameEng: varchar('plan_name_eng', { length: 255 }),
  planDataTypeEng: varchar('plan_data_type_eng', { length: 255 }),
  planDataLimitEng: varchar('plan_data_limit_eng', { length: 255 }),

  planDataDuration: integer('plan_data_duration'),
  planCountriesKr: text('plan_countries_kr').array(),
  planCountriesEng: text('plan_countries_eng').array(),
  planCountriesIso: text('plan_countries_iso').array(),
  timeZones: text('time_zones').array(),

  // Maya API fields
  uid: varchar('uid', { length: 255 }),
  name: varchar('name', { length: 255 }),
  policyId: integer('policy_id'),
  policyName: varchar('policy_name', { length: 255 }),
  dataQuotaMb: integer('data_quota_mb'),
  validityDays: integer('validity_days'),
  countriesEnabled: text('countries_enabled').array(),
});

// Plan table
export const plans = pgTable('plan', {
  planId: serial('plan_id').primaryKey(),
  id: varchar('id', { length: 255 }),
  isActivated: boolean('is_activated'),
  activatedAt: timestamp('activated_at'),
  timeToBeActivatedInUTC: timestamp('time_to_be_activated_in_utc'),
  timeToBeActivatedInLocal: timestamp('time_to_be_activated_in_local'),

  // User entered values
  startDateEntered: varchar('start_date_entered', { length: 50 }),
  startTimeEntered: integer('start_time_entered'),
  startTimeZoneEntered: varchar('start_time_zone_entered', { length: 100 }),
  startCountryEntered: varchar('start_country_entered', { length: 100 }),

  // Actual times
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),

  // Status
  networkStatus: varchar('network_status', { length: 100 }),
  dataQuotaBytes: bigint('data_quota_bytes', { mode: 'number' }),
  dataBytesRemaining: bigint('data_bytes_remaining', { mode: 'number' }),
  countriesEnabled: text('countries_enabled').array(),

  // Foreign keys
  esimId: varchar('esim_id', { length: 255 }).references(() => esims.esimId),
  planTypeId: varchar('plan_type_id', { length: 255 }).references(() => planTypes.planTypeId),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  esims: many(esims),
}));

export const esimsRelations = relations(esims, ({ one, many }) => ({
  order: one(orders, {
    fields: [esims.orderId],
    references: [orders.productOrderId],
  }),
  plans: many(plans),
}));

export const planTypesRelations = relations(planTypes, ({ many }) => ({
  plans: many(plans),
}));

export const plansRelations = relations(plans, ({ one }) => ({
  esim: one(esims, {
    fields: [plans.esimId],
    references: [esims.esimId],
  }),
  planType: one(planTypes, {
    fields: [plans.planTypeId],
    references: [planTypes.planTypeId],
  }),
}));

// Types
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Esim = typeof esims.$inferSelect;
export type NewEsim = typeof esims.$inferInsert;
export type PlanType = typeof planTypes.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
