import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBusinessinfoDto {
  // @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  query: string;

  @IsNotEmpty()
  timezone: string;
}
