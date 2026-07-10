import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async submitFeedback(@Request() req, @Body('message') message: string) {
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }
    const userId = req.user.sub;
    return this.feedbackService.submitFeedback(userId, message);
  }
}
