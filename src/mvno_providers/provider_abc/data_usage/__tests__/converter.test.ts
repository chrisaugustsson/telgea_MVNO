import { convertDataUsage } from '../converter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InvalidPayloadError } from '../../../../shared/errors';

describe('Data Usage Converter', () => {
  const sampleJsonPath = join(__dirname, 'test_data', 'sample.json');
  const sampleJson = JSON.parse(readFileSync(sampleJsonPath, 'utf-8'));
  
  it('should successfully convert valid JSON to normalized data usage', () => {
    const result = convertDataUsage(sampleJson);
    
    expect(result.isOk()).toBe(true);
    
    result.match(
      (data) => {
        expect(data).toEqual({
          usage: {
            total_mb: 845.23,
            roaming_mb: 210.50,
            country: 'SE',
            network_type: '4G',
            provider_code: 'SE01'
          },
          billingPeriod: {
            start: '2025-04-01T00:00:00Z',
            end: '2025-04-30T23:59:59Z'
          },
          userId: 'abc123',
          msisdn: '+46701234567'
        });
      },
      (error) => fail(`Expected success but got error: ${error.message}`)
    );
  });
  
  it('should return Err with InvalidPayloadError for data with missing required fields', () => {
    const invalidJson = {
      user_id: 'abc123',
      // Missing msisdn
      usage: {
        data: {
          total_mb: 845.23,
          roaming_mb: 210.50,
          country: 'SE'
        },
        period: {
          start: '2025-04-01T00:00:00Z',
          end: '2025-04-30T23:59:59Z'
        }
      },
      network: {
        type: '4G',
        provider_code: 'SE01'
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
        expect(error.message).toContain('msisdn');
      }
    );
  });
  
  it('should return Err with InvalidPayloadError for data with invalid types', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        data: {
          ...sampleJson.usage.data,
          total_mb: 'not a number' // Should be a number
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
        expect(error.message).toContain('total_mb');
      }
    );
  });

  it('should return Err for invalid date format in billing period start', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        period: {
          ...sampleJson.usage.period,
          start: 'invalid-date-format'
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
        expect(error.message).toContain('Invalid start date format');
      }
    );
  });

  it('should return Err for invalid date format in billing period end', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        period: {
          ...sampleJson.usage.period,
          end: 'invalid-date-format'
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
        expect(error.message).toContain('Invalid end date format');
      }
    );
  });

  it('should return Err for negative total data usage value', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        data: {
          ...sampleJson.usage.data,
          total_mb: -10.5
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
      }
    );
  });

  it('should return Err for negative roaming data usage value', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        data: {
          ...sampleJson.usage.data,
          roaming_mb: -5.25
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
      }
    );
  });

  it('should return Err for invalid country code length', () => {
    const invalidJson = {
      ...sampleJson,
      usage: {
        ...sampleJson.usage,
        data: {
          ...sampleJson.usage.data,
          country: 'SWE' // Should be exactly 2 characters
        }
      }
    };
    
    const result = convertDataUsage(invalidJson);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
        expect(error.message).toContain('country');
      }
    );
  });

  it('should return Err when invalid JSON is provided', () => {
    const result = convertDataUsage('not a json object');
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid data usage payload');
      }
    );
  });
});
