"use client";

import ArchiveGuard from "@/components/ArchiveGuard";

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArchiveGuard>{children}</ArchiveGuard>;
}
