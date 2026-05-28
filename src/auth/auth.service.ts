
import { Injectable, BadRequestException, HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private passwordService: PasswordService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(phone: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByPhoneNumber(phone);

        if (user && user.password) {
            const isPasswordValid = await this.passwordService.validatePassword(pass, user.password);

            if (isPasswordValid) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    private generateAccessToken(payload: { userId: string }): string {
        return this.jwtService.sign(payload);
    }

    private generateRefreshToken(payload: { userId: string }): string {
        const securityConfig = this.configService.get<string>('JWT_REFRESH_SECRET');

        return this.jwtService.sign(payload, {
            secret: securityConfig,
            expiresIn: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') ?? '604800') // Default to 7 days in seconds
        });
    }

    refreshToken(token: string) {
        try {
            const { userId } = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            return this.generateTokens({
                userId,
            });
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    getUserFromToken(token: string): Promise<User | null> {
        const id = this.jwtService.decode(token)['userId'];
        return this.usersService.findOneByUuid(id);
    }

    generateTokens(payload: { userId: string }) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }

    async login(phoneNumber: string, password: string) {
        const user = await this.usersService.findOneByPhoneNumber(phoneNumber);
        if (!user) {
            throw new NotFoundException('User not registered');
        }

        const passwordValid = await this.passwordService.validatePassword(
            password,
            user.password ?? '',
        );

        if (!passwordValid) {
            throw new BadRequestException('Invalid password');
        }

        return this.generateTokens({
            userId: user.uuid,
        });
    }

    async register(registerDto: RegisterDto): Promise<any> {
        // Check if the user already exists
        const existingUser = await this.usersService.findOneByPhoneNumber(registerDto.phoneNumber);
        if (existingUser !== null) {
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to register user, user already exists'
            });
        }

        const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

        // Merge the hashed password with the rest of the registration data
        const userData = { ...registerDto, password: hashedPassword };

        //
        const newUser = await this.usersService.createUser(userData);

        return this.generateTokens({
            userId: newUser.uuid,
        });
    }

    async extractTokenFromHeader(request: Request): Promise<string | undefined> {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
