"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, Heart, Plus, Users } from "lucide-react";
import { VitalsModal } from "@/features/vitals/components/VitalsModal";
import { RefreshCacheButton } from "@/components/ui/RefreshCacheButton";
import type { NavbarProps } from "@/types";

export function Navbar({ members = [] }: NavbarProps) {
  const pathname = usePathname();
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/members", label: "Family Vault", icon: Users },
    { href: "/reports", label: "Medical Reports", icon: FileText },
    { href: "/vitals", label: "Daily Vitals", icon: Heart },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-8 shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-all">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                    MediCare
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wide mt-1">
                    Family Health Intelligence
                  </span>
                </div>
              </Link>

              {/* Center Navigation Bar */}
              <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 shadow-inner">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-teal-800 shadow-sm font-extrabold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${isActive ? "text-teal-600 stroke-[2.5]" : "text-slate-400"}`}
                      />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Hub */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Family Members Count Avatar Stack */}
              {members.length > 0 && (
                <Link
                  href="/members"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
                  title="View Family Members Directory"
                >
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {members.slice(0, 3).map((m, idx) => (
                      <div
                        key={m.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white ring-1 ring-slate-200 ${
                          idx === 0
                            ? "bg-teal-600"
                            : idx === 1
                              ? "bg-blue-600"
                              : "bg-purple-600"
                        }`}
                        title={m.name}
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="font-bold text-slate-700 text-xs">
                    {members.length}{" "}
                    {members.length === 1 ? "Member" : "Members"}
                  </span>
                </Link>
              )}

              {/* Log Vitals Button */}
              <button
                type="button"
                onClick={() => setIsVitalsOpen(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all active:scale-95 shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span className="hidden md:inline">Log Vitals</span>
              </button>

              {/* Upload Report Button */}
              <Link
                href="/reports/upload"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Upload Report</span>
                <span className="sm:hidden">Upload</span>
              </Link>

              {/* Refresh Caches Button */}
              <RefreshCacheButton />
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
                    isActive ? "text-teal-700" : "text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Manual Daily Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsOpen}
        onClose={() => setIsVitalsOpen(false)}
        members={members}
      />
    </>
  );
}
