import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MemberProfileClient } from "@/features/members/components/MemberProfileClient";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

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
