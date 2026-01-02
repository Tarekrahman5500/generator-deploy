import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly infoEmailReplyFileRepo: Repository<InfoRequestEmailReplyFileRelationEntity>,

    private readonly fileService: FileService,

    private readonly emailService: EmailService,
  ) {}

  // FIX 1: Add <T extends ObjectLiteral>
  // FIX 2: Change Partial<T> to DeepPartial<T>
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

  // FIX 1: Add <T extends ObjectLiteral>
  private getAll<T extends ObjectLiteral>(repo: Repository<T>) {
    // FIX 3: Cast the order object to 'any'.
    // Since T is generic, TypeScript cannot verify 'createdAt' exists on FindOptionsOrder<T>
    // without extremely complex type guards. Casting is safe here since you know your entities have this field.
    // return repo.find({ order: { createdAt: 'DESC' } as any });
    return repo.find();
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
        createdAt: true,
        product: {
          id: true,
          modelName: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  // async contactFormEmailReply(dto: EmailReplyDto, repliedByAdminId: string) {
  //   return this.dataSource.transaction(async (manager) => {
  //     const contactForm = await manager.findOne(ContactFormEntity, {
  //       where: { id: dto.parentId },
  //     });
  //     if (!contactForm) throw new NotFoundException('Contact form not found');

  //     // create reply
  //     const reply = manager.create(ContactFormEmailReplyEntity, {
  //       subject: dto.subject,
  //       body: dto.body,
  //       contactForm,
  //       repliedByAdminId: repliedByAdminId,
  //     });
  //     await manager.save(reply);

  //     // handle files
  //     if (dto.fileIds?.length) {
  //       const files = await this.fileService.getFileByIds(dto.fileIds, manager);
  //       if (files.length !== dto.fileIds.length) {
  //         throw new NotFoundException('Some files not found');
  //       }

  //       const relations = files.map((file) =>
  //         manager.create(ContactFormEmailReplyFileRelationEntity, {
  //           reply,
  //           file,
  //         }),
  //       );
  //       await manager.save(relations);

  //       await this.fileService.usedAtUpdate(dto.fileIds, manager);
  //     }

  //     // mark parent replied
  //     contactForm.isReplied = true;
  //     await manager.save(contactForm);

  //     // send email
  //     try {
  //       await this.emailService.sendEmail({
  //         to: contactForm.email,
  //         subject: dto.subject,
  //         html: dto.body,
  //       });
  //     } catch (error) {
  //       throw new Error(`Failed to send email: ${error.message || error}`);
  //     }

  //     return reply;
  //   });
  // }

  // async infoRequestFormEmailReply(
  //   dto: EmailReplyDto,
  //   repliedByAdminId: string,
  // ) {
  //   return this.dataSource.transaction(async (manager) => {
  //     const infoForm = await manager.findOne(InfoRequestFormEntity, {
  //       where: { id: dto.parentId },
  //     });
  //     if (!infoForm) throw new NotFoundException('Info request form not found');

  //     const reply = manager.create(InfoRequestEmailReplyEntity, {
  //       subject: dto.subject,
  //       body: dto.body,
  //       infoRequestForm: infoForm,
  //       repliedByAdminId: repliedByAdminId,
  //     });
  //     await manager.save(reply);

  //     // handle files
  //     if (dto.fileIds?.length) {
  //       const files = await this.fileService.getFileByIds(dto.fileIds, manager);
  //       if (files.length !== dto.fileIds.length) {
  //         throw new NotFoundException('Some files not found');
  //       }

  //       const relations = files.map((file) =>
  //         manager.create(InfoRequestEmailReplyFileRelationEntity, {
  //           reply,
  //           file,
  //         }),
  //       );
  //       await manager.save(relations);

  //       await this.fileService.usedAtUpdate(dto.fileIds, manager);
  //     }

  //     // mark parent replied
  //     infoForm.isReplied = true;
  //     await manager.save(infoForm);

  //     // send email
  //     try {
  //       await this.emailService.sendEmail({
  //         to: infoForm.email,
  //         subject: dto.subject,
  //         html: dto.body,
  //       });
  //     } catch (error) {
  //       throw new Error(`Failed to send email: ${error.message || error}`);
  //     }

  //     return reply;
  //   });
  // }

  async contactFormEmailReply(dto: EmailReplyDto, repliedByAdminId: string) {
    // Step 1: Fetch contact form
    const contactForm = await this.dataSource.manager.findOne(
      ContactFormEntity,
      {
        where: { id: dto.parentId },
      },
    );
    if (!contactForm) throw new NotFoundException('Contact form not found');

    // Step 2: Prepare reply entity
    const reply = this.dataSource.manager.create(ContactFormEmailReplyEntity, {
      subject: dto.subject,
      body: dto.body,
      contactForm,
      repliedByAdminId,
    });

    // Step 3: Handle files
    let relations: ContactFormEmailReplyFileRelationEntity[] = [];
    if (dto.fileIds?.length) {
      const files = await this.fileService.getFileByIds(dto.fileIds);
      if (files.length !== dto.fileIds.length) {
        throw new NotFoundException('Some files not found');
      }

      relations = files.map((file) =>
        this.dataSource.manager.create(
          ContactFormEmailReplyFileRelationEntity,
          {
            reply,
            file,
          },
        ),
      );
    }

    // Step 4: Send email first
    try {
      await this.emailService.sendEmail({
        to: contactForm.email,
        subject: dto.subject,
        html: dto.body,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message || error}`);
    }

    // Step 5: Transaction to save all data
    return this.dataSource.transaction(async (manager) => {
      await manager.save(reply);

      if (relations.length) {
        await manager.save(relations);
        await this.fileService.usedAtUpdate(dto.fileIds ?? [], manager);
      }

      contactForm.isReplied = true;
      await manager.save(contactForm);

      return reply;
    });
  }

  async infoRequestFormEmailReply(
    dto: EmailReplyDto,
    repliedByAdminId: string,
  ) {
    // Step 1: Fetch info request form
    const infoForm = await this.dataSource.manager.findOne(
      InfoRequestFormEntity,
      {
        where: { id: dto.parentId },
      },
    );
    if (!infoForm) throw new NotFoundException('Info request form not found');

    // Step 2: Prepare reply entity
    const reply = this.dataSource.manager.create(InfoRequestEmailReplyEntity, {
      subject: dto.subject,
      body: dto.body,
      infoRequestForm: infoForm,
      repliedByAdminId,
    });

    // Step 3: Handle files
    let relations: InfoRequestEmailReplyFileRelationEntity[] = [];
    if (dto.fileIds?.length) {
      const files = await this.fileService.getFileByIds(dto.fileIds);
      if (files.length !== dto.fileIds.length) {
        throw new NotFoundException('Some files not found');
      }

      relations = files.map((file) =>
        this.dataSource.manager.create(
          InfoRequestEmailReplyFileRelationEntity,
          {
            reply,
            file,
          },
        ),
      );
    }

    // Step 4: Send email first
    try {
      await this.emailService.sendEmail({
        to: infoForm.email,
        subject: dto.subject,
        html: dto.body,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message || error}`);
    }

    // Step 5: Transaction to save all data
    return this.dataSource.transaction(async (manager) => {
      await manager.save(reply);

      if (relations.length) {
        await manager.save(relations);
        await this.fileService.usedAtUpdate(dto.fileIds ?? [], manager);
      }

      infoForm.isReplied = true;
      await manager.save(infoForm);

      return reply;
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
