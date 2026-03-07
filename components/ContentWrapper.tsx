"use client";

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/** Centers content with max-width on desktop for better web view */
export default function ContentWrapper({ children, className = "" }: ContentWrapperProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:max-w-[1400px] xl:px-10 ${className}`}>
      {children}
    </div>
  );
}
