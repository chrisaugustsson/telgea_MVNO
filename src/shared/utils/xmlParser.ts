import { XMLParser } from 'fast-xml-parser';
import { InvalidPayloadError } from '../errors';
import { Result, ok, err } from 'neverthrow';

// Private parser instance for internal use
const xmlParser = new XMLParser({
  ignoreAttributes: false
});

/**
 * Parse an XML string into a JavaScript object
 * 
 * @param xmlString - The XML string to parse
 * @returns A Result containing either the parsed XML object or an InvalidPayloadError
 */
export const parseXml = <T>(xmlString: string): Result<T, InvalidPayloadError> => {
  try {
    // Check if the input is a valid XML string with basic validation
    if (typeof xmlString !== 'string' || !xmlString.trim().startsWith('<') || !xmlString.trim().endsWith('>')) {
      return err(new InvalidPayloadError('Invalid XML format'));
    }
    
    const parsed = xmlParser.parse(xmlString) as T;

    return ok(parsed);
  } catch (error) {
    return err(new InvalidPayloadError('Failed to parse XML payload', { 
      cause: error instanceof Error ? error : new Error(String(error)) 
    }));
  }
};
