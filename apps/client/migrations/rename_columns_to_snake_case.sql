-- Migration: Rename camelCase columns to snake_case
-- Target: All tables (order, esim, plan-type, plan)

BEGIN;

-- =============================================
-- Table: "order"
-- =============================================
ALTER TABLE "order" RENAME COLUMN "productOrderId" TO "product_order_id";
ALTER TABLE "order" RENAME COLUMN "orderId" TO "order_id";
ALTER TABLE "order" RENAME COLUMN "productOrderStatus" TO "product_order_status";
ALTER TABLE "order" RENAME COLUMN "lastChangedType" TO "last_changed_type";
ALTER TABLE "order" RENAME COLUMN "paymentDate" TO "payment_date";
ALTER TABLE "order" RENAME COLUMN "lastChangedDate" TO "last_changed_date";
ALTER TABLE "order" RENAME COLUMN "claimType" TO "claim_type";
ALTER TABLE "order" RENAME COLUMN "claimStatus" TO "claim_status";
ALTER TABLE "order" RENAME COLUMN "receiverAddressChanged" TO "receiver_address_changed";
ALTER TABLE "order" RENAME COLUMN "productName" TO "product_name";
ALTER TABLE "order" RENAME COLUMN "productOption" TO "product_option";
ALTER TABLE "order" RENAME COLUMN "placeOrderDate" TO "place_order_date";
-- "quantity" is already single word, no rename needed
ALTER TABLE "order" RENAME COLUMN "totalPaymentAmount" TO "total_payment_amount";
ALTER TABLE "order" RENAME COLUMN "sellerProductCode" TO "seller_product_code";
ALTER TABLE "order" RENAME COLUMN "optionManageCode" TO "option_manage_code";
ALTER TABLE "order" RENAME COLUMN "customerName" TO "customer_name";
ALTER TABLE "order" RENAME COLUMN "customerPhoneNumber" TO "customer_phone_number";
ALTER TABLE "order" RENAME COLUMN "customerId" TO "customer_id";
ALTER TABLE "order" RENAME COLUMN "customerEmail" TO "customer_email";
ALTER TABLE "order" RENAME COLUMN "receiverName" TO "receiver_name";
ALTER TABLE "order" RENAME COLUMN "receiverPhoneNumber" TO "receiver_phone_number";
ALTER TABLE "order" RENAME COLUMN "cancelApprovalDate" TO "cancel_approval_date";
ALTER TABLE "order" RENAME COLUMN "cancelCompletedDate" TO "cancel_completed_date";
ALTER TABLE "order" RENAME COLUMN "cancelClaimRequestDate" TO "cancel_claim_request_date";
ALTER TABLE "order" RENAME COLUMN "refundStandbyStatus" TO "refund_standby_status";
ALTER TABLE "order" RENAME COLUMN "cancelReason" TO "cancel_reason";
ALTER TABLE "order" RENAME COLUMN "returnClaimRequestDate" TO "return_claim_request_date";
ALTER TABLE "order" RENAME COLUMN "returnClaimStatus" TO "return_claim_status";
ALTER TABLE "order" RENAME COLUMN "returnDetailedReason" TO "return_detailed_reason";
ALTER TABLE "order" RENAME COLUMN "returnReason" TO "return_reason";
ALTER TABLE "order" RENAME COLUMN "returnCompletedDate" TO "return_completed_date";
ALTER TABLE "order" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "order" RENAME COLUMN "updatedAt" TO "updated_at";

-- =============================================
-- Table: "esim"
-- =============================================
ALTER TABLE "esim" RENAME COLUMN "esimId" TO "esim_id";
-- "apn", "tag", "uid", "iccid", "state" are already single words
ALTER TABLE "esim" RENAME COLUMN "autoApn" TO "auto_apn";
ALTER TABLE "esim" RENAME COLUMN "manualCode" TO "manual_code";
ALTER TABLE "esim" RENAME COLUMN "smdpAddress" TO "smdp_address";
ALTER TABLE "esim" RENAME COLUMN "dateAssigned" TO "date_assigned";
ALTER TABLE "esim" RENAME COLUMN "networkStatus" TO "network_status";
ALTER TABLE "esim" RENAME COLUMN "serviceStatus" TO "service_status";
ALTER TABLE "esim" RENAME COLUMN "activationCode" TO "activation_code";
-- "orderProductOrderId" → "order_id" already applied

