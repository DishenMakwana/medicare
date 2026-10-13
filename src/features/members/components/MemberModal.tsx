"use client";

import { useState } from "react";
import { UserPlus, X, ChevronDown } from "lucide-react";
import { createFamilyMember } from "../actions";
import { calculateAge } from "@/lib/utils";
import type { FamilyMember, MemberModalProps } from "@/types";

export function MemberModal({
  isOpen,
  onClose,
  onSuccess,
  initialName = "",
  initialGender = "Female",
  initialDateOfBirth = "",
  initialAgeYears = "",
  initialAliases = "",
  initialRelation = "Mother",
}: MemberModalProps) {
  const [name, setName] = useState(initialName);
  const [relation, setRelation] = useState(initialRelation);
  const [gender, setGender] = useState(initialGender);
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    if (initialDateOfBirth) return initialDateOfBirth.split("T")[0];
    if (initialAgeYears) {
      const estimatedYear = new Date().getFullYear() - Number(initialAgeYears);
      return `${estimatedYear}-01-01`;
    }
    return "";
  });
  const [ageYears, setAgeYears] = useState(() => {
    if (initialAgeYears) return String(initialAgeYears);
    if (initialDateOfBirth) {
      const a = calculateAge(initialDateOfBirth);
      return a !== null ? String(a) : "";
    }
    return "";
  });
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [aliases, setAliases] = useState(initialAliases);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDateChange = (val: string) => {
    setDateOfBirth(val);
    if (val) {
      const computed = calculateAge(val);
      if (computed !== null) {
        setAgeYears(String(computed));
      }
    }
  };

  const handleAgeChange = (val: string) => {
    setAgeYears(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 125) {
      const estimatedYear = new Date().getFullYear() - parsed;
      setDateOfBirth(`${estimatedYear}-01-01`);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Please provide a name for this family member.");
      return;
    }

    let parsedDobIso: string | undefined = undefined;
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) {
        parsedDobIso = d.toISOString();
      }
    }

    const parsedAge = ageYears ? parseInt(ageYears, 10) : undefined;
    const finalAge =
      !isNaN(parsedAge as number) && (parsedAge as number) >= 0
        ? parsedAge
        : (calculateAge(parsedDobIso) ?? undefined);

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createFamilyMember({
        name: trimmedName,
        relation,
        gender,
        dateOfBirth: parsedDobIso,
        ageYears: finalAge,
        bloodGroup: bloodGroup || undefined,
        aliases: aliases.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setName("");
      setDateOfBirth("");
      setAgeYears("");
      setAliases("");
      setNotes("");
      setErrorMessage(null);
      onClose();
      if (onSuccess) onSuccess(created as unknown as FamilyMember);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add family member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Add Family Member
              </h2>
              <p className="text-xs text-slate-500">
                Create profile to associate medical reports and vitals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Person Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Muktaben Patel or Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Relationship
              </label>
              <div className="relative">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
                >
                  <optgroup label="Primary">
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Child">Child (General)</option>
                  </optgroup>

                  <optgroup label="Siblings">
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Sibling">Sibling (General)</option>
                  </optgroup>

                  <optgroup label="In-Laws">
                    <option value="Mother-in-law">Mother-in-law</option>
                    <option value="Father-in-law">Father-in-law</option>
                    <option value="Brother-in-law">Brother-in-law</option>
                    <option value="Sister-in-law">Sister-in-law</option>
                    <option value="Son-in-law">Son-in-law</option>
                    <option value="Daughter-in-law">Daughter-in-law</option>
                  </optgroup>

                  <optgroup label="Extended Family">
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandparent">Grandparent (General)</option>
                    <option value="Grandson">Grandson</option>
                    <option value="Granddaughter">Granddaughter</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Nephew">Nephew</option>
                    <option value="Niece">Niece</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Other">Other</option>
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Gender
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={dateOfBirth}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="0"
                max="125"
                placeholder="e.g. 77"
                value={ageYears}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="AB+">AB+</option>
                  <option value="B-">B-</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="AB-">AB-</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Aliases / OCR Names
              </label>
              <input
                type="text"
                placeholder="e.g. Muktaben, Mukta"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Health Notes / History (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Known allergies, chronic conditions, regular medications..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
