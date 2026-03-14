"use client";

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function AdminCard({ children, title, description, className = "" }: AdminCardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/15 ${className}`}>
      {title && <h3 className="mb-1 text-sm font-semibold text-white/90">{title}</h3>}
      {description && <p className="mb-4 text-xs text-white/50">{description}</p>}
      {children}
    </div>
  );
}
