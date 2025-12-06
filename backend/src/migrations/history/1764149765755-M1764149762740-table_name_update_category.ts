import { MigrationInterface, QueryRunner } from "typeorm";

export class M1764149762740TableNameUpdateCategory1764149765755 implements MigrationInterface {
    name = 'M1764149762740TableNameUpdateCategory1764149765755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` varchar(36) NOT NULL, \`category_name\` varchar(100) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, UNIQUE INDEX \`IDX_9359e3b1d5e90d7a0fbe3b2807\` (\`category_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`administrators_tokens\` CHANGE \`logout_at\` \`logout_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP INDEX \`IDX_9359e3b1d5e90d7a0fbe3b2807\` ON \`category\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
