"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  step?: number;
}

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  step,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          {step != null && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20 text-xs font-bold text-[var(--primary)]">
              {step}
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-white/50">{description}</p>}
          </div>
        </div>
        <svg
          className={`size-5 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-white/5 px-5 py-4">{children}</div>}
    </div>
  );
}
