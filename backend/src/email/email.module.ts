/* eslint-disable prettier/prettier */
// src/mail/mail.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';

@Module({
  imports: [

    TypeOrmModule.forFeature([User]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'hamza.anees.432@gmail.com',
          pass: 'vmxq zaly emzs aeds',
        },
      },
      defaults: {
        from: '"Voice Peri" <no-reply@voiceperi.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
}
