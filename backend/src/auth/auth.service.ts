import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Administrator, AdministratorToken } from 'src/entities/administrator';
import { ACCESS_JWT, REFRESH_JWT } from './provider';
import {
  LoginDto,
  RefreshTokenDto,
  TokenDto,
} from 'src/modules/administrator/dto';
import { JwtPayload } from 'src/common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Administrator)
    private readonly adminRepo: Repository<Administrator>,

    @InjectRepository(AdministratorToken)
    private readonly tokenRepo: Repository<AdministratorToken>,

    @Inject(ACCESS_JWT)
    private readonly accessJwt: JwtService,

    @Inject(REFRESH_JWT)
    private readonly refreshJwt: JwtService,
  ) {}

  // ------------------------
  // Public Methods
  // ------------------------

  async login(loginDto: LoginDto) {
    const admin = await this.findAdminByIdentifier(loginDto.email);
    await this.verifyPassword(admin.password, loginDto.password);

    const tokens = await this.generateTokensAndSave(admin);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        userName: admin.userName,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenDto> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const tokenRow = await this.tokenRepo.findOne({
      where: {
        token: dto.refreshToken,
        // userId: payload.id,
        // logoutAt: null,
      },
      //   order: { createdAt: 'DESC' },
    });

    // console.log('logout', tokenRow);

    if (
      !tokenRow ||
      tokenRow.logoutAt ||
      (tokenRow.expiresAt && tokenRow.expiresAt.getTime() < Date.now())
    ) {
      throw new UnauthorizedException(
        'Refresh token expired or not found or used',
      );
    }

    // mark old token as logged out
    tokenRow.logoutAt = new Date();
    // console.log('logout', tokenRow);
    await this.tokenRepo.update(tokenRow.id, { logoutAt: new Date() });
    // await this.tokenRepo.save(tokenRow);

    const admin = await this.adminRepo.findOne({ where: { id: payload.id } });
    if (!admin) throw new UnauthorizedException('User not found');

    return this.generateTokensAndSave(admin);
  }

  async logout(userId: string) {
    const tokens = await this.tokenRepo.find({
      where: { userId, logoutAt: undefined },
    });
    if (!tokens.length) return { loggedOutCount: 0 };

    for (const t of tokens) {
      t.logoutAt = new Date();
      await this.tokenRepo.save(t);
    }

    return { loggedOutCount: tokens.length };
  }

  // ------------------------
  // Private Helpers
  // ------------------------

  private async findAdminByIdentifier(email: string): Promise<Administrator> {
    const admin = await this.adminRepo.findOne({
      where: { email },
    });

    if (!admin) throw new UnauthorizedException('Invalid credentials');
    return admin;
  }

  private async verifyPassword(hash: string, password: string) {
    const valid = await argon2.verify(hash, password).catch(() => false);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.refreshJwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokensAndSave(admin: Administrator): Promise<TokenDto> {
    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.accessJwt.signAsync(payload);
    const refreshToken = await this.refreshJwt.signAsync(payload);

    const expiresAt = this.getTokenExpiry(refreshToken);

    await this.tokenRepo.save({
      userId: admin.id,
      token: refreshToken,
      expiresAt,
      createdAt: new Date(),
    } as Partial<AdministratorToken>);

    return { accessToken, refreshToken };
  }

  private getTokenExpiry(token: string): Date {
    const decoded = this.refreshJwt.decode(token) as JwtPayload;
    return decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // fallback 30 days
  }
}
