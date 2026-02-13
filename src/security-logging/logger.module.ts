// Winston logger module configuration for NestJS
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { SecurityLoggerService } from './security-logger.service';
import { LoggerService } from './logger.service';
import * as dotenv from 'dotenv';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
dotenv.config();
@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const esTransport = new ElasticsearchTransport({
          level: config.get<string>('LOG_LEVEL') || 'error',
          clientOpts: {
            node: config.get('ELASTIC_NODE'),
            auth: {
              username: config.get('ELASTIC_USER'),
              password: config.get('ELASTIC_PASSWORD'),
            },
            tls: { rejectUnauthorized: true }, // optional: ensure SSL cert validation
          },
          indexPrefix: 'security-logs',  // Index name in Elastic
        });

        return {
          transports: [esTransport], // No console logs, only ES
        };
      },
    }),
  ],
  providers: [SecurityLoggerService, LoggerService],
  exports: [SecurityLoggerService],
})
export class LoggerModule {} 
