import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764149640031UpdateTableFieldNameCategoryAndCategoryIntoTable1764149642021 implements MigrationInterface {
    name = 'M1764149640031UpdateTableFieldNameCategoryAndCategoryIntoTable1764149642021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP FOREIGN KEY \`FK_9228deaf3cc55aa0d37afd344b2\``);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`categories_name\` \`category_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP COLUMN \`category_id\``);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD UNIQUE INDEX \`IDX_872bff57db2b6fe48c0913d8da\` (\`category_name\`)`);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD UNIQUE INDEX \`IDX_c86702dfc8e7109dfdac96a058\` (\`title\`)`);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD UNIQUE INDEX \`IDX_c37540eeb84d5076597bdbf1e8\` (\`description\`)`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP INDEX \`IDX_c37540eeb84d5076597bdbf1e8\``);
        await queryRunner.query(`ALTER TABLE \`category_info\` DROP INDEX \`IDX_c86702dfc8e7109dfdac96a058\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP INDEX \`IDX_872bff57db2b6fe48c0913d8da\``);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD \`category_id\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`category_name\` \`categories_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`category_info\` ADD CONSTRAINT \`FK_9228deaf3cc55aa0d37afd344b2\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
