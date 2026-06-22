import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AgentsModule } from './agents/agents.module';
import { BusinessinfosModule } from './businessinfos/businessinfos.module';
import { PaymentPlanModule } from './payment_plans/payment_plans.module';
import { MailModule } from './email/email.module';
import { CallHistoryModule } from './callhistory/callhistory.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StripeWebhookModule } from './webhooks/webhooks.module';
import { BillingHistoryModule } from './billing_history/billing_history.module';
import { PlacesModule } from './places/places.module';
import { LogModule } from './logs_call_history/logs.module';
import { UsageModule } from './UsedMinutes/usedminutes.module';
import { RetelWebhookModule } from './retel-webhook/retel-webhook.module';
import { IntegrationModule } from './integrations/integration.module';
import { SqlService } from './sql/sql.service';
import { SqlController } from './sql/sql.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [join(__dirname, 'entities', '*.{ts,js}')],
          synchronize: true,     // Enable in development only
          logging: true,
          logger: 'advanced-console',
        };
      },
    }),
    UsersModule,
    AuthModule,
    AgentsModule,
    BusinessinfosModule,
    PaymentPlanModule,
    MailModule,
    CallHistoryModule,
    StripeWebhookModule,
    BillingHistoryModule,
    PlacesModule,
    LogModule,
    UsageModule,
    RetelWebhookModule,
    IntegrationModule
  ],
  controllers: [AppController, SqlController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    SqlService
  ],
})
export class AppModule {}
