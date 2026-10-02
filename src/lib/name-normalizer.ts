/**
 * Medicare Name Normalizer
 * Cleans titles, removes surnames, strips honorific suffixes (bhai, ben, bahen, behn, kumar, kumari),
 * and saves/matches only the given name in Title Case (e.g., "Sarah", "Michael").
 */

export function cleanPersonName(rawName: string): string {
  if (!rawName) return "Unknown";

  let cleaned = rawName.trim();

  // 1. Strip typical Indian / medical / social honorific prefix titles
  cleaned = cleaned.replace(
    /^(mrs|mr|ms|miss|dr|smt|shri|shree|master|baby\s+of)\.?\s+/i,
    "",
  );

  // 2. Strip stray punctuation, dashes, underscores, colons
  cleaned = cleaned.replace(/^[—\-_:\s]+|[—\-_:\s]+$/g, "");

  // 3. Remove trailing OCR leaks or document header words (e.g. "Report", "Date", "Reg")
  cleaned = cleaned.replace(/\s+(?:report|date|reg|dispatch).*$/i, "");

  // 4. Split into words
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Unknown";

  // 5. Filter out standalone honorific / relational tokens like "bhai", "ben", "kumar"
  const filteredWords = words.filter((w) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, "");
    return !["bhai", "ben", "bahen", "behn", "kumar", "kumari"].includes(
      cleanWord,
    );
  });

  // Pick the first word (given name / first name; drops surname and middle names)
  const candidate = filteredWords.length > 0 ? filteredWords[0] : words[0];

  // 6. Strip attached suffixes: bhai, ben, bahen, behn, kumar, kumari
  let baseName = candidate.replace(/[^a-zA-Z]/g, "");

  // Only strip if the remaining stem is at least 3 letters long
  const suffixRegex = /(bahen|behn|ben|bhai|kumari|kumar)$/i;
  const match = baseName.match(suffixRegex);
  if (match) {
    const stem = baseName.slice(0, -match[0].length);
    if (stem.length >= 3) {
      baseName = stem;
    }
  }

  if (!baseName) return "Unknown";

  // 7. Title Case format: e.g. "John", "Sarah"
  return baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
}

export function matchFamilyMember(
  extractedName: string,
  members: Array<{
    id: string | number;
    name: string;
    aliases?: string | null;
  }>,
): {
  matchedMemberId: string | number | null;
  confidence: "EXACT" | "ALIAS" | "FUZZY" | "NONE";
} {
  if (!extractedName || extractedName === "Unknown" || members.length === 0) {
    return { matchedMemberId: null, confidence: "NONE" };
  }

  const normalizedExtracted = cleanPersonName(extractedName).toLowerCase();

  // 1. Exact match on cleaned given name
  for (const m of members) {
    const memberCleaned = cleanPersonName(m.name).toLowerCase();
    if (
      memberCleaned === normalizedExtracted ||
      m.name.toLowerCase() === normalizedExtracted
    ) {
      return { matchedMemberId: m.id, confidence: "EXACT" };
    }
  }

  // 2. Check aliases (e.g. "Jane Doe", "Jane" for "Jane")
  for (const m of members) {
    if (m.aliases) {
      const aliasList = m.aliases
        .split(",")
        .map((a) => cleanPersonName(a.trim()).toLowerCase());
      if (aliasList.includes(normalizedExtracted)) {
        return { matchedMemberId: m.id, confidence: "ALIAS" };
      }
      // Also check raw string match in aliases
      const rawAliasList = m.aliases
        .split(",")
        .map((a) => a.trim().toLowerCase());
      if (
        rawAliasList.includes(extractedName.toLowerCase()) ||
        rawAliasList.includes(normalizedExtracted)
      ) {
        return { matchedMemberId: m.id, confidence: "ALIAS" };
      }
    }
  }

  // 3. First name stem match
  for (const m of members) {
    const memberCleaned = cleanPersonName(m.name).toLowerCase();
    if (
      normalizedExtracted.startsWith(memberCleaned.slice(0, 4)) ||
      memberCleaned.startsWith(normalizedExtracted.slice(0, 4))
    ) {
      return { matchedMemberId: m.id, confidence: "FUZZY" };
    }
  }

  return { matchedMemberId: null, confidence: "NONE" };
}
