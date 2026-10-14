import { PrismaClient } from "@prisma/client";
import {
  initialFamilyMembers,
  initialReports,
  initialTestPresets,
  initialVitals,
} from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Medicare database (if requested)...");

  // Track map of customId -> generated numeric id
  const memberIdMap = new Map<string, number>();

  // 1. Seed Family Members
  for (const m of initialFamilyMembers) {
    const customIdStr = String(m.id);
    const existing = await prisma.familyMember.findFirst({
      where: { customId: customIdStr },
    });
    if (existing) {
      memberIdMap.set(customIdStr, existing.id);
    } else {
      const created = await prisma.familyMember.create({
        data: {
          customId: customIdStr,
          name: m.name,
          aliases: m.aliases,
          gender: m.gender,
          dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth) : null,
          ageYears: m.ageYears,
          bloodGroup: m.bloodGroup,
          relation: m.relation,
          notes: m.notes,
        },
      });
      memberIdMap.set(customIdStr, created.id);
    }
  }
  console.log(`Seeded ${initialFamilyMembers.length} family members.`);

  // 2. Seed Medical Reports
  for (const r of initialReports) {
    const customIdStr = String(r.id);
    const targetMemberId = memberIdMap.get(String(r.familyMemberId)) || 1;
    const existing = await prisma.medicalReport.findFirst({
      where: { customId: customIdStr },
    });
    if (!existing) {
      await prisma.medicalReport.create({
        data: {
          customId: customIdStr,
          familyMemberId: targetMemberId,
          title: r.title,
          labName: r.labName,
          registrationNo: r.registrationNo,
          reportDate: new Date(r.reportDate),
          collectionDate: r.collectionDate ? new Date(r.collectionDate) : null,
          doctorRef: r.doctorRef,
          rawPatientName: r.rawPatientName,
          overallStatus: r.overallStatus,
          notes: r.notes,
          images: {
            create: (r.images || []).map((img, idx) => ({
              customId: String(img.id || `img-${idx}`),
              imageUrl: img.imageUrl,
              pageNumber: img.pageNumber,
              ocrStatus: img.ocrStatus,
            })),
          },
          parameters: {
            create: (r.parameters || []).map((p, idx) => ({
              customId: String(p.id || `param-${idx}`),
              category: p.category,
              paramName: p.paramName,
              paramSlug: p.paramSlug,
              valueNumber: p.valueNumber,
              valueText: p.valueText,
              unit: p.unit,
              refMin: p.refMin,
              refMax: p.refMax,
              refText: p.refText,
              status: p.status,
              clinicalMethod: p.clinicalMethod,
            })),
          },
        },
      });
    }
  }
  console.log(`Seeded ${initialReports.length} comprehensive medical reports with parameters.`);

  // 3. Seed Vitals
  for (const v of initialVitals) {
    const customIdStr = String(v.id);
    const targetMemberId = memberIdMap.get(String(v.familyMemberId)) || 1;
    const existing = await prisma.dailyVital.findFirst({
      where: { customId: customIdStr },
    });
    if (!existing) {
      await prisma.dailyVital.create({
        data: {
          customId: customIdStr,
          familyMemberId: targetMemberId,
          recordDate: new Date(v.recordDate),
          vitalType: v.vitalType,
          systolic: v.systolic,
          diastolic: v.diastolic,
          pulseRate: v.pulseRate,
          sugarValue: v.sugarValue,
          sugarContext: v.sugarContext,
          notes: v.notes,
        },
      });
    }
  }
  console.log(`Seeded ${initialVitals.length} daily vitals records.`);

  // 4. Seed Standard Clinical Test Presets
  let presetCount = 0;
  for (const preset of initialTestPresets) {
    const existing = await prisma.testPreset.findFirst({
      where: { name: { equals: preset.name, mode: "insensitive" } },
    });
    if (!existing) {
      await prisma.testPreset.create({
        data: {
          customId: String(preset.id),
          labName: preset.labName,
          name: preset.name,
          category: preset.category,
          unit: preset.unit,
          refMin: preset.refMin,
          refMax: preset.refMax,
          refText: preset.refText,
          clinicalMethod: preset.clinicalMethod,
          source: preset.source || "SYSTEM_DEFAULT",
        },
      });
      presetCount++;
    }
  }
  console.log(`Seeded ${presetCount} clinical test biomarker presets.`);
  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
