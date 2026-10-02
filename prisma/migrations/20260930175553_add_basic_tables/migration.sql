-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "ageYears" INTEGER,
    "bloodGroup" TEXT,
    "relation" TEXT,
    "notes" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalReport" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "familyMemberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "labName" TEXT,
    "registrationNo" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "collectionDate" TIMESTAMP(3),
    "doctorRef" TEXT,
    "rawPatientName" TEXT,
    "overallStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportImage" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "reportId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "ocrStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportParameter" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "reportId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "paramName" TEXT NOT NULL,
    "paramSlug" TEXT NOT NULL,
    "valueNumber" DOUBLE PRECISION,
    "valueText" TEXT,
    "unit" TEXT,
    "refMin" DOUBLE PRECISION,
    "refMax" DOUBLE PRECISION,
    "refText" TEXT,
    "status" TEXT NOT NULL,
    "clinicalMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVital" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "familyMemberId" INTEGER NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "vitalType" TEXT NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulseRate" INTEGER,
    "sugarValue" DOUBLE PRECISION,
    "sugarContext" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyVital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPreset" (
    "id" SERIAL NOT NULL,
    "customId" TEXT,
    "labName" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "refMin" DOUBLE PRECISION,
    "refMax" DOUBLE PRECISION,
    "refText" TEXT,
    "clinicalMethod" TEXT,
    "source" TEXT DEFAULT 'UPLOADED_REPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilyMember_name_idx" ON "FamilyMember"("name");

-- CreateIndex
CREATE INDEX "FamilyMember_customId_idx" ON "FamilyMember"("customId");

-- CreateIndex
CREATE INDEX "MedicalReport_familyMemberId_reportDate_idx" ON "MedicalReport"("familyMemberId", "reportDate");

-- CreateIndex
CREATE INDEX "MedicalReport_customId_idx" ON "MedicalReport"("customId");

-- CreateIndex
CREATE INDEX "ReportImage_reportId_idx" ON "ReportImage"("reportId");

-- CreateIndex
CREATE INDEX "ReportImage_customId_idx" ON "ReportImage"("customId");

-- CreateIndex
CREATE INDEX "ReportParameter_reportId_category_idx" ON "ReportParameter"("reportId", "category");

-- CreateIndex
CREATE INDEX "ReportParameter_paramSlug_idx" ON "ReportParameter"("paramSlug");

-- CreateIndex
CREATE INDEX "ReportParameter_customId_idx" ON "ReportParameter"("customId");

-- CreateIndex
CREATE INDEX "DailyVital_familyMemberId_recordDate_idx" ON "DailyVital"("familyMemberId", "recordDate");

-- CreateIndex
CREATE INDEX "DailyVital_vitalType_idx" ON "DailyVital"("vitalType");

-- CreateIndex
CREATE INDEX "DailyVital_customId_idx" ON "DailyVital"("customId");

-- CreateIndex
CREATE INDEX "TestPreset_labName_name_idx" ON "TestPreset"("labName", "name");

-- CreateIndex
CREATE INDEX "TestPreset_category_idx" ON "TestPreset"("category");

-- CreateIndex
CREATE INDEX "TestPreset_name_idx" ON "TestPreset"("name");

-- CreateIndex
CREATE INDEX "TestPreset_customId_idx" ON "TestPreset"("customId");

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MedicalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportParameter" ADD CONSTRAINT "ReportParameter_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MedicalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVital" ADD CONSTRAINT "DailyVital_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
