import { z } from 'zod';

/**
 * Schema for SMS charge in the internal format
 */
export const smsChargeSchema = z.object({
  message_id: z.string(),
  timestamp: z.string(),
  amount: z.number(),
  currency: z.string()
});

/**
 * Schema for data usage in the internal format
 */
export const usageDataSchema = z.object({
  total_mb: z.number(),
  roaming_mb: z.number(),
  country: z.string(),
  network_type: z.string(),
  provider_code: z.string()
});

/**
 * Schema for billing period in the internal format
 */
export const billingPeriodSchema = z.object({
  start: z.string(),
  end: z.string()
});

/**
 * Schema for the complete internal normalized format
 */
export const internalFormatSchema = z.object({
  telgea_user_id: z.string(),
  msisdn: z.string(),
  usage_data: usageDataSchema,
  sms_charges: z.array(smsChargeSchema),
  billing_period: billingPeriodSchema
});

export type SmsCharge = z.infer<typeof smsChargeSchema>;
export type UsageData = z.infer<typeof usageDataSchema>;
export type BillingPeriod = z.infer<typeof billingPeriodSchema>;
export type InternalFormat = z.infer<typeof internalFormatSchema>;
