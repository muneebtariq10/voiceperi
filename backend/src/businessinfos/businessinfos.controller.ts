import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BusinessinfosService } from './businessinfos.service';
import { UpdateBusinessinfoDto } from './dto/update-businessinfo.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('businessinfos')
export class BusinessinfosController {
  constructor(private readonly businessinfosService: BusinessinfosService) {}

  @Post()
  async create(
    @Body()
    body: {
      query?: string;
      profile?: string;
      name?: string;
      language?: string;
      user_id?: string;
      [key: string]: any;
    },
  ) {
    return await this.businessinfosService.getBusinessInfo(
      body.query || body.profile || body.name || '',
      body.language || 'en',
      body.user_id,
      body,
    );
  }

  @Post('new-info')
  async getNewBusinessInfo(@Body() body: { query: string; user_id: string }) {
    return await this.businessinfosService.getNewBusinessInfo(
      body.query,
      body.user_id,
    );
  }

  @Get()
  findAll() {
    return this.businessinfosService.findAll();
  }

  @Get(':user_id')
  findByUserId(@Param('user_id') userId: string) {
    return this.businessinfosService.findOneByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusinessinfoDto: UpdateBusinessinfoDto,
  ) {
    return this.businessinfosService.update(id, updateBusinessinfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessinfosService.remove(id);
  }
}
