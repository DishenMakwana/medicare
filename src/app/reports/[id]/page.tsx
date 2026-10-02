import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReportDetailClient } from "@/features/reports/components/ReportDetailClient";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await db.getReportById(id);

  if (!report) {
    notFound();
  }

  return <ReportDetailClient report={report} />;
}
