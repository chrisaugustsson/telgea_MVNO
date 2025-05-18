import { IntegrationError } from './IntegrationError';

/**
 * Error thrown when a payload is invalid or cannot be parsed
 */
export class InvalidPayloadError extends IntegrationError {
  constructor(message: string, options?: { 
    cause?: Error; 
    context?: Record<string, unknown> 
  }) {
    super(message, { 
      code: 'INVALID_PAYLOAD',
      cause: options?.cause,
      context: options?.context
    });
  }
}
