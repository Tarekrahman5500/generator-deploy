import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resend } from 'resend';

import { EmailCredentialEntity } from 'src/entities/email';
import { CreateEmailCredentialDto, UpdateEmailCredentialDto } from './schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailCredentialEntity)
    private readonly emailCredentialRepo: Repository<EmailCredentialEntity>,
  ) {}

  /* ======================================================
     EMAIL SENDING (READ FIRST, NO TRANSACTION)
     ====================================================== */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: {
      filename: string;
      content: Buffer;
    }[];
  }) {
    try {
      // ✅ READ before any write
      const { apiKey, fromEmail } = await this.getActiveCredential();

      const resend = new Resend(apiKey);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email sending timeout after 8 seconds'));
        }, 8000); // 8 seconds
      });

      // Race between email sending and timeout
      const sendEmailPromise = resend.emails.send({
        from: `Maresix <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      // Wait for either email to send or timeout
      return await Promise.race([sendEmailPromise, timeoutPromise]);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw new InternalServerErrorException(
        error?.message || 'Email sending failed',
      );
    }
  }

  /* ======================================================
     CREATE (READ → TRANSACTION WRITE)
     ====================================================== */
  async create(dto: CreateEmailCredentialDto) {
    // ✅ READ FIRST
    const exists = await this.emailCredentialRepo.findOne({
      where: { fromEmail: dto.fromEmail },
    });

    if (exists) {
      throw new ConflictException('From email already exists');
    }

    // ✅ TRANSACTION ONLY FOR WRITE
    return this.emailCredentialRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(EmailCredentialEntity);

      // 🔥 enforce single active
      if (dto.isActive === true) {
        await repo.update({ isActive: true }, { isActive: false });
      }

      const credential = repo.create(dto);
      return repo.save(credential);
    });
  }

  /* ======================================================
     GET ALL (NO TRANSACTION)
     ====================================================== */
  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.emailCredentialRepo.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  /* ======================================================
     GET ONE (NO TRANSACTION)
     ====================================================== */
  async findOne(id: string) {
    const credential = await this.emailCredentialRepo.findOne({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException('Email credential not found');
    }

    return credential;
  }

  /* ======================================================
     UPDATE (READ → TRANSACTION WRITE)
     ====================================================== */
  async update(id: string, dto: UpdateEmailCredentialDto) {
    // ✅ READ FIRST
    const credential = await this.emailCredentialRepo.findOne({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException('No credential found');
    }

    const nextStatus = dto.isActive ?? credential.isActive;
    // ✅ TRANSACTION ONLY FOR WRITE
    return this.emailCredentialRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(EmailCredentialEntity);

      if (nextStatus === true) {
        await repo.update({ isActive: true }, { isActive: false });
      }
      Object.assign(credential, dto);
      credential.isActive = nextStatus;
      return repo.save(credential);
    });
  }

  /* ======================================================
     DELETE (READ → TRANSACTION WRITE)
     ====================================================== */
  async remove(id: string) {
    // ✅ READ FIRST
    const credential = await this.findOne(id);

    // ✅ TRANSACTION ONLY FOR WRITE
    await this.emailCredentialRepo.manager.transaction(async (manager) => {
      await manager.remove(EmailCredentialEntity, credential);
    });

    return { deleted: true };
  }

  /* ======================================================
     GET ACTIVE (NO TRANSACTION)
     ====================================================== */
  async getActiveCredential(): Promise<EmailCredentialEntity> {
    const credential = await this.emailCredentialRepo.findOne({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });

    if (!credential) {
      throw new InternalServerErrorException(
        'No active email credential configured',
      );
    }

    return credential;
  }
}
