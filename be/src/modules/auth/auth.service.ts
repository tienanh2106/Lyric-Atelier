import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ErrorCode } from '../../common/enums/error-code.enum';

const MAX_SESSIONS = 5;

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(
    registerDto: RegisterDto,
    meta?: RequestMeta,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);
    const { accessToken, refreshToken } = await this.generateTokens(user, meta);
    return this.buildAuthResponse(user, accessToken, refreshToken);
  }

  async login(
    loginDto: LoginDto,
    meta?: RequestMeta,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'User account is inactive',
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user, meta);
    return this.buildAuthResponse(user, accessToken, refreshToken);
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }

  async refreshAccessToken(
    refreshToken: string,
    meta?: RequestMeta,
  ): Promise<AuthResponseDto> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    if (storedToken.isRevoked) {
      // Possible token reuse attack — revoke all sessions for this user
      await this.refreshTokenRepository.update(
        { userId: storedToken.userId },
        { isRevoked: true },
      );
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Refresh token has been revoked',
      });
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.TOKEN_EXPIRED,
        message: 'Refresh token has expired',
      });
    }

    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
      this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    // Token rotation: revoke used token before issuing new one
    await this.refreshTokenRepository.update(storedToken.id, {
      isRevoked: true,
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(storedToken.user, meta);

    return this.buildAuthResponse(
      storedToken.user,
      accessToken,
      newRefreshToken,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { isRevoked: true },
    );
  }

  private async generateTokens(
    user: User,
    meta?: RequestMeta,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '1d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    } as any);

    const expiresAt = this.parseExpiresAt(refreshExpiresIn);

    // Enforce session limit: remove oldest sessions if at capacity
    await this.enforceSessionLimit(user.id);

    // Clean up expired tokens while we're at it
    await this.refreshTokenRepository.delete({
      userId: user.id,
      expiresAt: LessThan(new Date()),
    });

    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      isRevoked: false,
      userAgent: meta?.userAgent?.substring(0, 255),
      ipAddress: meta?.ipAddress?.substring(0, 45),
    });

    return { accessToken, refreshToken };
  }

  private async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'ASC' },
    });

    if (activeSessions.length >= MAX_SESSIONS) {
      const toRevoke = activeSessions.slice(
        0,
        activeSessions.length - MAX_SESSIONS + 1,
      );
      await this.refreshTokenRepository.update(
        toRevoke.map((s) => s.id),
        { isRevoked: true },
      );
    }
  }

  private parseExpiresAt(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) return new Date(Date.now() + 86_400_000);

    const value = parseInt(match[1], 10);
    const unitMs: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return new Date(Date.now() + value * (unitMs[match[2]] ?? 86_400_000));
  }

  private buildAuthResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
