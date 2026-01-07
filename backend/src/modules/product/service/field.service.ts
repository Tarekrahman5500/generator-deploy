import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { FieldCreateDto, FieldUpdateDto, GroupFieldsDto } from '../dto';
import {
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
} from 'src/entities/product';
import { GroupEntity } from 'src/entities/product/group.entity';

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  // ------------------------------------------------------------
  // Create Field
  // ------------------------------------------------------------
  async createField(createFieldDto: FieldCreateDto): Promise<FieldEntity> {
    const { id, ...fieldData } = createFieldDto;

    // Check if group exists
    const group = await this.groupRepository.findOne({
      where: { id },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const field = this.fieldRepository.create({
      ...fieldData,
      group,
    });

    return this.fieldRepository.save(field);
  }

  // ------------------------------------------------------------
  // Find All Fields
  // ------------------------------------------------------------
  async findAllFields(): Promise<FieldEntity[]> {
    return this.fieldRepository.find({
      relations: ['group'],
    });
  }

  // ------------------------------------------------------------
  // Find Field by ID
  // ------------------------------------------------------------
  async findFieldById(id: string): Promise<FieldEntity | null> {
    return this.fieldRepository.findOne({
      where: { id },
      relations: ['group'],
    });
  }

  // ------------------------------------------------------------
  // Update Field
  // ------------------------------------------------------------
  async updateField(fieldDto: FieldUpdateDto): Promise<FieldEntity> {
    const { id, groupId, fieldName } = fieldDto;

    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: ['group'],
    });
    if (!field) throw new NotFoundException('Field not found');

    // Update group if provided
    if (groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
      });
      if (!group) throw new NotFoundException('Group not found');
      field.group = group;
    }

    if (fieldName) field.fieldName = fieldName;

    return this.fieldRepository.save(field);
  }

  // ------------------------------------------------------------
  // Find Fields by Group ID
  // ------------------------------------------------------------
  async findFieldsByGroupId(groupId: string): Promise<FieldEntity[]> {
    return this.fieldRepository.find({
      where: { group: { id: groupId } },
      // relations: ['group'],
    });
  }

  // ------------------------------------------------------------
  // Delete Field by ID
  // ------------------------------------------------------------
  async deleteField(id: string): Promise<void> {
    const field = await this.fieldRepository.findOne({ where: { id } });
    if (!field) throw new NotFoundException('Field not found');

    await this.fieldRepository.delete({ id });
  }

  async findFieldsByIdsOrFail(ids: string[]): Promise<FieldEntity[]> {
    const records = await this.fieldRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = records.map((r) => r.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(`Fields not found: ${missingIds.join(', ')}`);
    }

    return records;
  }

  async upsertProductValuesForGroup(
    product: ProductEntity,
    group: GroupEntity,
    dto: GroupFieldsDto[],
    manager: EntityManager,
  ) {
    if (!dto?.length) return [];

    const fieldRepo = manager.getRepository(FieldEntity);
    const valueRepo = manager.getRepository(ProductValueEntity);

    // Normalize incoming field names
    const normalized = dto.map((f) => ({
      original: f,
      key: f.fieldName.trim().toLowerCase(),
    }));

    /**
     * STEP 1: Fetch all existing fields for this group
     */
    const existingFields = await fieldRepo.find({
      where: { group: { id: group.id } },
    });

    const fieldMap = new Map(
      existingFields.map((f) => [f.fieldName.toLowerCase(), f]),
    );

    /**
     * STEP 2: Build field upserts (update or new create)
     */
    const finalFields = normalized.map((item) => {
      const match = fieldMap.get(item.key);
      if (match) return match;

      return fieldRepo.create({
        group,
        fieldName: item.original.fieldName,
      });
    });

    // Persist fields (new or existing)
    const savedFields = await fieldRepo.save(finalFields);

    // Re-map by lowercase name for fast lookup
    const savedFieldMap = new Map(
      savedFields.map((f) => [f.fieldName.toLowerCase(), f]),
    );

    /**
     * STEP 3: Fetch existing product values in one query
     */
    const existingValues = await valueRepo.find({
      where: { product: { id: product.id } },
      relations: ['field'],
    });

    const valueMap = new Map(
      existingValues.map((pv) => [pv.field.fieldName.toLowerCase(), pv]),
    );

    /**
     * STEP 4: Build value upserts
     */
    const valuesToUpsert = normalized.map((item) => {
      const field = savedFieldMap.get(item.key);

      const existingValue = valueMap.get(item.key);
      if (existingValue) {
        existingValue.value = item.original.value;
        return existingValue;
      }

      return valueRepo.create({
        product,
        field,
        value: item.original.value,
      });
    });

    /**
     * STEP 5: Bulk save product values
     */
    return valueRepo.save(valuesToUpsert);
  }
}
