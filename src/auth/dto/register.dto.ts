import { IsNotEmpty, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    age: number;
}