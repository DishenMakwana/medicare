"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { MemberCard } from "./MemberCard";
import { MemberModal } from "./MemberModal";
import type { FamilyMember, MembersListClientProps } from "@/types";

export function MembersListClient({ initialMembers }: MembersListClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMembers((prev) => {
      const incomingIds = new Set(initialMembers.map((m) => m.id));
      const optimisticNew = prev.filter((p) => !incomingIds.has(p.id));
      return [...optimisticNew, ...initialMembers];
    });
  }, [initialMembers]);

  useEffect(() => {
    function handleCacheRefreshed() {
      router.refresh();
      fetch(`/api/members?fresh=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.members && Array.isArray(data.members)) {
            setMembers(data.members);
          }
        })
        .catch(() => {});
    }

    window.addEventListener("medicare:cache-refreshed", handleCacheRefreshed);
    return () => {
      window.removeEventListener(
        "medicare:cache-refreshed",
        handleCacheRefreshed,
      );
    };
  }, [router]);

  const totalMembers = members.length;
  const totalReports = members.reduce(
    (acc, m) => acc + (m.reports?.length || 0),
    0,
  );
  const totalVitals = members.reduce(
    (acc, m) => acc + (m.vitals?.length || 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Family Members Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain profiles for all family members, link laboratory reports,
            and track vital trends.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Family Members
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalMembers}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              registered profiles
            </span>
          </div>
        </div>

        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Linked Lab Reports
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">
              {totalReports}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              diagnostic panels
            </span>
          </div>
        </div>

        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Home Vital Measurements
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalVitals}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              recorded logs
            </span>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          if (created) {
            setMembers((prev) => {
              const exists = prev.some((m) => m.id === created.id);
              return exists
                ? prev.map((m) => (m.id === created.id ? created : m))
                : [created, ...prev];
            });
          }
          router.refresh();
        }}
      />
    </div>
  );
}
