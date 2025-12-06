import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764162168443AllTableTimestampAdd1764162170425 implements MigrationInterface {
    name = 'M1764162168443AllTableTimestampAdd1764162170425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_46da9ee407f2d567ce95b08a3e4\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0c999dc9c0ab33368aee67f628d\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_2f7ab5797480dae527733b7eebf\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_11ab47a2ba3b5acbac66a78dd80\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_125705b31aea36c58b5187e6069\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_1e8c781bfdea5468a40ff2039e5\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_6c2a8601d5794df798eb8d463df\``);
        await queryRunner.query(`DROP INDEX \`IDX_9228deaf3cc55aa0d37afd344b\` ON \`category_info\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_f56cf3c2c2094d71c680d608f46\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0aeae2f6ef7256a851f80afb48b\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_031cdee6ad3914f07adaaf07a78\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_88b92f629c7fd3ef0941c6ef466\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_aea4b85f4845d00b1d03811b93b\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_2ad97586fae26621cbe2d5d7d98\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_bc34a64d4145e28abc0e0859b03\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_bc34a64d4145e28abc0e0859b03\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_2ad97586fae26621cbe2d5d7d98\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_aea4b85f4845d00b1d03811b93b\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_88b92f629c7fd3ef0941c6ef466\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_031cdee6ad3914f07adaaf07a78\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0aeae2f6ef7256a851f80afb48b\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_f56cf3c2c2094d71c680d608f46\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP COLUMN \`category_info_id\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD \`info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9228deaf3cc55aa0d37afd344b\` ON \`category_info\` (\`category_id\`)`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_6c2a8601d5794df798eb8d463df\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_1e8c781bfdea5468a40ff2039e5\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_125705b31aea36c58b5187e6069\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_11ab47a2ba3b5acbac66a78dd80\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_2f7ab5797480dae527733b7eebf\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0c999dc9c0ab33368aee67f628d\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_46da9ee407f2d567ce95b08a3e4\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
