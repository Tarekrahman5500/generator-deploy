import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764189929743TableModelNameUnique1764189934381
  implements MigrationInterface
{
  name = 'M1764189929743TableModelNameUnique1764189934381';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE \`ups\` ADD UNIQUE INDEX \`IDX_2393268c8782b5a588518ae450\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` ADD UNIQUE INDEX \`IDX_c6a4f99a7946935b765966b268\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` ADD UNIQUE INDEX \`IDX_80c5a98f378e045196a7a894b7\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` ADD UNIQUE INDEX \`IDX_0a9e82e73b275373a7c93ce960\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`model_name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` ADD \`model_name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` ADD UNIQUE INDEX \`IDX_4658b87c22606b00bff67643d6\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` ADD UNIQUE INDEX \`IDX_a6150124d9cbc8b434b7dd2b0b\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` ADD UNIQUE INDEX \`IDX_51d0778fe84bff30709c8a6f46\` (\`model_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
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
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` DROP INDEX \`IDX_51d0778fe84bff30709c8a6f46\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compressors\` DROP INDEX \`IDX_a6150124d9cbc8b434b7dd2b0b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` DROP INDEX \`IDX_4658b87c22606b00bff67643d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`model_name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`diesel_generator_sets\` ADD \`model_name\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` DROP INDEX \`IDX_0a9e82e73b275373a7c93ce960\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` DROP INDEX \`IDX_80c5a98f378e045196a7a894b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` DROP INDEX \`IDX_c6a4f99a7946935b765966b268\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ups\` DROP INDEX \`IDX_2393268c8782b5a588518ae450\``,
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
  }
}
