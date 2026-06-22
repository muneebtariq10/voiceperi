import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateBusinessinfoDto } from './dto/create-businessinfo.dto';
import { UpdateBusinessinfoDto } from './dto/update-businessinfo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessInformation } from 'src/entities/business_information';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { catchError, firstValueFrom, map, timeout } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/entities/user';
import { Agent } from 'src/entities/agent';

export interface PlaceDetailsResult {
  place_id?: string;
  name: string;
  formatted_address?: string;
  geometry?: any;
  international_phone_number?: string;
  opening_hours?: any;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: any[];
  types?: string[];
  photos?: any[];
  business_status?: string;
  [key: string]: any;
}

interface PlaceDetailsResponse {
  status: string;
  result: PlaceDetailsResult;
  error_message?: string;
}

interface FindPlaceResponse {
  status: string;
  candidates: { place_id: string }[];
  error_message?: string;
}

@Injectable()
export class BusinessinfosService {
  private readonly logger = new Logger(BusinessinfosService.name);
  private readonly apiKey: string;
  private readonly findPlaceBaseUrl =
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  private readonly detailsBaseUrl =
    'https://maps.googleapis.com/maps/api/place/details/json';
  private readonly requestTimeout = 10000;

  constructor(
    @InjectRepository(BusinessInformation)
    private businessInfoRepo: Repository<BusinessInformation>,
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  }

  async getBusinessInfo(query: string, language: string, user_id?: string) {
    const placeId = await this.findPlaceIdFromText(query);

    if (!placeId) {
      throw new NotFoundException('Place ID could not be found.');
    }

    const placeDetails = await this.getBusinessDetailsByPlaceId(
      placeId,
      language || 'en',
    );

    if (!user_id) {
      // If no user_id, return the place details only (no DB save)
      return placeDetails;
    }
    const createBusinessinfoDto: CreateBusinessinfoDto = {
      user_id,
      query,
      timezone: 'America/Detroit',
    };

    return await this.create(createBusinessinfoDto, placeDetails);
  }
  async getNewBusinessInfo(query: string, user_id: string) {
    const placeId = await this.findPlaceIdFromText(query);

    if (!placeId) {
      throw new NotFoundException('Place ID could not be found.');
    }
    const agentInfo = await this.agentRepo.findOne({
      where: { user: { id: user_id } },
      relations: ['language', 'user'],
    });

    const placeDetails = await this.getBusinessDetailsByPlaceId(
      placeId,
      agentInfo?.language?.code || 'en',
    );

    if (!placeDetails) {
      throw new NotFoundException('Business info not found');
    }
    return placeDetails;
  }

  async findPlaceIdFromText(query: string): Promise<string | null> {
    if (!this.apiKey)
      throw new InternalServerErrorException(
        'Google Places API key is not configured.',
      );
    if (!query || query.trim().length < 3) {
      throw new InternalServerErrorException(
        'Search query must be provided and be at least 3 characters.',
      );
    }

    const params = {
      input: query,
      inputtype: 'textquery',
      fields: 'place_id',
      key: this.apiKey,
    };

    const request$ = this.httpService
      .get<FindPlaceResponse>(this.findPlaceBaseUrl, { params })
      .pipe(
        timeout(this.requestTimeout),
        map((response) => {
          switch (response.data.status) {
            case 'OK':
              return response.data.candidates?.[0]?.place_id ?? null;
            case 'ZERO_RESULTS':
              return null;
            case 'INVALID_REQUEST':
            case 'OVER_QUERY_LIMIT':
            case 'REQUEST_DENIED':
              throw new InternalServerErrorException(
                `Error: ${response.data.error_message || response.data.status}`,
              );
            default:
              throw new InternalServerErrorException(
                `Google Places API Error: ${response.data.status}`,
              );
          }
        }),
        catchError((error) => {
          if (error instanceof InternalServerErrorException) {
            throw error;
          }
          const axiosError = error as AxiosError;
          throw new InternalServerErrorException(
            'Failed to communicate with Google Places API.',
          );
        }),
      );

    return firstValueFrom(request$);
  }

  async getBusinessDetailsByPlaceId(
    placeId: string,
    language: string,
  ): Promise<PlaceDetailsResult> {
    if (!this.apiKey)
      throw new InternalServerErrorException(
        'Google Places API key is not configured.',
      );
    if (!placeId) throw new NotFoundException('Place ID must be provided.');

    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'international_phone_number',
      'opening_hours',
      'website',
      'url',
      'rating',
      'user_ratings_total',
      'reviews',
      'types',
      'photos',
      'business_status',
      'editorial_summary',
    ].join(',');

