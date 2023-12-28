import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RolesModule } from './roles/roles.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { WorkersModule } from './workers/workers.module';
import { SkillsModule } from './skills/skills.module';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get('MAIL_USERNAME'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    WorkersModule,
    SkillsModule,
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
