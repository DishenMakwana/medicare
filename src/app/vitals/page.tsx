import { db } from "@/lib/db";
import { VitalsDashboardClient } from "@/features/vitals/components/VitalsDashboardClient";

export const dynamic = "force-dynamic";

export default async function VitalsPage() {
  const [vitals, members] = await Promise.all([
    db.getVitals(),
    db.getFamilyMembers(),
  ]);

  return <VitalsDashboardClient vitals={vitals} members={members} />;
}
