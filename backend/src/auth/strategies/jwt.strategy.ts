import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-key', // Provide a fallback
    });
  }

  // async validate(payload:any) {
  //     const user = await this.userService.findOne(payload.email);

  //     if (!user) {
  //         throw new UnauthorizedException();
  //     }

  //     // if (!user.status) {
  //     //     throw new UnauthorizedException(
  //     //       `${user.firstname}, account Disabled`,
  //     //     );
  //     // }

  //     // if (!user.verified) {
  //     //     throw new UnauthorizedException(
  //     //       `${user.firstname}, account not verified`,
  //     //     );
  //     // }

  //     return { userId: payload.sub, email: payload.email };
  // }
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role, // ✅ MUST include this
      impersonatedBy: payload.impersonatedBy || null,
    };
  }
}
