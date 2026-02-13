import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: 'Content-Type,Authorization',
  }));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "https://js.stripe.com"
          ],
          styleSrc: [
            "'self'",
            "https://fonts.googleapis.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https://images.unsplash.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],
          connectSrc: [
            "'self'",
            "http://localhost:4000",
            "https://api.stripe.com",
            "https://*.supabase.co"
          ],
          frameSrc: [
            "https://js.stripe.com"
          ],
        },
      },
    })
  );

  await app.listen(4000);
} 
bootstrap();