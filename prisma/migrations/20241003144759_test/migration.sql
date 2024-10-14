-- CreateTable
CREATE TABLE "approved_dates" (
    "staff_id" INTEGER NOT NULL,
    "request_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "approved_dates_pkey" PRIMARY KEY ("staff_id","request_id","date")
);

-- CreateTable
CREATE TABLE "dept" (
    "dept_id" SERIAL NOT NULL,
    "dept_name" VARCHAR(100) NOT NULL,
    "dept_head" INTEGER,

    CONSTRAINT "dept_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "requests" (
    "request_id" SERIAL NOT NULL,
    "staff_id" INTEGER,
    "timeslot" VARCHAR(20),
    "daterange" DATE[],
    "reason" TEXT,
    "approved" VARCHAR(20) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "team" (
    "team_id" SERIAL NOT NULL,
    "team_name" VARCHAR(100) NOT NULL,
    "team_leader" INTEGER,

    CONSTRAINT "team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "users" (
    "staff_id" SERIAL NOT NULL,
    "staff_fname" VARCHAR(100) NOT NULL,
    "staff_lname" VARCHAR(100) NOT NULL,
    "dept_id" INTEGER,
    "position" VARCHAR(100),
    "country" VARCHAR(100),
    "email" VARCHAR(100),
    "reporting_manager" INTEGER,
    "role_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "withdraw_request_id" SERIAL NOT NULL,
    "staff_id" INTEGER,
    "timeslot" VARCHAR(20),
    "date" DATE NOT NULL,
    "reason" TEXT,
    "approved" VARCHAR(20) NOT NULL,

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("withdraw_request_id")
);

-- CreateTable
CREATE TABLE "withdrawn_dates" (
    "staff_id" INTEGER NOT NULL,
    "withdraw_request_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "withdrawn_dates_pkey" PRIMARY KEY ("staff_id","withdraw_request_id","date")
);

-- CreateTable
CREATE TABLE "logs" (
    "log_id" SERIAL NOT NULL,
    "staff_id" INTEGER,
    "request_id" INTEGER,
    "withdraw_request_id" INTEGER,
    "processor_id" INTEGER,
    "reason" TEXT,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "approved_dates" ADD CONSTRAINT "approved_dates_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "approved_dates" ADD CONSTRAINT "approved_dates_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dept" ADD CONSTRAINT "fk_dept_head" FOREIGN KEY ("dept_head") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_team_leader_fkey" FOREIGN KEY ("team_leader") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_dept" FOREIGN KEY ("dept_id") REFERENCES "dept"("dept_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_manager" FOREIGN KEY ("reporting_manager") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawn_dates" ADD CONSTRAINT "withdrawn_dates_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawn_dates" ADD CONSTRAINT "withdrawn_dates_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("withdraw_request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_processor_id_fkey" FOREIGN KEY ("processor_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("withdraw_request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
