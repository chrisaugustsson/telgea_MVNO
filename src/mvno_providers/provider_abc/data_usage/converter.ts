import { InvalidPayloadError } from '../../../shared/errors';
import { dataUsageResponseSchema } from './schema';
import { Result, ok, err } from 'neverthrow';
import { UsageData, BillingPeriod } from '../../../shared/types';

/**
 * Converts REST JSON data usage response to normalized format
 * 
 * @param jsonData - Raw JSON data from provider API
 * @returns A Result containing either the normalized data or an InvalidPayloadError
 */
export const convertDataUsage = (jsonData: unknown): Result<{
  usage: UsageData;
  billingPeriod: BillingPeriod;
  userId: string;
  msisdn: string;
}, InvalidPayloadError> => {
  const validationResult = dataUsageResponseSchema.safeParse(jsonData);
  
  if (!validationResult.success) {
    const errorMessage = `Invalid data usage payload: ${validationResult.error.message}`;
    console.error(errorMessage);
    return err(new InvalidPayloadError(errorMessage, { 
      context: { errors: validationResult.error.errors }
    }));
  }
  
  try {
    const data = validationResult.data;
    
    const usage: UsageData = {
      total_mb: data.usage.data.total_mb,
      roaming_mb: data.usage.data.roaming_mb,
      country: data.usage.data.country,
      network_type: data.network.type,
      provider_code: data.network.provider_code
    };
    
    const billingPeriod: BillingPeriod = {
      start: data.usage.period.start,
      end: data.usage.period.end
    };
    
    return ok({ 
      usage, 
      billingPeriod,
      userId: data.user_id,
      msisdn: data.msisdn
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    return err(new InvalidPayloadError('Failed to convert data usage', { 
      cause: errorObj
    }));
  }
};
