export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Dynamically calculate age in completed years from birthdate.
 * Falls back to fallbackAge if birthdate is not set or invalid.
 */
export function calculateAge(
  dateOfBirth?: string | Date | null,
  fallbackAge?: number | null,
): number | null {
  if (!dateOfBirth) return fallbackAge ?? null;
  const birth =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(birth.getTime())) return fallbackAge ?? null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Format member age for display e.g. "42 Yrs" or "42 Years Old".
 * Can accept a member object, or a birthdate directly.
 */
export function formatMemberAge(
  memberOrDob:
    | { dateOfBirth?: string | Date | null; ageYears?: number | null }
    | string
    | Date
    | null
    | undefined,
  fallbackAge?: number | null,
  format: "short" | "long" = "short",
): string {
  let dob: string | Date | null | undefined;
  let fallback: number | null | undefined = fallbackAge;

  if (
    memberOrDob &&
    typeof memberOrDob === "object" &&
    !(memberOrDob instanceof Date)
  ) {
    dob = memberOrDob.dateOfBirth;
    fallback = memberOrDob.ageYears ?? fallbackAge;
  } else {
    dob = memberOrDob as string | Date | null | undefined;
  }

  const age = calculateAge(dob, fallback);
  if (age === null || age === undefined) return "";
  return format === "long" ? `${age} Years Old` : `${age} Yrs`;
}
