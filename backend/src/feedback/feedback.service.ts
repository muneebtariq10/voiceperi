import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback';
import { User } from '../entities/user';
import { MailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async submitFeedback(userId: string, message: string): Promise<Feedback> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const feedback = this.feedbackRepo.create({
      message,
      user,
    });

    const savedFeedback = await this.feedbackRepo.save(feedback);

    // Send email notification to admin
    try {
      // Accessing mailerService through MailService is not exposed,
      // let's add a sendFeedbackNotification method to MailService or just send directly if possible.
      // Actually, wait, MailService doesn't have a generic send email method exposed. Let's use mailerService directly or add a method.
      // I will add a method in MailService.
      await this.mailService.sendFeedbackEmail(
        user.email,
        user.firstname,
        message,
      );
    } catch (err) {
      console.error('Failed to send feedback email:', err);
    }

    return savedFeedback;
  }
}
