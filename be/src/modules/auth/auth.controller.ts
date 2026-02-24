import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ global: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    operationId: 'register',
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    return this.authService.register(registerDto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Public()
  @Post('login')
  @Throttle({ global: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    operationId: 'login',
    summary: 'Login user',
    description: 'Authenticate user and get access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'getMe',
    summary: 'Get current user profile',
    description: 'Get authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @Public()
  @Post('refresh')
  @Throttle({ global: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    operationId: 'refreshToken',
    summary: 'Refresh access token',
    description: 'Exchange refresh token for new access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    operationId: 'logout',
    summary: 'Logout user',
    description: 'Revoke refresh token to logout user',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
