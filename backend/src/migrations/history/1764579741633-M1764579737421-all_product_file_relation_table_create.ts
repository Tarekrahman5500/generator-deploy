import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764579737421AllProductFileRelationTableCreate1764579741633 implements MigrationInterface {
    name = 'M1764579737421AllProductFileRelationTableCreate1764579741633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ups_file_relation\` (\`id\` varchar(36) NOT NULL, \`ups_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tower_light_file_relation\` (\`id\` varchar(36) NOT NULL, \`tower_light_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`forklift_file_relation\` (\`id\` varchar(36) NOT NULL, \`forklift_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`distributor_panel_file_relation\` (\`id\` varchar(36) NOT NULL, \`distributor_panel_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`diesel_generator_file_relation\` (\`id\` varchar(36) NOT NULL, \`diesel_generator_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`compressor_file_relation\` (\`id\` varchar(36) NOT NULL, \`compressor_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_info_file_relation\` (\`id\` varchar(36) NOT NULL, \`category_info_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`automatic_transfer_switch_file_relation\` (\`id\` varchar(36) NOT NULL, \`automatic_transfer_switch_id\` varchar(255) NOT NULL, \`file_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD CONSTRAINT \`FK_9228deaf3cc55aa0d37afd344b2\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups_file_relation\` ADD CONSTRAINT \`FK_19f53aa1da750b7fd5938aae4a7\` FOREIGN KEY (\`ups_id\`) REFERENCES \`ups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ups_file_relation\` ADD CONSTRAINT \`FK_4daebc3e418d95fb083384cd22e\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light_file_relation\` ADD CONSTRAINT \`FK_0942f051e1d2960a1d14e4be111\` FOREIGN KEY (\`tower_light_id\`) REFERENCES \`tower_light\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tower_light_file_relation\` ADD CONSTRAINT \`FK_0aea0667cac6b36e07a10f62383\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift_file_relation\` ADD CONSTRAINT \`FK_250805bf1772b4f89a26303355d\` FOREIGN KEY (\`forklift_id\`) REFERENCES \`forklift\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forklift_file_relation\` ADD CONSTRAINT \`FK_e76e6081149f9958f6929f7fe89\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panel_file_relation\` ADD CONSTRAINT \`FK_4b0f777587af539ecbc20297eaf\` FOREIGN KEY (\`distributor_panel_id\`) REFERENCES \`distributor_panels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`distributor_panel_file_relation\` ADD CONSTRAINT \`FK_79cb339ac749b3502482de8cbf3\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_file_relation\` ADD CONSTRAINT \`FK_6b8a933e26bd0425428b7d3d3ef\` FOREIGN KEY (\`diesel_generator_id\`) REFERENCES \`diesel_generator_sets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_file_relation\` ADD CONSTRAINT \`FK_479aeee1feab7c551f8cd9034f0\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressor_file_relation\` ADD CONSTRAINT \`FK_6bab55002f4a4756609a70af97d\` FOREIGN KEY (\`compressor_id\`) REFERENCES \`compressors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compressor_file_relation\` ADD CONSTRAINT \`FK_dd56167538dbe8ba6c950a719ec\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_info_file_relation\` ADD CONSTRAINT \`FK_59510ec51735c78a76db52b7a04\` FOREIGN KEY (\`category_info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_info_file_relation\` ADD CONSTRAINT \`FK_48864590998acc518e54ef6c6f6\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch_file_relation\` ADD CONSTRAINT \`FK_752a3c40e71d72ea9d5c0f80100\` FOREIGN KEY (\`automatic_transfer_switch_id\`) REFERENCES \`automatic_transfer_switch\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch_file_relation\` ADD CONSTRAINT \`FK_4a6d7596a8ed918b6e7d7c70c27\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch_file_relation\` DROP FOREIGN KEY \`FK_4a6d7596a8ed918b6e7d7c70c27\``);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch_file_relation\` DROP FOREIGN KEY \`FK_752a3c40e71d72ea9d5c0f80100\``);
        await queryRunner.query(`ALTER TABLE \`category_info_file_relation\` DROP FOREIGN KEY \`FK_48864590998acc518e54ef6c6f6\``);
        await queryRunner.query(`ALTER TABLE \`category_info_file_relation\` DROP FOREIGN KEY \`FK_59510ec51735c78a76db52b7a04\``);
        await queryRunner.query(`ALTER TABLE \`compressor_file_relation\` DROP FOREIGN KEY \`FK_dd56167538dbe8ba6c950a719ec\``);
        await queryRunner.query(`ALTER TABLE \`compressor_file_relation\` DROP FOREIGN KEY \`FK_6bab55002f4a4756609a70af97d\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_file_relation\` DROP FOREIGN KEY \`FK_479aeee1feab7c551f8cd9034f0\``);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_file_relation\` DROP FOREIGN KEY \`FK_6b8a933e26bd0425428b7d3d3ef\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panel_file_relation\` DROP FOREIGN KEY \`FK_79cb339ac749b3502482de8cbf3\``);
        await queryRunner.query(`ALTER TABLE \`distributor_panel_file_relation\` DROP FOREIGN KEY \`FK_4b0f777587af539ecbc20297eaf\``);
        await queryRunner.query(`ALTER TABLE \`forklift_file_relation\` DROP FOREIGN KEY \`FK_e76e6081149f9958f6929f7fe89\``);
        await queryRunner.query(`ALTER TABLE \`forklift_file_relation\` DROP FOREIGN KEY \`FK_250805bf1772b4f89a26303355d\``);
        await queryRunner.query(`ALTER TABLE \`tower_light_file_relation\` DROP FOREIGN KEY \`FK_0aea0667cac6b36e07a10f62383\``);
        await queryRunner.query(`ALTER TABLE \`tower_light_file_relation\` DROP FOREIGN KEY \`FK_0942f051e1d2960a1d14e4be111\``);
        await queryRunner.query(`ALTER TABLE \`ups_file_relation\` DROP FOREIGN KEY \`FK_4daebc3e418d95fb083384cd22e\``);
        await queryRunner.query(`ALTER TABLE \`ups_file_relation\` DROP FOREIGN KEY \`FK_19f53aa1da750b7fd5938aae4a7\``);
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP FOREIGN KEY \`FK_9228deaf3cc55aa0d37afd344b2\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`automatic_transfer_switch\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`compressors\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`diesel_generator_sets\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`distributor_panels\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`forklift\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`tower_light\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`ups\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`DROP TABLE \`automatic_transfer_switch_file_relation\``);
        await queryRunner.query(`DROP TABLE \`category_info_file_relation\``);
        await queryRunner.query(`DROP TABLE \`compressor_file_relation\``);
        await queryRunner.query(`DROP TABLE \`diesel_generator_file_relation\``);
        await queryRunner.query(`DROP TABLE \`distributor_panel_file_relation\``);
        await queryRunner.query(`DROP TABLE \`forklift_file_relation\``);
        await queryRunner.query(`DROP TABLE \`tower_light_file_relation\``);
        await queryRunner.query(`DROP TABLE \`ups_file_relation\``);
    }

}
