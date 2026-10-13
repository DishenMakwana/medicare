import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { FamilyMember, MedicalReport, DailyVital, TestPreset } from "@/types";
import { initialTestPresets } from "./seed-data";
import { cleanPersonName } from "./name-normalizer";
import { calculateAge } from "./utils";

// Prisma Singleton for Next.js to prevent connection pool exhaustion during hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ----------------------------------------------------
// In-Memory Fast Cache with TTL & Dynamic Invalidation
// ----------------------------------------------------
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const localCache = new Map<string, CacheEntry<unknown>>();

const memoryCache = {
  get<T>(key: string): T | null {
    const entry = localCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      localCache.delete(key);
      return null;
    }
    return entry.data as T;
  },
  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    localCache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  },
  invalidatePrefix(prefix: string): void {
    for (const key of localCache.keys()) {
      if (key.startsWith(prefix)) {
        localCache.delete(key);
      }
    }
  },
  invalidateAll(): void {
    localCache.clear();
  },
};

// Helper to delete physical image files from public/ folder when deleted from database
function deleteImageFileFromDisk(imageUrl: string | null | undefined) {
  if (!imageUrl) return;
  // Ignore remote URLs or base64 data URIs
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return;
  }

  try {
    const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
    const publicDir = path.resolve(process.cwd(), "public");
    const absolutePath = path.resolve(publicDir, cleanPath);

    // Prevent directory traversal: must stay within public/
    if (!absolutePath.startsWith(publicDir)) {
      console.warn(`[Storage] Directory traversal blocked: ${imageUrl}`);
      return;
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(
        `[Storage] Deleted image file from public folder: ${absolutePath}`,
      );
    }
  } catch (err) {
    console.error(`[Storage] Failed to delete image file: ${imageUrl}`, err);
  }
}

