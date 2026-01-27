import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { FieldCreateDto, FieldUpdateDto, GroupFieldsDto } from '../dto';
import {
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
} from 'src/entities/product';
import { GroupEntity } from 'src/entities/product/group.entity';
import { ProductFieldHelperService } from 'src/modules/product/service/product-field.helper.service';

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    private readonly dataSource: DataSource,
    private readonly productFieldHelperService: ProductFieldHelperService,
  ) {}

  // ------------------------------------------------------------
  // Create Field
  // ------------------------------------------------------------
  // async createField(createFieldDto: FieldCreateDto): Promise<FieldEntity> {
  //   const { id, ...fieldData } = createFieldDto;

  //   // Check if group exists
  //   const group = await this.groupRepository.findOne({
  //     where: { id },
  //   });
  //   if (!group) {
  //     throw new NotFoundException('Group not found');
  //   }

  //   const field = this.fieldRepository.create({
  //     ...fieldData,
  //     group,
  //   });

  //   return this.fieldRepository.save(field);
  // }

  // async createField(createFieldDto: FieldCreateDto): Promise<FieldEntity> {
  //   const { id, groupId, fieldName, serialNo, filter, order } = createFieldDto;

  //   // 1️⃣ PRE-TRANSACTION: GET operations
  //   const group = await this.groupRepository.findOne({
  //     where: { id: groupId },
  //     relations: {
  //       category: true,
  //     },
  //   });
  //   if (!group) throw new NotFoundException('Group not found');

  //   const categoryId = group?.category?.id;

  //   // Check if field name already exists in this group
  //   const nameExists = await this.fieldRepository.findOne({
  //     where: { fieldName, group: { id: groupId } },
  //   });
  //   if (nameExists) {
  //     throw new ConflictException(
  //       `Field ${fieldName} already exists in this group`,
  //     );
  //   }

  //   // Get MAX serial if no serialNo is provided
  //   const maxSerialObj = await this.fieldRepository
  //     .createQueryBuilder('f')
  //     .where('f.group_id = :groupId', { groupId })
  //     .select('MAX(f.serial_no)', 'max')
  //     .getRawOne();
  //   const nextSerial = (Number(maxSerialObj?.max) || 0) + 1;

  //   // 2️⃣ START TRANSACTION: WRITE operations
  //   return this.dataSource.transaction(async (manager) => {
  //     let finalSerial: number;
  //     // get all product ids in this category
  //     const productsIds =
  //       await this.productFieldHelperService.getProductIdsByCategoryId(
  //         categoryId,
  //         manager,
  //       );

  //     if (serialNo !== undefined && serialNo !== null) {
  //       // SHIFT LOGIC: Move existing fields in this group up by 1
  //       await manager
  //         .createQueryBuilder()
  //         .update(FieldEntity)
  //         .set({ serialNo: () => 'serial_no + 1' })
  //         .where('group_id = :groupId AND serial_no >= :serialNo', {
  //           groupId,
  //           serialNo,
  //         })
  //         .orderBy('serial_no', 'DESC') // Clear path from top down
  //         .execute();

  //       finalSerial = serialNo;
  //     } else {
  //       finalSerial = nextSerial;
  //     }

  //     // 3️⃣ CREATE & SAVE
  //     const field = manager.create(FieldEntity, {
  //       fieldName,
  //       serialNo: finalSerial,
  //       filter,
  //       order,
  //       group,
  //     });

  //     const response = await manager.save(FieldEntity, field);
  //     // After field is created, create product values for all products in this category
  //     await this.productFieldHelperService.ensureProductValuesExist(
  //       productsIds,
  //       [response.id],
  //       manager,
  //     );

  //     return response;
  //   });
  // }

  async createField(dto: FieldCreateDto): Promise<FieldEntity> {
    const { id, fieldName, serialNo, filter, order } = dto;

    // 1️⃣ ID Discovery & Context Recovery
    let targetField = await this.fieldRepository.findOne({
      where: { id },
      relations: { group: { category: true } },
    });

    let targetGroup: GroupEntity | null = null;
    let isUpdate = false;

    if (targetField) {
      isUpdate = true;
      targetGroup = targetField.group;
    } else {
      targetGroup = await this.groupRepository.findOne({
        where: { id },
        relations: { category: true },
      });
      if (!targetGroup)
        throw new NotFoundException(`Valid Field or Group ID required.`);
    }

    const groupId = targetGroup.id;
    const categoryId = targetGroup.category?.id;

    // 2️⃣ Duplicate Name Check (Skip if fieldName is not provided in update)
    if (fieldName) {
      const whereClause: any = { fieldName, group: { id: groupId } };
      if (isUpdate && id) whereClause.id = Not(id);

      const nameConflict = await this.fieldRepository.findOne({
        where: whereClause,
      });
      if (nameConflict) {
        // Switch to updating the conflicting field instead of the one passed by ID
        targetField = nameConflict;
        isUpdate = true;
      }
    }

    // 3️⃣ TRANSACTION: Safe Writing
    return this.dataSource.transaction(async (manager) => {
      let savedField: FieldEntity;

      if (order === true) {
        await manager
          .createQueryBuilder()
          .update(FieldEntity)
          .set({ order: false })
          .where('group_id = :groupId', { groupId })
          .execute();
      }

      if (isUpdate && targetField) {
        const oldSerial = targetField.serialNo;
        const newSerial = serialNo;

        if (typeof newSerial === 'number' && oldSerial !== newSerial) {
          if (newSerial < oldSerial) {
            // 🔽 SCENARIO: Moving UP (e.g., 5 -> 2)
            // Shift everything between the new and old position (+1)
            await manager
              .createQueryBuilder()
              .update(FieldEntity)
              .set({ serialNo: () => 'serial_no + 1' })
              .where(
                'group_id = :groupId AND serial_no >= :newSerial AND serial_no < :oldSerial',
                {
                  groupId,
                  newSerial,
                  oldSerial,
                },
              )
              .orderBy('serial_no', 'DESC') // Avoid collisions
              .execute();
          } else {
            // 🔼 SCENARIO: Moving DOWN (e.g., 2 -> 5)
            // Shift everything between the old and new position (-1)
            await manager
              .createQueryBuilder()
              .update(FieldEntity)
              .set({ serialNo: () => 'serial_no - 1' })
              .where(
                'group_id = :groupId AND serial_no > :oldSerial AND serial_no <= :newSerial',
                {
                  groupId,
                  oldSerial,
                  newSerial,
                },
              )
              .orderBy('serial_no', 'ASC') // Avoid collisions
              .execute();
          }
        }

        // Apply other updates
        targetField.fieldName = fieldName ?? targetField.fieldName;
        targetField.filter = filter ?? targetField.filter;
        targetField.order = order ?? targetField.order;
        targetField.serialNo = newSerial ?? targetField.serialNo;

        savedField = await manager.save(FieldEntity, targetField);
      } else {
        // CORNER CASE: Creation must have a name
        if (!fieldName)
          throw new BadRequestException('fieldName is required for new field.');

        const maxSerialObj = await manager
          .createQueryBuilder(FieldEntity, 'f')
          .where('f.group_id = :groupId', { groupId })
          .select('MAX(f.serial_no)', 'max')
          .getRawOne();

        const nextSerial = (Number(maxSerialObj?.max) || 0) + 1;
        const finalSerial =
          typeof serialNo === 'number' ? serialNo : nextSerial;

        // Only shift if user provided a specific serial (not using the default max)
        if (typeof serialNo === 'number') {
          await this.handleSerialShift(manager, groupId, serialNo);
        }

        const newField = manager.create(FieldEntity, {
          fieldName,
          serialNo: finalSerial,
          filter,
          order: order ?? false,
          group: targetGroup as GroupEntity,
        });

        savedField = await manager.save(FieldEntity, newField);
      }

      const productsIds =
        await this.productFieldHelperService.getProductIdsByCategoryId(
          categoryId,
          manager,
        );

      // 4️⃣ SYNC PRODUCT VALUES
      await this.productFieldHelperService.ensureProductValuesExist(
        productsIds,
        [savedField.id],
        manager,
      );

      return savedField;
    });
  }

  /**
   * FIXED Helper: Shifting logic with DESC order to avoid unique constraint collisions
   */
  private async handleSerialShift(
    manager: EntityManager,
    groupId: string,
    serialNo: number,
  ) {
    await manager
      .createQueryBuilder()
      .update(FieldEntity)
      .set({ serialNo: () => 'serial_no + 1' })
      .where('group_id = :groupId AND serial_no >= :serialNo', {
        groupId,
        serialNo,
      })
      // CRITICAL: Update from highest to lowest to prevent temporary duplicates
      .orderBy('serial_no', 'DESC')
      .execute();
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
  // async updateField(fieldDto: FieldUpdateDto): Promise<FieldEntity> {
  //   const { id, groupId, fieldName } = fieldDto;

  //   const field = await this.fieldRepository.findOne({
  //     where: { id },
  //     relations: ['group'],
  //   });
  //   if (!field) throw new NotFoundException('Field not found');

  //   // Update group if provided
  //   if (groupId) {
  //     const group = await this.groupRepository.findOne({
  //       where: { id: groupId },
  //     });
  //     if (!group) throw new NotFoundException('Group not found');
  //     field.group = group;
  //   }

  //   if (fieldName) field.fieldName = fieldName;

  //   return this.fieldRepository.save(field);
  // }

  async updateField(fieldDto: FieldUpdateDto): Promise<FieldEntity> {
    const {
      id,
      groupId,
      fieldName,
      serialNo,
      order = false,
      filter = false,
    } = fieldDto;

    // 1️⃣ PRE-TRANSACTION: Fetch current state
    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: {
        group: { category: true },
      },
    });
    if (!field) throw new NotFoundException('Field not found');

    const categoryId = field?.group?.category?.id;

    const oldGroupId = field.group.id;
    const targetGroupId = groupId || oldGroupId;
    const oldSerial = field.serialNo;

    // Validate target group if changing
    let targetGroup = field.group;
    if (groupId && groupId !== oldGroupId) {
      const groupExists = await this.groupRepository.findOne({
        where: { id: groupId },
      });
      if (!groupExists) throw new NotFoundException('Target Group not found');
      targetGroup = groupExists;
    }

    // 2️⃣ START TRANSACTION: Handle Serial Shifting
    return this.dataSource.transaction(async (manager) => {
      if (
        typeof serialNo === 'number' &&
        (serialNo !== oldSerial || targetGroupId !== oldGroupId)
      ) {
        // Step A: Set current field to a temp value to free up its current serialNo
        await manager.update(FieldEntity, id, { serialNo: -1 });

        // Step B: Logic for same group movement
        if (targetGroupId === oldGroupId) {
          if (serialNo !== oldSerial) {
            if (serialNo < oldSerial) {
              // Moving Up: Shift others between new and old DOWN (+1)
              await manager
                .createQueryBuilder()
                .update(FieldEntity)
                .set({ serialNo: () => 'serial_no + 1' })
                .where(
                  'group_id = :gId AND serial_no >= :newS AND serial_no < :oldS AND id != :id',
                  { gId: oldGroupId, newS: serialNo, oldS: oldSerial, id },
                )
                .orderBy('serial_no', 'DESC')
                .execute();
            } else {
              // Moving Down: Shift others between old and new UP (-1)
              await manager
                .createQueryBuilder()
                .update(FieldEntity)
                .set({ serialNo: () => 'serial_no - 1' })
                .where(
                  'group_id = :gId AND serial_no <= :newS AND serial_no > :oldS AND id != :id',
                  { gId: oldGroupId, newS: serialNo, oldS: oldSerial, id },
                )
                .orderBy('serial_no', 'ASC')
                .execute();
            }
          }
        }
        // Step C: Logic for cross-group movement
        else {
          // 1. Close the gap in the OLD group
          await manager
            .createQueryBuilder()
            .update(FieldEntity)
            .set({ serialNo: () => 'serial_no - 1' })
            .where('group_id = :oldGId AND serial_no > :oldS', {
              oldGId: oldGroupId,
              oldS: oldSerial,
            })
            .orderBy('serial_no', 'ASC')
            .execute();

          // 2. Open space in the NEW group
          await manager
            .createQueryBuilder()
            .update(FieldEntity)
            .set({ serialNo: () => 'serial_no + 1' })
            .where('group_id = :newGId AND serial_no >= :newS', {
              newGId: targetGroupId,
              newS: serialNo,
            })
            .orderBy('serial_no', 'DESC')
            .execute();
        }

        field.serialNo = serialNo;
      }

      if (order) {
        await manager
          .createQueryBuilder()
          .update(FieldEntity)
          .set({ order: false })
          .where(
            'group_id IN (SELECT g.id FROM `group` g WHERE g.category_id = :categoryId)',
            { categoryId },
          )
          .andWhere('`order` = true')
          .execute();
      }

      // Update remaining scalars
      if (fieldName) field.fieldName = fieldName;
      field.group = targetGroup;

      field.filter = filter;
      field.order = order;
      // 3️⃣ FINAL SAVE
      return manager.save(FieldEntity, field);
    });
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
  // async deleteField(id: string): Promise<void> {
  //   const field = await this.fieldRepository.findOne({ where: { id } });
  //   if (!field) throw new NotFoundException('Field not found');

  //   await this.fieldRepository.delete({ id });
  // }

  async deleteField(id: string): Promise<void> {
    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: ['group'], // Ensure we know which group the field belongs to
    });

    if (!field) throw new NotFoundException('Field not found');

    const groupId = field.group.id;
    const deletedSerial = field.serialNo;

    await this.dataSource.transaction(async (manager) => {
      // 1. Delete the targeted field
      await manager.delete(FieldEntity, { id });

      // 2. Shift all fields with a higher serialNo down by 1
      // Logic: UPDATE fields SET serialNo = serialNo - 1 WHERE groupId = X AND serialNo > deletedSerial
      await manager
        .createQueryBuilder()
        .update(FieldEntity)
        .set({ serialNo: () => 'serial_no - 1' })
        .where('group_id = :groupId', { groupId })
        .andWhere('serial_no > :deletedSerial', { deletedSerial })
        .execute();
    });
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
