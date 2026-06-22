/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request as ARequest, Response } from 'express';
import { MailService } from 'src/email/email.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { User } from 'src/entities/user';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedRequest extends ARequest {
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects user to Google's OAuth page
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const user = req.user;
      const token = await this.authService.generateJwt(user);

      const redirectPath = user.isNew || user.status == 0 ? 'signup' : 'login';

      return res.redirect(
        `${process.env.FRONTEND_URL}${redirectPath}?token=${token}`,
      );
    } catch (error) {
      console.error('Google Auth Error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    const { email } = forgetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.mailService.sendResetPasswordEmail(email);
    return { message: 'Reset password email sent successfully.' };
  }

  @Public()
  @Put(':id/reset-password')
  async ResetPassword(
    @Param('id') id: string,
    @Body() ResetPasswordDto: ResetPasswordDto,
  ): Promise<User> {
    return this.authService.ResetPassword(id, ResetPasswordDto);
  }
  // Do NOT use @Res — just return JSON
  @Post('login-as')
  @UseGuards(AuthGuard('jwt'))
  async loginAs(@Request() req, @Body() body: { userId: string }) {
    const admin = req.user;

    if (admin.role !== 'admin') {
      throw new UnauthorizedException('Only admins can impersonate users');
    }

    const targetUser = await this.userService.findOneById(body.userId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const impersonationPayload = {
      ...targetUser,
      impersonatedBy: admin.id,
    };

    const { access_token } = await this.authService.login(impersonationPayload);

    const url = `${process.env.FRONTEND_URL}login?token=${access_token}&impersonating=true`;
    return { url };
  }
}
