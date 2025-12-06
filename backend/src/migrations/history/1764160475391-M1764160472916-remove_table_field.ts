import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764160472916RemoveTableField1764160475391 implements MigrationInterface {
    name = 'M1764160472916RemoveTableField1764160475391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category\` DROP FOREIGN KEY \`FK_6e132b5eff0f4fcfb3581b3832e\``);
        await queryRunner.query(`DROP INDEX \`IDX_6e132b5eff0f4fcfb3581b3832\` ON \`category\``);
        await queryRunner.query(`DROP INDEX \`REL_6e132b5eff0f4fcfb3581b3832\` ON \`category\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`info_id\``);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`brochure_url\` \`brochure_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` CHANGE \`main_image_url\` \`main_image_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD \`info_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_6e132b5eff0f4fcfb3581b3832\` ON \`category\` (\`info_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_6e132b5eff0f4fcfb3581b3832\` ON \`category\` (\`info_id\`)`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD CONSTRAINT \`FK_6e132b5eff0f4fcfb3581b3832e\` FOREIGN KEY (\`info_id\`) REFERENCES \`category_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
