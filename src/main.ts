import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as process from 'process';

const port = +process.env.PORT as number;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  });
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: Boolean(process.env.SESSION_RESAVE),
      saveUninitialized: Boolean(process.env.SESSION_SAVE_UNINITIALIZED),
      cookie: { maxAge: +process.env.SESSION_COOKIE_MAX_AGE, secure: false },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  await app.listen(port);
}

bootstrap().then(() =>
  console.log(`🚀 Application is running on: localhost:${port}`),
);
