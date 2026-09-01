import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateBusinessinfoDto {
  // @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  query: string;

  @IsNotEmpty()
  timezone: string;

  @IsOptional()
  shopifyStoreUrl?: string;

  @IsOptional()
  shopifyAccessToken?: string;

  @IsOptional()
  shopifyClientId?: string;

  @IsOptional()
  shopifyClientSecret?: string;
}
