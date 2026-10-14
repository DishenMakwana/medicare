import { NextRequest, NextResponse } from "next/server";
import { runPythonExtraction } from "@/lib/python-runner";
import { cleanPersonName } from "@/lib/name-normalizer";
import { db } from "@/lib/db";
import { PageExtractionSummary } from "@/types";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No image files uploaded" },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedImages: Array<{
      imageUrl: string;
      pageNumber: number;
      extractionQuality?: string;
    }> = [];
    const aggregatedParameters: any[] = [];
    const pagesSummary: PageExtractionSummary[] = [];

    let detectedRawName = "";
    let detectedCleanName = "";
    let detectedAge: number | null = null;
    let detectedGender: string | null = null;
    let detectedLab = "";
    let detectedRegNo = "";
    let detectedReportDate = "";
    let detectedCollectionDate = "";
    let detectedDoctorRef = "";

    // Process each uploaded image photo or PDF document
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const filename = `report_${Date.now()}_file${i + 1}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);

      // Call our 100% open-source Python extraction engine
      const extraction = await runPythonExtraction(filePath, uploadDir);

      if (
        extraction.raw_patient_name &&
        extraction.raw_patient_name !== "Unknown"
      ) {
        detectedRawName = extraction.raw_patient_name;
        detectedCleanName = extraction.clean_patient_name;
      }
      if (extraction.age) detectedAge = extraction.age;
      if (extraction.gender) detectedGender = extraction.gender;
      if (extraction.lab_name) detectedLab = extraction.lab_name;
      if (extraction.registration_no)
        detectedRegNo = extraction.registration_no;
      if (extraction.report_date) detectedReportDate = extraction.report_date;
      if (extraction.collection_date)
        detectedCollectionDate = extraction.collection_date;
      if (extraction.doctor_ref) detectedDoctorRef = extraction.doctor_ref;

      if (
        extraction.is_pdf &&
        extraction.pdf_pages &&
        extraction.pdf_pages.length > 0
      ) {
        // Multi-page or single-page PDF report: unpack generated page PNGs
        for (const p of extraction.pdf_pages) {
          const pageNum = uploadedImages.length + 1;
          const pageImgUrl = `/uploads/reports/${p.image_filename}`;
          const pageParams = (p.parameters || []).map((param: any) => ({
            ...param,
            source_page: pageNum,
            is_incomplete:
              param.value_number === null &&
              (!param.value_text || param.value_text.trim() === ""),
          }));

          const paramCount = pageParams.length;
          let pageStatus: "SUCCESS" | "WARNING" | "EMPTY" = "SUCCESS";
          let errorReason = "";

          if (paramCount === 0) {
            pageStatus = "EMPTY";
            errorReason =
              "No clinical parameters could be identified from this page. Possible blurry scan or narrative page.";
          } else if (pageParams.some((param: any) => param.is_incomplete)) {
            pageStatus = "WARNING";
            errorReason =
              "Some parameters on this page have missing or unverified values.";
          }

          const testPresetStatus: "COMPLETE" | "PARTIAL" | "EMPTY" =
            p.test_preset_quality ||
            (paramCount === 0
              ? "EMPTY"
              : (p.unparsed_lines && p.unparsed_lines.length > 0) ||
                  pageStatus === "WARNING"
                ? "PARTIAL"
                : "COMPLETE");

          const nonPresetStatus:
            "CLEAN" | "NARRATIVE_NOTES" | "UNPARSED_LINES" | "NONE" =
            p.non_preset_quality ||
            (p.non_preset_lines && p.non_preset_lines.length > 0
              ? "NARRATIVE_NOTES"
              : "CLEAN");

          const resolvedPageStatus: "SUCCESS" | "WARNING" | "EMPTY" =
            testPresetStatus === "COMPLETE"
              ? "SUCCESS"
              : testPresetStatus === "EMPTY"
                ? "EMPTY"
                : "WARNING";

          uploadedImages.push({
            imageUrl: pageImgUrl,
            pageNumber: pageNum,
            extractionQuality: testPresetStatus,
          });

          pagesSummary.push({
            pageNumber: pageNum,
            imageUrl: pageImgUrl,
            fileName: `${file.name} (Page ${p.page_number})`,
            paramCount,
            status: resolvedPageStatus,
            extractionQuality: testPresetStatus,
            testPresetStatus,
            nonPresetStatus,
            nonPresetLines: p.non_preset_lines || [],
            extractedParams: pageParams.map((param: any) => param.param_name),
            unparsedLines: p.unparsed_lines || [],
            errorReason: errorReason || undefined,
          });

          if (pageParams.length > 0) {
            aggregatedParameters.push(...pageParams);
          }
        }
      } else {
        // Standard single image photo
        const pageNum = uploadedImages.length + 1;
        const imageUrl = `/uploads/reports/${filename}`;
        const rawParams = extraction.parameters || [];
        const pageParams = rawParams.map((p) => ({
          ...p,
          source_page: pageNum,
          is_incomplete:
            p.value_number === null &&
            (!p.value_text || p.value_text.trim() === ""),
        }));

        const paramCount = pageParams.length;
        let pageStatus: "SUCCESS" | "WARNING" | "EMPTY" = "SUCCESS";
        let errorReason = "";

        if (paramCount === 0) {
          pageStatus = "EMPTY";
          errorReason =
            "No clinical parameters could be identified from this page. Possible blurry scan or handwritten note.";
        } else if (pageParams.some((p) => p.is_incomplete)) {
          pageStatus = "WARNING";
          errorReason =
            "Some parameters on this page have missing or unverified values.";
        }

        const testPresetStatus: "COMPLETE" | "PARTIAL" | "EMPTY" =
          extraction.test_preset_quality ||
          (paramCount === 0
            ? "EMPTY"
            : (extraction.unparsed_lines &&
                  extraction.unparsed_lines.length > 0) ||
                pageStatus === "WARNING"
              ? "PARTIAL"
              : "COMPLETE");

        const nonPresetStatus:
          "CLEAN" | "NARRATIVE_NOTES" | "UNPARSED_LINES" | "NONE" =
          extraction.non_preset_quality ||
          (extraction.non_preset_lines && extraction.non_preset_lines.length > 0
            ? "NARRATIVE_NOTES"
            : "CLEAN");

        const resolvedPageStatus: "SUCCESS" | "WARNING" | "EMPTY" =
          testPresetStatus === "COMPLETE"
            ? "SUCCESS"
            : testPresetStatus === "EMPTY"
              ? "EMPTY"
              : "WARNING";

        uploadedImages.push({
          imageUrl,
          pageNumber: pageNum,
          extractionQuality: testPresetStatus,
        });

        pagesSummary.push({
          pageNumber: pageNum,
          imageUrl,
          fileName: file.name,
          paramCount,
          status: resolvedPageStatus,
          extractionQuality: testPresetStatus,
          testPresetStatus,
          nonPresetStatus,
          nonPresetLines: extraction.non_preset_lines || [],
          extractedParams: pageParams.map((p) => p.param_name),
          unparsedLines: extraction.unparsed_lines || [],
          errorReason: errorReason || undefined,
        });

        if (pageParams.length > 0) {
          aggregatedParameters.push(...pageParams);
        }
      }
    }

    // Deduplicate parameters by slug across pages if any duplicates
    const uniqueParams = new Map();
    for (const p of aggregatedParameters) {
      if (!uniqueParams.has(p.param_slug)) {
        uniqueParams.set(p.param_slug, p);
      }
    }

    const cleanName = cleanPersonName(detectedCleanName || detectedRawName);
    const hasIncompleteExtraction = pagesSummary.some(
      (p) => p.status === "EMPTY" || p.status === "WARNING",
    );
    const finalParameters = Array.from(uniqueParams.values());

    // Auto-save newly found test presets directly to the database during extraction
    if (finalParameters.length > 0) {
      try {
        await db.savePresetsFromReport(
          detectedLab,
          finalParameters.map((p: any) => ({
            category: p.category,
            paramName: p.param_name,
            paramSlug: p.param_slug,
            unit: p.unit,
            refMin: p.ref_min,
            refMax: p.ref_max,
            refText: p.ref_text,
            clinicalMethod: p.clinical_method,
          })),
        );
      } catch (presetErr) {
        console.warn(
          "Auto-saving test presets during extraction encountered an error:",
          presetErr,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        raw_patient_name: detectedRawName || "",
        clean_patient_name:
          cleanName && cleanName !== "Unknown" ? cleanName : "",
        age: detectedAge || null,
        gender: detectedGender || null,
        lab_name: detectedLab || "",
        registration_no: detectedRegNo || "",
        report_date:
          detectedReportDate || new Date().toISOString().split("T")[0],
        collection_date: detectedCollectionDate || null,
        doctor_ref: detectedDoctorRef || null,
        images: uploadedImages,
        pagesSummary,
        hasIncompleteExtraction,
        parameters: finalParameters,
      },
    });
  } catch (error: any) {
    console.error("API /api/reports/extract error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract report" },
      { status: 500 },
    );
  }
}
