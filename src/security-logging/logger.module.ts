// Winston logger module configuration for NestJS
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { SecurityLoggerService } from './security-logger.service';
import { LoggerService } from './logger.service';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL,

      transports: process.env.LOG_ENABLED === 'false'
        ? []
        : [
            new DailyRotateFile({
              filename: 'logs/security-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
              ),
            }),
          ],
    }),
  ],
  providers: [SecurityLoggerService, LoggerService],
  exports: [WinstonModule, SecurityLoggerService],
})
export class LoggerModule {} 
