import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Public } from 'src/auth/decorators/public.decorator';
import { IntegrationService } from './integration.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('integration')
export class IntegrationController {
    constructor(
        private readonly integrationService: IntegrationService,
        private readonly httpService: HttpService) { }

    @Public()
    @Get()
    async getEvents(@Query('key') key: string) {
        const url = `https://api.cal.com/v2/event-types`;
        const response = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${key}`,
                },
            }),
        );
        return response.data;
    }

    @Post()
    async saveEvent(
        @Body() createEventDto: CreateEventDto,
        @Query('user-id') userId: string,
    ) {
        const { event_id, cal_key, title } = createEventDto;
        return await this.integrationService.saveEvent(
            userId,
            event_id,
            cal_key,
            title,
        );
    }

}
