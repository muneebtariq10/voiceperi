/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  // async findByEmail(email: string): Promise<User | null> {
  //   return await this.userRepo.findOne({ where: { email } });
  // }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    // Step 2: Append user ID to the reset URL (or generate a token if you plan to do that)
    const resetUrl = `${process.env.FRONTEND_URL}new-password?id=${user.id}`;

    // Step 3: Send the email
    await this.mailerService.sendMail({
      to: email,
      subject: 'We received your password reset request',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Password Reset</title>
          </head>
          <body>
            <h1>Reset your password</h1>
            <p>Hello ${user.firstname || ''},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email.</p>
          </body>
        </html>
      `,
    });
  }

}
