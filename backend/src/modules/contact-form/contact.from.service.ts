import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactFormDto, InfoRequestFormDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContactFormEntity,
  InfoRequestFormEntity,
} from 'src/entities/contact-form';
import {
  DeepPartial,
  FindManyOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { ProductEntity } from 'src/entities/product';

@Injectable()
export class ContactFormService {
  constructor(
    @InjectRepository(ContactFormEntity)
    private readonly contactRepo: Repository<ContactFormEntity>,

    @InjectRepository(InfoRequestFormEntity)
    private readonly infoRepo: Repository<InfoRequestFormEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
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
}
