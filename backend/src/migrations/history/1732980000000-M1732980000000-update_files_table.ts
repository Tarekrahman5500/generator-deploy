import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1732980000000UpdateFilesTable1732980000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query(
        `
      ALTER TABLE files 
      ADD COLUMN original_name VARCHAR(255) NOT NULL AFTER file_name
    `,
      )
      .catch(() => {});

    await queryRunner
      .query(
        `
      ALTER TABLE files 
      ADD COLUMN mime_type VARCHAR(100) NOT NULL AFTER url
    `,
      )
      .catch(() => {});

    await queryRunner
      .query(
        `
      ALTER TABLE files 
      ADD COLUMN size INT NOT NULL AFTER mime_type
    `,
      )
      .catch(() => {});
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query(`ALTER TABLE files DROP COLUMN original_name`)
      .catch(() => {});
    await queryRunner
      .query(`ALTER TABLE files DROP COLUMN mime_type`)
      .catch(() => {});
    await queryRunner
      .query(`ALTER TABLE files DROP COLUMN size`)
      .catch(() => {});
  }
}
