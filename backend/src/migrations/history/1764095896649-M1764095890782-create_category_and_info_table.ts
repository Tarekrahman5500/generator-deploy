import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764095890782CreateCategoryAndInfoTable1764095896649
  implements MigrationInterface
{
  name = 'M1764095890782CreateCategoryAndInfoTable1764095896649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`id\` varchar(36) NOT NULL, \`categories_name\` varchar(100) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`info\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`main_image_url\` varchar(255) NOT NULL, \`brochure_url\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL, \`categories_id\` varchar(255) NOT NULL, \`category_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``,
    );
    await queryRunner.query(`DROP TABLE \`info\``);
    await queryRunner.query(`DROP TABLE \`categories\``);
  }
}
