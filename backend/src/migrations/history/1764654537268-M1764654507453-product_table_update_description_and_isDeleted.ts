import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764654507453ProductTableUpdateDescriptionAndIsDeleted1764654537268
  implements MigrationInterface
{
  name = 'M1764654507453ProductTableUpdateDescriptionAndIsDeleted1764654537268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ups\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` ADD \`description\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`is_deleted\``);
    await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`description\``);
  }
}
