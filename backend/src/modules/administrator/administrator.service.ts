import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entities/administrator';
import { Repository } from 'typeorm';
import { AdminUpdateDto } from './dto';
import { AdministratorRole } from 'src/common/enums';
import * as argon2 from 'argon2';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly adminRepo: Repository<Administrator>,
  ) {}

  async getAllAdmins() {
    return this.adminRepo.find({
      where: { role: AdministratorRole.ADMIN },
    });
  }

  async getAdminById(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async updateAdmin(adminUpdateDto: AdminUpdateDto) {
    const { id, password, ...updateData } = adminUpdateDto;

    // 1️⃣ Find the admin
    const admin = await this.getAdminById(id);

    // 2️⃣ Only allow updating admins (role check)
    if (admin.role !== AdministratorRole.ADMIN) {
      throw new BadRequestException('Only admins can be updated');
    }

    // 3️⃣ Hash password if provided
    if (password) {
      updateData['password'] = await argon2.hash(password);
    }

    // 4️⃣ Merge update data
    Object.assign(admin, updateData);

    // 5️⃣ Save updated admin
    await this.adminRepo.save(admin);

    return await this.getAdminById(id);
  }
}
