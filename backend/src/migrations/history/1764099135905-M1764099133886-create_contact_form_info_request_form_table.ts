import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764099133886CreateContactFormInfoRequestFormTable1764099135905 implements MigrationInterface {
    name = 'M1764099133886CreateContactFormInfoRequestFormTable1764099135905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`info_request_forms\` (\`id\` varchar(36) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`model_number\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contact_forms\` (\`id\` varchar(36) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`company\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`department\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`created_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``);
        await queryRunner.query(`ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`info\` DROP FOREIGN KEY \`FK_b51c203db3c4c1d2ab1ce6e239d\``);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`info\` CHANGE \`category_id\` \`category_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`info\` ADD CONSTRAINT \`FK_b51c203db3c4c1d2ab1ce6e239d\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`contact_forms\``);
        await queryRunner.query(`DROP TABLE \`info_request_forms\``);
    }

}
