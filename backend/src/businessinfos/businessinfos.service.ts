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
import { WebsiteImportService } from './website-import.service';

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
    private readonly websiteImportService: WebsiteImportService,
  ) {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  }

  async getBusinessInfo(query: string, language: string, user_id?: string, existingData?: any) {
    let placeDetails: PlaceDetailsResult | null = null;
    try {
      if (
        query.startsWith('http://') ||
        query.startsWith('https://') ||
        query.includes('.com') ||
        query.includes('.net') ||
        query.includes('.org') ||
        query.toLowerCase().includes('printez')
      ) {
        this.logger.log(`Query appears to be a website URL: ${query}`);
        placeDetails = await this.websiteImportService.scrapeWebsite(query);
      } else {
        const placeId = await this.findPlaceIdFromText(query);
        if (placeId) {
          placeDetails = await this.getBusinessDetailsByPlaceId(
            placeId,
            language || 'en',
          );
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch details for query: ${query}`);
    }

    if (!user_id) {
      // If no user_id, return the place details only (no DB save)
      return { ...placeDetails, ...(existingData || {}) };
    }
    const createBusinessinfoDto: CreateBusinessinfoDto = {
      user_id,
      query,
      timezone: existingData?.timezone || 'America/Detroit',
    };

    if (!placeDetails) {
      // Fallback dummy place details if not found on Google Maps
      placeDetails = {
        name: existingData?.name || query,
        website: existingData?.profile || query,
        formatted_address: existingData?.address || '',
        international_phone_number: existingData?.phone || '',
        types: existingData?.services || [],
        opening_hours: { weekday_text: existingData?.business_hours || [] },
        editorial_summary: { overview: existingData?.overview || '' },
      };
    } else if (existingData) {
      if (existingData.name) placeDetails.name = existingData.name;
      if (existingData.address) placeDetails.formatted_address = existingData.address;
      if (existingData.phone) placeDetails.international_phone_number = existingData.phone;
      if (existingData.overview) placeDetails.overview = existingData.overview;
      if (existingData.services) placeDetails.services = existingData.services;
      if (existingData.business_hours) placeDetails.business_hours = existingData.business_hours;
      if (existingData.profile) placeDetails.profile = existingData.profile;
    }

    return await this.create(createBusinessinfoDto, placeDetails);
  }

  async getNewBusinessInfo(query: string, user_id: string) {
    let placeDetails: PlaceDetailsResult | null = null;
    try {
      if (
        query.startsWith('http://') ||
        query.startsWith('https://') ||
        query.includes('.com') ||
        query.includes('.net') ||
        query.includes('.org') ||
        query.toLowerCase().includes('printez')
      ) {
        this.logger.log(`Query appears to be a website URL: ${query}`);
        placeDetails = await this.websiteImportService.scrapeWebsite(query);
      } else {
        const placeId = await this.findPlaceIdFromText(query);
        if (placeId) {
          const agentInfo = await this.agentRepo.findOne({
            where: { user: { id: user_id } },
            relations: ['language', 'user'],
          });

          placeDetails = await this.getBusinessDetailsByPlaceId(
            placeId,
            agentInfo?.language?.code || 'en',
          );
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch new place details for query: ${query}`);
    }

    if (!placeDetails) {
      // Fallback dummy place details if not found on Google Maps
      placeDetails = {
        name: query,
        website: query,
        formatted_address: '',
        international_phone_number: '',
        types: [],
        opening_hours: { weekday_text: [] },
        editorial_summary: { overview: '' },
      };
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
      profile: place.profile || place.url || place.website || '',
      websiteUrl: place.websiteUrl || place.website || place.url || '',
      businessType: place.businessType || (place.types?.includes('ecommerce') ? 'ecommerce' : 'physical'),
      name: place.name || 'My Business',
      address: place.address || place.formatted_address || 'Unknown',
      phone: place.phone || place.international_phone_number || '',
      overview: place.overview || place.editorial_summary?.overview || '',
      services: place.services || filteredTypes,
      timezone: place.timezone || createBusinessinfoDto.timezone || 'America/Detroit',
      business_hours: place.business_hours || place.opening_hours?.weekday_text || [],
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
        websiteUrl: place.website || (place.url ? place.url : ''),
        businessType: place.types?.includes('ecommerce')
          ? 'ecommerce'
          : 'physical',
        name: place.name,
        address: place.formatted_address || 'Unknown',
        phone: place.international_phone_number || '',
        overview: place.editorial_summary?.overview || place.overview || '',
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
