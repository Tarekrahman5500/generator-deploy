import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Administrator } from 'src/entities/administrator';
import { ACCESS_JWT } from './provider';
import { LoginDto, TokenDto } from 'src/modules/administrator/dto';
import { JwtPayload } from 'src/common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Administrator)
    private readonly adminRepo: Repository<Administrator>,

    @Inject(ACCESS_JWT)
    private readonly accessJwt: JwtService,
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
      admin: {
        id: admin.id,
        userName: admin.userName,
        email: admin.email,
        role: admin.role,
      },
    };
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

  private async generateTokensAndSave(admin: Administrator): Promise<TokenDto> {
    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.accessJwt.signAsync(payload);

    return { accessToken };
  }
}
