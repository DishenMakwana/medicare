import { prisma } from "../src/lib/db";
import { initialFamilyMembers, initialReports, initialVitals } from "../src/lib/seed-data";

async function seed() {
  console.log("Seeding PostgreSQL database with initial data...");

  const memberIdMap = new Map<string, number>();

  // Seed Members
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

  // Seed Reports
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
  console.log(`Seeded ${initialReports.length} reports.`);

  // Seed Vitals
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
  console.log(`Seeded ${initialVitals.length} vitals.`);
  console.log("Seeding finished successfully.");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
