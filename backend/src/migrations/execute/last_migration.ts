import { MigrationInterface, QueryRunner } from "typeorm";

export class M1768023727120Need1768023728594 implements MigrationInterface {
    name = 'M1768023727120Need1768023728594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`background\` (\`id\` varchar(36) NOT NULL, \`section\` varchar(100) NOT NULL, \`title\` varchar(150) NOT NULL, \`description\` text NOT NULL, \`is_visible\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`file_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contact_form_email_reply_files\` (\`id\` varchar(36) NOT NULL, \`reply_id\` varchar(36) NULL, \`file_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contact_form_email_replies\` (\`id\` varchar(36) NOT NULL, \`subject\` varchar(200) NOT NULL, \`body\` text NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`contact_form_id\` varchar(36) NOT NULL, \`administrator_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`info_request_email_reply_files\` (\`id\` varchar(36) NOT NULL, \`reply_id\` varchar(36) NULL, \`file_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`info_request_email_replies\` (\`id\` varchar(36) NOT NULL, \`subject\` varchar(200) NOT NULL, \`body\` text NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`info_request_form_id\` varchar(36) NOT NULL, \`administrator_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sub_category\` (\`id\` varchar(36) NOT NULL, \`sub_category_name\` varchar(100) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`category_id\` varchar(36) NULL, UNIQUE INDEX \`UQ_sub_category_name_category\` (\`sub_category_name\`, \`category_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`email_credentials\` (\`id\` varchar(36) NOT NULL, \`api_key\` varchar(255) NOT NULL, \`from_email\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_8b0ed217cc077ae540ba44af4e\` (\`from_email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` ADD \`is_replied\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` ADD \`is_replied\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` ADD \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`sub_category_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`background\` ADD CONSTRAINT \`FK_03d98a208a20e8f177291daef9e\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_reply_files\` ADD CONSTRAINT \`FK_067e990de59dc8bfbe11cf07d4d\` FOREIGN KEY (\`reply_id\`) REFERENCES \`contact_form_email_replies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_reply_files\` ADD CONSTRAINT \`FK_e2cefd9d3a827b058c97e37bcf4\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_replies\` ADD CONSTRAINT \`FK_9db481f47bd7d966b578195a7fc\` FOREIGN KEY (\`contact_form_id\`) REFERENCES \`contact_forms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_replies\` ADD CONSTRAINT \`FK_fc039c6e07e77e7835e1bd97ea5\` FOREIGN KEY (\`administrator_id\`) REFERENCES \`administrators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`info_request_email_reply_files\` ADD CONSTRAINT \`FK_9726af9860d527cc87a1750091e\` FOREIGN KEY (\`reply_id\`) REFERENCES \`info_request_email_replies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`info_request_email_reply_files\` ADD CONSTRAINT \`FK_937ff48e05d26706212fe48ab0b\` FOREIGN KEY (\`file_id\`) REFERENCES \`files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`info_request_email_replies\` ADD CONSTRAINT \`FK_41ae4786374e20dff297a615000\` FOREIGN KEY (\`info_request_form_id\`) REFERENCES \`info_request_forms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`info_request_email_replies\` ADD CONSTRAINT \`FK_82e5aa78ae236d6fcece74242c5\` FOREIGN KEY (\`administrator_id\`) REFERENCES \`administrators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_bb5914af2b6f5d4e13115cdc07b\` FOREIGN KEY (\`sub_category_id\`) REFERENCES \`sub_category\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD CONSTRAINT \`FK_4ec8c495300259f2322760a39fa\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP FOREIGN KEY \`FK_4ec8c495300259f2322760a39fa\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_bb5914af2b6f5d4e13115cdc07b\``);
        await queryRunner.query(`ALTER TABLE \`info_request_email_replies\` DROP FOREIGN KEY \`FK_82e5aa78ae236d6fcece74242c5\``);
        await queryRunner.query(`ALTER TABLE \`info_request_email_replies\` DROP FOREIGN KEY \`FK_41ae4786374e20dff297a615000\``);
        await queryRunner.query(`ALTER TABLE \`info_request_email_reply_files\` DROP FOREIGN KEY \`FK_937ff48e05d26706212fe48ab0b\``);
        await queryRunner.query(`ALTER TABLE \`info_request_email_reply_files\` DROP FOREIGN KEY \`FK_9726af9860d527cc87a1750091e\``);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_replies\` DROP FOREIGN KEY \`FK_fc039c6e07e77e7835e1bd97ea5\``);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_replies\` DROP FOREIGN KEY \`FK_9db481f47bd7d966b578195a7fc\``);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_reply_files\` DROP FOREIGN KEY \`FK_e2cefd9d3a827b058c97e37bcf4\``);
        await queryRunner.query(`ALTER TABLE \`contact_form_email_reply_files\` DROP FOREIGN KEY \`FK_067e990de59dc8bfbe11cf07d4d\``);
        await queryRunner.query(`ALTER TABLE \`background\` DROP FOREIGN KEY \`FK_03d98a208a20e8f177291daef9e\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`sub_category_id\``);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`info_request_forms\` DROP COLUMN \`is_replied\``);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`contact_forms\` DROP COLUMN \`is_replied\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b0ed217cc077ae540ba44af4e\` ON \`email_credentials\``);
        await queryRunner.query(`DROP TABLE \`email_credentials\``);
        await queryRunner.query(`DROP INDEX \`UQ_sub_category_name_category\` ON \`sub_category\``);
        await queryRunner.query(`DROP TABLE \`sub_category\``);
        await queryRunner.query(`DROP TABLE \`info_request_email_replies\``);
        await queryRunner.query(`DROP TABLE \`info_request_email_reply_files\``);
        await queryRunner.query(`DROP TABLE \`contact_form_email_replies\``);
        await queryRunner.query(`DROP TABLE \`contact_form_email_reply_files\``);
        await queryRunner.query(`DROP TABLE \`background\``);
    }

}
