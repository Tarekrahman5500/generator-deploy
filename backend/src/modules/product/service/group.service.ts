import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GroupCreateDto, GroupUpdateDto } from '../dto';
import { GroupEntity } from 'src/entities/product/group.entity';
import { CategoryEntity, FieldEntity } from 'src/entities/product';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
  ) {}

  async createGroup(createGroupDto: GroupCreateDto): Promise<GroupEntity> {
    const { categoryId, fieldNames, groupName } = createGroupDto;

    // 1️⃣ Check category exists
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 2️⃣ Upsert group (skip if exists)
    let group = await this.groupRepository.findOne({
      where: { groupName, category: { id: categoryId } },
      relations: ['fields'],
    });

    if (!group) {
      group = this.groupRepository.create({
        groupName,
        category,
      });
      group = await this.groupRepository.save(group);
    }

    // 3️⃣ Collect existing field names (NO normalization)
    const existingFieldNames = new Set(
      (group.fields ?? []).map((f) => f.fieldName),
    );

    // 4️⃣ Filter out already-existing fields
    const newFieldNames = fieldNames.filter(
      (name) => name && !existingFieldNames.has(name),
    );

    // 5️⃣ Insert only new fields
    if (newFieldNames.length) {
      const fieldsToInsert = newFieldNames.map((name) => ({
        fieldName: name,
        group,
      }));

      // console.log('Fields to insert:', fieldsToInsert);
      await this.fieldRepository
        .createQueryBuilder()
        .insert()
        .into(FieldEntity)
        .values(fieldsToInsert)
        .orIgnore() // skip duplicates just in case
        .execute();
    }

    // 6️⃣ Return group with updated fields
    return this.groupRepository.findOneOrFail({
      where: { id: group.id },
      relations: ['fields'],
    });
  }

  // ------------------------------------------------------------
  // Find All Groups
  // ------------------------------------------------------------
  async findAllGroups(): Promise<GroupEntity[]> {
    return this.groupRepository.find({
      relations: ['category'],
    });
  }

  // ------------------------------------------------------------
  // Find Group by ID
  // ------------------------------------------------------------
  async findGroupById(id: string): Promise<GroupEntity | null> {
    return this.groupRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  // ------------------------------------------------------------
  // Update Group
  // ------------------------------------------------------------
  async updateGroup(groupDto: GroupUpdateDto): Promise<GroupEntity> {
    const { id, categoryId, groupName } = groupDto;

    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!group) throw new NotFoundException('Group not found');

    // Update category if provided
    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      group.category = category;
    }

    if (groupName) group.groupName = groupName;

    return this.groupRepository.save(group);
  }

  // ------------------------------------------------------------
  // Find Groups by Category ID
  // ------------------------------------------------------------
  async findGroupsByCategoryId(categoryId: string): Promise<GroupEntity[]> {
    return this.groupRepository.find({
      where: { category: { id: categoryId } },
      relations: ['fields'],
      order: { groupName: 'ASC' },
    });
  }

  // ------------------------------------------------------------
  // Delete Group by ID
  // ------------------------------------------------------------
  async deleteGroup(id: string): Promise<void> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');

    await this.groupRepository.delete({ id });
  }

  async findOrCreateGroup(
    category: CategoryEntity,
    groupName: string,
    entityManager: EntityManager,
  ): Promise<GroupEntity> {
    // Check if group already exists
    const existingGroup = await entityManager.findOne(GroupEntity, {
      where: {
        category: { id: category.id },
        groupName,
      },
    });

    if (existingGroup) {
      return existingGroup;
    }

    // Create new group
    const newGroup = entityManager.create(GroupEntity, {
      groupName,
      category,
    });

    return await entityManager.save(GroupEntity, newGroup);
  }
}
