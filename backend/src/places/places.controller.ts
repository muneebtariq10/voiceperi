import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('places')
export class PlacesController {
    constructor(private readonly httpService: HttpService) { }

    @Public()
    @Get('autocomplete')
    async autocomplete(@Query('input') input: string) {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

        const response = await firstValueFrom(this.httpService.get(url));
        return response.data;
    }
}
