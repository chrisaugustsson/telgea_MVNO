import { z } from 'zod';

/**
 * Schema for REST JSON data usage response
 */
export const dataUsageResponseSchema = z.object({
  user_id: z.string(),
  msisdn: z.string(),
  usage: z.object({
    data: z.object({
      total_mb: z.number().nonnegative(),
      roaming_mb: z.number().nonnegative(),
      country: z.string().length(2)
    }),
    period: z.object({
      start: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid start date format'
      }),
      end: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid end date format'
      })
    })
  }),
  network: z.object({
    type: z.string(),
    provider_code: z.string()
  })
});

export type DataUsageResponse = z.infer<typeof dataUsageResponseSchema>;
