"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { useAnalytics } from "@/lib/useAnalytics";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/categories", label: "Categories", icon: "📂" },
  { href: "/library", label: "Library", icon: "📚" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useAnalytics();

  return (
    <div className="relative z-10 flex min-h-dvh flex-col bg-transparent text-foreground">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 flex min-h-[56px] items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 pb-2 pt-3 backdrop-blur-sm"
      >
        <Link href="/" className="block transition-opacity hover:opacity-90">
          <Logo size={32} showText={true} />
        </Link>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/search"
            className="flex size-10 items-center justify-center rounded-full text-white/90 transition-colors hover:text-white"
            aria-label="Search"
          >
            🔍
          </Link>
        </motion.div>
      </motion.header>

      <main className="flex-1 overflow-auto pb-24 pt-0">{children}</main>

      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/10 bg-[#141414]/95 backdrop-blur-md"
        aria-label="Bottom navigation"
      >
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? "text-[var(--primary)]" : "text-white/70 hover:text-white"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {icon}
                </span>
                <span>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
