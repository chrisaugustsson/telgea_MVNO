import { parseXml } from '../xmlParser';
import { InvalidPayloadError } from '../../errors';

describe('parseXml', () => {
  it('should parse valid XML string to object', () => {
    const xmlString = `<root><item>value</item></root>`;
    const result = parseXml(xmlString);
    
    expect(result.isOk()).toBe(true);
    
    // Use unwrapOr to safely get the value
    const parsed = result.unwrapOr(null);
    expect(parsed).toEqual({
      root: {
        item: 'value'
      }
    });
  });
  
  it('should return Err with InvalidPayloadError for invalid XML', () => {
    // Use a more obviously invalid XML that will definitely fail parsing
    const invalidXml = 'This is not XML at all';
    const result = parseXml(invalidXml);
    
    expect(result.isErr()).toBe(true);
    
    // Safely check the error type
    result.match(
      () => fail('Expected an error but got a success'),
      (error) => expect(error).toBeInstanceOf(InvalidPayloadError)
    );
  });
});
