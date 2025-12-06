import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764149342125UpdateIntoToCategoryInfoInTable1764149363999 implements MigrationInterface {
    name = 'M1764149342125UpdateIntoToCategoryInfoInTable1764149363999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_46da9ee407f2d567ce95b08a3e4\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0c999dc9c0ab33368aee67f628d\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_11ab47a2ba3b5acbac66a78dd80\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_2f7ab5797480dae527733b7eebf\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_1e8c781bfdea5468a40ff2039e5\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_125705b31aea36c58b5187e6069\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_6c2a8601d5794df798eb8d463df\``);
        await queryRunner.query(`CREATE TABLE \`category_info\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`main_image_url\` varchar(255) NOT NULL, \`brochure_url\` varchar(255) NOT NULL, \`categories_id\` varchar(255) NOT NULL, \`category_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD CONSTRAINT \`FK_9228deaf3cc55aa0d37afd344b2\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_46da9ee407f2d567ce95b08a3e4\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0c999dc9c0ab33368aee67f628d\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_11ab47a2ba3b5acbac66a78dd80\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_2f7ab5797480dae527733b7eebf\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_1e8c781bfdea5468a40ff2039e5\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_125705b31aea36c58b5187e6069\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_6c2a8601d5794df798eb8d463df\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_6c2a8601d5794df798eb8d463df\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_125705b31aea36c58b5187e6069\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_1e8c781bfdea5468a40ff2039e5\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_2f7ab5797480dae527733b7eebf\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_11ab47a2ba3b5acbac66a78dd80\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0c999dc9c0ab33368aee67f628d\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_46da9ee407f2d567ce95b08a3e4\``);
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP FOREIGN KEY \`FK_9228deaf3cc55aa0d37afd344b2\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`category_info\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_6c2a8601d5794df798eb8d463df\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_125705b31aea36c58b5187e6069\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_1e8c781bfdea5468a40ff2039e5\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_2f7ab5797480dae527733b7eebf\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_11ab47a2ba3b5acbac66a78dd80\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0c999dc9c0ab33368aee67f628d\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_46da9ee407f2d567ce95b08a3e4\` FOREIGN KEY (\`info_id\`) REFERENCES \`info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
