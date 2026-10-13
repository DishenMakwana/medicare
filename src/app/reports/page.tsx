import { db } from "@/lib/db";
import { ReportsVaultClient } from "@/features/reports/components/ReportsVaultClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const [reports, members] = await Promise.all([
    db.getReports(),
    db.getFamilyMembers(),
  ]);

  return <ReportsVaultClient reports={reports} members={members} />;
}
