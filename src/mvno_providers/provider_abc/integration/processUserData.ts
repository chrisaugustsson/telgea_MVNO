import { convertDataUsage } from '../data_usage';
import { convertSmsCharge } from '../sms_charge';
import { Result, ok, err } from 'neverthrow';
import { IntegrationError } from '../../../shared/errors';
import { InternalFormat, internalFormatSchema } from '../../../shared/types';

/**
 * Processes data usage and SMS charges for a user from Provider ABC
 * 
 * @param dataUsageJson - Raw JSON data from provider API for data usage
 * @param smsChargeXml - Optional raw XML string from provider API for SMS charges
 * @returns A Result containing either the normalized user data or an error
 */
export const processUserData = (
  dataUsageJson: unknown,
  smsChargeXml?: string
): Result<InternalFormat, IntegrationError> => {
  return convertDataUsage(dataUsageJson)
    .mapErr(error => new IntegrationError('Failed to process data usage', {
      code: 'DATA_USAGE_ERROR',
      cause: error
    }))
    .andThen(dataResult => {
      const { userId, msisdn, usage, billingPeriod } = dataResult;
      
      const smsChargesResult = smsChargeXml 
        ? convertSmsCharge(smsChargeXml)
            .mapErr(error => new IntegrationError('Failed to process SMS charges', {
              code: 'SMS_CHARGE_ERROR',
              cause: error
            }))
        : ok([]);
      
      return smsChargesResult.andThen(smsCharges => {
        const validationResult = internalFormatSchema.safeParse({
          telgea_user_id: userId,
          msisdn,
          usage_data: usage,
          sms_charges: smsCharges,
          billing_period: billingPeriod
        });

        if (!validationResult.success) {
          const errorMessage = `Invalid internal format: ${validationResult.error.message}`;
          return err(new IntegrationError(errorMessage, {
            code: 'INTERNAL_FORMAT_ERROR',
            cause: validationResult.error
          }));
        }

        return ok(validationResult.data);
      }
      );
    });
};
