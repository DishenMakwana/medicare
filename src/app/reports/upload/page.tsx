"use client";

import { useState, useEffect } from "react";
import { MultiPhotoDropzone } from "@/features/reports/components/MultiPhotoDropzone";
import { ExtractionReviewTable } from "@/features/reports/components/ExtractionReviewTable";
import { FamilyMember } from "@/types";
import { Sparkles } from "lucide-react";

export default function ReportUploadPage() {
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.members) setMembers(data.members);
      })
      .catch(() => {
        setMembers([]);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      {!extractedData && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>100% Free & Open-Source Python OCR & PDF Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload & Extract Medical Reports
          </h1>
          <p className="text-sm text-slate-500">
            Upload single or multi-page PDF documents or photo scans of
            laboratory tests. The local extraction engine parses the patient
            name and individual clinical parameters for database storage.
          </p>
        </div>
      )}

      {/* Upload Dropzone OR Review Table */}
      {!extractedData ? (
        <MultiPhotoDropzone onExtractionComplete={setExtractedData} />
      ) : (
        <ExtractionReviewTable
          extractedData={extractedData}
          members={members}
          onReset={() => setExtractedData(null)}
        />
      )}
    </div>
  );
}
