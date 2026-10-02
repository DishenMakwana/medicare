import { db } from "@/lib/db";
import { MembersListClient } from "@/features/members/components/MembersListClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await db.getMembers();

  return <MembersListClient initialMembers={members} />;
}
