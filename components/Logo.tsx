"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 36, showText = true, className = "" }: LogoProps) {
  const id = useId().replace(/:/g, "");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <defs>
          <linearGradient id={`logoGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* Open book - clean geometric shape */}
        <path
          d="M8 14 L8 36 Q8 40 12 40 L20 40 L20 12 Q12 12 8 14 Z"
          fill={`url(#logoGrad-${id})`}
        />
        <path
          d="M40 14 L40 36 Q40 40 36 40 L28 40 L28 12 Q36 12 40 14 Z"
          fill={`url(#logoGrad-${id})`}
          fillOpacity="0.9"
        />
        <rect x="22" y="10" width="4" height="28" rx="1" fill="var(--primary)" opacity="0.5" />
        {/* Clear S */}
        <path
          d="M24 18.5 C26 18.5 27.5 19.8 27.5 21.2 C27.5 22.4 26.5 23.2 25 23.8 C23 24.5 22 25.4 22 26.8 C22 28.2 23.2 29.2 25 29.2 C26.5 29.2 27.8 28.5 27.8 27.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--primary)" }}
        >
          bongochoti
        </span>
      )}
    </motion.div>
  );
}