    const params = { place_id: placeId, fields, key: this.apiKey, language };

    const request$ = this.httpService
      .get<PlaceDetailsResponse>(this.detailsBaseUrl, { params })
      .pipe(
        timeout(this.requestTimeout),
        map((response) => {
          switch (response.data.status) {
            case 'OK':
              return response.data.result;
            case 'ZERO_RESULTS':
            case 'NOT_FOUND':
              throw new NotFoundException(
                `No details found for Place ID: ${placeId}`,
              );
            case 'INVALID_REQUEST':
            case 'OVER_QUERY_LIMIT':
            case 'REQUEST_DENIED':
              throw new InternalServerErrorException(
                `Error: ${response.data.error_message || response.data.status}`,
              );
            default:
              throw new InternalServerErrorException(
                `Google Places API Error: ${response.data.status}`,
              );
          }
        }),
        catchError((error) => {
          if (
            error instanceof NotFoundException ||
            error instanceof InternalServerErrorException
          ) {
            throw error;
          }
          const axiosError = error as AxiosError;
          throw new InternalServerErrorException(
            'Failed to communicate with Google Places API.',
          );
        }),
      );

    return firstValueFrom(request$);
  }

  async create(
    createBusinessinfoDto: CreateBusinessinfoDto,
    place: PlaceDetailsResult,
  ): Promise<BusinessInformation> {
    const user = await this.businessInfoRepo.manager.findOne(User, {
      where: { id: createBusinessinfoDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createBusinessinfoDto.user_id} not found`,
      );
    }

    const filteredTypes = (place.types || [])
      .filter(
        (type) => type !== 'point_of_interest' && type !== 'establishment',
      )
      .slice(0, 5);
    const businessInfo = this.businessInfoRepo.create({
      id: uuidv4(),
      profile: place.url ? place.url : place.website || '',
      name: place.name,
      address: place.formatted_address,
      phone: place.international_phone_number || '',
      overview: place.editorial_summary?.overview || '',
      services: filteredTypes,
      timezone: 'America/Detroit',
      business_hours: place.opening_hours?.weekday_text || [],
      user_id: user,
    });

    return await this.businessInfoRepo.save(businessInfo);
  }

  async findAll(): Promise<BusinessInformation[]> {
    return await this.businessInfoRepo.find();
  }

  async findOne(id: string): Promise<BusinessInformation> {
    const businessInfo = await this.businessInfoRepo.findOne({ where: { id } });
    if (!businessInfo) {
      throw new NotFoundException(`BusinessInfo with ID ${id} not found`);
    }
    return businessInfo;
  }
  async findOneByUserId(user_id: string): Promise<BusinessInformation> {
    const businessInfo = await this.businessInfoRepo.findOne({
      where: { user_id: { id: user_id } },
      relations: ['user_id'],
    });

    if (!businessInfo) {
      throw new NotFoundException(
        `BusinessInfo for user ID ${user_id} not found`,
      );
    }
    return businessInfo;
  }

  async update(
    id: string,
    updateBusinessinfoDto: UpdateBusinessinfoDto,
    place?: PlaceDetailsResult,
  ): Promise<BusinessInformation> {
    const businessInfo = await this.findOne(id);

    // If a Google PlaceDetailsResult is provided, override fields
    if (place) {
      const filteredTypes = (place.types || []).filter(
        (type) => type !== 'point_of_interest' && type !== 'establishment',
      );

      const placePayload: Partial<BusinessInformation> = {
        profile: place.url ? place.url : place.website || '',
        name: place.name,
        address: place.formatted_address,
        phone: place.international_phone_number || '',
        overview: place.editorial_summary?.overview || '',
        services: filteredTypes,
        timezone: '', // optional, fill later
        business_hours: place.opening_hours?.weekday_text || [],
      };

      Object.assign(businessInfo, placePayload);
    } else {
      // Regular update with DTO
      Object.assign(businessInfo, updateBusinessinfoDto);
    }

    // Save and return fresh data
    await this.businessInfoRepo.save(businessInfo);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const businessInfo = await this.findOne(id);
    await this.businessInfoRepo.remove(businessInfo);
    return { message: `BusinessInfo with ID ${id} deleted successfully` };
  }
}
