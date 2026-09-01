// components/profile/section-nav.tsx — Profile Section Navigation Component for KorraStore.
// Renders vertical section tabs on desktop and horizontally scrollable pill tabs on mobile.
// Enables seamless switching between Personal Profile, Contact Details, Security, and Account sections.
// Used in: app/profile/page.tsx.

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Types & Section Definitions
// ----------------------------------------------------------------------------

export type ProfileSection = "profile" | "contact" | "security" | "account";

export interface NavSection {
  id: ProfileSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const PROFILE_SECTIONS: NavSection[] = [
  {
    id: "profile",
    label: "Personal Profile",
    description: "Display name & identity",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Contact Details",
    description: "Email & phone verification",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security & Password",
    description: "Password & authentication",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account Actions",
    description: "Session logout & deletion",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
];

export interface SectionNavProps {
  activeSection: ProfileSection;
  onSelectSection: (section: ProfileSection) => void;
  className?: string;
}

// ----------------------------------------------------------------------------
// SectionNav Component Definition
// ----------------------------------------------------------------------------
export const SectionNav: React.FC<SectionNavProps> = ({
  activeSection,
  onSelectSection,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Horizontal Pill Tab Navigation (< md viewport) */}
      <div className="md:hidden flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {PROFILE_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center space-x-1.5 shrink-0 shadow-2xs",
                isActive
                  ? "bg-[#D8B56A] text-[#4A3828] font-bold"
                  : "bg-white text-[#4A3828]/70 border border-[#E4DCC8] hover:bg-[#EDE8DA]"
              )}
            >
              <span className="w-4 h-4">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Sidebar Card (>= md viewport) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E4DCC8] p-3 space-y-1 shadow-2xs">
        <div className="px-3 py-2 text-[11px] font-mono-plex uppercase tracking-wider text-[#A88958] font-bold">
          Account Navigation
        </div>
        {PROFILE_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={cn(
                "w-full flex items-center space-x-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer group",
                isActive
                  ? "bg-[#F7F4EA] text-[#4A3828] border-l-4 border-[#D8B56A] font-bold shadow-2xs"
                  : "text-[#4A3828]/70 hover:text-[#4A3828] hover:bg-[#F7F4EA]/60 border-l-4 border-transparent"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors shrink-0",
                  isActive
                    ? "bg-[#D8B56A]/30 text-[#4A3828]"
                    : "bg-[#F7F4EA] text-[#A88958] group-hover:text-[#4A3828]"
                )}
              >
                {section.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{section.label}</div>
                <div className="text-xs text-[#A88958] truncate">{section.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
