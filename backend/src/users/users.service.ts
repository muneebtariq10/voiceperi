import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { FindUsersDto } from './dto/find-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Agent } from 'src/entities/agent';
import { BusinessInformation } from 'src/entities/business_information';
import { BillingHistory } from 'src/entities/billing_history';
import { PaymentPlan } from 'src/entities/payment_plans';
import { PricingInterval } from 'src/entities/payment_plans_pricing';
import { CallHistory } from 'src/entities/call_history';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Agent) // white_check_mark Use InjectRepository here
    private agentRepo: Repository<Agent>,

    @InjectRepository(CallHistory) // white_check_mark Use InjectRepository here
    private callHistoryRepo: Repository<CallHistory>,

    @InjectRepository(BusinessInformation) // white_check_mark Use InjectRepository here
    private businessRepo: Repository<BusinessInformation>,

    @InjectRepository(BillingHistory) // white_check_mark Use InjectRepository here
    private billingHistoryRepo: Repository<BillingHistory>,

    @InjectRepository(PaymentPlan) // white_check_mark Use InjectRepository here
    private paymentPlanRepo: Repository<PaymentPlan>,

    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  // async createUser(dto: CreateUserDto): Promise<{ access_token: string, id: string }> {
  //  const { firstname, lastname, email, password, } = dto;
  //  const userExists = await this.findByEmail(email);

  //  console.log('lastname', lastname);
  //  if (userExists) {
  //    throw new BadRequestException('User already exists');
  //  } else {
  //    const saltRounds = 10;
  //    const hashedPassword = await bcrypt.hash(password, saltRounds);

  //    const user = this.userRepo.create({
  //      id: uuidv4(),
  //      firstname,
  //      lastname,
  //      email,
  //      password: hashedPassword,
  //    });
  //    const savedUser = await this.userRepo.save(user);

  //    // closed_lock_with_key Generate JWT token
  //    const payload = { email: savedUser.email, sub: savedUser.id };

  //    const access_token = this.jwtService.sign(payload);

  //    return { access_token, id: user.id };

  //  }

  // }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async createUser(
    dto: CreateUserDto,
  ): Promise<{ access_token: string; id: string }> {
    const { firstname, lastname, email, password } = dto;

    const userExists = await this.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepo.create({
      id: uuidv4(),
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepo.save(user);
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

        // receipt Save billing history
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

    // closed_lock_with_key JWT token
    const payload = { email: savedUser.email, sub: savedUser.id };
    const access_token = this.jwtService.sign(payload);

    return { access_token, id: savedUser.id };
  }

  // async getUserRelatedEntities(userId: string): Promise<{
  //   userId: string;
  //   agentId?: string;
  //   retellAgentId?: string;
  //   businessId?: string;
  //   billingHistoryIds?: string[];
  //   callHistoryIds?: string[];
  // }> {
  //   const user = await this.userRepo.findOne({ where: { id: userId } });
  //   if (!user) throw new NotFoundException('User not found');

  //   const [agent, businessInfo, billingHistory] = await Promise.all([
  //     this.agentRepo.findOne({ where: { user: { id: userId } } }),
  //     this.businessRepo.findOne({ where: { user_id: { id: userId } } }),
  //     this.billingHistoryRepo.find({ where: { user: { id: userId } } }),
  //   ]);

  //   const callHistory = agent?.retell_agent
  //     ? await this.callHistoryRepo.find({
  //         where: { retell_agent: agent.retell_agent },
  //       })
  //     : [];

  //   return {
  //     userId: user.id,
  //     agentId: agent?.id,
  //     retellAgentId: agent?.retell_agent,
  //     businessId: businessInfo?.id,
  //     billingHistoryIds: billingHistory.map((b) => String(b.id)),
  //     callHistoryIds: callHistory.map((c) => String(c.id)),
  //   };
  // }
  async getUserRelatedEntities(userId: string): Promise<{
    userId: string;
    agentIds: string[];
    retellAgentIds: string[];
    businessIds: string[];
    billingHistoryIds: string[];
    callHistoryIds: string[];
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [agents, businessInfos, billingHistory] = await Promise.all([
      this.agentRepo.find({ where: { user: { id: userId } } }),
      this.businessRepo.find({ where: { user_id: { id: userId } } }),
      this.billingHistoryRepo.find({ where: { user: { id: userId } } }),
    ]);

    const retellAgentIds = agents.map((a) => a.retell_agent).filter((r) => !!r);

    const callHistory = retellAgentIds.length
      ? await this.callHistoryRepo.find({
          where: { retell_agent: In(retellAgentIds) },
        })
      : [];

    return {
      userId: user.id,
      agentIds: agents.map((a) => a.id),
      retellAgentIds,
      businessIds: businessInfos.map((b) => b.id),
      billingHistoryIds: billingHistory.map((b) => String(b.id)),
      callHistoryIds: callHistory.map((c) => String(c.id)),
    };
  }

  async findMany(dto: FindUsersDto) {
    return this.userRepo.createQueryBuilder('user').getMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = this.userRepo.findOne({ where: { id } });
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<User | null> {
    const { firstname, lastname, password, email, verified, status } =
      updateUserDto;
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (file != undefined && file.filename != '') {
      user.image = 'uploads/users/' + file.filename;
    }

    // Manually assign fields to update
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (status !== undefined) user.status = status;
    if (verified !== undefined) user.verified = verified;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await this.userRepo.save(user);

    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['agent', 'info'],
    });
    console.log('updateUserDto', updateUserDto);

    if (!updatedUser) {
      throw new UnauthorizedException('User not found after update');
    }

    return updatedUser;
  }

  async getAllUsers() {
    return await this.userRepo.find({
      relations: ['agent', 'info'],
    });
  }

  // async backupAndDeleteUser(
  //   id: string,
  // ): Promise<{ status: number; deletionIds: any }> {
  //   const user = await this.userRepo.findOne({ where: { id } });
  //   console.log(user);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Step 1: Collect all related data
  //   const [agent, business_information, billing_history] = await Promise.all([
  //     this.agentRepo.findOne({ where: { user: { id } } }),
  //     this.businessRepo.findOne({ where: { user_id: { id } } }),
  //     this.billingHistoryRepo.find({
  //       where: {
  //         user: { id },
  //       },
  //     }),
  //   ]);
  //   // const call_history = await this.callHistoryRepo.find({
  //   //   where: { retell_agent: agent?.retell_agent },
  //   // });
  //   const call_history = agent?.retell_agent
  //     ? await this.callHistoryRepo.find({
  //         where: { retell_agent: agent.retell_agent },
  //       })
  //     : [];

  //   const dataToBackup = {
  //     deletedAt: new Date().toISOString(),
  //     user,
  //     agent,
  //     business_information,
  //     billing_history,
  //     call_history,
  //   };

  //   // Step 2: Create a file path
  //   const fileName = `${user.id}_${user.email}_${Date.now()}.json`;
  //   // const backupPath = path.join(__dirname, '..', '..', 'backups', fileName); // adjust the path as needed

  //   const backupDir = path.join(process.cwd(), 'backup');
  //   const backupPath = path.join(backupDir, fileName);

  //   // Step 3: Save to file
  //   try {
  //     await writeFile(
  //       backupPath,
  //       JSON.stringify(dataToBackup, null, 2),
  //       'utf8',
  //     );
  //   } catch (error) {
  //     console.error('Failed to write backup file:', error);
  //     throw new InternalServerErrorException('Failed to backup user data');
  //   }
  //   console.log(agent?.retell_agent);
  //   return {
  //     status: 200,
  //     deletionIds: {
  //       userId: user.id,
  //       agentId: agent?.id,
  //       retellAgentId: agent?.retell_agent,
  //       businessId: business_information?.id,
  //       billingHistoryIds: billing_history.map((b) => b.id),
  //       callHistoryIds: call_history.map((c) => c.id),
  //     },
  //   };
  // }
  async backupAndDeleteUser(
    id: string,
  ): Promise<{ status: number; deletionIds: any }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [agents, businessInfos, billingHistory] = await Promise.all([
      this.agentRepo.find({ where: { user: { id } } }),
      this.businessRepo.find({ where: { user_id: { id } } }),
      this.billingHistoryRepo.find({ where: { user: { id } } }),
    ]);

    const retellAgentIds = agents.map((a) => a.retell_agent).filter(Boolean);

    const callHistory = retellAgentIds.length
      ? await this.callHistoryRepo.find({
          where: { retell_agent: In(retellAgentIds) },
        })
      : [];

    const dataToBackup = {
      deletedAt: new Date().toISOString(),
      user,
      agents,
      businessInfos,
      billingHistory,
      callHistory,
    };

    const fileName = `${user.id}_${user.email}_${Date.now()}.json`;
    const backupDir = path.join(process.cwd(), 'backup');

    try {
      await fs.promises.mkdir(backupDir, { recursive: true });
      await writeFile(
        path.join(backupDir, fileName),
        JSON.stringify(dataToBackup, null, 2),
        'utf8',
      );
    } catch (error) {
      console.error('Failed to write backup file:', error);
      throw new InternalServerErrorException('Failed to backup user data');
    }

    return {
      status: 200,
      deletionIds: {
        userId: user.id,
        agentIds: agents.map((a) => a.id),
        retellAgentIds,
        businessIds: businessInfos.map((b) => b.id),
        billingHistoryIds: billingHistory.map((b) => b.id),
        callHistoryIds: callHistory.map((c) => c.id),
      },
    };
  }

  async deleteRetellAgent(agentId: string): Promise<any> {
    console.log(agentId, 'Agent Id for deletion');
    const url = `${process.env.RETELL_AI_API_URL}delete-agent/${agentId}`;

    try {
      const response$ = this.httpService.delete(url, {
        headers: {
          Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Let us handle all status codes manually
      });

      const response = await lastValueFrom(response$);
      console.log(`Retell API status: ${response}`);

      return response;
    } catch (error) {
      console.error(
        'Error calling Retell API:',
        error?.response?.data || error.message,
      );
      return error;
    }
  }

  // async deleteUserDataByIds(ids: {
  //   userId: string;
  //   agentId?: string;
  //   retellAgentId?: string;
  //   businessId?: string;
  //   billingHistoryIds?: string[];
  //   callHistoryIds?: string[];
  // }): Promise<{ success: boolean; message: string }> {
  //   let retellDeleted = true;

  //   // Step 1: Delete Retell agent if present
  //   if (ids.retellAgentId) {
  //     const retellStatus = await this.deleteRetellAgent(ids.retellAgentId);
  //     if (retellStatus >= 400) {
  //       retellDeleted = false;
  //     }
  //   }

  //   // Step 2: Delete local data in a transaction
  //   await this.dataSource.transaction(async (manager) => {
  //     if (ids.callHistoryIds?.length) {
  //       await manager.delete(
  //         this.callHistoryRepo.target,
  //         ids.callHistoryIds.map((id) => ({ id })),
  //       );
  //     }

  //     if (ids.agentId) {
  //       await manager.delete(this.agentRepo.target, { id: ids.agentId });
  //     }

  //     if (ids.billingHistoryIds?.length) {
  //       await manager.delete(
  //         this.billingHistoryRepo.target,
  //         ids.billingHistoryIds.map((id) => ({ id })),
  //       );
  //     }

  //     if (ids.businessId) {
  //       await manager.delete(this.businessRepo.target, { id: ids.businessId });
  //     }

  //     await manager.delete(this.userRepo.target, { id: ids.userId });
  //   });

  //   // Step 3: Compose response
  //   if (retellDeleted) {
  //     return {
  //       success: true,
  //       message: 'User deleted successfully, including Retell agent.',
  //     };
  //   } else {
  //     return {
  //       success: false,
  //       message: 'User data deleted, but failed to delete Retell agent.',
  //     };
  //   }
  // }

  async deleteUserDataByIds(ids: {
    userId: string;
    agentIds?: string[];
    retellAgentIds?: string[];
    businessIds?: string[];
    billingHistoryIds?: string[];
    callHistoryIds?: string[];
  }): Promise<{ success: boolean; message: string }> {
    let retellDeleted = true;

    // Step 1: Attempt to delete Retell agents
    if (ids.retellAgentIds?.length) {
      for (const retellId of ids.retellAgentIds) {
        const retellRes = await this.deleteRetellAgent(retellId);
        if (retellRes.status >= 400) {
          retellDeleted = false;
        }
      }
    }

    // Step 2: Transactional DB delete
    await this.dataSource.transaction(async (manager) => {
      if (ids.callHistoryIds?.length) {
        await manager.delete(this.callHistoryRepo.target, ids.callHistoryIds);
      }

      if (ids.agentIds?.length) {
        await manager.delete(this.agentRepo.target, ids.agentIds);
      }

      if (ids.billingHistoryIds?.length) {
        await manager.delete(
          this.billingHistoryRepo.target,
          ids.billingHistoryIds,
        );
      }

      if (ids.businessIds?.length) {
        await manager.delete(this.businessRepo.target, ids.businessIds);
      }

      await manager.delete(this.userRepo.target, { id: ids.userId });
    });

    return {
      success: retellDeleted,
      message: retellDeleted
        ? 'User and all related data deleted successfully.'
        : 'User data deleted, but some Retell agent deletions failed.',
    };
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.agentRepo.delete({ user: { id } });
    await this.businessRepo.delete({ user_id: { id } });
    await this.userRepo.delete(id);
    return { message: '200' };
  }

  // async deleteUser(
  //   id: string,
  // ): Promise<{ message: string; timeOfDeletion?: Date }> {
  //   const user = await this.userRepo.findOne({
  //     where: { id },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   if (user.deActivateTime == null) {
  //     let updateTime = new Date();
  //     await this.userRepo.update(user.id, {
  //       deActivateTime: updateTime,
  //     });
  //     return {
  //       message: 'User Deactivated successfully',
  //       timeOfDeletion: updateTime,
  //     };
  //   } else {
  //     await this.userRepo.update(user.id, {
  //       deActivateTime: undefined,
  //     });
  //     return {
  //       message: 'User Deactivated successfully',
  //       timeOfDeletion: undefined,
  //     };
  //   }
  //   // await this.agentRepo.delete({ user: { id } });
  //   // await this.businessRepo.delete({ user_id: { id } });
  //   // await this.userRepo.delete(id);
  //   // return { message: 'User and related data deleted successfully' };
  //   // if (currentUser?.deActivateTime !== null) {
  //   //   const deactivationTime = new Date(currentUser?.deActivateTime!);
  //   //   const now = new Date();
  //   //   const diffMs = now.getTime() - deactivationTime.getTime(); // difference in milliseconds
  //   //   const diffHours = diffMs / (1000 * 60 * 60); // convert ms to hours
  //   //   if (diffHours < 36) {
  //   //     await this.userRepository.update(user.id, {
  //   //       deActivateTime: undefined,
  //   //     });
  //   //   }
  //   // }
  // }
  async deactivateUser(
    id: string,
  ): Promise<{ message: string; timeOfDeletion?: Date | null; userInfo: any }> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deActivateTime || user.deActivateTime === 'null') {
      const updateTime = new Date();
      await this.userRepo.update(user.id, {
        deActivateTime: updateTime.toISOString(),
      });

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return {
        message: 'User deactivated successfully',
        timeOfDeletion: updateTime,
        userInfo: updatedUser,
      };
    } else {
      await this.userRepo.update(user.id, { deActivateTime: 'null' });

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return {
        message: 'User reactivated successfully',
        timeOfDeletion: null,
        userInfo: updatedUser,
      };
    }
  }

  async findOne(
    email: string,
    selectSecret: boolean = false,
  ): Promise<User | null> {
    const user = this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: selectSecret,
        firstname: true,
        lastname: true,
        image: true,
        status: true,
        verified: true,
        role: true,
      },
    });

    return user;
  }
}
