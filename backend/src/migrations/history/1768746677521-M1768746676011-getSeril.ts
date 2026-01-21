import { MigrationInterface, QueryRunner } from "typeorm";

export class M1768746676011GetSeril1768746677521 implements MigrationInterface {
    name = 'M1768746676011GetSeril1768746677521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_ba4f7f2ef775d3c902ed5dddaf\` ON \`product\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`language\` varchar(10) NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`serial_no\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`field\` ADD \`serial_no\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`group\` ADD \`serial_no\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD \`serial_no\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD UNIQUE INDEX \`IDX_aa3714c1d50264dccd4db3f825\` (\`serial_no\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category\` DROP INDEX \`IDX_aa3714c1d50264dccd4db3f825\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`serial_no\``);
        await queryRunner.query(`ALTER TABLE \`group\` DROP COLUMN \`serial_no\``);
        await queryRunner.query(`ALTER TABLE \`field\` DROP COLUMN \`serial_no\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`serial_no\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`language\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_ba4f7f2ef775d3c902ed5dddaf\` ON \`product\` (\`model_name\`)`);
    }

}
