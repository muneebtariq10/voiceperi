import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from 'src/entities/user';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      // Step 1: Verify whether an admin already exists in the database
      const existingAdminCount = await this.userRepository.count({
        where: { role: Role.ADMIN },
      });

      if (existingAdminCount > 0) {
        this.logger.log(
          'An existing admin account was detected in database. Skipping initial admin bootstrap.',
        );
        return;
      }

      // Step 2: Check if INITIAL_ADMIN_EMAIL environment variable is configured
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      if (!initialAdminEmail) {
        this.logger.warn(
          'No admin found in database, and INITIAL_ADMIN_EMAIL is not configured in environment. Skipping bootstrap.',
        );
        return;
      }

      // Step 3: Either promote existing matching email or bootstrap a clean admin account
      const existingUser = await this.userRepository.findOne({
        where: { email: initialAdminEmail },
      });

      if (existingUser) {
        existingUser.role = Role.ADMIN;
        await this.userRepository.save(existingUser);
        this.logger.log(
          `Successfully promoted existing user account (${initialAdminEmail}) to initial ADMIN role. Database is now definitive authority.`,
        );
      } else {
        const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || uuidv4(); // Use explicit password or securely generated UUID string
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(initialPassword, salt);

        const newAdmin = this.userRepository.create({
          id: uuidv4(),
          email: initialAdminEmail,
          password: hashedPassword,
          firstname: 'System',
          lastname: 'Owner',
          role: Role.ADMIN,
          verified: 1,
          status: 1,
        });

        await this.userRepository.save(newAdmin);
        this.logger.log(
          `Successfully bootstrapped initial admin account (${initialAdminEmail}). Database is now the authoritative role source.`,
        );
      }
    } catch (error) {
      this.logger.error('Error encountered during initial admin bootstrap execution:', error);
    }
  }
}
