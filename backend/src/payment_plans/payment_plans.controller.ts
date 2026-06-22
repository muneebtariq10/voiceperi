/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    Put,
    //UseGuards,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { PaymentPlanService } from './payment_plans.service';
  import { CreatePaymentPlanDto } from './dto/create-plan.dto';
  import { UpdatePaymentPlanDto } from './dto/update-plan.dto';
//import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
  
  @Controller('payment-plans')
  export class PaymentPlanController {
    constructor(private readonly paymentPlanService: PaymentPlanService) {}
  
    @Public()
    //@UseGuards(LocalAuthGuard)
    @Post()
    async create(@Body() createDto: CreatePaymentPlanDto) {
      try {
        console.log('Received body:', createDto); // 👀
        return await this.paymentPlanService.create(createDto);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    } 
  
    @Public()
    //@UseGuards(LocalAuthGuard)
    @Get()
    findAll() {
      return this.paymentPlanService.findAll();
    }
  
    @Public()
    //@UseGuards(LocalAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.paymentPlanService.findOne(id);
    }
  
    @Public()
    //@UseGuards(LocalAuthGuard)
    @Put(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdatePaymentPlanDto,
    ) {
      return this.paymentPlanService.update(id, updateDto);
    }

    @Public()
    //@UseGuards(LocalAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.paymentPlanService.remove(id);
    }

    @Public()
    @Post('create-checkout-session/:id')
    async createCheckoutSession(
    @Param('id') planId: number,
    @Body('selectedPlan') selectedPlan: 'month' | 'year',
    @Body('userId') userId: string
    ): Promise<{ id: string }> {
    return this.paymentPlanService.createCheckoutSession(planId, selectedPlan, userId);
    }  
  }
  