-- =============================================
-- Table: "plan-type"
-- =============================================
ALTER TABLE "plan-type" RENAME COLUMN "planTypeId" TO "plan_type_id";
ALTER TABLE "plan-type" RENAME COLUMN "planCode" TO "plan_code";
ALTER TABLE "plan-type" RENAME COLUMN "dataCode" TO "data_code";
ALTER TABLE "plan-type" RENAME COLUMN "durationCode" TO "duration_code";
-- "version", "uid", "name" are already single words
ALTER TABLE "plan-type" RENAME COLUMN "planNameKr" TO "plan_name_kr";
ALTER TABLE "plan-type" RENAME COLUMN "planDataTypeKr" TO "plan_data_type_kr";
ALTER TABLE "plan-type" RENAME COLUMN "planDataLimitKr" TO "plan_data_limit_kr";
ALTER TABLE "plan-type" RENAME COLUMN "planNameEng" TO "plan_name_eng";
ALTER TABLE "plan-type" RENAME COLUMN "planDataTypeEng" TO "plan_data_type_eng";
ALTER TABLE "plan-type" RENAME COLUMN "planDataLimitEng" TO "plan_data_limit_eng";
ALTER TABLE "plan-type" RENAME COLUMN "planDataDuration" TO "plan_data_duration";
ALTER TABLE "plan-type" RENAME COLUMN "planCountriesKr" TO "plan_countries_kr";
ALTER TABLE "plan-type" RENAME COLUMN "planCountriesEng" TO "plan_countries_eng";
ALTER TABLE "plan-type" RENAME COLUMN "planCountriesIso" TO "plan_countries_iso";
ALTER TABLE "plan-type" RENAME COLUMN "timeZones" TO "time_zones";
ALTER TABLE "plan-type" RENAME COLUMN "policyId" TO "policy_id";
ALTER TABLE "plan-type" RENAME COLUMN "policyName" TO "policy_name";
ALTER TABLE "plan-type" RENAME COLUMN "dataQuotaMb" TO "data_quota_mb";
ALTER TABLE "plan-type" RENAME COLUMN "validityDays" TO "validity_days";
ALTER TABLE "plan-type" RENAME COLUMN "countriesEnabled" TO "countries_enabled";

-- =============================================
-- Table: "plan"
-- =============================================
ALTER TABLE "plan" RENAME COLUMN "planId" TO "plan_id";
-- "id" is already single word
ALTER TABLE "plan" RENAME COLUMN "isActivated" TO "is_activated";
ALTER TABLE "plan" RENAME COLUMN "activatedAt" TO "activated_at";
ALTER TABLE "plan" RENAME COLUMN "timeToBeActivatedInUTC" TO "time_to_be_activated_in_utc";
ALTER TABLE "plan" RENAME COLUMN "timeToBeActivatedInLocal" TO "time_to_be_activated_in_local";
ALTER TABLE "plan" RENAME COLUMN "startDateEntered" TO "start_date_entered";
ALTER TABLE "plan" RENAME COLUMN "startTimeEntered" TO "start_time_entered";
ALTER TABLE "plan" RENAME COLUMN "startTimeZoneEntered" TO "start_time_zone_entered";
ALTER TABLE "plan" RENAME COLUMN "startCountryEntered" TO "start_country_entered";
ALTER TABLE "plan" RENAME COLUMN "startTime" TO "start_time";
ALTER TABLE "plan" RENAME COLUMN "endTime" TO "end_time";
ALTER TABLE "plan" RENAME COLUMN "networkStatus" TO "network_status";
ALTER TABLE "plan" RENAME COLUMN "dataQuotaBytes" TO "data_quota_bytes";
ALTER TABLE "plan" RENAME COLUMN "dataBytesRemaining" TO "data_bytes_remaining";
ALTER TABLE "plan" RENAME COLUMN "countriesEnabled" TO "countries_enabled";
ALTER TABLE "plan" RENAME COLUMN "esimId" TO "esim_id";
ALTER TABLE "plan" RENAME COLUMN "planTypeId" TO "plan_type_id";
ALTER TABLE "plan" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "plan" RENAME COLUMN "updatedAt" TO "updated_at";

COMMIT;
