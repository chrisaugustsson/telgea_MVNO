import { processUserData } from '../../integration';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Provider ABC Integration', () => {
  const dataUsagePath = join(__dirname, '../../data_usage/__tests__/test_data/sample.json');
  const smsChargePath = join(__dirname, '../../sms_charge/__tests__/test_data/sample.xml');
  
  const dataUsageJson = JSON.parse(readFileSync(dataUsagePath, 'utf-8'));
  const smsChargeXml = readFileSync(smsChargePath, 'utf-8');

  it('should process data usage and SMS charge data successfully', () => {
    const result = processUserData(dataUsageJson, smsChargeXml);
    
    expect(result.isOk()).toBe(true);
    
    result.match(
      (data) => {
        expect(data).toEqual({
          telgea_user_id: 'abc123',
          msisdn: '+46701234567',
          usage_data: {
            total_mb: 845.23,
            roaming_mb: 210.50,
            country: 'SE',
            network_type: '4G',
            provider_code: 'SE01'
          },
          sms_charges: [
            {
              message_id: 'msg789',
              timestamp: '2025-04-01T12:30:00Z',
              amount: 0.05,
              currency: 'EUR'
            }
          ],
          billing_period: {
            start: '2025-04-01T00:00:00Z',
            end: '2025-04-30T23:59:59Z'
          }
        });
      },
      (error) => fail(`Expected success but got error: ${error.message}`)
    );
  });

  it('should process only data usage when SMS charge data is not provided', () => {
    const result = processUserData(dataUsageJson, undefined);
    
    expect(result.isOk()).toBe(true);
    
    result.match(
      (data) => {
        expect(data.sms_charges).toEqual([]);
      },
      (error) => fail(`Expected success but got error: ${error.message}`)
    );
  });
});
