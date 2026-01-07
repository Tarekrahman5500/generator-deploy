import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764154598401CategoryIntoTableNameUpdate1764154600346
  implements MigrationInterface
{
  name = 'M1764154598401CategoryIntoTableNameUpdate1764154600346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`categories_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`category_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
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
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`category_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`categories_id\` varchar(255) NOT NULL`,
    );
  }
}
