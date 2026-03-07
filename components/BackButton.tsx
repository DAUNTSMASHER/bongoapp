"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label, className = "" }: BackButtonProps) {
  const router = useRouter();

  const content = (
    <>
      <BackIcon size={22} strokeWidth={2} />
      {label && <span className="font-bangla text-sm">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 text-white/80 transition-colors hover:text-white ${className}`}
        aria-label={label || "Back"}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-white/80 transition-colors hover:text-white ${className}`}
      aria-label={label || "Back"}
    >
      {content}
    </button>
  );
}
