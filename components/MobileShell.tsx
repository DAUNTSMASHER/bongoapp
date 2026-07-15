"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { useAnalytics } from "@/lib/useAnalytics";
import { HomeIcon, FolderIcon, LibraryIcon, UserIcon, SearchIcon, CalendarIcon, PlayIcon, FileTextIcon } from "./icons";
import dynamic from "next/dynamic";

const BannerAd = dynamic(() => import("./BannerAd"), { ssr: false });

const navItems = [
  { href: "/", label: "হোম", Icon: HomeIcon },
  { href: "/videos/", label: "ভিডিও", Icon: PlayIcon },
  { href: "/categories/", label: "ক্যাটাগরি", Icon: FolderIcon },
  { href: "/blog/", label: "ব্লগ", Icon: FileTextIcon },
  { href: "/archive/", label: "আর্কাইভ", Icon: CalendarIcon },
  { href: "/library/", label: "লাইব্রেরি", Icon: LibraryIcon },
  { href: "/profile/", label: "প্রোফাইল", Icon: UserIcon },
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
      {/* Header - full width on all screens */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 flex min-h-[56px] items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-4 pb-2 pt-3 backdrop-blur-md md:px-6 lg:px-8"
      >
        <Link href="/" className="block transition-opacity hover:opacity-90">
          <Logo size={32} showText={true} className="md:scale-110" />
        </Link>

        {/* Desktop nav - horizontal */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive ? "text-primary" : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/search/"
            className="flex size-10 items-center justify-center rounded-full text-white/90 transition-colors hover:text-white"
            aria-label="Search"
          >
            <SearchIcon size={22} strokeWidth={2} />
          </Link>
        </motion.div>
      </motion.header>

      <main className="flex-1 overflow-auto pb-24 pt-0 md:pb-8">{children}</main>

      {/* Mobile persistent banner above nav */}
      <div className="fixed bottom-[56px] left-0 right-0 z-20 flex h-[50px] justify-center bg-black/80 md:hidden">
         <BannerAd placement="mobile-sticky" variant="mobile" />
      </div>

      {/* Mobile bottom nav - hidden on md+ */}
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/10 bg-[#141414]/95 backdrop-blur-md md:hidden"
        aria-label="Bottom navigation"
      >
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon size={24} strokeWidth={2} />
                <span>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
