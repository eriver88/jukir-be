import { Body, Controller, Post, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<BaseResponseDto<any>> {
        const loginResp = await this.authService.login(loginDto.phoneNumber, loginDto.password);

        return new BaseResponseDto({
            statusCode: HttpStatus.OK,
            message: 'User logged in successfully',
            data: loginResp // Return the JWT token upon successful login,
        });
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<BaseResponseDto<any>> {
        const registerResp = await this.authService.register(registerDto);

        return new BaseResponseDto({
            statusCode: HttpStatus.CREATED,
            message: 'User registered successfully',
            data: registerResp // Return the JWT token upon successful registration,
        });
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh(@Req() req): Promise<BaseResponseDto<any>> {
        const jwtToken = await this.authService.extractTokenFromHeader(req);
        const refreshResp = await this.authService.refreshToken(jwtToken ?? '');


        return new BaseResponseDto({
            statusCode: HttpStatus.CREATED,
            message: 'Token refreshed successfully',
            data: refreshResp // Return the new JWT token upon successful refresh,
        });
    }
}
