import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentPlanService } from './payment_plans.service';
import { CreatePaymentPlanDto } from './dto/create-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-plan.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/entities/user';

@Controller('payment-plans')
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createDto: CreatePaymentPlanDto) {
    try {
      console.log('Received body:', createDto); // 👀
      return await this.paymentPlanService.create(createDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get()
  findAll() {
    return this.paymentPlanService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentPlanService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentPlanDto,
  ) {
    return this.paymentPlanService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentPlanService.remove(id);
  }

  @Public()
  @Post('create-checkout-session/:id')
  async createCheckoutSession(
    @Param('id') planId: number,
    @Body('selectedPlan') selectedPlan: 'month' | 'year',
    @Body('userId') userId: string,
  ): Promise<{ id: string }> {
    return this.paymentPlanService.createCheckoutSession(
      planId,
      selectedPlan,
      userId,
    );
  }
}
