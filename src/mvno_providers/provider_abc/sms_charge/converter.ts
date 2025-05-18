import { parseXml } from '../../../shared/utils/xmlParser';
import { InvalidPayloadError } from '../../../shared/errors';
import { smsResponseSchema, SmsChargeEntry } from './schema';
import { Result, ok, err } from 'neverthrow';
import { SmsCharge } from '../../../shared/types';

/**
 * Normalize a single SMS charge entry to the standard format
 * 
 * @param chargeEntry SMS charge entry from parsed XML
 * @returns Normalized SMS charge object
 */
const normalizeSmsCharge = (chargeEntry: SmsChargeEntry): SmsCharge => {
  return {
    message_id: chargeEntry['sms:MessageID'],
    timestamp: chargeEntry['sms:Timestamp'],
    amount: Number(chargeEntry['sms:ChargeAmount']),
    currency: chargeEntry['sms:Currency']
  };
};

/**
 * Convert XML string to normalized SMS charge data
 * Supports both single SMS charge and arrays of SMS charges
 * 
 * @param xmlString - Raw XML string from provider API
 * @returns A Result containing either the normalized SMS charges array or an InvalidPayloadError
 */
export const convertSmsCharge = (xmlString: string): Result<SmsCharge[], InvalidPayloadError> => {
  return parseXml(xmlString)
    .andThen((parsed) => {
      const validationResult = smsResponseSchema.safeParse(parsed);
      
      if (!validationResult.success) {
        const errorMessage = `Invalid SMS charge payload: ${validationResult.error.message}`;
        console.error(errorMessage);
        return err(new InvalidPayloadError(errorMessage, { 
          context: { errors: validationResult.error.errors }
        }));
      }
      
      return ok(validationResult.data);
    })
    .map((data) => {
      const smsData = data['soapenv:Envelope']['soapenv:Body']['sms:ChargeSMS'];
      
      const results: SmsCharge[] = Array.isArray(smsData) ? 
        smsData.map((charge) => normalizeSmsCharge(charge)) : 
        [normalizeSmsCharge(smsData)];
      
      return results;
    })
    .mapErr((error: unknown) => {
      if (error instanceof InvalidPayloadError) {
        return error;
      }
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      return new InvalidPayloadError('Failed to convert SMS charge data', { 
        cause: errorObj
      });
    });
};
