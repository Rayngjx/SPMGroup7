/*
  Warnings:

  - You are about to drop the column `withdraw_request_id` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `dept_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `dept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `request_type` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `request_id` on table `logs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `department` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `position` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role_id` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `staff_id` on table `withdraw_requests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "dept" DROP CONSTRAINT "fk_dept_head";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_request_id_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_withdraw_request_id_fkey";

-- DropForeignKey
ALTER TABLE "team" DROP CONSTRAINT "team_team_leader_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "fk_users_dept";

-- DropForeignKey
ALTER TABLE "withdraw_requests" DROP CONSTRAINT "withdraw_requests_staff_id_fkey";

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "withdraw_request_id",
ADD COLUMN     "approved" VARCHAR(20),
ADD COLUMN     "request_type" VARCHAR(50) NOT NULL,
ALTER COLUMN "request_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "document_url" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "dept_id",
ADD COLUMN     "department" VARCHAR(100) NOT NULL,
ADD COLUMN     "temp_replacement" INTEGER,
ALTER COLUMN "position" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "role_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "withdraw_requests" ALTER COLUMN "staff_id" SET NOT NULL;

-- DropTable
DROP TABLE "dept";

-- DropTable
DROP TABLE "team";

-- CreateTable
CREATE TABLE "delegation_requests" (
    "delegation_request" SERIAL NOT NULL,
    "staff_id" INTEGER,
    "delegated_to" INTEGER,
    "approved" VARCHAR(20),
    "date_range" DATE[],

    CONSTRAINT "delegation_requests_pkey" PRIMARY KEY ("delegation_request")
);

-- RenameForeignKey
ALTER TABLE "users" RENAME CONSTRAINT "fk_users_manager" TO "users_reporting_manager_fkey";

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delegation_requests" ADD CONSTRAINT "delegation_requests_delegated_to_fkey" FOREIGN KEY ("delegated_to") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delegation_requests" ADD CONSTRAINT "delegation_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
