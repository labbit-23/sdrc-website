import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition",
        "focus:border-[var(--sdrc-teal)] focus:ring-2 focus:ring-[rgba(0,143,130,.16)] disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition",
        "focus:border-[var(--sdrc-teal)] focus:ring-2 focus:ring-[rgba(0,143,130,.16)] disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
