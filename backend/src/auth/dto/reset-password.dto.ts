/* eslint-disable prettier/prettier */
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @MinLength(8, { message: 'password must not be less than 8 characters' })
    @IsNotEmpty()
    password: string;

    @MinLength(8, { message: 'password must not be less than 8 characters' })
    @IsNotEmpty()
    confirm_password: string;
}