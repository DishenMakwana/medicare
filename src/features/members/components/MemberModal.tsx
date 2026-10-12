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
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [aliases, setAliases] = useState(initialAliases);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedAge = calculateAge(dateOfBirth);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createFamilyMember({
        name: name.trim(),
        relation,
        gender,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth).toISOString()
          : undefined,
        ageYears: calculatedAge ?? undefined,
        bloodGroup,
        aliases: aliases.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setName("");
      setDateOfBirth("");
      setAliases("");
      setNotes("");
      onClose();
      if (onSuccess) onSuccess(created as unknown as FamilyMember);
    } catch (err: any) {
      alert(err.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Person Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah or Michael"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Only given name is saved (bhai, ben, kumar and surnames are
              automatically removed).
            </p>
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
                  <option value="Self">Self</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child / Son / Daughter</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Birth Date *</span>
                {calculatedAge !== null && (
                  <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {calculatedAge} Yrs
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-700"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {calculatedAge !== null
                  ? `Calculated dynamically: ${calculatedAge} years old`
                  : "Age is computed dynamically from birthdate"}
              </p>
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Aliases / Name Variations on Reports
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins, SJ (comma separated)"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Helps OCR auto-match when reports print names slightly differently
            </span>
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
