import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764096462286CreateDieselGeneratorSetTable1764096464268 implements MigrationInterface {
    name = 'M1764096462286CreateDieselGeneratorSetTable1764096464268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`diesel_generator_sets\` (\`id\` varchar(36) NOT NULL, \`model_name\` varchar(100) NOT NULL, \`power_output_kva\` double NOT NULL, \`power_output_kw\` double NOT NULL, \`frequency_hz\` int NOT NULL, \`voltage_min\` int NOT NULL, \`voltage_max\` int NOT NULL, \`voltage_unit\` enum ('V', 'mV', 'MV') NOT NULL, \`fuel_tank_capacity_liters\` int NOT NULL, \`fuel_consumption_l_per_hr\` int NOT NULL, \`noise_level_db\` int NOT NULL, \`engine_mode\` varchar(255) NOT NULL, \`cylinders\` int NOT NULL, \`displacement_cc\` int NOT NULL, \`aspiration\` varchar(255) NOT NULL, \`alternator_brand\` varchar(255) NOT NULL, \`alternator_model\` varchar(255) NOT NULL, \`alternator_insulation_class\` varchar(255) NOT NULL, \`length\` int NOT NULL, \`width\` int NOT NULL, \`height\` int NOT NULL, \`weight_kg\` int NOT NULL, \`info_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``);
        await queryRunner.query(`ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_125705b31aea36c58b5187e6069\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_125705b31aea36c58b5187e6069\``);
        await queryRunner.query(`ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``);
        await queryRunner.query(`ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`diesel_generator_sets\``);
    }

}
