import { BadRequestException, Controller, Req } from '@nestjs/common';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { User } from '@prisma/client';
import { Get, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { ProfileDto } from './dto/profile.dto';
import { plainToInstance } from 'class-transformer';

@Controller('api/users')
export class UsersController {
    constructor(private userService: UsersService, private authService: AuthService) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async profile(@Req() req): Promise<BaseResponseDto<ProfileDto>> {
        const jwtToken = await this.authService.extractTokenFromHeader(req);
        const user: User | null = await this.authService.getUserFromToken(jwtToken ?? '');
        const profileData: ProfileDto = plainToInstance(ProfileDto, user, {
            excludeExtraneousValues: true
        });

        if (user !== null) {
            return new BaseResponseDto<ProfileDto>({
                statusCode: HttpStatus.OK,
                message: 'User profile retrieved successfully',
                data: profileData // You can replace this with actual user profile data if needed
            });
        }

        throw new BadRequestException('Invalid token');
    }
}
