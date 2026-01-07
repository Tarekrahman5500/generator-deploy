import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764514927342NewTableFilesCreate1764514935584
  implements MigrationInterface
{
  name = 'M1764514927342NewTableFilesCreate1764514935584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`files\` (\`id\` varchar(36) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`url\` text NOT NULL, \`used_at\` timestamp NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
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
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
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
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
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
      `ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`DROP TABLE \`files\``);
  }
}
