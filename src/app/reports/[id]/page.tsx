import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ReportDetailClient } from "@/features/reports/components/ReportDetailClient";
import type { ReportPageProps } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportDetailPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await db.getReportById(id);

  if (!report) {
    notFound();
  }

  return <ReportDetailClient report={report} />;
}
