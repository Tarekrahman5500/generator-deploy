import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764170672793TableRelationChangeAllProductRelationWithCategory1764170676443 implements MigrationInterface {
    name = 'M1764170672793TableRelationChangeAllProductRelationWithCategory1764170676443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_f56cf3c2c2094d71c680d608f46\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_bc34a64d4145e28abc0e0859b03\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_0aeae2f6ef7256a851f80afb48b\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_031cdee6ad3914f07adaaf07a78\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_aea4b85f4845d00b1d03811b93b\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_88b92f629c7fd3ef0941c6ef466\``);
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_2ad97586fae26621cbe2d5d7d98\``);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`category_info_id\` \`category_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_853f340fd59942b883b73deef57\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_48ab10beb4e9ab586b33d89e254\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_08a45105cbfc9afd5253f00a3ac\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_d22349b594345d5cf8d95cd2f21\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_5ddc94018d70ab347a25254fcf2\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_433b1914ec902985f06da76e130\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_f87dfd5c139c0915efcb4593cdd\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`compressors\` DROP FOREIGN KEY \`FK_f87dfd5c139c0915efcb4593cdd\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` DROP FOREIGN KEY \`FK_433b1914ec902985f06da76e130\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` DROP FOREIGN KEY \`FK_5ddc94018d70ab347a25254fcf2\``);
        await queryRunner.query(`ALTER TABLE \`forklift\` DROP FOREIGN KEY \`FK_d22349b594345d5cf8d95cd2f21\``);
        await queryRunner.query(`ALTER TABLE \`tower_light\` DROP FOREIGN KEY \`FK_08a45105cbfc9afd5253f00a3ac\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` DROP FOREIGN KEY \`FK_48ab10beb4e9ab586b33d89e254\``);
        await queryRunner.query(`ALTER TABLE \`ups\` DROP FOREIGN KEY \`FK_853f340fd59942b883b73deef57\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`category_id\` \`category_info_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`compressors\` ADD CONSTRAINT \`FK_2ad97586fae26621cbe2d5d7d98\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` ADD CONSTRAINT \`FK_88b92f629c7fd3ef0941c6ef466\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` ADD CONSTRAINT \`FK_aea4b85f4845d00b1d03811b93b\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift\` ADD CONSTRAINT \`FK_031cdee6ad3914f07adaaf07a78\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` ADD CONSTRAINT \`FK_0aeae2f6ef7256a851f80afb48b\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` ADD CONSTRAINT \`FK_bc34a64d4145e28abc0e0859b03\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups\` ADD CONSTRAINT \`FK_f56cf3c2c2094d71c680d608f46\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