// Unified Database Service directly invoking Prisma
export const db = {
  // Cache Management
  clearCache(): void {
    memoryCache.invalidateAll();
  },

  // Members
  async getMembers(): Promise<FamilyMember[]> {
    const cacheKey = "members:all";
    const cached = memoryCache.get<FamilyMember[]>(cacheKey);
    if (cached) return cached;

    try {
      const dbMembers = await prisma.familyMember.findMany({
        include: {
          reports: {
            select: {
              id: true,
              reportDate: true,
              title: true,
              overallStatus: true,
            },
          },
          vitals: { orderBy: { recordDate: "desc" }, take: 5 },
        },
        orderBy: { name: "asc" },
      });
      const result = dbMembers as unknown as FamilyMember[];
      memoryCache.set(cacheKey, result, 60000);
      return result;
    } catch (err) {
      console.warn("[Database] Failed to fetch members:", err);
      return [];
    }
  },

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return this.getMembers();
  },

  async getMemberById(id: string | number): Promise<FamilyMember | null> {
    const cacheKey = `member:${id}`;
    const cached = memoryCache.get<FamilyMember>(cacheKey);
    if (cached) return cached;

    try {
      const numId =
        typeof id === "number"
          ? id
          : /^\d+$/.test(String(id).trim())
            ? parseInt(String(id).trim(), 10)
            : null;
      const orClauses: any[] = [{ customId: String(id) }];
      if (numId !== null) {
        orClauses.push({ id: numId });
      }

      const member = await prisma.familyMember.findFirst({
        where: {
          OR: orClauses,
        },
        include: {
          reports: {
            include: { parameters: true, images: true },
            orderBy: { reportDate: "desc" },
          },
          vitals: {
            orderBy: { recordDate: "desc" },
          },
        },
      });
      const result = (member as unknown as FamilyMember) || null;
      if (result) {
        memoryCache.set(cacheKey, result, 60000);
      }
      return result;
    } catch (err) {
      console.warn(`[Database] Failed to fetch member ${id}:`, err);
      return null;
    }
  },

  async createMember(data: Partial<FamilyMember>): Promise<FamilyMember> {
    const customId = data.customId || "member-" + Date.now();
    const memberName = data.name?.trim() || "Family Member";

    let parsedDob: Date | null = null;
    if (data.dateOfBirth) {
      const d =
        typeof data.dateOfBirth === "string"
          ? new Date(data.dateOfBirth)
          : data.dateOfBirth;
      if (d instanceof Date && !isNaN(d.getTime())) {
        parsedDob = d;
      }
    }

    const numAge =
      data.ageYears !== undefined && data.ageYears !== null
        ? Number(data.ageYears)
        : null;
    const calculatedAgeYears =
      calculateAge(parsedDob, numAge) ??
      (numAge !== null && !isNaN(numAge) ? numAge : null);

    const created = await prisma.familyMember.create({
      data: {
        customId,
        name: memberName,
        aliases: data.aliases || null,
        gender: data.gender || null,
        dateOfBirth: parsedDob,
        ageYears: calculatedAgeYears,
        bloodGroup: data.bloodGroup || null,
        relation: data.relation || "Family",
        notes: data.notes || null,
        avatarUrl: data.avatarUrl || null,
      },
      include: {
        reports: {
          select: {
            id: true,
            reportDate: true,
            title: true,
            overallStatus: true,
          },
        },
        vitals: { orderBy: { recordDate: "desc" }, take: 5 },
      },
    });

    memoryCache.invalidateAll();

    return created as unknown as FamilyMember;
  },

  async updateMember(
    id: string | number,
    data: Partial<FamilyMember>,
  ): Promise<FamilyMember | null> {
    const numId = typeof id === "number" ? id : parseInt(String(id), 10);
    const isNumeric = !isNaN(numId);

    let parsedDob: Date | null | undefined = undefined;
    if (data.dateOfBirth !== undefined) {
      if (!data.dateOfBirth) {
        parsedDob = null;
      } else {
        const d =
          typeof data.dateOfBirth === "string"
            ? new Date(data.dateOfBirth)
            : data.dateOfBirth;
        parsedDob = d instanceof Date && !isNaN(d.getTime()) ? d : null;
      }
    }

    const numAge =
      data.ageYears !== undefined && data.ageYears !== null
        ? Number(data.ageYears)
        : null;
    const calculatedAgeYears =
      parsedDob !== undefined
        ? (calculateAge(parsedDob, numAge) ?? numAge)
        : numAge;

    let targetId: number | null = isNumeric ? numId : null;
    if (targetId === null) {
      const found = await prisma.familyMember.findFirst({
        where: { customId: String(id) },
      });
      if (found) targetId = found.id;
    }

    if (targetId === null) return null;

    const updated = await prisma.familyMember.update({
      where: { id: targetId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.aliases !== undefined ? { aliases: data.aliases } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(parsedDob !== undefined ? { dateOfBirth: parsedDob } : {}),
        ...(calculatedAgeYears !== undefined
          ? { ageYears: calculatedAgeYears }
          : {}),
        ...(data.bloodGroup !== undefined
          ? { bloodGroup: data.bloodGroup }
          : {}),
        ...(data.relation !== undefined ? { relation: data.relation } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
      include: {
        reports: {
          select: {
            id: true,
            reportDate: true,
            title: true,
            overallStatus: true,
          },
        },
        vitals: { orderBy: { recordDate: "desc" }, take: 5 },
      },
    });

    memoryCache.invalidateAll();

    return updated as unknown as FamilyMember;
  },

  async deleteMember(id: string | number): Promise<boolean> {
    const numId = typeof id === "number" ? id : parseInt(String(id), 10);
    const isNumeric = !isNaN(numId);

    let targetId: number | null = isNumeric ? numId : null;
    if (targetId === null) {
      const found = await prisma.familyMember.findFirst({
        where: { customId: String(id) },
        select: { id: true },
      });
      if (found) targetId = found.id;
    }

    if (targetId !== null) {
      // Find reports of this member to clean up physical images from disk
      const reports = await prisma.medicalReport.findMany({
        where: { familyMemberId: targetId },
        include: { images: true },
      });
      for (const r of reports) {
        for (const img of r.images) {
          deleteImageFileFromDisk(img.imageUrl);
        }
      }

      await prisma.familyMember.delete({
        where: { id: targetId },
      });

      memoryCache.invalidatePrefix("member");
      memoryCache.invalidatePrefix("reports");

      return true;
    }

    return false;
  },

  // Reports
  async getReports(): Promise<MedicalReport[]> {
    const cacheKey = "reports:all";
    const cached = memoryCache.get<MedicalReport[]>(cacheKey);
    if (cached) return cached;

    try {
      const reports = await prisma.medicalReport.findMany({
        include: {
          familyMember: true,
          parameters: true,
          images: true,
        },
        orderBy: { reportDate: "desc" },
      });
      const result = reports as unknown as MedicalReport[];
      memoryCache.set(cacheKey, result, 60000);
      return result;
    } catch (err) {
      console.warn("[Database] Failed to fetch reports:", err);
      return [];
    }
  },

  async getReportById(id: string | number): Promise<MedicalReport | null> {
    const cacheKey = `report:${id}`;
    const cached = memoryCache.get<MedicalReport>(cacheKey);
    if (cached) return cached;

    try {
      const numId =
        typeof id === "number"
          ? id
          : /^\d+$/.test(String(id).trim())
            ? parseInt(String(id).trim(), 10)
            : null;
      const orClauses: any[] = [{ customId: String(id) }];
      if (numId !== null) {
        orClauses.push({ id: numId });
      }

      const report = await prisma.medicalReport.findFirst({
        where: {
          OR: orClauses,
        },
        include: {
          familyMember: true,
          parameters: true,
          images: true,
        },
      });

      if (!report) return null;

      // Ensure every parameter has its associated TestPreset and database ID attached
      if (report.parameters && report.parameters.length > 0) {
        const lab = report.labName ? report.labName.trim() : null;
        const dbPresets = await prisma.testPreset.findMany({
          orderBy: { name: "asc" },
        });

        const enhancedParameters = await Promise.all(
          report.parameters.map(async (param) => {
            const pName = param.paramName.trim().toLowerCase();
            let matched = dbPresets.find(
              (p) =>
                p.name.trim().toLowerCase() === pName &&
                lab &&
                p.labName?.trim().toLowerCase() === lab.toLowerCase(),
            );

            if (!matched) {
              matched = dbPresets.find(
                (p) => p.name.trim().toLowerCase() === pName,
              );
            }

            if (!matched) {
              try {
                matched = await prisma.testPreset.create({
                  data: {
                    customId: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    labName: lab,
                    name: param.paramName.trim(),
                    category: param.category?.trim() || "General",
                    unit: param.unit?.trim() || null,
                    refMin:
                      param.refMin !== undefined && param.refMin !== null
                        ? Number(param.refMin)
                        : null,
                    refMax:
                      param.refMax !== undefined && param.refMax !== null
                        ? Number(param.refMax)
                        : null,
                    refText: param.refText?.trim() || null,
                    clinicalMethod: param.clinicalMethod?.trim() || null,
                    source: "UPLOADED_REPORT",
                  },
                });
                dbPresets.push(matched);
              } catch (err) {
                console.warn(
                  "Could not auto-create preset for parameter:",
                  param.paramName,
                  err,
                );
              }
            }

            return {
              ...param,
              testPresetId: matched ? matched.id : null,
              testPreset: matched || null,
            };
          }),
        );

        const result = {
          ...report,
          parameters: enhancedParameters,
        } as unknown as MedicalReport;
        memoryCache.set(cacheKey, result, 60000);
        return result;
      }

      const result = (report as unknown as MedicalReport) || null;
      if (result) {
        memoryCache.set(cacheKey, result, 60000);
      }
      return result;
    } catch (err) {
      console.warn(`[Database] Failed to fetch report ${id}:`, err);
      return null;
    }
  },

  async createReport(reportData: {
    familyMemberId: string | number;
    title: string;
    labName?: string | null;
    registrationNo?: string | null;
    reportDate: string | Date;
    collectionDate?: string | Date | null;
    doctorRef?: string | null;
    rawPatientName?: string | null;
    overallStatus?: string | null;
    notes?: string | null;
    images?: Array<{ imageUrl: string; pageNumber: number }>;
    parameters: Array<{
      category: string;
      paramName: string;
      paramSlug: string;
      valueNumber?: number | null;
      valueText?: string | null;
      unit?: string | null;
      refMin?: number | null;
      refMax?: number | null;
      refText?: string | null;
      status: string;
      clinicalMethod?: string | null;
    }>;
  }): Promise<MedicalReport> {
    const reportCustomId = "report-" + Date.now();

    let targetMemberId = 1;
    if (typeof reportData.familyMemberId === "number") {
      targetMemberId = reportData.familyMemberId;
    } else if (/^\d+$/.test(String(reportData.familyMemberId).trim())) {
      targetMemberId = parseInt(String(reportData.familyMemberId).trim(), 10);
    } else {
      const found = await prisma.familyMember.findFirst({
        where: {
          OR: [
            { customId: String(reportData.familyMemberId) },
            { name: String(reportData.familyMemberId) },
          ],
        },
      });
      if (found) targetMemberId = found.id;
    }

    const dbReport = await prisma.medicalReport.create({
      data: {
        customId: reportCustomId,
        familyMemberId: targetMemberId,
        title: reportData.title,
        labName: reportData.labName || null,
        registrationNo: reportData.registrationNo || null,
        reportDate: new Date(reportData.reportDate),
        collectionDate: reportData.collectionDate
          ? new Date(reportData.collectionDate)
          : null,
        doctorRef: reportData.doctorRef || null,
        rawPatientName: reportData.rawPatientName || null,
        overallStatus: reportData.overallStatus || "NORMAL",
        notes: reportData.notes || null,
        images: {
          create: (reportData.images || []).map((img, idx) => ({
            customId: `img-${Date.now()}-${idx}`,
            imageUrl: img.imageUrl,
            pageNumber: img.pageNumber || idx + 1,
            ocrStatus: "COMPLETED",
          })),
        },
        parameters: {
          create: reportData.parameters.map((p, idx) => ({
            customId: `param-${Date.now()}-${idx}`,
            category: p.category,
            paramName: p.paramName,
            paramSlug: p.paramSlug,
            valueNumber: p.valueNumber ?? null,
            valueText: p.valueText ?? null,
            unit: p.unit ?? null,
            refMin: p.refMin ?? null,
            refMax: p.refMax ?? null,
            refText: p.refText ?? null,
            status: p.status || "NORMAL",
            clinicalMethod: p.clinicalMethod ?? null,
          })),
        },
      },
      include: {
        familyMember: true,
        parameters: true,
        images: true,
      },
    });

    // Automatically save/update test presets for this report provider in database
    await this.savePresetsFromReport(reportData.labName, reportData.parameters);

    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");
    memoryCache.invalidatePrefix("member");
    memoryCache.invalidatePrefix("presets");

    return dbReport as unknown as MedicalReport;
  },

  async deleteReportImage(imageId: string | number): Promise<boolean> {
    const numId =
      typeof imageId === "number"
        ? imageId
        : /^\d+$/.test(String(imageId).trim())
          ? parseInt(String(imageId).trim(), 10)
          : null;

    let imageUrlToDelete: string | null = null;

    if (numId !== null) {
      const img = await prisma.reportImage.findUnique({
        where: { id: numId },
        select: { imageUrl: true },
      });
      if (img) imageUrlToDelete = img.imageUrl;
      await prisma.reportImage.delete({ where: { id: numId } });
    } else {
      const img = await prisma.reportImage.findFirst({
        where: { customId: String(imageId) },
        select: { imageUrl: true },
      });
      if (img) imageUrlToDelete = img.imageUrl;
      await prisma.reportImage.deleteMany({
        where: { customId: String(imageId) },
      });
    }

    if (imageUrlToDelete) {
      deleteImageFileFromDisk(imageUrlToDelete);
    }

    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");

    return true;
  },

  async deleteReport(reportId: string | number): Promise<boolean> {
    const numId =
      typeof reportId === "number"
        ? reportId
        : /^\d+$/.test(String(reportId).trim())
          ? parseInt(String(reportId).trim(), 10)
          : null;

    const imageUrlsToDelete: string[] = [];

    let targetReportId: number | null = numId;
    if (targetReportId === null) {
      const found = await prisma.medicalReport.findFirst({
        where: { customId: String(reportId) },
        select: { id: true },
      });
      if (found) targetReportId = found.id;
    }

    if (targetReportId !== null) {
      const images = await prisma.reportImage.findMany({
        where: { reportId: targetReportId },
        select: { imageUrl: true },
      });
      for (const img of images) {
        if (img.imageUrl && !imageUrlsToDelete.includes(img.imageUrl)) {
          imageUrlsToDelete.push(img.imageUrl);
        }
      }

      // Delete from Prisma (cascades to reportImage and reportParameter)
      await prisma.medicalReport.delete({ where: { id: targetReportId } });
    } else {
      const foundImages = await prisma.reportImage.findMany({
        where: { report: { customId: String(reportId) } },
        select: { imageUrl: true },
      });
      for (const img of foundImages) {
        if (img.imageUrl && !imageUrlsToDelete.includes(img.imageUrl)) {
          imageUrlsToDelete.push(img.imageUrl);
        }
      }
      await prisma.medicalReport.deleteMany({
        where: { customId: String(reportId) },
      });
    }

    // Delete all physical image files from the public folder
    for (const url of imageUrlsToDelete) {
      deleteImageFileFromDisk(url);
    }

    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");
    memoryCache.invalidatePrefix("member");

    return true;
  },

  // Daily Vitals (BP & Sugar)
  async getVitals(familyMemberId?: string | number): Promise<DailyVital[]> {
    const cacheKey = `vitals:${familyMemberId || "all"}`;
    const cached = memoryCache.get<DailyVital[]>(cacheKey);
    if (cached) return cached;

    try {
      const numId =
        familyMemberId !== undefined
          ? typeof familyMemberId === "number"
            ? familyMemberId
            : /^\d+$/.test(String(familyMemberId).trim())
              ? parseInt(String(familyMemberId).trim(), 10)
              : null
          : null;

      const vitals = await prisma.dailyVital.findMany({
        where: numId !== null ? { familyMemberId: numId } : undefined,
        include: { familyMember: true },
        orderBy: { recordDate: "desc" },
      });
      const result = vitals as unknown as DailyVital[];
      memoryCache.set(cacheKey, result, 60000);
      return result;
    } catch (err) {
      console.warn("[Database] Failed to fetch vitals:", err);
      return [];
    }
  },

  async logVital(data: {
    familyMemberId: string | number;
    recordDate: string | Date;
    vitalType: "BLOOD_PRESSURE" | "BLOOD_SUGAR";
    systolic?: number | null;
    diastolic?: number | null;
    pulseRate?: number | null;
    sugarValue?: number | null;
    sugarContext?: string | null;
    notes?: string | null;
  }): Promise<DailyVital> {
    const customId = "vital-" + Date.now();

    let targetMemberId = 1;
    if (typeof data.familyMemberId === "number") {
      targetMemberId = data.familyMemberId;
    } else if (/^\d+$/.test(String(data.familyMemberId).trim())) {
      targetMemberId = parseInt(String(data.familyMemberId).trim(), 10);
    } else {
      const found = await prisma.familyMember.findFirst({
        where: { customId: String(data.familyMemberId) },
      });
      if (found) targetMemberId = found.id;
    }

    const created = await prisma.dailyVital.create({
      data: {
        customId,
        familyMemberId: targetMemberId,
        recordDate: new Date(data.recordDate),
        vitalType: data.vitalType,
        systolic: data.systolic ?? null,
        diastolic: data.diastolic ?? null,
        pulseRate: data.pulseRate ?? null,
        sugarValue: data.sugarValue ?? null,
        sugarContext: data.sugarContext ?? null,
        notes: data.notes ?? null,
      },
      include: {
        familyMember: true,
      },
    });

    memoryCache.invalidatePrefix("vitals");
    memoryCache.invalidatePrefix("member");

    return created as unknown as DailyVital;
  },

  async deleteVital(vitalId: string | number): Promise<boolean> {
    const numId =
      typeof vitalId === "number"
        ? vitalId
        : /^\d+$/.test(String(vitalId).trim())
          ? parseInt(String(vitalId).trim(), 10)
          : null;

    if (numId !== null) {
      await prisma.dailyVital.delete({ where: { id: numId } });
    } else {
      await prisma.dailyVital.deleteMany({
        where: { customId: String(vitalId) },
      });
    }

    memoryCache.invalidatePrefix("vitals");
    memoryCache.invalidatePrefix("member");

    return true;
  },

  // Test Presets (Lab-specific & General Clinical Biomarkers)
  async getTestPresets(labName?: string | null): Promise<TestPreset[]> {
    const cleanTargetLab = labName ? labName.trim().toLowerCase() : null;
    const cacheKey = `presets:${cleanTargetLab || "all"}`;
    const cached = memoryCache.get<TestPreset[]>(cacheKey);
    if (cached) return cached;

    try {
      let dbPresets = await prisma.testPreset.findMany({
        orderBy: [{ name: "asc" }],
      });

      if (dbPresets.length === 0) {
        // Seed initial presets into prisma
        await prisma.testPreset.createMany({
          data: initialTestPresets.map((p) => ({
            customId: String(p.id),
            labName: p.labName,
            name: p.name,
            category: p.category,
            unit: p.unit,
            refMin: p.refMin,
            refMax: p.refMax,
            refText: p.refText,
            clinicalMethod: p.clinicalMethod,
            source: p.source || "SYSTEM_DEFAULT",
          })),
          skipDuplicates: true,
        });
        dbPresets = await prisma.testPreset.findMany({
          orderBy: [{ name: "asc" }],
        });
      }

      const presets = dbPresets as unknown as TestPreset[];

      if (cleanTargetLab) {
        const sorted = [...presets].sort((a, b) => {
          const aMatch = a.labName?.toLowerCase().includes(cleanTargetLab)
            ? 1
            : 0;
          const bMatch = b.labName?.toLowerCase().includes(cleanTargetLab)
            ? 1
            : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
          return a.name.localeCompare(b.name);
        });
        memoryCache.set(cacheKey, sorted, 300000);
        return sorted;
      }

      memoryCache.set(cacheKey, presets, 300000);
      return presets;
    } catch (err) {
      console.warn("[Database] Failed to fetch test presets:", err);
      return initialTestPresets;
    }
  },

  async savePresetsFromReport(
    labName: string | null | undefined,
    parameters: Array<{
      category: string;
      paramName: string;
      unit?: string | null;
      refMin?: number | null;
      refMax?: number | null;
      refText?: string | null;
      clinicalMethod?: string | null;
    }>,
  ): Promise<void> {
    if (!parameters || parameters.length === 0) return;

    const trimmedLab = labName ? labName.trim() : null;

    for (const p of parameters) {
      if (!p.paramName || !p.paramName.trim()) continue;
      const paramName = p.paramName.trim();
      const category = p.category?.trim() || "General";
      const unit = p.unit?.trim() || null;
      const refMin =
        p.refMin !== undefined && p.refMin !== null ? Number(p.refMin) : null;
      const refMax =
        p.refMax !== undefined && p.refMax !== null ? Number(p.refMax) : null;
      const refText = p.refText?.trim() || null;
      const clinicalMethod = p.clinicalMethod?.trim() || null;

      try {
        const existing = await prisma.testPreset.findFirst({
          where: {
            name: { equals: paramName, mode: "insensitive" },
            ...(trimmedLab
              ? { labName: { equals: trimmedLab, mode: "insensitive" } }
              : { labName: null }),
          },
        });

        if (existing) {
          await prisma.testPreset.update({
            where: { id: existing.id },
            data: {
              category,
              unit: unit ?? existing.unit,
              refMin: refMin ?? existing.refMin,
              refMax: refMax ?? existing.refMax,
              refText: refText ?? existing.refText,
              clinicalMethod: clinicalMethod ?? existing.clinicalMethod,
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.testPreset.create({
            data: {
              customId:
                "preset-" +
                Date.now() +
                "-" +
                Math.random().toString(36).substring(2, 7),
              labName: trimmedLab,
              name: paramName,
              category,
              unit,
              refMin,
              refMax,
              refText,
              clinicalMethod,
              source: "UPLOADED_REPORT",
            },
          });
        }
      } catch (err) {
        console.error("Failed to save preset for:", paramName, err);
      }
    }

    memoryCache.invalidatePrefix("presets");
  },

  async upsertTestPreset(presetData: {
    labName?: string | null;
    name: string;
    category: string;
    unit?: string | null;
    refMin?: number | null;
    refMax?: number | null;
    refText?: string | null;
    clinicalMethod?: string | null;
  }): Promise<TestPreset> {
    const trimmedLab = presetData.labName ? presetData.labName.trim() : null;
    const name = presetData.name.trim();

    const existing = await prisma.testPreset.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        ...(trimmedLab
          ? { labName: { equals: trimmedLab, mode: "insensitive" } }
          : { labName: null }),
      },
    });

    if (existing) {
      const updated = await prisma.testPreset.update({
        where: { id: existing.id },
        data: {
          category: presetData.category,
          unit: presetData.unit ?? null,
          refMin: presetData.refMin ?? null,
          refMax: presetData.refMax ?? null,
          refText: presetData.refText ?? null,
          clinicalMethod: presetData.clinicalMethod ?? null,
          updatedAt: new Date(),
        },
      });

      memoryCache.invalidatePrefix("presets");
      memoryCache.invalidatePrefix("reports");
      memoryCache.invalidatePrefix("report");

      return updated as unknown as TestPreset;
    }

    const created = await prisma.testPreset.create({
      data: {
        customId:
          "preset-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substring(2, 7),
        labName: trimmedLab,
        name,
        category: presetData.category,
        unit: presetData.unit ?? null,
        refMin: presetData.refMin ?? null,
        refMax: presetData.refMax ?? null,
        refText: presetData.refText ?? null,
        clinicalMethod: presetData.clinicalMethod ?? null,
        source: "MANUAL",
      },
    });

    memoryCache.invalidatePrefix("presets");
    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");

    return created as unknown as TestPreset;
  },

  async updateTestPresetById(
    id: number,
    presetData: {
      name?: string;
      category?: string;
      unit?: string | null;
      refMin?: number | null;
      refMax?: number | null;
      refText?: string | null;
      clinicalMethod?: string | null;
    },
  ): Promise<TestPreset> {
    const updated = await prisma.testPreset.update({
      where: { id: Number(id) },
      data: {
        ...(presetData.name !== undefined
          ? { name: presetData.name.trim() }
          : {}),
        ...(presetData.category !== undefined
          ? { category: presetData.category.trim() }
          : {}),
        ...(presetData.unit !== undefined
          ? { unit: presetData.unit?.trim() || null }
          : {}),
        ...(presetData.refMin !== undefined
          ? {
              refMin:
                presetData.refMin !== null && !isNaN(Number(presetData.refMin))
                  ? Number(presetData.refMin)
                  : null,
            }
          : {}),
        ...(presetData.refMax !== undefined
          ? {
              refMax:
                presetData.refMax !== null && !isNaN(Number(presetData.refMax))
                  ? Number(presetData.refMax)
                  : null,
            }
          : {}),
        ...(presetData.refText !== undefined
          ? { refText: presetData.refText?.trim() || null }
          : {}),
        ...(presetData.clinicalMethod !== undefined
          ? { clinicalMethod: presetData.clinicalMethod?.trim() || null }
          : {}),
        updatedAt: new Date(),
      },
    });

    memoryCache.invalidatePrefix("presets");
    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");

    return updated as unknown as TestPreset;
  },

  async syncReportParameterWithPreset(
    paramId: number,
    data: {
      name?: string;
      category?: string;
      unit?: string | null;
      refMin?: number | null;
      refMax?: number | null;
      refText?: string | null;
      clinicalMethod?: string | null;
      valueNumber?: number | null;
      valueText?: string | null;
    },
  ): Promise<void> {
    const existing = await prisma.reportParameter.findUnique({
      where: { id: Number(paramId) },
    });
    if (!existing) return;

    const valueNumber =
      data.valueNumber !== undefined
        ? data.valueNumber !== null && !isNaN(Number(data.valueNumber))
          ? Number(data.valueNumber)
          : null
        : existing.valueNumber;
    const valueText =
      data.valueText !== undefined
        ? data.valueText?.trim() || null
        : existing.valueText;

    const refMin =
      data.refMin !== undefined
        ? data.refMin !== null && !isNaN(Number(data.refMin))
          ? Number(data.refMin)
          : null
        : existing.refMin;
    const refMax =
      data.refMax !== undefined
        ? data.refMax !== null && !isNaN(Number(data.refMax))
          ? Number(data.refMax)
          : null
        : existing.refMax;

    // Recalculate status if numeric value exists
    let status = existing.status;
    if (valueNumber !== null && valueNumber !== undefined) {
      const val = valueNumber;
      if (refMax !== null && val > refMax) {
        status = "HIGH";
      } else if (refMin !== null && val < refMin) {
        status = "LOW";
      } else if (refMin !== null || refMax !== null) {
        status = "NORMAL";
      }
    }

    await prisma.reportParameter.update({
      where: { id: Number(paramId) },
      data: {
        ...(data.name !== undefined ? { paramName: data.name.trim() } : {}),
        ...(data.category !== undefined
          ? { category: data.category.trim() }
          : {}),
        ...(data.unit !== undefined ? { unit: data.unit?.trim() || null } : {}),
        valueNumber,
        valueText,
        refMin,
        refMax,
        ...(data.refText !== undefined
          ? { refText: data.refText?.trim() || null }
          : {}),
        ...(data.clinicalMethod !== undefined
          ? { clinicalMethod: data.clinicalMethod?.trim() || null }
          : {}),
        status,
      },
    });

    memoryCache.invalidatePrefix("presets");
    memoryCache.invalidatePrefix("reports");
    memoryCache.invalidatePrefix("report");
  },

  async clearAllData(): Promise<void> {
    await prisma.reportParameter.deleteMany({});
    await prisma.reportImage.deleteMany({});
    await prisma.medicalReport.deleteMany({});
    await prisma.dailyVital.deleteMany({});
    await prisma.familyMember.deleteMany({});
    await prisma.testPreset.deleteMany({});
    memoryCache.invalidateAll();
  },
};
