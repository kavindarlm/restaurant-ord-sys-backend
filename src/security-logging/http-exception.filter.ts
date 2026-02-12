import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { SecurityLoggerService } from './security-logger.service';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: { id: string };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly securityLogger: SecurityLoggerService) {}
  // This filter catches all exceptions thrown in the application. It checks if the exception is an instance of HttpException and logs relevant security events based on the status code and response message.
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<CustomRequest>();
    const userId = request.user ? request.user.id : null;
    const ip = request.ip || (request.headers && request.headers['x-forwarded-for'] as string) || (request.connection && request.connection.remoteAddress) || 'unknown';
    const endpoint = request.originalUrl || request.url || 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (status === 401 || status === 403) {
        this.securityLogger.logJwtViolation(userId, ip);
      } else if (status === 400 && response && response['message']) {
        this.securityLogger.logValidationError(response['message'], userId, ip, endpoint);
      } else if (status >= 500) {
        this.securityLogger.logError('Internal server error', {
          eventType: 'SERVER_ERROR',
          userId,
          ip,
          endpoint,
          status,
          timestamp: new Date().toISOString(),
          severity: 'error',
        });
      }
    }
  }
}
