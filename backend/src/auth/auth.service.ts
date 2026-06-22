/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BillingHistory } from 'src/entities/billing_history';
import { PaymentPlan } from 'src/entities/payment_plans';
import { PricingInterval } from 'src/entities/payment_plans_pricing';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(BillingHistory) // ✅ Use InjectRepository here
    private billingHistoryRepo: Repository<BillingHistory>,

    @InjectRepository(PaymentPlan) // ✅ Use InjectRepository here
    private paymentPlanRepo: Repository<PaymentPlan>,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginDto) {
    const user = await this.userService.findOne(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      const isMatched = await bcrypt.compare(password, user.password);

      if (!isMatched) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch {
      return null;
    }

    return user;
  }

  // async login(user: any) {
  //   const payload = { email: user.email, sub: user.id, role: user.role };
  //   console.log('payload of login', payload);
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      impersonatedBy: user.impersonatedBy || null, // 🟡 support impersonation
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateGoogleUser(
    profile: any,
  ): Promise<{ user: User; isNew: boolean }> {
    const { id, name, emails, photos } = profile;

    if (!emails || !emails.length || !emails[0].value) {
      throw new UnauthorizedException('No email found in Google profile');
    }

    const existingUser = await this.userService.findOne(emails[0].value, true);
    if (existingUser) {
      return { user: existingUser, isNew: false };
    }

    const newUser = this.userRepository.create({
      id: uuidv4(),
      google_id: id,
      firstname: name.givenName,
      lastname: name.familyName,
      email: emails[0].value,
      image: photos[0].value,
      password: '',
    });

    const savedUser = await this.userRepository.save(newUser);
    const freeTrialPlan = await this.paymentPlanRepo.findOne({
      where: { title: 'Free Trial' },
      relations: ['pricings'],
    });

    if (freeTrialPlan) {
      const monthlyPricing = freeTrialPlan.pricings.find(
        (p) => p.type === PricingInterval.MONTHLY,
      );

      if (monthlyPricing) {
        const currentPeriodStart = savedUser.createdAt;
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 14); // Add 14 days

        // 🧾 Save billing history
        await this.billingHistoryRepo.save({
          user: savedUser,
          paymentPlan: freeTrialPlan,
          PaymentPlanPricing: monthlyPricing,
          subscription_status: 'active',
          type: 'month',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          amount: monthlyPricing.price,
        });
      }
    }
    return { user: savedUser, isNew: true };
  }

  async ResetPassword(
    id: string,
    ResetPasswordDto: ResetPasswordDto,
  ): Promise<User> {
    const { password, confirm_password } = ResetPasswordDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (password !== confirm_password) {
      throw new BadRequestException('New passwords do not match');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await this.userRepository.update(id, user);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new UnauthorizedException('User not found after update');
    }
    return updatedUser;
  }

  // async generateJwt(user: any) {
  //   if (!user || !user.email) {
  //     throw new UnauthorizedException('Invalid user data');
  //   }

  //   const payload = { sub: user.id, email: user.email };
  //   return this.jwtService.sign(payload);
  // }
  async generateJwt(user: any) {
    if (!user || !user.email) {
      throw new UnauthorizedException('Invalid user data');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role, // ✅ this was missing
      impersonatedBy: user.impersonatedBy || null,
    };
    if (user.impersonatedBy) {
      payload.impersonatedBy = user.impersonatedBy; // Optional metadata
    }

    return this.jwtService.sign(payload);
  }
}
