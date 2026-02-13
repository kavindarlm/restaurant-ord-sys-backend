import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Events } from './events';

@Injectable()
export class SecurityLoggerService {
  constructor(private readonly logger: LoggerService) {}

  logAuthFailure(userId: string | null, ip: string, endpoint: string) {
    this.logger.warn('Authentication failure', {
      eventType: Events.AUTH_FAILURE,
      userId,
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      severity: 'warn',
    });
  }

  logJwtViolation(userId: string | null, ip: string) {
    this.logger.error('JWT violation', {
      eventType: Events.JWT_VIOLATION,
      userId,
      ip,
      timestamp: new Date().toISOString(),
      severity: 'error',
    });
  }

  logPriceMismatch(cartId: string, expected: number, actual: number) {
    this.logger.error('Stripe price mismatch', {
      eventType: Events.PRICE_MISMATCH,
      cartId,
      expected,
      actual,
      timestamp: new Date().toISOString(),
      severity: 'error',
    });
  }

  logValidationError(errors: any, userId?: string, ip?: string, endpoint?: string) {
    this.logger.warn('DTO validation error', {
      eventType: Events.VALIDATION_ERROR,
      errors,
      userId,
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      severity: 'warn',
    });
  }

  logRequest(userId: string | null, ip: string, endpoint: string, responseTime: number) {
    this.logger.info('Request log', {
      eventType: Events.REQUEST,
      userId,
      ip,
      endpoint,
      responseTime,
      timestamp: new Date().toISOString(),
      severity: 'info',
    });
  }

  logSuspiciousActivity(type: Events, meta: Record<string, any>) {
    this.logger.error('Suspicious activity detected', {
      eventType: type,
      ...meta,
      timestamp: new Date().toISOString(),
      severity: 'error',
    });
  }

  logError(message: string, meta: Record<string, any>) {
    this.logger.error(message, meta);
  }
}
