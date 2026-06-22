import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessinfosModule } from 'src/businessinfos/businessinfos.module';
import { AgentsModule } from 'src/agents/agents.module';
import { BusinessInformation } from 'src/entities/business_information';
import { Agent } from 'src/entities/agent';
import { BillingHistory } from 'src/entities/billing_history';
import { PaymentPlan } from 'src/entities/payment_plans';
import { CallHistory } from 'src/entities/call_history';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      User,
      BusinessInformation,
      Agent,
      BillingHistory,
      PaymentPlan,
      CallHistory,
    ]),
    forwardRef(() => BusinessinfosModule),
    forwardRef(() => AgentsModule),
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your_jwt_secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES') || '1h',
        },
      }),
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
