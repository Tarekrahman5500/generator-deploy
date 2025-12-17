import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764155879482TableRelationChange1764155881479
  implements MigrationInterface
{
  name = 'M1764155879482TableRelationChange1764155881479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP FOREIGN KEY \`category_info_category_id_fk\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c86702dfc8e7109dfdac96a058\` ON \`category_info\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c37540eeb84d5076597bdbf1e8\` ON \`category_info\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`category_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` ADD \`info_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` ADD UNIQUE INDEX \`IDX_6e132b5eff0f4fcfb3581b3832\` (\`info_id\`)`,
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
      `CREATE UNIQUE INDEX \`REL_6e132b5eff0f4fcfb3581b3832\` ON \`category\` (\`info_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` ADD CONSTRAINT \`FK_6e132b5eff0f4fcfb3581b3832e\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category\` DROP FOREIGN KEY \`FK_6e132b5eff0f4fcfb3581b3832e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_6e132b5eff0f4fcfb3581b3832\` ON \`category\``,
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
      `ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category\` DROP INDEX \`IDX_6e132b5eff0f4fcfb3581b3832\``,
    );
    await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`info_id\``);
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`category_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c37540eeb84d5076597bdbf1e8\` ON \`category_info\` (\`description\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c86702dfc8e7109dfdac96a058\` ON \`category_info\` (\`title\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD CONSTRAINT \`category_info_category_id_fk\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`,
    );
  }
}
