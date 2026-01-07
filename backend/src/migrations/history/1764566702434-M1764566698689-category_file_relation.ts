import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764566698689CategoryFileRelation1764566702434
  implements MigrationInterface
{
  name = 'M1764566698689CategoryFileRelation1764566702434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP FOREIGN KEY \`FK_9228deaf3cc55aa0d37afd344b2\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_9228deaf3cc55aa0d37afd344b\` ON \`category_info\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`category_file_relation\` (\`id\` varchar(36) NOT NULL, \`category_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`main_image_url\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` DROP COLUMN \`brochure_url\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL`,
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
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
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
    await queryRunner.query(
      `ALTER TABLE \`category_file_relation\` ADD CONSTRAINT \`FK_58d3f76ff609f28c28a0393a891\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_file_relation\` ADD CONSTRAINT \`FK_7486ea8d6257932e486ee642a5d\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`category_file_relation\` DROP FOREIGN KEY \`FK_7486ea8d6257932e486ee642a5d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_file_relation\` DROP FOREIGN KEY \`FK_58d3f76ff609f28c28a0393a891\``,
    );
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
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
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
      `ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`DROP TABLE \`category_file_relation\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_9228deaf3cc55aa0d37afd344b\` ON \`category_info\` (\`category_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_info\` ADD CONSTRAINT \`FK_9228deaf3cc55aa0d37afd344b2\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
