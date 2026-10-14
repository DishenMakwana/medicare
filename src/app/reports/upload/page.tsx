import { db } from "@/lib/db";
import { ReportUploadClient } from "@/features/reports/components/ReportUploadClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportUploadPage() {
  const members = await db.getMembers();

  return <ReportUploadClient initialMembers={members} />;
}
