import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { GroupCreateDto, GroupUpdateDto } from '../dto';
import { GroupEntity } from 'src/entities/product/group.entity';
import { CategoryEntity, FieldEntity } from 'src/entities/product';
import { ProductFieldHelperService } from 'src/modules/product/service/product-field.helper.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,

    private readonly dataSource: DataSource,
    private readonly productFieldHelperService: ProductFieldHelperService,
  ) {}

  async createGroup(createGroupDto: GroupCreateDto): Promise<GroupEntity> {
    const { categoryId, fieldNames, groupName, serialNo } = createGroupDto;

    const isOrderFieldPresent = fieldNames.some((f) => f.order === true);

    // 1️⃣ PRE-TRANSACTION FETCHES (GET Operations)
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    let group = await this.groupRepository.findOne({
      where: { groupName, category: { id: categoryId } },
      relations: ['fields'],
    });

    // Get current max serial for Group (used if serialNo is missing)
    const groupMaxObj = await this.groupRepository
      .createQueryBuilder('g')
      .where('g.category_id = :categoryId', { categoryId })
      .select('MAX(g.serial_no)', 'max')
      .getRawOne();
    const nextGroupSerial = (Number(groupMaxObj?.max) || 0) + 1;

    // Get current max serial for Fields within this group (if group exists)
    const fieldMaxObj = group
      ? await this.fieldRepository
          .createQueryBuilder('f')
          .where('f.group_id = :groupId', { groupId: group.id })
          .select('MAX(f.serial_no)', 'max')
          .getRawOne()
      : { max: 0 };
    let nextFieldSerial = (Number(fieldMaxObj?.max) || 0) + 1;

    // 2️⃣ START TRANSACTION (WRITE Operations)
    return this.dataSource.transaction(async (manager) => {
      // --- HANDLE GROUP SERIAL ---
      // get products ids of category
      const productIds =
        await this.productFieldHelperService.getProductIdsByCategoryId(
          categoryId,
          manager,
        );
      let finalGroupSerial: number;
      if (serialNo !== undefined && serialNo !== null) {
        // Shift existing groups out of the way
        await manager
          .createQueryBuilder()
          .update(GroupEntity)
          .set({ serialNo: () => 'serial_no + 1' })
          .where('category_id = :categoryId AND serial_no >= :serialNo', {
            categoryId,
            serialNo,
          })
          .orderBy('serial_no', 'DESC') // Clear the path descending
          .execute();
        finalGroupSerial = serialNo;
      } else {
        finalGroupSerial = nextGroupSerial;
      }

      // --- UPSERT GROUP ---
      if (!group) {
        group = manager.create(GroupEntity, {
          groupName,
          category,
          serialNo: finalGroupSerial,
        });
        group = await manager.save(group);
      }

      if (isOrderFieldPresent) {
        await manager.update(
          FieldEntity,
          { group: { id: group.id } },
          { order: false },
        );
      }
      // --- HANDLE FIELDS ---
      if (fieldNames?.length) {
        const existingFieldNames = new Set(
          (group.fields ?? []).map((f) => f.fieldName),
        );
        const fieldsIds: string[] = [];

        for (const fieldDto of fieldNames) {
          if (existingFieldNames.has(fieldDto.name)) continue;

          let finalFieldSerial: number;

          if (fieldDto.serialNo !== undefined && fieldDto.serialNo !== null) {
            // 1. Shift existing ones if there is a collision
            await manager
              .createQueryBuilder()
              .update(FieldEntity)
              .set({ serialNo: () => 'serial_no + 1' })
              .where('group_id = :groupId AND serial_no >= :fSerial', {
                groupId: group.id,
                fSerial: fieldDto.serialNo,
              })
              .orderBy('serial_no', 'DESC')
              .execute();

            finalFieldSerial = fieldDto.serialNo;

            // 2. CRITICAL FIX: Update the counter so the NEXT auto-generated serial
            // is higher than this manual one.
            if (finalFieldSerial >= nextFieldSerial) {
              nextFieldSerial = finalFieldSerial + 1;
            }
          } else {
            // 3. Use the counter and increment it
            finalFieldSerial = nextFieldSerial++;
          }

          const field = await manager.save(FieldEntity, {
            fieldName: fieldDto.name,
            serialNo: finalFieldSerial,
            group: group,
            order: fieldDto.order,
            filter: fieldDto.filter,
          });
          fieldsIds.push(field.id);
        }

        await this.productFieldHelperService.ensureProductValuesExist(
          productIds,
          fieldsIds,
          manager,
        );
      }
      // now ensure product fields are in sync

      // 3️⃣ FETCH FRESH DATA
      return manager.findOneOrFail(GroupEntity, {
        where: { id: group.id },
        relations: ['fields'],
        order: { fields: { serialNo: 'ASC' } },
      });
    });
  }

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
    const { id, categoryId, groupName, serialNo } = groupDto;

    // 1️⃣ PRE-TRANSACTION: GET operations
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const oldCategoryId = group.category.id;
    const targetCategoryId = categoryId || oldCategoryId;
    const oldSerial = group.serialNo;

    // If category is changing, validate the new one exists
    let targetCategory = group.category;
    if (categoryId && categoryId !== oldCategoryId) {
      const categoryExists = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!categoryExists)
        throw new NotFoundException('Target Category not found');
      targetCategory = categoryExists;
    }

    // 2️⃣ START TRANSACTION: WRITE operations
    return this.dataSource.transaction(async (manager) => {
      if (
        typeof serialNo === 'number' &&
        (serialNo !== oldSerial || targetCategoryId !== oldCategoryId)
      ) {
        // Step A: Move current group to a temporary safe value to avoid initial collision
        await manager.update(GroupEntity, id, { serialNo: -1 });

        // Step B: Logic if shifting within the SAME category
        if (targetCategoryId === oldCategoryId) {
          if (serialNo < oldSerial) {
            // Moving Up: Shift others Down (Increment)
            await manager
              .createQueryBuilder()
              .update(GroupEntity)
              .set({ serialNo: () => 'serial_no + 1' })
              .where(
                'category_id = :catId AND serial_no >= :newS AND serial_no < :oldS AND id != :id',
                { catId: oldCategoryId, newS: serialNo, oldS: oldSerial, id },
              )
              .orderBy('serial_no', 'DESC')
              .execute();
          } else {
            // Moving Down: Shift others Up (Decrement)
            await manager
              .createQueryBuilder()
              .update(GroupEntity)
              .set({ serialNo: () => 'serial_no - 1' })
              .where(
                'category_id = :catId AND serial_no <= :newS AND serial_no > :oldS AND id != :id',
                { catId: oldCategoryId, newS: serialNo, oldS: oldSerial, id },
              )
              .orderBy('serial_no', 'ASC')
              .execute();
          }
        }
        // Step C: Logic if moving to a DIFFERENT category
        else {
          // 1. Close the gap in the OLD category
          await manager
            .createQueryBuilder()
            .update(GroupEntity)
            .set({ serialNo: () => 'serial_no - 1' })
            .where('category_id = :oldCatId AND serial_no > :oldS', {
              oldCatId: oldCategoryId,
              oldS: oldSerial,
            })
            .orderBy('serial_no', 'ASC')
            .execute();

          // 2. Open space in the NEW category
          await manager
            .createQueryBuilder()
            .update(GroupEntity)
            .set({ serialNo: () => 'serial_no + 1' })
            .where('category_id = :newCatId AND serial_no >= :newS', {
              newCatId: targetCategoryId,
              newS: serialNo,
            })
            .orderBy('serial_no', 'DESC')
            .execute();
        }

        group.serialNo = serialNo;
      }

      // Update other fields
      if (groupName) group.groupName = groupName;
      group.category = targetCategory;

      // 3️⃣ FINAL SAVE
      return manager.save(GroupEntity, group);
    });
  }
  // ------------------------------------------------------------
  // Find Groups by Category ID
  // ------------------------------------------------------------
  async findGroupsByCategoryId(categoryId: string): Promise<GroupEntity[]> {
    return this.groupRepository.find({
      where: { category: { id: categoryId } },
      relations: ['fields'],
      order: { serialNo: 'ASC', fields: { serialNo: 'ASC' } },
    });
  }

  // ------------------------------------------------------------
  // Delete Group by ID
  // ------------------------------------------------------------
  // async deleteGroup(id: string): Promise<void> {
  //   const group = await this.groupRepository.findOne({ where: { id } });
  //   if (!group) throw new NotFoundException('Group not found');

  //   await this.groupRepository.delete({ id });
  // }
  async deleteGroup(id: string): Promise<void> {
    // 1. Find the group and its category association
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!group) throw new NotFoundException('Group not found');

    const categoryId = group.category.id;
    const deletedSerial = group.serialNo;

    // 2. Execute deletion and reorder in a transaction
    await this.dataSource.transaction(async (manager) => {
      // A. Delete the group
      // Note: Ensure your GroupEntity has 'onDelete: CASCADE' for its fields,
      // or delete fields manually here first.
      await manager.delete('group', { id });

      // B. Shift subsequent groups in the same category down by 1
      await manager
        .createQueryBuilder()
        .update('group')
        .set({ serialNo: () => 'serial_no - 1' })
        .where('category_id = :categoryId', { categoryId })
        .andWhere('serial_no > :deletedSerial', { deletedSerial })
        .execute();
    });
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
