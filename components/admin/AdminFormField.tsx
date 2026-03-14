"use client";

interface AdminFormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminFormField({ label, hint, children, className = "" }: AdminFormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-white/50">{hint}</p>}
    </div>
  );
}
