import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764098864958CreateAdministratorAdministratortokenTable1764098867755
  implements MigrationInterface
{
  name =
    'M1764098864958CreateAdministratorAdministratortokenTable1764098867755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`administrators\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('admin', 'super_admin') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`administrators_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token\` text NOT NULL, \`expires_at\` datetime NOT NULL, \`created_at\` datetime NOT NULL, \`logout_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` ADD CONSTRAINT \`FK_4ec5cb1a1c6fcbd60368665d9bf\` FOREIGN KEY (\`user_id\`) REFERENCES \`administrators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`administrators_tokens\` DROP FOREIGN KEY \`FK_4ec5cb1a1c6fcbd60368665d9bf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE \`administrators_tokens\``);
    await queryRunner.query(`DROP TABLE \`administrators\``);
  }
}
