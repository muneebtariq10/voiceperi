/* eslint-disable prettier/prettier */
import {  IsString } from 'class-validator';

export class CreateEventDto {

  @IsString()
  cal_key: string;

  @IsString()
  event_id: string;

  @IsString()
  title: string;


}
