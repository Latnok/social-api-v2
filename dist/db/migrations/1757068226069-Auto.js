"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auto1757068226069 = void 0;
class Auto1757068226069 {
    constructor() {
        this.name = 'Auto1757068226069';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`title\` varchar(200) NOT NULL, \`content\` text NOT NULL, \`authorId\` bigint NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(3) NULL, INDEX \`IDX_posts_authorId_createdAt\` (\`authorId\`, \`createdAt\`), INDEX \`IDX_posts_authorId\` (\`authorId\`), INDEX \`IDX_posts_createdAt\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`displayName\` varchar(100) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(3) NULL, UNIQUE INDEX \`IDX_users_email\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c5a322ad12a7bf95460c958e80e\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c5a322ad12a7bf95460c958e80e\``);
        await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_createdAt\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_authorId\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_authorId_createdAt\` ON \`posts\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
    }
}
exports.Auto1757068226069 = Auto1757068226069;
//# sourceMappingURL=1757068226069-Auto.js.map