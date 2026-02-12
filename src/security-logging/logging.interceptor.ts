import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SecurityLoggerService } from './security-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user ? req.user.id : null;
    const ip = req.ip || (req.headers && req.headers['x-forwarded-for'] as string) || (req.connection && req.connection.remoteAddress) || 'unknown';
    const endpoint = req.originalUrl || req.url || 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - start;
        this.securityLogger.logRequest(userId, ip, endpoint, responseTime);
      })
    );
  }
}
