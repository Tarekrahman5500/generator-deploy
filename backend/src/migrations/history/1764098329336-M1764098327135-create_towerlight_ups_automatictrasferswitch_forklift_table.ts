import { MigrationInterface, QueryRunner } from 'typeorm';

export class M1764098327135CreateTowerlightUpsAutomatictrasferswitchForkliftTable1764098329336
  implements MigrationInterface
{
  name =
    'M1764098327135CreateTowerlightUpsAutomatictrasferswitchForkliftTable1764098329336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tower_light\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`mast_height_m\` int NOT NULL, \`lamp_count\` int NOT NULL, \`lamp_power_watt\` int NOT NULL, \`mast_type\` enum ('Manual', 'Hydraulic') NOT NULL, \`power_source\` enum ('Diesel', 'Electric', 'Solar') NOT NULL, \`trailer_type\` enum ('Two-wheel', 'Four-wheel', 'Compact trailer', 'Heavy-duty trailer', 'Off-road trailer') NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`automatic_transfer_switch\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`current_rating_a\` int NOT NULL, \`number_of_poles\` int NOT NULL, \`transfer_time_ms\` int NOT NULL, \`operating_voltage\` int NOT NULL, \`switching_type\` enum ('Soft Load Transition', 'Delayed Transition', 'Open Transition', 'Closed Transition', 'Bypass-Isolation', 'Manual Transfer') NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`forklift\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`load_capacity_kg\` int NOT NULL, \`max_lift_height_m\` double NOT NULL, \`mast_type\` enum ('SINGLE', 'DOUBLE', 'TRIPLEX', 'QUADRUPLEX') NOT NULL, \`power_source\` enum ('ELECTRIC', 'DIESEL', 'LPG', 'CNG', 'PETROL', 'DUAL_FUEL', 'LI_ION', 'HYDROGEN_FUEL_CELL') NOT NULL, \`tire_type\` enum ('PNEUMATIC', 'CUSHION', 'SOLID', 'NON-MARKING', 'FOAM_FILLED') NOT NULL, \`turning_radius_m\` double NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`distributor_panels\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(255) NOT NULL, \`number_of_ways\` int NOT NULL, \`ampere_rating_a\` int NOT NULL, \`ip_rating\` enum ('IP20', 'IP30', 'IP40', 'IP42', 'IP44', 'IP54', 'IP55', 'IP65', 'IP66', 'IP67') NOT NULL, \`main_switch_type\` enum ('Isolator', 'MCB Main Switch', 'MCCB', 'RCCB Main Switch', 'RCBO Main Switch', 'ACB Main Switch') NOT NULL, \`circuit_breaker_type\` enum ('MCB', 'MCCB', 'ACB', 'VCB', 'OCB', 'SF6', 'RCCB', 'RCBO', 'ELCB', 'MPCB') NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
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
      `ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0c999dc9c0ab33368aee67f628d\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_6c2a8601d5794df798eb8d463df\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_2f7ab5797480dae527733b7eebf\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_11ab47a2ba3b5acbac66a78dd80\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_11ab47a2ba3b5acbac66a78dd80\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_2f7ab5797480dae527733b7eebf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_6c2a8601d5794df798eb8d463df\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0c999dc9c0ab33368aee67f628d\``,
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
    await queryRunner.query(`DROP TABLE \`distributor_panels\``);
    await queryRunner.query(`DROP TABLE \`forklift\``);
    await queryRunner.query(`DROP TABLE \`automatic_transfer_switch\``);
    await queryRunner.query(`DROP TABLE \`tower_light\``);
  }
}
