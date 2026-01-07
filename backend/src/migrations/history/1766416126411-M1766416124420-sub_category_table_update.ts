import { MigrationInterface, QueryRunner } from "typeorm";

export class M1766416124420SubCategoryTableUpdate1766416126411 implements MigrationInterface {
    name = 'M1766416124420SubCategoryTableUpdate1766416126411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`product_file_relation\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_bb5914af2b6f5d4e13115cdc07b\``);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`sub_category_id\` \`sub_category_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`product_value\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`product_value\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`field\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`field\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`group\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`group\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP FOREIGN KEY \`FK_4ec8c495300259f2322760a39fa\``);
        await queryRunner.query(`DROP INDEX \`UQ_sub_category_name_category\` ON \`sub_category\``);
        await queryRunner.query(`ALTER TABLE \`sub_category\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_sub_category_name_category\` ON \`sub_category\` (\`sub_category_name\`, \`category_id\`)`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_bb5914af2b6f5d4e13115cdc07b\` FOREIGN KEY (\`sub_category_id\`) REFERENCES \`sub_category\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD CONSTRAINT \`FK_4ec8c495300259f2322760a39fa\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP FOREIGN KEY \`FK_4ec8c495300259f2322760a39fa\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_bb5914af2b6f5d4e13115cdc07b\``);
        await queryRunner.query(`DROP INDEX \`UQ_sub_category_name_category\` ON \`sub_category\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`administrators\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_sub_category_name_category\` ON \`sub_category\` (\`sub_category_name\`, \`category_id\`)`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD CONSTRAINT \`FK_4ec8c495300259f2322760a39fa\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`group\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`group\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`field\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`field\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product_value\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product_value\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`sub_category_id\` \`sub_category_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_bb5914af2b6f5d4e13115cdc07b\` FOREIGN KEY (\`sub_category_id\`) REFERENCES \`sub_category\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`product_file_relation\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`used_at\` \`used_at\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP COLUMN \`created_at\``);
    }

}
