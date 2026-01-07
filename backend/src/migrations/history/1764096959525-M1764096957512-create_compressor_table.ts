import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764096957512CreateCompressorTable1764096959525
  implements MigrationInterface
{
  name = 'M1764096957512CreateCompressorTable1764096959525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`compressors\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`max_pressure_psi\` int NOT NULL, \`max_pressure_bar\` double NOT NULL, \`flow_rate_cfm\` double NOT NULL, \`flow_rate_m3_min\` double NOT NULL, \`tank_capacity_l\` int NOT NULL, \`power_source\` enum ('Gasoline', 'Electric') NOT NULL, \`stages\` int NOT NULL, \`pump_type\` enum ('Reciprocating', 'Screw') NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
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
      `ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_1e8c781bfdea5468a40ff2039e5\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_1e8c781bfdea5468a40ff2039e5\``,
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
    await queryRunner.query(`DROP TABLE \`compressors\``);
  }
}
