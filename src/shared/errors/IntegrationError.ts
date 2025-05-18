/**
 * Base error class for all integration-related errors
 */
export class IntegrationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;

  constructor(message: string, options?: { 
    code?: string; 
    cause?: Error; 
    context?: Record<string, unknown> 
  }) {
    super(message);
    
    if (options?.cause) {
      // Use non-standard way to set cause for ES2022 compatibility
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        writable: true,
        configurable: true,
      });
    }
    
    this.name = this.constructor.name;
    this.code = options?.code || 'INTEGRATION_ERROR';
    this.context = options?.context || {};
  }
}
