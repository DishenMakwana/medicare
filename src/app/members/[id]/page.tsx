import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MemberProfileClient } from "@/features/members/components/MemberProfileClient";
import type { MemberDetailPageProps } from "@/types";

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { id } = await params;
  const [member, allMembers] = await Promise.all([
    db.getMemberById(id),
    db.getFamilyMembers(),
  ]);

  if (!member) {
    notFound();
  }

  return <MemberProfileClient member={member} allMembers={allMembers} />;
}
