import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from '../entities/feedback';
import { User } from '../entities/user';
import { MailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, User]), MailModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
