"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-white/30"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="bongochoti"
          width={size}
          height={size}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </span>
      {showText && (
        <span className="flex flex-col">
          <span
            className="text-xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--primary)" }}
          >
            bongochoti
          </span>
          <span className="font-bangla text-[11px] text-white/70 tracking-wide md:text-xs">
            বাংলা চটি
          </span>
        </span>
      )}
    </motion.div>
  );
}
