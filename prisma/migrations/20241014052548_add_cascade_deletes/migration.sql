-- DropForeignKey
ALTER TABLE "approved_dates" DROP CONSTRAINT "approved_dates_request_id_fkey";

-- DropForeignKey
ALTER TABLE "approved_dates" DROP CONSTRAINT "approved_dates_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "delegation_requests" DROP CONSTRAINT "delegation_requests_delegated_to_fkey";

-- DropForeignKey
ALTER TABLE "delegation_requests" DROP CONSTRAINT "delegation_requests_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_processor_id_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_reporting_manager_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawn_dates" DROP CONSTRAINT "withdrawn_dates_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawn_dates" DROP CONSTRAINT "withdrawn_dates_withdraw_request_id_fkey";

-- AddForeignKey
ALTER TABLE "approved_dates" ADD CONSTRAINT "approved_dates_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("request_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "approved_dates" ADD CONSTRAINT "approved_dates_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_reporting_manager_fkey" FOREIGN KEY ("reporting_manager") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawn_dates" ADD CONSTRAINT "withdrawn_dates_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawn_dates" ADD CONSTRAINT "withdrawn_dates_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("withdraw_request_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_processor_id_fkey" FOREIGN KEY ("processor_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delegation_requests" ADD CONSTRAINT "delegation_requests_delegated_to_fkey" FOREIGN KEY ("delegated_to") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delegation_requests" ADD CONSTRAINT "delegation_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE CASCADE ON UPDATE NO ACTION;
