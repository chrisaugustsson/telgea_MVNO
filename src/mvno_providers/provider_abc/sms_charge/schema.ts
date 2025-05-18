import { z } from 'zod';

/**
 * Schema for a single SMS charge entry
 */
const smsChargeEntrySchema = z.object({
  'sms:UserID': z.string(),
  // Accept both string and number for PhoneNumber, always convert to string
  'sms:PhoneNumber': z.union([
    z.string(),
    z.number().transform(val => String(val))
  ]),
  'sms:MessageID': z.string(),
  'sms:Timestamp': z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp format'
  }),
  // Accept both string and number for ChargeAmount
  'sms:ChargeAmount': z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]).refine(val => !isNaN(val), {
    message: 'ChargeAmount must be a valid number'
  }),
  'sms:Currency': z.string().length(3)
});

/**
 * Schema for SOAP XML SMS charge response (after XML parsing)
 * Always expects an array of SMS charges
 */
export const smsResponseSchema = z.object({
  'soapenv:Envelope': z.object({
    'soapenv:Body': z.object({
      'sms:ChargeSMS': z.union([
        z.array(smsChargeEntrySchema),
        smsChargeEntrySchema
      ])
    })
  })
});

export type SmsResponse = z.infer<typeof smsResponseSchema>;
export type SmsChargeEntry = z.infer<typeof smsChargeEntrySchema>;
