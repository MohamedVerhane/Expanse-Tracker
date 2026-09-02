-- DropForeignKey
ALTER TABLE `VerificationToken` DROP FOREIGN KEY `VerificationToken_userId_fkey`;

-- DropTable
DROP TABLE `VerificationToken`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `emailVerifiedAt`;