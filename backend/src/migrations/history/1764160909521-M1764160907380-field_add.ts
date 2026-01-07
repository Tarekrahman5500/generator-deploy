import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764160907380FieldAdd1764160909521 implements MigrationInterface {
  name = 'M1764160907380FieldAdd1764160909521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`category_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD UNIQUE INDEX \`IDX_9228deaf3cc55aa0d37afd344b\` (\`category_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_9228deaf3cc55aa0d37afd344b\` ON \`category_info\` (\`category_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD CONSTRAINT \`FK_9228deaf3cc55aa0d37afd344b2\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP FOREIGN KEY \`FK_9228deaf3cc55aa0d37afd344b2\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_9228deaf3cc55aa0d37afd344b\` ON \`category_info\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP INDEX \`IDX_9228deaf3cc55aa0d37afd344b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`category_id\``,
    );
  }
}
