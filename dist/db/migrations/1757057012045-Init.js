"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1757057012045 = void 0;
class Init1757057012045 {
    constructor() {
        this.name = 'Init1757057012045';
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_2d82eb2bb2ddd7a6bfac8804d8\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_c5a322ad12a7bf95460c958e80\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_46bc204f43827b6f25e0133dbf\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`body\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`content\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`displayName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c5a322ad12a7bf95460c958e80e\``);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`id\` bigint NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`authorId\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`authorId\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`createdAt\` \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`deletedAt\` \`deletedAt\` datetime(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`id\` bigint NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`passwordHash\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`passwordHash\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE INDEX \`IDX_posts_authorId_createdAt\` ON \`posts\` (\`authorId\`, \`createdAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_posts_authorId\` ON \`posts\` (\`authorId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_posts_createdAt\` ON \`posts\` (\`createdAt\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c5a322ad12a7bf95460c958e80e\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c5a322ad12a7bf95460c958e80e\``);
        await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_createdAt\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_authorId\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_posts_authorId_createdAt\` ON \`posts\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`passwordHash\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`passwordHash\` varchar(60) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`authorId\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`authorId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c5a322ad12a7bf95460c958e80e\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`displayName\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`name\` varchar(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`body\` text NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_46bc204f43827b6f25e0133dbf\` ON \`posts\` (\`createdAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_c5a322ad12a7bf95460c958e80\` ON \`posts\` (\`authorId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2d82eb2bb2ddd7a6bfac8804d8\` ON \`posts\` (\`title\`)`);
    }
}
exports.Init1757057012045 = Init1757057012045;
//# sourceMappingURL=1757057012045-Init.js.map