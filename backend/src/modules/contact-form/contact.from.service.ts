import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ContactFormDto, EmailReplyDto, InfoRequestFormDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContactFormEmailReplyEntity,
  ContactFormEmailReplyFileRelationEntity,
  ContactFormEntity,
  InfoRequestEmailReplyEntity,
  InfoRequestEmailReplyFileRelationEntity,
  InfoRequestFormEntity,
} from 'src/entities/contact-form';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { ProductEntity } from 'src/entities/product';
import { FileService } from '../file/file.service';
import { EmailService } from '../email/email.service';
import { Administrator } from 'src/entities/administrator';

@Injectable()
export class ContactFormService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ContactFormEntity)
    private readonly contactRepo: Repository<ContactFormEntity>,

    @InjectRepository(InfoRequestFormEntity)
    private readonly infoRepo: Repository<InfoRequestFormEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectRepository(ContactFormEmailReplyEntity)
    private readonly contactEmailReplyRepo: Repository<ContactFormEmailReplyEntity>,

    @InjectRepository(ContactFormEmailReplyFileRelationEntity)
    private readonly contactEmailReplyFileRepo: Repository<ContactFormEmailReplyFileRelationEntity>,

    @InjectRepository(InfoRequestEmailReplyEntity)
    private readonly infoEmailReplyRepo: Repository<InfoRequestEmailReplyEntity>,

    @InjectRepository(InfoRequestEmailReplyFileRelationEntity)
    private readonly inforRequestEmailReplyFileRepo: Repository<InfoRequestEmailReplyFileRelationEntity>,

    @InjectRepository(Administrator)
    private readonly administratorRepo: Repository<Administrator>,

    private readonly fileService: FileService,

    private readonly emailService: EmailService,
  ) {}

  private create<T extends ObjectLiteral>(
    repo: Repository<T>,
    dto: DeepPartial<T>,
  ) {
    const entity = repo.create(dto);
    return repo.save(entity);
  }

  private async paginate<T extends ObjectLiteral>(
    repo: Repository<T>,
    page = 1,
    limit = 10,
    options: FindManyOptions<T>,
  ) {
    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await repo.findAndCount({
      take,
      skip,
      ...options,
    });

    return {
      meta: {
        total,
        page,
        limit,
        perPage: data.length,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async createContactFrom(contactFormDto: ContactFormDto) {
    return await this.create(this.contactRepo, contactFormDto);
  }

  async createInfoRequestFrom(infoRequestFormDto: InfoRequestFormDto) {
    const { productId, ...rest } = infoRequestFormDto;

    // 1️⃣ Validate product exists
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2️⃣ Create entity with proper relation
    const entity = this.infoRepo.create({
      ...rest,
      product, // ✅ relation mapping
    });

    // 3️⃣ Save
    return this.infoRepo.save(entity);
  }

  async getAllContactFrom(page = 1, limit = 10) {
    return this.paginate(this.contactRepo, page, limit, {
      order: { createdAt: 'DESC' },
    });
  }

  async getAllInfoRequestFrom(page = 1, limit = 10) {
    return this.paginate(this.infoRepo, page, limit, {
      relations: ['product'],
      select: {
        id: true,
        fullName: true,
        email: true,
        telephone: true,
        country: true,
        isReplied: true,
        createdAt: true,
        product: {
          id: true,
          modelName: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async contactFormEmailReply(dto: EmailReplyDto, repliedByAdminId: string) {
    // 1️⃣ READ contact form
    const contactForm = await this.contactRepo.findOne({
      where: { id: dto.parentId, isReplied: false },
    });
    if (!contactForm) throw new NotFoundException('Contact form not found');

    // 2️⃣ READ admin
    const admin = await this.administratorRepo.findOne({
      where: { id: repliedByAdminId },
    });
    if (!admin) throw new NotFoundException('Administrator not found');

    // 3️⃣ Prepare reply entity (NO DB WRITE yet)
    const reply = this.contactEmailReplyRepo.create({
      subject: dto.subject,
      body: dto.body,
      contactForm,
      repliedBy: admin,
    });

    // 4️⃣ Handle files
    let relations: ContactFormEmailReplyFileRelationEntity[] = [];
    let attachments: { filename: string; content: Buffer }[] | undefined;

    if (dto.fileIds?.length) {
      const files = await this.fileService.getFileByIds(dto.fileIds);

      if (files.length !== dto.fileIds.length) {
        throw new NotFoundException('Some files not found');
      }

      // Prepare DB relations
      relations = files.map((file) => {
        const relation = new ContactFormEmailReplyFileRelationEntity();
        relation.reply = reply;
        relation.file = file;
        return relation;
      });

      // Prepare email attachments
      attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.originalName,
          content: await this.fileService.getFileBuffer(file), // returns Buffer
        })),
      );
    }

    // 5️⃣ Send email first (outside transaction)
    try {
      await this.emailService.sendEmail({
        to: contactForm.email,
        subject: dto.subject,
        html: dto.body,
        attachments,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to send email: ${error?.message || error}`,
      );
    }
    // 6️⃣ Transaction → WRITES ONLY
    return this.dataSource.transaction(async (manager) => {
      // Save reply
      await manager.save(reply);
      if (relations.length) {
        await manager.save(relations);
        // Safe usedAtUpdate
        if (dto.fileIds?.length) {
          await this.fileService.usedAtUpdate(dto.fileIds, manager);
        }
      }
      // Mark contact form as replied
      const contactFormToUpdate = manager.create(ContactFormEntity, {
        ...contactForm,
        isReplied: true,
      });

      await manager.save(contactFormToUpdate);

      return contactFormToUpdate;
    });
  }

  async infoRequestFormEmailReply(
    dto: EmailReplyDto,
    repliedByAdminId: string,
  ) {
    const infoForm = await this.infoRepo.findOne({
      where: { id: dto.parentId, isReplied: false },
    });
    if (!infoForm) throw new NotFoundException('Info request form not found');

    const admin = await this.administratorRepo.findOne({
      where: { id: repliedByAdminId },
    });
    if (!admin) throw new NotFoundException('Administrator not found');

    const reply = this.infoEmailReplyRepo.create({
      subject: dto.subject,
      body: dto.body,
      infoRequestForm: infoForm,
      repliedBy: admin,
    });

    let relations: InfoRequestEmailReplyFileRelationEntity[] = [];
    let attachments: { filename: string; content: Buffer }[] | undefined;

    if (dto.fileIds?.length) {
      const files = await this.fileService.getFileByIds(dto.fileIds);

      if (files.length !== dto.fileIds.length) {
        throw new NotFoundException('Some files not found');
      }

      // Prepare DB relations
      relations = files.map((file) => {
        const relation = new InfoRequestEmailReplyFileRelationEntity();
        relation.reply = reply;
        relation.file = file;
        return relation;
      });

      attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.originalName,
          content: await this.fileService.getFileBuffer(file),
        })),
      );
    }

    try {
      await this.emailService.sendEmail({
        to: infoForm.email,
        subject: dto.subject,
        html: dto.body,
        attachments,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to send email: ${error.message || error}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.save(reply);

      if (relations.length) {
        await manager.save(relations);
        if (dto.fileIds?.length) {
          await this.fileService.usedAtUpdate(dto.fileIds, manager);
        }
      }

      // Mark contact form as replied
      const infoRequestFormToUpdate = manager.create(InfoRequestFormEntity, {
        ...infoForm,
        isReplied: true,
      });

      await manager.save(infoRequestFormToUpdate);

      return infoRequestFormToUpdate;
    });
  }

  async getAllContactFormEmailReply(page = 1, limit = 10) {
    return this.paginate(this.contactEmailReplyRepo, page, limit, {
      relations: ['contactForm', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllInfoRequestFormEmailReply(page = 1, limit = 10) {
    return this.paginate(this.infoEmailReplyRepo, page, limit, {
      relations: ['infoRequestForm', 'files'],
      order: { createdAt: 'DESC' },
    });
  }
}
