import { convertSmsCharge } from '../converter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InvalidPayloadError } from '../../../../shared/errors';
import { SmsCharge } from '../../../../shared/types';

describe('convertSmsCharge', () => {
  const sampleXmlPath = join(__dirname, 'test_data', 'sample.xml');
  const sampleMultipleXmlPath = join(__dirname, 'test_data', 'sample_multiple.xml');
  const sampleXml = readFileSync(sampleXmlPath, 'utf-8');
  const sampleMultipleXml = readFileSync(sampleMultipleXmlPath, 'utf-8');
  
  it('should successfully convert valid XML to normalized SMS charge data', () => {
    const result = convertSmsCharge(sampleXml);
    
    expect(result.isOk()).toBe(true);
    
    result.match(
      (charges: SmsCharge[]) => {
        expect(charges.length).toBe(1);
        expect(charges[0]).toEqual({
          message_id: 'msg789',
          timestamp: '2025-04-01T12:30:00Z',
          amount: 0.05,
          currency: 'EUR'
        });
      },
      (error: InvalidPayloadError) => fail(`Expected success but got error: ${error.message}`)
    );
  });

  it('should successfully convert valid XML with multiple charges', () => {
    const result = convertSmsCharge(sampleMultipleXml);
    
    if (result.isErr()) {
      console.error('Error in multiple charges test:', result.error);
    }
    
    expect(result.isOk()).toBe(true);
    
    result.match(
      (charges: SmsCharge[]) => {
        expect(charges.length).toBe(3);
        expect(charges[0]).toEqual({
          message_id: 'msg001',
          timestamp: '2025-04-01T12:30:00Z',
          amount: 0.05,
          currency: 'EUR'
        });
        expect(charges[1]).toEqual({
          message_id: 'msg002',
          timestamp: '2025-04-01T12:35:00Z',
          amount: 0.07,
          currency: 'EUR'
        });
        expect(charges[2]).toEqual({
          message_id: 'msg003',
          timestamp: '2025-04-01T12:40:00Z',
          amount: 0.10,
          currency: 'EUR'
        });
      },
      (error: InvalidPayloadError) => fail(`Expected success but got error: ${error.message}`)
    );
  });
  
  it('should return Err with InvalidPayloadError for malformed XML', () => {
    const malformedXml = '<invalid>xml';
    const result = convertSmsCharge(malformedXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => expect(error).toBeInstanceOf(InvalidPayloadError)
    );
  });
  
  it('should return Err with InvalidPayloadError for valid XML with missing required fields', () => {
    const invalidXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sms="http://provider.com/sms">
        <soapenv:Header/>
        <soapenv:Body>
          <sms:ChargeSMS>
            <sms:UserID>abc123</sms:UserID>
            <!-- Missing PhoneNumber -->
            <sms:MessageID>msg789</sms:MessageID>
            <sms:Timestamp>2025-04-01T12:30:00Z</sms:Timestamp>
            <sms:ChargeAmount>0.05</sms:ChargeAmount>
            <sms:Currency>EUR</sms:Currency>
          </sms:ChargeSMS>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    
    const result = convertSmsCharge(invalidXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => expect(error).toBeInstanceOf(InvalidPayloadError)
    );
  });
  
  it('should return Err with InvalidPayloadError for invalid timestamp format', () => {
    const invalidTimestampXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sms="http://provider.com/sms">
        <soapenv:Header/>
        <soapenv:Body>
          <sms:ChargeSMS>
            <sms:UserID>abc123</sms:UserID>
            <sms:PhoneNumber>+46701234567</sms:PhoneNumber>
            <sms:MessageID>msg789</sms:MessageID>
            <sms:Timestamp>not-a-valid-timestamp</sms:Timestamp>
            <sms:ChargeAmount>0.05</sms:ChargeAmount>
            <sms:Currency>EUR</sms:Currency>
          </sms:ChargeSMS>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    
    const result = convertSmsCharge(invalidTimestampXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('Invalid timestamp format');
      }
    );
  });
  
  it('should return Err with InvalidPayloadError for invalid currency format', () => {
    const invalidCurrencyXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sms="http://provider.com/sms">
        <soapenv:Header/>
        <soapenv:Body>
          <sms:ChargeSMS>
            <sms:UserID>abc123</sms:UserID>
            <sms:PhoneNumber>+46701234567</sms:PhoneNumber>
            <sms:MessageID>msg789</sms:MessageID>
            <sms:Timestamp>2025-04-01T12:30:00Z</sms:Timestamp>
            <sms:ChargeAmount>0.05</sms:ChargeAmount>
            <sms:Currency>EURO</sms:Currency>
          </sms:ChargeSMS>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    
    const result = convertSmsCharge(invalidCurrencyXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        // Currency is validated to be exactly 3 characters
        expect(error.message).toContain('3 character');
      }
    );
  });
  
  it('should return Err with InvalidPayloadError for invalid charge amount format', () => {
    const invalidAmountXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sms="http://provider.com/sms">
        <soapenv:Header/>
        <soapenv:Body>
          <sms:ChargeSMS>
            <sms:UserID>abc123</sms:UserID>
            <sms:PhoneNumber>+46701234567</sms:PhoneNumber>
            <sms:MessageID>msg789</sms:MessageID>
            <sms:Timestamp>2025-04-01T12:30:00Z</sms:Timestamp>
            <sms:ChargeAmount>not-a-number</sms:ChargeAmount>
            <sms:Currency>EUR</sms:Currency>
          </sms:ChargeSMS>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    
    const result = convertSmsCharge(invalidAmountXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
        expect(error.message).toContain('ChargeAmount');
      }
    );
  });
  
  it('should return Err with InvalidPayloadError for empty SMS charges array', () => {
    const emptyArrayXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sms="http://provider.com/sms">
        <soapenv:Header/>
        <soapenv:Body>
          <sms:ChargeSMS/>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    
    const result = convertSmsCharge(emptyArrayXml);
    
    expect(result.isErr()).toBe(true);
    
    result.match(
      (data: SmsCharge[]) => fail(`Expected error but got success: ${JSON.stringify(data)}`),
      (error: InvalidPayloadError) => {
        expect(error).toBeInstanceOf(InvalidPayloadError);
      }
    );
  });
});
