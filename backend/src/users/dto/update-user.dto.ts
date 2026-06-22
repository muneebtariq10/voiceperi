import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    image?: string[];

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    status?: number;

    @IsOptional()
    verified?: number;

    @IsOptional()
    @MinLength(8)
    password?: string;

}