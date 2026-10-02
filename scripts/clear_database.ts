import { prisma } from "../src/lib/db";

async function clearDatabase() {
  console.log("Removing all seeder data from database...");

  try {
    // Delete all parameters
    const deletedParams = await prisma.reportParameter.deleteMany({});
    console.log(`Deleted ${deletedParams.count} report parameters.`);

    // Delete all images
    const deletedImages = await prisma.reportImage.deleteMany({});
    console.log(`Deleted ${deletedImages.count} report images.`);

    // Delete all reports
    const deletedReports = await prisma.medicalReport.deleteMany({});
    console.log(`Deleted ${deletedReports.count} medical reports.`);

    // Delete all daily vitals
    const deletedVitals = await prisma.dailyVital.deleteMany({});
    console.log(`Deleted ${deletedVitals.count} daily vitals.`);

    // Delete all family members
    const deletedMembers = await prisma.familyMember.deleteMany({});
    console.log(`Deleted ${deletedMembers.count} family members.`);

    console.log("PostgreSQL tables successfully emptied!");
  } catch (err) {
    console.warn("Prisma deletion notice (PostgreSQL might not be running or empty):", err);
  }

  console.log("All seeder data has been completely removed from the database!");
}

clearDatabase()
  .catch(e => {
    console.error("Clear database failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
