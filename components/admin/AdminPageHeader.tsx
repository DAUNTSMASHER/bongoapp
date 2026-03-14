"use client";

import Link from "next/link";
import { BackIcon } from "@/components/icons";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function AdminPageHeader({ title, description, backHref = "/admin/dashboard/", backLabel = "Dashboard" }: AdminPageHeaderProps) {
  return (
    <header className="border-b border-white/5 bg-[#0d0d0d]/50 px-6 py-6 backdrop-blur-sm md:px-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <BackIcon size={16} />
          {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
    </header>
  );
}
