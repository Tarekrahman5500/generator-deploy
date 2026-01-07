import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764097767582CreateUpsTable1764097771557
  implements MigrationInterface
{
  name = 'M1764097767582CreateUpsTable1764097771557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ups\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`power_capacity_va\` int NOT NULL, \`power_capacity_watt\` int NOT NULL, \`topology\` enum ('Online', 'Line-interactive') NOT NULL, \`backup_time_min\` int NOT NULL, \`battery_type\` enum ('Lithium-ion', 'VRLA') NOT NULL, \`outlet_count\` int NOT NULL, \`input_voltage_min\` int NOT NULL, \`input_voltage_max\` int NOT NULL, \`output_voltage\` int NOT NULL, \`voltage_unit\` enum ('V', 'mV', 'MV') NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
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
      `ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_46da9ee407f2d567ce95b08a3e4\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_46da9ee407f2d567ce95b08a3e4\``,
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
    await queryRunner.query(`DROP TABLE \`ups\``);
  }
}
